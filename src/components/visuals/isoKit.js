/**
 * isoKit — tiny isometric geometry for the 2.5D illustrations (no 3D library).
 *
 * World axes: u runs to the lower right, v to the lower left, z up. 2:1 dimetric projection,
 * 1 world unit = 1 px along u. Shapes are drawn in a plane (floor or one of two walls) and
 * "extruded": the visible side walls are the convex hull of the face and its offset copy, so any
 * rounded shape gets clean, solid sides without per-face maths.
 */
export const ORIGIN = [260, 128]
export const P = (u, v, z = 0) => [ORIGIN[0] + u - v, ORIGIN[1] + (u + v) / 2 - z]

// Linear part of the plane → screen map, as SVG matrix (a b c d)
const PLANES = {
  floor: [1, 0.5, -1, 0.5], // local x → +u, local y → +v (lying flat)
  wallL: [1, 0.5, 0, 1], // faces front-left: local x → +u, local y → down
  wallR: [1, -0.5, 0, 1], // faces front-right: local x → −v, local y → down
}
// Which way a face's thickness runs on screen, per unit of depth
const DEPTH = { floor: [0, 1], wallL: [1, -0.5], wallR: [-1, -0.5] }

export const planeMatrix = (plane, [e, f]) => `matrix(${PLANES[plane].join(" ")} ${e.toFixed(2)} ${f.toFixed(2)})`

/** Points around a rounded rectangle (local coords, clockwise from the top-right corner). */
export function roundRect(x0, y0, w, h, r, seg = 6) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  const corners = [
    [x0 + w - rr, y0 + rr, -90],
    [x0 + w - rr, y0 + h - rr, 0],
    [x0 + rr, y0 + h - rr, 90],
    [x0 + rr, y0 + rr, 180],
  ]
  const pts = []
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = ((a0 + (90 * i) / seg) * Math.PI) / 180
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)])
    }
  }
  return pts
}

const project = (plane, [e, f]) => {
  const [a, b, c, d] = PLANES[plane]
  return ([x, y]) => [e + a * x + c * y, f + b * x + d * y]
}

export const toPath = (pts, close = true) =>
  `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}${close ? "Z" : ""}`

/** Convex hull (monotone chain). */
export function hull(points) {
  const pts = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1])
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

/** The lower (front) run of a convex outline, from its leftmost to its rightmost point. */
function frontEdge(pts) {
  let li = 0
  let ri = 0
  pts.forEach((p, i) => {
    if (p[0] < pts[li][0]) li = i
    if (p[0] > pts[ri][0]) ri = i
  })
  const walk = (from, to, step) => {
    const out = []
    for (let i = from; ; i = (i + step + pts.length) % pts.length) {
      out.push(pts[i])
      if (i === to) break
    }
    return out
  }
  const a = walk(li, ri, 1)
  const b = walk(li, ri, -1)
  const lowest = (run) => Math.max(...run.map((p) => p[1]))
  return lowest(a) >= lowest(b) ? a : b
}

/** A flat rounded shape in a plane, as a screen-space path. */
export function face(plane, at, x0, y0, w, h, r, seg) {
  return toPath(roundRect(x0, y0, w, h, r, seg).map(project(plane, at)))
}

/**
 * An extruded rounded slab. `at` is the screen point of the face's local origin (for floor
 * shapes: the top face, at its height). Returns paths for the face, the solid body (side walls),
 * the walls alone (even-odd ring, for drawing over contents) and the front edge (for a rim light).
 */
export function prism({ plane = "floor", at, w, h, r = 0, depth, seg = 6 }) {
  const facePts = roundRect(0, 0, w, h, r, seg).map(project(plane, at))
  const [dx, dy] = DEPTH[plane]
  const back = facePts.map(([x, y]) => [x + dx * depth, y + dy * depth])
  const body = toPath(hull(facePts.concat(back)))
  const top = toPath(facePts)
  return { face: top, body, walls: `${body}${top}`, front: toPath(frontEdge(facePts), false), matrix: planeMatrix(plane, at) }
}

/** A circle lying on the floor (radius in world units), as ellipse props. */
export function floorCircle(u, v, z, r) {
  const [cx, cy] = P(u, v, z)
  return { cx, cy, rx: r * Math.SQRT2, ry: r * Math.SQRT1_2 }
}

/** A vertical cylinder standing on the floor: body path + top ellipse. */
export function cylinder(u, v, r, height, z0 = 0) {
  const b = floorCircle(u, v, z0, r)
  const t = floorCircle(u, v, z0 + height, r)
  const body = `M${b.cx - b.rx} ${t.cy}L${b.cx - b.rx} ${b.cy}A${b.rx} ${b.ry} 0 0 0 ${b.cx + b.rx} ${b.cy}L${b.cx + b.rx} ${t.cy}Z`
  return { body, top: t }
}

/** An iso bar (square footprint) of height h, as three face paths with a fixed command layout,
 *  so Motion can tween between heights. */
export function bar(u, v, s, h) {
  const q = (a, b, z) => P(a, b, z).map((n) => n.toFixed(1)).join(" ")
  return {
    top: `M${q(u, v, h)}L${q(u + s, v, h)}L${q(u + s, v + s, h)}L${q(u, v + s, h)}Z`,
    left: `M${q(u, v + s, h)}L${q(u + s, v + s, h)}L${q(u + s, v + s, 0)}L${q(u, v + s, 0)}Z`,
    right: `M${q(u + s, v, h)}L${q(u + s, v + s, h)}L${q(u + s, v + s, 0)}L${q(u + s, v, 0)}Z`,
  }
}

/** A camera-facing speech bubble outline (tail at bottom-left), top-left at (x, y). */
export function bubblePath(x, y, w, h, r = 8, tail = 7) {
  return [
    `M${x + r} ${y}`,
    `H${x + w - r}`,
    `Q${x + w} ${y} ${x + w} ${y + r}`,
    `V${y + h - r}`,
    `Q${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `H${x + 16}`,
    `L${x + 7} ${y + h + tail}`,
    `L${x + 9} ${y + h}`,
    `H${x + r}`,
    `Q${x} ${y + h} ${x} ${y + h - r}`,
    `V${y + r}`,
    `Q${x} ${y} ${x + r} ${y}`,
    "Z",
  ].join("")
}
