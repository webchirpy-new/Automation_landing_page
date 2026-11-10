import { Color, DynamicDrawUsage, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, NormalBlending, PlaneGeometry, ShaderMaterial, Vector3 } from "three"
import { hash01 } from "./introConfig"

/**
 * The aircraft's prismatic vapour wake. One instanced mesh, one draw call, a fixed pool of
 * camera-facing soft sprites in a ring buffer. Sprites are left in WORLD space at the craft's tail
 * as it passes, so the plume bends and curls because the flight did, not because a texture loops.
 * Each sprite is also shed rearward along the tail axis at birth, so a craft that is rolling or
 * moving mostly in depth still streams a wake behind it instead of piling vapour into a puff.
 *
 * It owns no clock: update() receives the master timeline time each render, so seeking, skipping
 * and tier time-scales stay in sync. If time runs backwards (a dev seek) the pool clears.
 * Ageing, growth, curl drift and fade all happen in the vertex shader; JS only writes a sprite
 * when it is born.
 */

const VERTEX = /* glsl */ `
  attribute vec3 aPos;
  attribute vec3 aVel; // shed velocity: rearward along the tail at birth, world units/s
  attribute vec4 aData; // birth, life, size, seed
  attribute vec2 aTone; // hue, amplitude
  uniform float uTime; uniform float uDrift; uniform float uGrow;
  varying vec2 vUv; varying float vAlpha; varying float vHue; varying float vSeed; varying float vAge;
  void main() {
    float age = uTime - aData.x;
    float life = aData.y;
    float q = clamp(age / life, 0.0, 1.0);
    float alive = step(0.0, age) * step(age, life);
    float seed = aData.w;
    // Slow curl: the drift direction turns as the sprite ages, so the plume billows, never streams
    float a = seed * 6.2831 + age * (0.7 + seed * 0.8);
    vec3 drift = vec3(cos(a), sin(a * 0.83 + 1.7), sin(a * 0.61)) * uDrift * aData.z * (0.12 + q * 1.1);
    float size = aData.z * mix(0.6, uGrow, 1.0 - (1.0 - q) * (1.0 - q));
    float rot = seed * 6.2831 + age * (seed - 0.5) * 0.9;
    vec2 p = mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * position.xy;
    // Shed vapour slows as it mixes with the air: the distance covered eases off with age
    vec3 shed = aVel * life * (1.0 - (1.0 - q) * (1.0 - q)) * 0.6;
    vec4 mv = modelViewMatrix * vec4(aPos + shed + drift, 1.0);
    mv.xy += p * size * alive;
    gl_Position = projectionMatrix * mv;
    vUv = uv;
    vSeed = seed;
    vHue = aTone.x;
    vAge = q;
    // Quick soft fade in, long fade out
    vAlpha = alive * aTone.y * smoothstep(0.0, 0.14, q) * pow(1.0 - q, 1.5);
    // Never a large haze right in front of the lens
    vAlpha *= smoothstep(280.0, 760.0, -mv.z);
  }`

const FRAGMENT = /* glsl */ `
  uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;
  uniform float uGlobal;
  varying vec2 vUv; varying float vAlpha; varying float vHue; varying float vSeed; varying float vAge;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  vec3 palette(float t) {
    t = fract(t) * 5.0;
    float f = smoothstep(0.0, 1.0, fract(t));
    if (t < 1.0) return mix(uC0, uC1, f);
    if (t < 2.0) return mix(uC1, uC2, f);
    if (t < 3.0) return mix(uC2, uC3, f);
    if (t < 4.0) return mix(uC3, uC4, f);
    return mix(uC4, uC0, f);
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    // Two octaves of value noise break the disc into vapour; it loosens as the sprite ages
    float n = noise(p * 2.3 + vSeed * 17.0) * 0.62 + noise(p * 5.1 - vSeed * 9.0) * 0.38;
    float m = smoothstep(1.0, 0.1, r + (n - 0.5) * (0.5 + vAge * 0.35));
    m *= m;
    // Hue drifts across the sprite as well as along the trail, so colours overlap, never band
    vec3 col = palette(vHue + p.x * 0.09 + p.y * 0.05 + (n - 0.5) * 0.14);
    float a = m * vAlpha * uGlobal;
    if (a < 0.002) discard;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }`

export function createSpectralFog({ max, config }) {
  const base = new PlaneGeometry(1, 1)
  const geo = new InstancedBufferGeometry()
  geo.index = base.index
  geo.setAttribute("position", base.getAttribute("position"))
  geo.setAttribute("uv", base.getAttribute("uv"))
  const pos = new Float32Array(max * 3)
  const vel = new Float32Array(max * 3)
  const data = new Float32Array(max * 4)
  const tone = new Float32Array(max * 2)
  for (let i = 0; i < max; i++) data[i * 4] = -1e6 // unborn: always dead
  const aPos = new InstancedBufferAttribute(pos, 3).setUsage(DynamicDrawUsage)
  const aVel = new InstancedBufferAttribute(vel, 3).setUsage(DynamicDrawUsage)
  const aData = new InstancedBufferAttribute(data, 4).setUsage(DynamicDrawUsage)
  const aTone = new InstancedBufferAttribute(tone, 2).setUsage(DynamicDrawUsage)
  geo.setAttribute("aPos", aPos)
  geo.setAttribute("aVel", aVel)
  geo.setAttribute("aData", aData)
  geo.setAttribute("aTone", aTone)
  geo.instanceCount = 0

  const [c0, c1, c2, c3, c4] = config.colors.map((c) => new Color(c))
  const uniforms = {
    uTime: { value: 0 },
    uDrift: { value: config.drift },
    uGrow: { value: config.grow },
    uGlobal: { value: 1 },
    uC0: { value: c0 },
    uC1: { value: c1 },
    uC2: { value: c2 },
    uC3: { value: c3 },
    uC4: { value: c4 },
  }
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: NormalBlending,
  })
  const mesh = new Mesh(geo, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 3 // after the opaque wall and debris, before the glow and the glass craft

  let head = 0
  let born = 0
  let lastTime = -1
  let lastSpawnT = -1
  const last = new Vector3()
  let hasLast = false
  const p = new Vector3()

  function clear() {
    for (let i = 0; i < max; i++) data[i * 4] = -1e6
    aData.needsUpdate = true
    geo.instanceCount = 0
    head = 0
    born = 0
    hasLast = false
    lastSpawnT = -1
  }

  function spawn(x, y, z, t, len, amp, shed) {
    const i = head
    const s = born
    head = (head + 1) % max
    born++
    const j = config.spread * len
    pos[i * 3] = x + (hash01(s, 1) - 0.5) * j
    pos[i * 3 + 1] = y + (hash01(s, 2) - 0.5) * j
    pos[i * 3 + 2] = z + (hash01(s, 3) - 0.5) * j
    // Rearward shed, fanned a little so the wake opens like vapour rather than a tube
    const fan = 0.35 * len * config.shed
    vel[i * 3] = shed.x + (hash01(s, 9) - 0.5) * fan
    vel[i * 3 + 1] = shed.y + (hash01(s, 10) - 0.5) * fan
    vel[i * 3 + 2] = shed.z + (hash01(s, 11) - 0.5) * fan
    data[i * 4] = t
    data[i * 4 + 1] = config.trailLifetime * (0.75 + hash01(s, 4) * 0.5)
    data[i * 4 + 2] = len * config.size * (0.7 + hash01(s, 5) * 0.6)
    data[i * 4 + 3] = hash01(s, 6)
    // The hue walks slowly along the trail and with time: neighbours share a colour family
    tone[i * 2] = (s * 0.034 + t * 0.07 + hash01(s, 7) * 0.12) % 1
    tone[i * 2 + 1] = config.trailOpacity * amp * (0.7 + hash01(s, 8) * 0.6)
    geo.instanceCount = Math.min(max, born)
  }

  /**
   * time: master timeline seconds · tail: world point behind the craft · len: craft world length
   * amp: brightness for new sprites (0–1) · emit: whether the craft is still laying vapour
   * visible: global multiplier on the whole plume (0–1), used for the dip at impact and the fade
   */
  function update(time, tail, len, amp, emit, visible, shed) {
    if (time < lastTime - 1e-4) clear()
    uniforms.uTime.value = time
    uniforms.uGlobal.value = visible
    mesh.visible = visible > 0.002 && born > 0 ? true : emit
    if (!emit || len < 1e-3) {
      hasLast = false
      lastTime = time
      return
    }
    let wrote = false
    if (hasLast) {
      const spacing = Math.max(0.5, len * config.emissionSpacing)
      const dist = last.distanceTo(tail)
      const since = time - lastSpawnT
      // Spacing gives a continuous wake at speed; the rate cap keeps a tiny, slow craft from
      // laying a sprite every frame (spacing shrinks with it)
      let n = Math.min(config.maxPerFrame, Math.floor(dist / spacing), Math.floor(since * config.maxRate))
      // A slow or hovering craft still breathes out a thin wake
      if (n === 0 && since >= 1 / config.minRate) n = 1
      for (let k = 1; k <= n; k++) {
        const f = k / n
        p.lerpVectors(last, tail, f)
        spawn(p.x, p.y, p.z, lastTime + (time - lastTime) * f, len, amp, shed)
        wrote = true
      }
      if (n > 0) {
        last.copy(tail)
        lastSpawnT = time
      }
    } else {
      last.copy(tail)
      hasLast = true
      lastSpawnT = time
    }
    if (wrote) {
      aPos.needsUpdate = true
      aVel.needsUpdate = true
      aData.needsUpdate = true
      aTone.needsUpdate = true
    }
    lastTime = time
  }

  /** Live sprites at this time, for QA. */
  function stats(time) {
    let live = 0
    for (let i = 0; i < Math.min(max, born); i++) {
      const age = time - data[i * 4]
      if (age >= 0 && age <= data[i * 4 + 1]) live++
    }
    return { live, born, max }
  }

  function dispose() {
    base.dispose()
    geo.dispose()
    material.dispose()
  }

  return { mesh, update, clear, stats, dispose, uniforms }
}
