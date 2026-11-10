import {
  AdditiveBlending,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  BufferAttribute,
  Mesh,
  ShaderMaterial,
  Vector2,
} from "three"
import { hash01 } from "./introConfig"

/**
 * Whole-viewport forward travel. Every streak is a real 3D segment parallel to the camera's view
 * axis, at a fixed x/y around that axis, moving along z. Nothing is drawn or animated in screen
 * space: perspective alone makes the lines fan out from the vanishing point on the camera axis,
 * so they cover all four sides of the frame, near lines move fastest and grow thicker, and there
 * is no sideways bias. All movement is computed in the vertex shader from one travel uniform.
 */

const RANGE = 6800

const vertex = /* glsl */ `
  attribute vec2 aQuad;      // x: 0 tail, 1 head · y: side
  attribute vec3 aRadial;    // angle, radius, phase
  attribute vec2 aShape;     // length, width in px
  attribute vec3 aTint;
  uniform float uTravel; uniform float uRange; uniform float uCamZ; uniform vec2 uViewport; uniform float uFocal;
  varying float vAlong; varying float vSide; varying vec3 vColor;
  void main() {
    // Distance ahead of the camera, wrapping from the far end of the tunnel to the lens
    float ahead = uRange - mod(aRadial.z * uRange + uTravel, uRange);
    float headD = max(ahead, 34.0);
    float tailD = max(ahead + aShape.x, 34.0);
    vec2 xy = vec2(cos(aRadial.x), sin(aRadial.x)) * aRadial.y;
    vec4 head = projectionMatrix * viewMatrix * vec4(xy, uCamZ - headD, 1.0);
    vec4 tail = projectionMatrix * viewMatrix * vec4(xy, uCamZ - tailD, 1.0);
    vec2 a = tail.xy / tail.w;
    vec2 b = head.xy / head.w;
    vec2 d = (b - a) * uViewport;
    float l = length(d);
    vec2 n = l > 0.001 ? vec2(-d.y, d.x) / l : vec2(0.0, 1.0);
    vec4 pos = mix(tail, head, aQuad.x);
    float dist = mix(tailD, headD, aQuad.x);
    float px = clamp(aShape.y * uFocal / dist, 0.7, aShape.y * 2.2);
    pos.xy += n * aQuad.y * px / uViewport * pos.w * 2.0;
    gl_Position = pos;
    vAlong = aQuad.x;
    vSide = aQuad.y;
    // Born in the dark at the far end, gone before it can pop at the lens
    float born = smoothstep(uRange, uRange * 0.62, ahead);
    float leaving = smoothstep(0.0, 260.0, ahead + aShape.x * 0.5);
    vColor = aTint * born * leaving;
  }`

const fragment = /* glsl */ `
  uniform float uIntensity;
  varying float vAlong; varying float vSide; varying vec3 vColor;
  void main() {
    float across = 1.0 - vSide * vSide;
    float along = pow(vAlong, 1.2) * smoothstep(1.0, 0.95, vAlong);
    vec3 c = vColor * along * across * across * uIntensity;
    gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
    #include <colorspace_fragment>
  }`

const PALETTE = ["#84ddf7", "#6a9ce8", "#9676e7", "#7fe6f2", "#e0aced", "#5e8cf0"].map((c) => new Color(c))

/** @param major clearly visible streaks · @param faint supporting trails · @param k viewport scale */
export function createPortalField({ major, faint, k, width, height, focal }) {
  const total = major + faint
  const geo = new InstancedBufferGeometry()
  geo.setAttribute("position", new BufferAttribute(new Float32Array(12), 3)) // positions come from aQuad
  geo.setAttribute("aQuad", new BufferAttribute(new Float32Array([0, -1, 1, -1, 1, 1, 0, 1]), 2))
  geo.setIndex([0, 1, 2, 0, 2, 3])
  geo.instanceCount = total

  const radial = new Float32Array(total * 3)
  const shape = new Float32Array(total * 2)
  const tint = new Float32Array(total * 3)
  const reach = Math.hypot(width, height) / 2
  for (let i = 0; i < total; i++) {
    const isMajor = i < major
    const n = isMajor ? major : faint
    const slot = isMajor ? i : i - major
    // Even coverage of the full circle with a little irregularity, so no side of the frame is empty
    const angle = ((slot + 0.5 + (hash01(i, 11) - 0.5) * 0.62) / n) * Math.PI * 2 + (isMajor ? 0 : 0.21)
    // Off-axis distance chosen against the frame size so streaks actually reach its edges
    const radius = (isMajor ? 0.42 + hash01(i, 12) * 0.62 : 0.3 + hash01(i, 12) * 0.9) * reach
    radial[i * 3] = angle
    radial[i * 3 + 1] = radius
    radial[i * 3 + 2] = hash01(i, 13)
    shape[i * 2] = isMajor ? 2300 + hash01(i, 14) * 2100 : 900 + hash01(i, 15) * 1300
    shape[i * 2 + 1] = (isMajor ? 2.2 + hash01(i, 16) * 1.6 : 1 + hash01(i, 17) * 0.6) * Math.max(0.75, k)
    const c = PALETTE[i % PALETTE.length]
    const gain = isMajor ? 1.15 + hash01(i, 18) * 0.35 : 0.4 + hash01(i, 19) * 0.2
    tint[i * 3] = c.r * gain
    tint[i * 3 + 1] = c.g * gain
    tint[i * 3 + 2] = c.b * gain
  }
  geo.setAttribute("aRadial", new InstancedBufferAttribute(radial, 3))
  geo.setAttribute("aShape", new InstancedBufferAttribute(shape, 2))
  geo.setAttribute("aTint", new InstancedBufferAttribute(tint, 3))

  const uniforms = {
    uTravel: { value: 0 },
    uRange: { value: RANGE },
    uCamZ: { value: 0 },
    uIntensity: { value: 0 },
    uFocal: { value: focal },
    uViewport: { value: new Vector2(width, height) },
  }
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
    premultipliedAlpha: true,
  })
  const mesh = new Mesh(geo, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 6 // behind the aircraft
  mesh.visible = false

  return {
    mesh,
    update(travel, intensity, camZ) {
      mesh.visible = intensity > 0.002
      uniforms.uTravel.value = travel
      uniforms.uIntensity.value = intensity
      uniforms.uCamZ.value = camZ
    },
    /** The streak layout, for tests: angle of every line about the vanishing point. */
    angles: () => Array.from({ length: total }, (_, i) => radial[i * 3]),
    dispose() {
      geo.dispose()
      material.dispose()
    },
  }
}
