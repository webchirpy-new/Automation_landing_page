import {
  AdditiveBlending,
  AmbientLight,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Quaternion,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
import { POSES, createArrowcraft } from "./glassArrowcraft"
import { FOG, hash01, monotoneTrack } from "./introConfig"
import { createPortalField } from "./portalField"
import { createSpectralFog } from "./spectralFog"

/**
 * The WebGL half of the intro (loaded on demand). World units are CSS pixels: z=0 maps 1:1 onto
 * the page while the camera is at rest, the origin is the fold's visible centre and +y is up.
 * It owns no timing. GSAP tweens `state` and calls render() every tick, so the whole scene can
 * be seeked or stopped safely. The camera returns to rest before the hand-off, so the surviving
 * corner cubes line up with their CSS 3D counterparts.
 */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

const SPECTRAL = {
  cyan: new Color("#84DDF7"),
  violet: new Color("#9676E7"),
  pink: new Color("#E0ACED"),
}

const GLOW_VERTEX = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const GLOW_FRAGMENT = /* glsl */ `
  uniform float uStrength; uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
  void main(){
    vec2 p = vUv * 2.0 - 1.0;
    float f = pow(clamp(1.0 - length(p), 0.0, 1.0), 2.4);
    vec3 c = mix(uA, uB, clamp(p.x * 0.7 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(c * f * uStrength, f * uStrength);
  }`

export function createIntroScene(canvas, { width, height, foldHeight, centre, distance, tier, corners, requireFastGPU }) {
  let renderer
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: tier.antialias,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: requireFastGPU,
    })
  } catch {
    return null
  }

  const k = Math.max(0.55, Math.min(1.2, Math.min(width / 1440, height / 800)))
  const D = distance
  const zK = D / 1400
  let dpr = Math.min(window.devicePixelRatio || 1, tier.dpr)
  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height, false)
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera((2 * Math.atan(height / 2 / D) * 180) / Math.PI, width / height, 10, D + 20000)
  camera.position.set(0, 0, D)
  // Shift the principal point so the vanishing point stays on the fold centre
  camera.setViewOffset(width, height, width / 2 - centre.x, height / 2 - centre.y, width, height)

  scene.add(new AmbientLight(0xffffff, 1.3))
  const key = new DirectionalLight(0xffffff, 2.2)
  key.position.set(-0.42, 0.62, 0.82)
  scene.add(key)
  const lightA = new PointLight(SPECTRAL.cyan, 0, 760, 0)
  const lightB = new PointLight(SPECTRAL.violet, 0, 860, 0)
  const lightC = new PointLight(SPECTRAL.pink, 0, 640, 0)
  lightA.position.set(-210, 40, 170)
  lightB.position.set(190, -70, 190)
  lightC.position.set(40, 170, 130)
  scene.add(lightA, lightB, lightC)

  /* ---------- Voxel wall ---------- */
  const { cols, foldRows, pitchX, pitchY } = corners
  const rows = Math.max(foldRows, Math.ceil((height + pitchY) / pitchY))
  const count = cols * rows
  const cubeGeo = new RoundedBoxGeometry(1, 1, 1, 1, 0.075)
  const cubeMat = new MeshLambertMaterial({ color: 0xffffff })
  const voxels = new InstancedMesh(cubeGeo, cubeMat, count)
  voxels.frustumCulled = false
  voxels.instanceMatrix.setUsage(DynamicDrawUsage)
  const matrices = voxels.instanceMatrix.array
  const colors = new Float32Array(count * 3)

  const keepSet = new Set(corners.cells.map((c) => c.key))
  const bx = new Float32Array(count)
  const by = new Float32Array(count)
  const rn = new Float32Array(count)
  const h1 = new Float32Array(count)
  const h2 = new Float32Array(count)
  const h3 = new Float32Array(count)
  const lf = new Float32Array(count) // smooth low-frequency field, so the break is coherent
  const role = new Uint8Array(count) // 0 bursts, 1 retires later, 2 stays as a corner cube
  const done = new Uint8Array(count)
  // Cover the viewport for the wall, but measure the break from the fold's own visible box
  const halfW = width / 2
  const halfH = Math.min(height, foldHeight) / 2
  let idx = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++, idx++) {
      const x = (c + 0.5) * pitchX - centre.x
      const y = centre.y - (r + 0.5) * pitchY
      bx[idx] = x
      by[idx] = y
      h1[idx] = hash01(c, r, 1)
      h2[idx] = hash01(c, r, 2)
      h3[idx] = hash01(c, r, 3)
      rn[idx] = Math.hypot(x / halfW, y / halfH)
      lf[idx] = 0.5 + 0.25 * Math.sin(x * 0.011 + y * 0.006 + 1.1) + 0.25 * Math.sin(y * 0.014 - x * 0.005 + 2.4)
      // An inscribed ellipse with a torn edge bursts about 78% of the wall, centre first
      const angle = Math.atan2(y / halfH, x / halfW)
      const edge = 0.975 + Math.sin(angle * 3 + 1.3) * 0.055 + Math.sin(angle * 7 + 0.4) * 0.035 + (h3[idx] - 0.5) * 0.09
      role[idx] = keepSet.has(`${c}:${r}`) ? 2 : rn[idx] < edge ? 0 : 1
      const tone = 0.93 + h2[idx] * 0.07
      colors[idx * 3] = tone
      colors[idx * 3 + 1] = tone
      colors[idx * 3 + 2] = Math.min(1, tone * 1.012)
    }
  }
  voxels.instanceColor = new InstancedBufferAttribute(colors, 3)
  scene.add(voxels)

  /* The whole cinematic is these values. The hook's GSAP timeline is the only thing writing them. */
  const state = {
    breath: 0,
    pressure: 0,
    tremble: 0,
    burst: 0, // seconds since the burst began
    retire: 0,
    relief: 1, // uneven wall heights; 0 lets survivors match the flat CSS cubes
    spectral: 0,
    // Aircraft. Before impact it rides the approach curve (u). From impact on (free = 1) it is
    // placed directly by px/py/pz, in world px. Orientation in radians (see glassArrowcraft).
    u: 0,
    free: 0,
    px: 0,
    py: 0,
    pz: 0,
    size: 0.5, // multiplier on the tier size
    aura: 1,
    ...POSES.underside,
    planeOpacity: 0,
    glow: 0,
    // Fog: brightness of new vapour, whether the craft is laying it, and the plume's overall level
    fog: 0,
    fogEmit: 0,
    fogVis: 1,
    // Portal
    travel: 0,
    streak: 0,
    portal: 0,
    // Camera offsets from rest
    camX: 0,
    camY: 0,
    camZ: 0,
    camRoll: 0,
  }

  /** Writes one instance matrix: translation, axis-angle rotation, scale. */
  function writeMatrix(i, x, y, z, ax, ay, az, angle, s) {
    const o = i * 16
    const sx = pitchX * s
    const sy = pitchY * s
    const sz = pitchX * s
    if (angle === 0) {
      matrices[o] = sx; matrices[o + 1] = 0; matrices[o + 2] = 0; matrices[o + 3] = 0
      matrices[o + 4] = 0; matrices[o + 5] = sy; matrices[o + 6] = 0; matrices[o + 7] = 0
      matrices[o + 8] = 0; matrices[o + 9] = 0; matrices[o + 10] = sz; matrices[o + 11] = 0
    } else {
      const c = Math.cos(angle)
      const n = Math.sin(angle)
      const t = 1 - c
      matrices[o] = (t * ax * ax + c) * sx
      matrices[o + 1] = (t * ax * ay + n * az) * sx
      matrices[o + 2] = (t * ax * az - n * ay) * sx
      matrices[o + 3] = 0
      matrices[o + 4] = (t * ax * ay - n * az) * sy
      matrices[o + 5] = (t * ay * ay + c) * sy
      matrices[o + 6] = (t * ay * az + n * ax) * sy
      matrices[o + 7] = 0
      matrices[o + 8] = (t * ax * az + n * ay) * sz
      matrices[o + 9] = (t * ay * az - n * ax) * sz
      matrices[o + 10] = (t * az * az + c) * sz
      matrices[o + 11] = 0
    }
    matrices[o + 12] = x
    matrices[o + 13] = y
    matrices[o + 14] = z
    matrices[o + 15] = 1
  }

  let wallFrozen = false
  function updateVoxels(time) {
    if (wallFrozen) return
    const { pressure, tremble, burst, retire, relief, breath } = state
    for (let i = 0; i < count; i++) {
      if (done[i]) continue
      const x = bx[i]
      const y = by[i]
      const r = rn[i]
      // Physical unevenness of the wall plus a slow swell while it holds
      const swell = breath * Math.sin(time * 2.1 + lf[i] * 6.2) * 2.2
      const base = -pitchX / 2 + relief * ((h1[i] - 0.5) * 7 + (lf[i] - 0.5) * 7 + swell)
      // Pressure field: the core compresses away from the viewer while a torn ring around it lifts
      const core = Math.exp(-(r * r) / 0.13)
      const rd = (r - (0.48 + lf[i] * 0.14)) / 0.15
      const ring = Math.exp(-(rd * rd))
      const load = pressure * (0.72 + lf[i] * 0.56)
      const push = load * (-30 * core * (0.7 + h1[i] * 0.6) + 26 * ring * (0.55 + h2[i] * 0.9))
      const lean = load * 0.42 * ring * (0.25 + h3[i] * 0.75)
      const len = Math.hypot(x, y) || 1
      const rx = x / len
      const ry = y / len
      // Phase-offset groups of 1–3 px, so it shudders in places rather than as one sheet
      const group = Math.floor(lf[i] * 5)
      const shake = tremble * (core + ring) * Math.sin(time * 43 + group * 2.1 + h2[i] * 2.4) * (1 + h1[i] * 2)
      const gap = 1 - pressure * 0.11 * ring * h2[i]

      if (role[i] === 0 && burst > 0) {
        const delay = r * 0.32 + (lf[i] - 0.5) * 0.09 + h1[i] * 0.05
        const life = 0.6 + h2[i] * 0.42
        const q = clamp01((burst - Math.max(0, delay)) / life)
        if (q >= 1) {
          writeMatrix(i, 0, 0, 0, 0, 0, 1, 0, 0)
          done[i] = 1
          continue
        }
        if (q > 0) {
          const a = q * q * (2.4 - 1.4 * q)
          const travel = a * (130 + h3[i] * 620) * (0.5 + r * 0.8)
          const z = base + push * (1 - q) + a * D * (0.14 + h2[i] * 0.62)
          const angle = lean * (1 - q) + q * (1 + h1[i] * 3.2)
          const s = gap * (q < 0.66 ? 1 : 1 - ((q - 0.66) / 0.34) ** 2)
          const ax = -ry * 0.8 + (h2[i] - 0.5) * 0.5
          const ay = rx * 0.8 + (h3[i] - 0.5) * 0.5
          const az = (h1[i] - 0.5) * 0.7
          const n = Math.hypot(ax, ay, az) || 1
          writeMatrix(i, x + rx * travel, y + ry * travel, z, ax / n, ay / n, az / n, angle, s)
          continue
        }
      }
      if (role[i] === 1 && retire > 0) {
        const q = clamp01((retire - h1[i] * 0.62) / 0.38)
        if (q >= 1) {
          writeMatrix(i, 0, 0, 0, 0, 0, 1, 0, 0)
          done[i] = 1
          continue
        }
        // Blown out of frame by the opening rather than dissolving in place
        const a = q * q
        const away = a * (240 + h3[i] * 520)
        writeMatrix(i, x + rx * away, y + ry * away, base + a * D * (0.12 + h2[i] * 0.3), -ry, rx, 0, a * (1 + h1[i] * 2.4), 1 - q ** 5)
        continue
      }
      if (lean > 0.001) writeMatrix(i, x + rx * shake, y + ry * shake, base + push, -ry, rx, 0, lean, gap)
      else writeMatrix(i, x + rx * shake, y + ry * shake, base + push, 0, 0, 1, 0, gap)
    }
    voxels.instanceMatrix.needsUpdate = true
    if (retire >= 1 && burst > 1.8 && relief <= 0) wallFrozen = true
  }

  /** World point at the resting page plane (z = 0) under a viewport point. */
  const pageToWorld = (x, y) => ({ x: x - centre.x, y: centre.y - y })
  /** World point at depth z that the resting camera shows at viewport point (x, y). */
  const screenToWorld = (x, y, z) => {
    const back = (D - z) / D
    return { x: (x - centre.x) * back, y: (centre.y - y) * back, z }
  }

  /* ---------- The aircraft ---------- */
  const craftSize = tier.craft * k
  const craft = createArrowcraft({ size: craftSize })
  scene.add(craft.travelRig)
  const planePos = craft.travelRig.position

  /*
   * Approach: one counter-clockwise loop IN FRONT of the wall. Points are given in screen terms
   * (fractions of the half-frame, +y up) at a depth, and converted so they land there through the
   * resting camera. It starts beyond the lower-right edge and ends with the nose tip exactly on
   * the wall centre, in the front-lock pose.
   */
  const toWorld = (fx, fy, z) => {
    const s = D / (D - z)
    return new Vector3((fx * halfW) / s, (fy * halfH) / s, z)
  }
  const contactCentre = craft.noseOffset(POSES.frontLock, craftSize, new Vector3()).negate() // centre so the tip is at 0,0,0
  const lockDir = contactCentre.clone().negate().normalize() // the nose direction in front lock
  const approach = new CatmullRomCurve3(
    [
      toWorld(1.42, -0.5, 230), // fully outside the lower-right edge
      toWorld(0.84, -0.44, 270), // first seen: lower-right quadrant, about 72% down
      toWorld(0.5, -0.12, 320),
      toWorld(0.3, 0.36, 360),
      toWorld(-0.08, 0.56, 380), // top of the loop
      toWorld(-0.46, 0.36, 360),
      toWorld(-0.56, -0.02, 330), // far left
      toWorld(-0.34, -0.36, 290),
      toWorld(-0.06, -0.3, 230), // turning in, below the centre
      // Front lock, lined up: straight back along the nose direction from the contact point
      contactCentre.clone().addScaledVector(lockDir, -170 * k),
      contactCentre,
    ],
    false,
    "centripetal"
  )
  const curvePos = new Vector3()

  /*
   * Perceived-distance progress. Equal WORLD arc length is not equal motion on screen: where the
   * loop turns into the front-lock line the path runs almost straight at the camera, so constant
   * world speed collapsed to a near stop on screen (829 to 341 px/s in two frames). Progress is
   * measured instead as screen travel plus looming (change of on-screen size), so the same path,
   * through the same points, is covered at a continuous perceived speed.
   */
  function perceivedTable(curve, nominal, N = 600) {
    const pts = curve.getSpacedPoints(N)
    const cum = new Float64Array(N + 1)
    let px = 0, py = 0, ps = 0
    pts.forEach((p, i) => {
      const s = D / (D - p.z)
      const x = p.x * s
      const y = p.y * s
      if (i) cum[i] = cum[i - 1] + Math.hypot(x - px, y - py, nominal * (s - ps))
      px = x; py = y; ps = s
    })
    const total = cum[N] || 1
    for (let i = 0; i <= N; i++) cum[i] /= total
    // Perceived fraction to arc-length u, and back
    const uOf = (v) => {
      if (v <= 0) return 0
      if (v >= 1) return 1
      let lo = 0, hi = N
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (cum[mid] < v) lo = mid
        else hi = mid
      }
      const f = (v - cum[lo]) / Math.max(1e-9, cum[hi] - cum[lo])
      return (lo + f) / N
    }
    const vOf = (u) => {
      const x = Math.min(N, Math.max(0, u * N))
      const i = Math.min(N - 1, Math.floor(x))
      return cum[i] + (cum[i + 1] - cum[i]) * (x - i)
    }
    return { uOf, vOf }
  }
  const approachV = perceivedTable(approach, craftSize * 0.6)
  // Perceived fraction of a control point, so the timeline can aim at named points of the path
  const arc = approach.getLengths(600)
  const approachFrac = (i) => approachV.vOf(arc[Math.round((i / 10) * 600)] / arc[600])

  /**
   * Where and how big the craft must be to sit exactly in the eyebrow slot: the landing pose's
   * projected extent at the page plane (1:1 with CSS px when the camera is at rest). The slot is
   * sized from the eyebrow type itself (hero-dimension.css), and the craft is fitted to it by
   * HEIGHT, so its visible height is the measured text height, not a guessed world scale.
   */
  const ext = new Vector3()
  function landingFor(box) {
    craft.setPose(POSES.landing)
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    const pos = craft.geometry.attributes.position
    for (let i = 0; i < pos.count; i += 3) {
      ext.fromBufferAttribute(pos, i).applyQuaternion(craft.poseRig.quaternion)
      x0 = Math.min(x0, ext.x); x1 = Math.max(x1, ext.x); y0 = Math.min(y0, ext.y); y1 = Math.max(y1, ext.y)
    }
    const span = x1 - x0
    const spanY = y1 - y0
    const size = box.height / spanY / craftSize
    const s = craftSize * size
    const c = pageToWorld(box.left + box.width / 2, box.top + box.height / 2)
    // Size that gives `px` of projected width at depth z, for the glide in
    const sizeFor = (px, z) => (px / span / craftSize) * ((D - z) / D)
    return {
      x: c.x - ((x0 + x1) / 2) * s,
      y: c.y - ((y0 + y1) / 2) * s,
      size,
      span,
      sizeFor,
      cx: box.left + box.width / 2,
      cy: box.top + box.height / 2,
      // QA: the craft's projected box at rest in the slot, in CSS px
      fit: { w: +(span * s).toFixed(2), h: +(spanY * s).toFixed(2), aspect: +(span / spanY).toFixed(3) },
    }
  }

  /**
   * The landing as ONE path: a centripetal curve through the given world points (portal depth,
   * above-left of the eyebrow, beside it, the slot), covered by perceived distance, with the
   * on-screen width tied to progress along it. The craft therefore shrinks as it approaches and
   * reaches the slot size exactly as it arrives; there is no separate final leg to pop into.
   * widths: projected width in CSS px at each point. Returns (v, out) setting px/py/pz/size.
   */
  function landingPath(points, widths, span) {
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(p.x, p.y, p.z)), false, "centripetal")
    const table = perceivedTable(curve, 80 * k)
    const lens = curve.getLengths(600)
    const knots = points.map((_, i) => table.vOf(lens[Math.round((i / (points.length - 1)) * 600)] / lens[600]))
    const logW = monotoneTrack(knots.map((v, i) => [v, Math.log(widths[i])]))
    const at = new Vector3()
    const at_ = (v, out) => {
      curve.getPointAt(table.uOf(v), at)
      out.px = at.x
      out.py = at.y
      out.pz = at.z
      out.size = (Math.exp(logW(v)) / span / craftSize) * ((D - at.z) / D)
      return out
    }
    // knots: perceived progress at each given point, so the timeline can time the waypoints
    return { at: at_, knots }
  }

  function updatePlane() {
    approach.getPointAt(approachV.uOf(clamp01(state.u)), curvePos)
    planePos.set(
      curvePos.x + (state.px - curvePos.x) * state.free,
      curvePos.y + (state.py - curvePos.y) * state.free,
      curvePos.z + (state.pz - curvePos.z) * state.free
    )
    craft.body.scale.setScalar(craftSize * state.size)
    craft.setPose(state)
    craft.setOpacity(state.planeOpacity)
    craft.setAura(state.aura)
  }

  /* ---------- Contact: the nose tip reaching the wall face is the impact ---------- */
  const WALL_FACE = 2 // world z of the cube faces, within the bevel
  const tip = new Vector3()
  let impactAt = null
  const impact = { at: null, tip: null, maxLensCover: 0, firstSeen: null }
  function checkContact(time) {
    if (impactAt !== null && time < impactAt) impactAt = null // only when a dev seek rewinds
    if (impactAt !== null || state.planeOpacity < 0.5) return
    craft.noseTip(tip)
    if (tip.z <= WALL_FACE) {
      impactAt = time
      impact.at = +time.toFixed(3)
      impact.tip = { x: +tip.x.toFixed(1), y: +tip.y.toFixed(1), z: +tip.z.toFixed(1) }
    }
  }
  /** Everything the wall does after contact derives from the seconds since contact. */
  function applyImpact(time) {
    const since = impactAt === null ? -1 : time - impactAt
    // A few frames of compression, then the fracture runs outward from the contact point
    state.pressure = since < 0 ? 0 : since < 0.07 ? since / 0.07 : Math.max(0, 1 - (since - 0.07) / 0.25)
    state.burst = Math.max(0, since - 0.05)
    state.retire = clamp01((since - 0.75) / 1.6)
    state.relief = 1 - clamp01((since - 2.4) / 1.2)
    state.breath = since < 0 ? 1 : Math.max(0, 1 - since / 0.3)
    state.spectral = since < 0 ? 0 : Math.min(1, since / 0.3) * (1 - clamp01((since - 1.4) / 1.6) * 0.65)
    return since
  }

  /* ---------- Near-lens debris: a few large cubes that pass the camera ---------- */
  const lensCount = tier.lens
  const lensMat = new MeshLambertMaterial({ color: 0xffffff })
  const lens = new InstancedMesh(cubeGeo, lensMat, Math.max(1, lensCount))
  lens.frustumCulled = false
  lens.instanceMatrix.setUsage(DynamicDrawUsage)
  lens.count = lensCount
  scene.add(lens)
  // Screen positions (half-frame fractions) where each passes, its start, life and projected size
  const LENS = [
    { sx: -0.5, sy: 0.32, t0: 0.03, life: 0.62, h: 0.62 },
    { sx: 0.58, sy: -0.26, t0: 0.1, life: 0.66, h: 0.56 },
    { sx: 0.3, sy: 0.6, t0: 0.18, life: 0.6, h: 0.46 },
    { sx: -0.38, sy: -0.56, t0: 0.26, life: 0.64, h: 0.5 },
    { sx: 0.78, sy: 0.18, t0: 0.34, life: 0.56, h: 0.4 },
    { sx: -0.8, sy: -0.1, t0: 0.4, life: 0.6, h: 0.42 },
  ].slice(0, lensCount)
  const lensM = new Matrix4()
  const lensQ = new Quaternion()
  const lensP = new Vector3()
  const lensS = new Vector3()
  const lensAxis = new Vector3()
  function updateLens(since) {
    lens.visible = since >= 0 && since < 1.3
    if (!lens.visible) return
    let cover = 0
    LENS.forEach((c, i) => {
      const q = (since - c.t0) / c.life
      if (q <= 0 || q >= 1) {
        lensM.makeScale(0, 0, 0)
        lens.setMatrixAt(i, lensM)
        return
      }
      const nearDist = 110 * k // closest it comes to the lens
      const zEnd = D - nearDist
      const e = q ** 1.7 // accelerates toward the camera
      const z = zEnd * e
      const reach = (D - z) / D
      // Starts at the breach, ends at its pass point, sliding outward as it nears
      lensP.set(c.sx * halfW * reach * e + (1 - e) * c.sx * 40, c.sy * halfH * reach * e + (1 - e) * c.sy * 40, z)
      // Sized from the frame area, so a tall phone frame is not swamped (20–35% at most)
      const side = (c.h * 0.85 * Math.sqrt(width * height) * nearDist) / D
      lensS.setScalar(side * (0.6 + 0.4 * e))
      lensAxis.set(c.sy + 0.3, -c.sx + 0.2, 0.4).normalize()
      lensQ.setFromAxisAngle(lensAxis, q * 2.6 + i)
      // Approximate share of the frame this cube covers, for QA
      const px = (lensS.x * D) / Math.max(1, D - z)
      cover += Math.min(px * px, width * height * 0.5) / (width * height)
      lensM.compose(lensP, lensQ, lensS)
      lens.setMatrixAt(i, lensM)
    })
    lens.instanceMatrix.needsUpdate = true
    impact.maxLensCover = Math.max(impact.maxLensCover, +cover.toFixed(3))
  }

  /* ---------- Soft light: behind the aircraft and at the vanishing point ---------- */
  const glowGeo = new PlaneGeometry(1, 1)
  const makeGlow = (a, b) => {
    const uStrength = { value: 0 }
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      premultipliedAlpha: true,
      side: DoubleSide,
      uniforms: { uStrength, uA: { value: new Color(a) }, uB: { value: new Color(b) } },
      vertexShader: GLOW_VERTEX,
      fragmentShader: GLOW_FRAGMENT,
    })
    const mesh = new Mesh(glowGeo, material)
    mesh.renderOrder = 5
    mesh.frustumCulled = false
    scene.add(mesh)
    return { mesh, uStrength, material }
  }
  const planeGlow = makeGlow("#5c9cf5", "#8a63e8")
  const portalGlow = makeGlow("#6fd7f4", "#a273ec")

  /* ---------- Spectral fog: the aircraft's vapour wake (spectralFog.js) ---------- */
  const fog = createSpectralFog({ max: tier.fog, config: FOG })
  scene.add(fog.mesh)
  const tailP = new Vector3()
  const noseP = new Vector3()
  const shedV = new Vector3()
  let fogTime = 0
  function updateFog(time) {
    fogTime = time
    craft.tailPoint(tailP)
    craft.noseTip(noseP)
    const len = craftSize * state.size
    // Rearward along the craft's real axis, so the wake turns as the craft rolls
    shedV.subVectors(tailP, noseP).normalize().multiplyScalar(len * FOG.shed)
    const emit = state.fogEmit > 0.5 && state.planeOpacity > 0.5
    fog.update(time, tailP, len, state.fog, emit, state.fogVis, shedV)
  }

  /* ---------- Forward portal ---------- */
  const portal = createPortalField({ major: tier.streaks, faint: tier.faint, k, width, height, focal: D })
  scene.add(portal.mesh)

  /* ---------- Frame ---------- */
  function updateCamera() {
    camera.position.set(state.camX, state.camY, D + state.camZ)
    camera.rotation.z = state.camRoll
    camera.updateMatrixWorld()
  }

  let frames = 0
  let slow = 0
  let lastNow = 0
  function render(time) {
    // Drop to 1× resolution if this GPU cannot hold the frame rate
    const now = performance.now()
    if (lastNow && dpr > 1) {
      frames++
      if (now - lastNow > 33) slow++
      if (frames === 40) {
        if (slow > 20) {
          dpr = 1
          renderer.setPixelRatio(1)
          renderer.setSize(width, height, false)
        }
        frames = 0
        slow = 0
      }
    }
    lastNow = now

    updateCamera()
    updatePlane()
    updateFog(time)
    checkContact(time)
    // QA: the first frame any part of the craft is inside the frame, and where
    if (!impact.firstSeen && state.planeOpacity > 0.5) {
      const sc = depthScale(planePos.z)
      const sx = centre.x + planePos.x * sc
      const sy = centre.y - planePos.y * sc
      const rad = craftSize * state.size * 0.5 * sc
      if (sx + rad > 0 && sx - rad < width && sy + rad > 0 && sy - rad < height)
        impact.firstSeen = { t: +time.toFixed(3), xPct: Math.round((sx / width) * 100), yPct: Math.round((sy / height) * 100), sizePx: Math.round(rad * 2) }
    }
    const since = applyImpact(time)
    updateVoxels(time)
    updateLens(since)
    portal.update(state.travel, state.streak, camera.position.z)

    planeGlow.mesh.visible = state.glow > 0.002
    if (planeGlow.mesh.visible) {
      planeGlow.mesh.position.set(planePos.x, planePos.y, planePos.z - 80)
      planeGlow.mesh.scale.setScalar(1040 * k)
      planeGlow.uStrength.value = state.glow
    }
    portalGlow.mesh.visible = state.portal > 0.002
    if (portalGlow.mesh.visible) {
      const far = camera.position.z - 2600
      portalGlow.mesh.position.set(0, 0, far)
      portalGlow.mesh.scale.setScalar((560 * k * 2600) / D)
      portalGlow.uStrength.value = state.portal
    }
    lightA.intensity = state.spectral * 0.7
    lightB.intensity = state.spectral * 0.95
    lightC.intensity = state.spectral * 0.5
    renderer.render(scene, camera)
  }

  /**
   * Compiles every program and uploads every buffer while the veil still covers the frame. Before
   * this, the aircraft's first visible frame compiled its shaders mid-animation and stalled.
   */
  function warmUp() {
    const s0 = state.planeOpacity
    const g0 = state.glow
    const p0 = state.portal
    lens.visible = true
    state.planeOpacity = 0.003
    state.glow = 0.003
    state.portal = 0.003
    updateCamera()
    updatePlane()
    portal.update(0, 0.003, camera.position.z)
    planeGlow.mesh.visible = true
    portalGlow.mesh.visible = true
    fog.mesh.visible = true
    renderer.compile(scene, camera)
    renderer.render(scene, camera)
    renderer.getContext().finish()
    state.planeOpacity = s0
    state.glow = g0
    state.portal = p0
  }

  /** Perspective scale at world depth z: 1 at the page plane with the camera at rest. */
  const depthScale = (z) => D / Math.max(40, camera.position.z - z)

  /** World point → fold coordinates, through the real camera. */
  const tmp = new Vector3()
  function project(x, y, z, out) {
    tmp.set(x, y, z).project(camera)
    out.x = (tmp.x * 0.5 + 0.5) * width
    out.y = (0.5 - tmp.y * 0.5) * height
    out.scale = depthScale(z)
    return out
  }

  function dispose() {
    renderer.setAnimationLoop(null)
    craft.dispose()
    fog.dispose()
    portal.dispose()
    lensMat.dispose()
    lens.dispose()
    cubeGeo.dispose()
    glowGeo.dispose()
    cubeMat.dispose()
    planeGlow.material.dispose()
    portalGlow.material.dispose()
    voxels.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }


  return { state, render, warmUp, dispose, planePos, impact, pageToWorld, craftSize, poses: POSES, screenToWorld, approachFrac, contactCentre, landingFor, landingPath, depthScale, project, k, zK, centre, distance: D, canvas, portal, craft, renderer, voxelCount: count, fogStats: () => fog.stats(fogTime) }
}
