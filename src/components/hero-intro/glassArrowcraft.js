import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  FrontSide,
  Group,
  Mesh,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three"

/**
 * The one aircraft used by the whole intro: a real, closed, rotatable mesh built in code (no
 * texture, no PNG, no external file). Its silhouette is measured from the approved angled and
 * straight-front glass references:
 *
 *   LOCAL AXES   +Z = nose / direction of travel · +Y = top of the wings · +X = aircraft's left.
 *   LENGTH       1 unit, nose at z = +0.5, keel tip at z = -0.5.
 *   IDENTITY     Identity rotation points the nose straight at a camera on +Z.
 *
 * Four separate glass panels meet along the folds: two wings and the two sides of the central
 * V. Each is a solid slab with a rounded rim, so the folds and outer edges catch light the way
 * the references do, and the craft keeps real thickness and a real underside through a roll.
 *
 * Rig (always driven through setPose, never by writing rotations by hand):
 *   travelRig  → world position only (camera-relative flight)
 *   poseRig    → yaw · pitch · roll quaternion, composed fresh each frame so bank and axial roll
 *                never pass through interpolated Euler angles
 *   body       → local mesh and materials, plus model scale
 */

const THICKNESS = 0.034
const RIM = 0.021
const ARC_STEPS = 7
const PROFILE_STEPS = 8

/* Key points of the folded sheet, in model units. */
const NOSE = [0, 0.004, 0.5]
const WING_TIP = [0.46, 0.082, -0.292]
const WING_ROOT = [0.092, 0.004, -0.296]
const KEEL_TIP = [0, -0.205, -0.5]

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a) => scale(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1))
const towards = (from, to, d) => add(from, scale(norm(sub(to, from)), d))

/**
 * Appends one rounded glass slab. `outline` is a convex planar polygon listed counter-clockwise
 * seen from the side `normal` faces. The rim is built by insetting the outline, so an arc of
 * constant vertex count sits on every corner and the rings stitch into clean quads.
 */
function addSlab(out, outline, normal, panelId) {
  const n = norm(normal)
  const u = norm(sub(outline[1], outline[0]))
  const v = cross(n, u)
  const to2 = (p) => [dot(sub(p, outline[0]), u), dot(sub(p, outline[0]), v)]
  const to3 = (x, y, h) => add(add(add(outline[0], scale(u, x)), scale(v, y)), scale(n, h))
  const pts = outline.map(to2)
  const count = pts.length

  // Outward 2D normals of each edge, then the core polygon inset by the rim width
  const edgeN = pts.map((p, i) => {
    const q = pts[(i + 1) % count]
    const dx = q[0] - p[0]
    const dy = q[1] - p[1]
    const l = Math.hypot(dx, dy)
    return [dy / l, -dx / l]
  })
  const core = pts.map((p, i) => {
    const prev = edgeN[(i - 1 + count) % count]
    const next = edgeN[i]
    // Miter inset, limited so a very acute tip keeps its rim instead of collapsing
    const mx = prev[0] + next[0]
    const my = prev[1] + next[1]
    const ml = Math.hypot(mx, my) || 1
    const cosHalf = Math.max(0.09, ml / 2)
    const d = RIM / cosHalf
    return [p[0] - (mx / ml) * d, p[1] - (my / ml) * d]
  })

  const ring = (cosA, sinA) => {
    const verts = []
    for (let i = 0; i < count; i++) {
      const prev = edgeN[(i - 1 + count) % count]
      const next = edgeN[i]
      const a0 = Math.atan2(prev[1], prev[0])
      let a1 = Math.atan2(next[1], next[0])
      while (a1 < a0) a1 += Math.PI * 2
      for (let s = 0; s <= ARC_STEPS; s++) {
        const a = a0 + ((a1 - a0) * s) / ARC_STEPS
        const ox = Math.cos(a)
        const oy = Math.sin(a)
        const position = to3(core[i][0] + ox * RIM * cosA, core[i][1] + oy * RIM * cosA, (THICKNESS / 2) * sinA)
        const inPlane = add(scale(u, ox), scale(v, oy))
        // Ellipse normal: the rim is wider than it is tall
        const normalV = norm(add(scale(inPlane, cosA / RIM), scale(n, sinA / (THICKNESS / 2))))
        verts.push({ position, normal: normalV })
      }
    }
    return verts
  }

  const rings = []
  for (let j = 0; j <= PROFILE_STEPS; j++) {
    const a = -Math.PI / 2 + (Math.PI * j) / PROFILE_STEPS
    rings.push(ring(Math.cos(a), Math.sin(a)))
  }

  const base = out.position.length / 3
  const perRing = rings[0].length
  rings.forEach((r, j) => {
    const rim = Math.cos(-Math.PI / 2 + (Math.PI * j) / PROFILE_STEPS)
    r.forEach(({ position, normal: nv }) => {
      out.position.push(...position)
      out.normal.push(...nv)
      out.rim.push(rim)
      out.panel.push(panelId)
    })
  })
  for (let j = 0; j < PROFILE_STEPS; j++) {
    for (let i = 0; i < perRing; i++) {
      const i2 = (i + 1) % perRing
      const a = base + j * perRing + i
      const b = base + j * perRing + i2
      const c = base + (j + 1) * perRing + i
      const d = base + (j + 1) * perRing + i2
      out.index.push(a, b, d, a, d, c)
    }
  }

  // Flat caps over the core polygon, fanned, top and bottom
  const cap = (h, nv, flip) => {
    const start = out.position.length / 3
    core.forEach((c) => {
      out.position.push(...to3(c[0], c[1], h))
      out.normal.push(...nv)
      out.rim.push(0)
      out.panel.push(panelId)
    })
    for (let i = 1; i < count - 1; i++) {
      if (flip) out.index.push(start, start + i + 1, start + i)
      else out.index.push(start, start + i, start + i + 1)
    }
  }
  cap(THICKNESS / 2, n, false)
  cap(-THICKNESS / 2, scale(n, -1), true)
}

/** Builds the closed mesh. Pure maths, so it can also be exported or tested outside the browser. */
export function buildArrowcraftGeometry() {
  const out = { position: [], normal: [], rim: [], panel: [], index: [] }
  const mirror = (p) => [-p[0], p[1], p[2]]

  // Orders a polygon so its normal faces up (+Y) and adds it as a slab
  const addPanel = (poly, id) => {
    let nrm = cross(sub(poly[1], poly[0]), sub(poly[2], poly[0]))
    let ordered = poly
    if (nrm[1] < 0) {
      ordered = [poly[0], ...poly.slice(1).reverse()]
      nrm = scale(nrm, -1)
    }
    addSlab(out, ordered, nrm, id)
  }

  // Every panel's rounded tip is centred on the nose, so the four slabs close to a single point
  const tipFor = (a, b, c) => {
    const e1 = norm(sub(b, a))
    const e2 = norm(sub(c, a))
    const half = Math.acos(Math.min(1, dot(e1, e2))) / 2
    const push = RIM / Math.max(0.09, Math.sin(half))
    return add(a, scale(norm(scale(add(e1, e2), -1)), push))
  }

  // Wing: nose → soft two-point tip → root
  const wing = (m, id) => {
    const tip = m ? mirror(WING_TIP) : WING_TIP
    const root = m ? mirror(WING_ROOT) : WING_ROOT
    // The tip is a short curve rather than one corner, so it reads soft like the reference
    const a = towards(tip, NOSE, 0.075)
    const b = towards(tip, root, 0.065)
    const curve = [0, 0.33, 0.67, 1].map((t) => add(add(scale(a, (1 - t) ** 2), scale(tip, 2 * t * (1 - t))), scale(b, t * t)))
    addPanel([tipFor(NOSE, tip, root), ...curve, root], id)
  }
  wing(false, 0)
  wing(true, 1)

  // Central V: each side runs from the nose along the fold to the keel tip
  const keel = (m, id) => {
    const root = m ? mirror(WING_ROOT) : WING_ROOT
    addPanel([tipFor(NOSE, root, KEEL_TIP), root, towards(KEEL_TIP, root, 0.016), towards(KEEL_TIP, NOSE, 0.016)], id)
  }
  keel(false, 2)
  keel(true, 3)

  const geo = new BufferGeometry()
  geo.setAttribute("position", new BufferAttribute(new Float32Array(out.position), 3))
  geo.setAttribute("normal", new BufferAttribute(new Float32Array(out.normal), 3))
  geo.setAttribute("aRim", new BufferAttribute(new Float32Array(out.rim), 1))
  geo.setAttribute("aPanel", new BufferAttribute(new Float32Array(out.panel), 1))
  geo.setIndex(out.index)
  return geo
}

const vertex = /* glsl */ `
  attribute float aRim; attribute float aPanel;
  varying vec3 vL; varying vec3 vN; varying vec3 vW; varying float vRim; varying float vPanel;
  void main() {
    vL = position;
    vN = normal;
    vRim = aRim;
    vPanel = aPanel;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`

/*
 * Approximate prismatic glass, without a screen-space transmission pass. Colour comes from a
 * small procedural environment sampled along the world-space reflection, so the spectral bands
 * really do slide across the faces as the craft turns. Each flat face gets a gentle shaded
 * curvature so a band has a shape instead of filling the whole panel. Alpha lets what is behind
 * show through; there is no true refraction.
 */
const fragment = /* glsl */ `
  uniform float uOpacity; uniform float uPass; uniform mat4 modelMatrix; uniform vec3 uLightDir;
  varying vec3 vL; varying vec3 vN; varying vec3 vW; varying float vRim; varying float vPanel;

  vec3 spectrum(float t) {
    t = fract(t) * 6.0;
    vec3 c0 = vec3(0.30, 0.90, 0.98); // cyan
    vec3 c1 = vec3(0.18, 0.42, 1.00); // sapphire
    vec3 c2 = vec3(0.50, 0.28, 0.98); // violet
    vec3 c3 = vec3(0.96, 0.36, 0.86); // magenta
    vec3 c4 = vec3(0.30, 0.30, 1.00); // indigo
    vec3 c5 = vec3(0.08, 0.72, 0.95); // deep cyan
    float f = smoothstep(0.0, 1.0, fract(t));
    if (t < 1.0) return mix(c0, c1, f);
    if (t < 2.0) return mix(c1, c2, f);
    if (t < 3.0) return mix(c2, c3, f);
    if (t < 4.0) return mix(c3, c4, f);
    if (t < 5.0) return mix(c4, c5, f);
    return mix(c5, c0, f);
  }

  float w1Hue(vec3 R, vec3 p) {
    return 0.5 + 0.5 * sin(dot(R, vec3(1.9, 2.8, 1.2)) * 1.7 + p.z * 3.4 - abs(p.x) * 2.4);
  }

  void main() {
    float front = gl_FrontFacing ? 1.0 : -1.0;
    vec3 p = vL;
    float side = p.x < 0.0 ? -1.0 : 1.0;
    float flat_ = 1.0 - smoothstep(0.0, 0.5, vRim);
    // Mirror-symmetric faux curvature on the flat faces, none on the true rim normals
    vec3 bend = vec3(
      side * (0.22 * sin(p.z * 5.4 + abs(p.x) * 7.5 + 0.7) + 0.2),
      0.0,
      0.26 * cos(p.z * 6.6 - abs(p.x) * 5.2 + 0.4)
    ) * flat_;
    vec3 N = normalize(mat3(modelMatrix) * (normalize(vN) * front + bend * front));
    vec3 V = normalize(cameraPosition - vW);
    vec3 R = reflect(-V, N);
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float fres = pow(1.0 - ndv, 3.0);

    // Spectral light: thin saturated streaks over a near-black body, strongest toward the panel
    // ends and edges (as in the references), leaving each panel's middle dark
    float ph = dot(R, vec3(0.52, 0.74, 0.31)) * 0.62 + (p.z * 0.34 + abs(p.x) * 0.3) + vPanel * 0.045;
    vec3 sp = spectrum(ph + 0.08 + (w1Hue(R, p) - 0.85) * 0.7);
    float w1 = w1Hue(R, p);
    float w2 = 0.5 + 0.5 * sin(dot(R, vec3(-1.3, 1.6, 2.2)) * 2.1 - p.z * 4.6 + abs(p.x) * 4.1 + 1.9);
    float band = pow(smoothstep(0.62, 1.0, w1), 1.8) + 0.4 * pow(smoothstep(0.74, 1.0, w2), 1.8);
    float mid = smoothstep(0.28, 0.8, w1);

    // Near-black sapphire, gaining depth only at glancing angles
    vec3 body = mix(vec3(0.0006, 0.0016, 0.012), vec3(0.003, 0.022, 0.15), pow(1.0 - ndv, 1.5));
    body += vec3(0.0006, 0.005, 0.035) * mid;
    if (vPanel > 1.5) body *= 0.7; // the central V reads darker than the wings

    // Studio reflections: a key softbox and a long overhead strip
    float key = pow(max(dot(R, uLightDir), 0.0), 34.0);
    float strip = smoothstep(0.1, 0.0, abs(R.y * 0.72 + R.x * 0.42 - 0.26)) * smoothstep(-0.5, 0.5, R.z);
    vec3 env = vec3(0.92, 0.97, 1.0) * (key * 1.4 + strip * 0.12);

    vec3 col = body;
    col += sp * sp * sp * band * (1.25 + 0.5 * fres);
    // A pale core where a streak is strongest, the way white light sits inside a prism band
    col += mix(vec3(1.0, 0.5, 0.26), vec3(1.0, 0.95, 0.85), smoothstep(0.97, 1.0, w1)) * smoothstep(0.93, 1.0, w1) * 0.3;
    col += env * (0.25 + 0.75 * fres);

    // Rim: polished tube of glass. Two bright lines, its crown and its inner shoulder, with
    // deep blue between them: this is what makes the edge read as thick glass, not an outline
    float rim = smoothstep(0.06, 0.34, vRim);
    float lit = 0.5 + 0.5 * dot(R, vec3(-0.35, 0.82, 0.45));
    vec3 tube = mix(vec3(0.006, 0.04, 0.24), vec3(0.03, 0.2, 0.62), lit);
    float crown = smoothstep(0.86, 1.0, vRim);
    float d = (vRim - 0.3) / 0.11;
    float shoulder = exp(-d * d);
    vec3 line = mix(vec3(0.42, 0.84, 1.0), vec3(1.0), smoothstep(0.25, 0.8, lit));
    line = mix(line, sp, 0.14);
    vec3 rimCol = tube + line * (crown * (0.8 + 0.5 * lit) + shoulder * (0.42 + 0.62 * lit)) + vec3(1.0) * key;
    col = mix(col, rimCol, rim);

    float a = mix(uPass > 0.5 ? 0.82 : 0.2, 0.98, rim) + min(band, 1.0) * 0.14 + fres * 0.16 + key * 0.2;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uOpacity);
    #include <colorspace_fragment>
  }`

const haloVertex = /* glsl */ `
  attribute float aRim;
  uniform float uInflate;
  varying vec3 vNV; varying vec3 vVP; varying float vRim;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position + normal * uInflate, 1.0);
    vVP = mv.xyz;
    vNV = normalize(normalMatrix * normal);
    vRim = aRim;
    gl_Position = projectionMatrix * mv;
  }`

/*
 * A thin shell behind the mesh: a soft glow that follows the real silhouette from any angle.
 * It is brightest near the glass and reaches zero exactly at the shell's outer edge (where the
 * surface turns edge-on), so no contour line shows. Only the rim contributes, never the faces.
 */
const haloFragment = /* glsl */ `
  uniform float uOpacity; uniform float uGain; uniform float uAura;
  varying vec3 vNV; varying vec3 vVP; varying float vRim;
  void main() {
    float facing = abs(dot(normalize(vNV), normalize(-vVP)));
    float glow = pow(facing, 1.6) * smoothstep(0.02, 0.5, vRim);
    gl_FragColor = vec4(vec3(0.2, 0.5, 1.0) * glow * uGain * uOpacity * uAura, 1.0);
    #include <colorspace_fragment>
  }`

/**
 * Named poses (radians), composed as spin · yaw · pitch · (bank + roll). See setPose.
 *
 * View vocabulary, for a camera on +Z looking at the wall:
 *   UNDERSIDE  pitch −π/2: the belly (local −Y) faces the camera, nose in the screen plane;
 *              `spin` then turns the nose toward the direction of travel.
 *   FRONT LOCK yaw π, pitch −0.35: the nose leads INTO the wall, its tip on the wall centre and
 *              the wings foreshortened below it: the narrow nose-apex triangle of the approved
 *              straight-front reference. (A nose aimed at the camera could not hit a wall that
 *              lies beyond the aircraft, so the nose-on read is from behind the leading tip.)
 *   TOP        the broad planform; REAR the trailing V. Neither is used as the front.
 */
export const POSES = {
  underside: { spin: 0.78, pitch: -Math.PI / 2, yaw: 0, bank: 0, roll: 0 },
  frontLock: { spin: 0, pitch: -0.35, yaw: Math.PI, bank: 0, roll: 0 },
  // Resting mark beside the eyebrow: the approved angled reference view, top side up
  landing: { spin: 0, pitch: -0.6, yaw: 0.7, bank: -0.62, roll: 2.78 },
  // Nose at the viewer, tipped up: both wings even, keel and underside toward camera
  front: { pitch: -0.94, yaw: 0, bank: 0, roll: 0 },
  // Nose up and to the right; negative bank keeps the wing axis across the frame, so both open
  threeQuarter: { pitch: -0.6, yaw: 0.7, bank: -0.62, roll: 0 },
  bank: { pitch: -0.5, yaw: 0.62, bank: -0.62, roll: 0 },
  // Part way through the axial roll: wing edge-on and underside sweeping past the camera
  rollUnderside: { pitch: -0.56, yaw: 0.66, bank: -0.62, roll: 1.05 },
  // End of the 158° roll. The top of the craft faces the viewer: the approved angled reference
  rollTop: { pitch: -0.6, yaw: 0.7, bank: -0.62, roll: 2.78 },
  exit: { pitch: Math.PI - 0.44, yaw: -0.14, bank: 0, roll: Math.PI },
}

const AX_X = new Vector3(1, 0, 0)
const AX_Y = new Vector3(0, 1, 0)
const AX_Z = new Vector3(0, 0, 1)
const qa = new Quaternion()
const qb = new Quaternion()
const qc = new Quaternion()
const qs = new Quaternion()

export function createArrowcraft({ size = 500, halo = true } = {}) {
  const geometry = buildArrowcraftGeometry()
  const uOpacity = { value: 1 }
  const uAura = { value: 1 }
  const uLightDir = { value: new Vector3(-0.42, 0.78, 0.46).normalize() }
  const make = (side, pass) =>
    new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      side,
      uniforms: { uOpacity, uPass: { value: pass }, uLightDir },
    })
  const backMat = make(BackSide, 0)
  const frontMat = make(FrontSide, 1)

  const makeHalo = (inflate, gain) =>
    new ShaderMaterial({
      vertexShader: haloVertex,
      fragmentShader: haloFragment,
      transparent: true,
      depthWrite: false,
      side: BackSide,
      blending: AdditiveBlending,
      uniforms: { uOpacity, uAura, uInflate: { value: inflate }, uGain: { value: gain } },
    })
  const haloMats = halo ? [makeHalo(0.008, 0.05), makeHalo(0.018, 0.022), makeHalo(0.036, 0.009)] : []

  const travelRig = new Group()
  const poseRig = new Group()
  const body = new Group()
  body.scale.setScalar(size)
  haloMats.forEach((m, i) => {
    const mesh = new Mesh(geometry, m)
    mesh.renderOrder = 9 - i
    mesh.frustumCulled = false
    body.add(mesh)
  })
  const back = new Mesh(geometry, backMat)
  const frontMesh = new Mesh(geometry, frontMat)
  back.renderOrder = 10
  frontMesh.renderOrder = 11
  back.frustumCulled = false
  frontMesh.frustumCulled = false
  body.add(back, frontMesh)
  poseRig.add(body)
  travelRig.add(poseRig)

  /**
   * Orientation in one place. Roll (about the nose) applies first, then pitch (about the wing
   * axis; negative lifts the nose), then yaw (about world up). `bank` and `roll` share an axis
   * and are kept apart only so the timeline can animate them independently.
   */
  function setPose({ pitch, yaw, bank, roll, spin = 0 }) {
    qs.setFromAxisAngle(AX_Z, spin)
    qa.setFromAxisAngle(AX_Y, yaw)
    qb.setFromAxisAngle(AX_X, pitch)
    qc.setFromAxisAngle(AX_Z, bank + roll)
    poseRig.quaternion.copy(qs).multiply(qa).multiply(qb).multiply(qc)
  }

  const setOpacity = (v) => {
    uOpacity.value = v
    travelRig.visible = v > 0.002
  }
  /** The thin prismatic haze around the craft, 0–1 on top of its fixed gains. */
  const setAura = (v) => {
    uAura.value = v
  }

  /** World position of the nose tip, for the wall contact test. */
  const NOSE_TIP = new Vector3(0, 0.004, 0.5)
  function noseTip(out) {
    travelRig.updateMatrixWorld(true)
    return body.localToWorld(out.copy(NOSE_TIP))
  }
  /** World position of the trailing edge (between the keel and the wing roots), for the fog. */
  const TAIL = new Vector3(0, -0.07, -0.43)
  function tailPoint(out) {
    travelRig.updateMatrixWorld(true)
    return body.localToWorld(out.copy(TAIL))
  }
  /** Nose-tip offset from the craft centre in world units, for a given pose and size. */
  function noseOffset(pose, scale, out) {
    setPose(pose)
    return out.copy(NOSE_TIP).multiplyScalar(scale).applyQuaternion(poseRig.quaternion)
  }

  function dispose() {
    geometry.dispose()
    backMat.dispose()
    frontMat.dispose()
    haloMats.forEach((m) => m.dispose())
  }

  return { travelRig, poseRig, body, setPose, setOpacity, setAura, noseTip, tailPoint, noseOffset, dispose, geometry }
}
