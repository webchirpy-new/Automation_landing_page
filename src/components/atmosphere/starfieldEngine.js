import { LAYERS, PRESETS, tierFor } from "./starfieldPresets"

/**
 * Canvas 2D star renderer, shared by every dark section.
 *
 * - One requestAnimationFrame loop drives all visible fields, capped at 20 fps: at under 1.5 px/s
 *   a higher rate cannot be seen, and each frame re-uploads a full-screen canvas. It stops completely when nothing
 *   is visible or the tab is hidden.
 * - It also holds still while the page is actively scrolling. A star moves about 1 px/s, so a
 *   pause during a scroll cannot be seen, and scrolling gets the whole frame budget.
 * - Stars are seeded, so a section's layout is stable between renders and differs from every
 *   other section's.
 * - Each star sits at an offset from the frame centre and at a depth that slowly grows, so the
 *   field draws very gently inward toward its vanishing point, on top of a slight diagonal drift. A star leaving
 *   the frame is replaced elsewhere and fades in, so nothing ever visibly teleports.
 * - Stars are drawn from a small round sprite: optically tiny points, never squares.
 */

const FRAME_MS = 1000 / 20
const MAX_STEP = 0.1
const CELL = 28 // px per cell of the text-protection grid
const MARGIN = 8
const SCROLL_HOLD_MS = 140

const fields = new Set()
let raf = 0
let last = 0
let quality = 1
let cost = 0
let frames = 0
let lastScroll = 0

const anyRunning = () => [...fields].some((f) => f.running)

function loop(now) {
  raf = requestAnimationFrame(loop)
  if (now - last < FRAME_MS - 2) return
  if (now - lastScroll < SCROLL_HOLD_MS) {
    last = now // the hold spends no star time, so nothing jumps afterward
    return
  }
  const dt = last ? Math.min((now - last) / 1000, MAX_STEP) : 0
  last = now
  const t0 = performance.now()
  fields.forEach((f) => f.running && f.frame(dt))
  // If drawing is costing real frame budget, thin the stars rather than touch anything else
  cost += performance.now() - t0
  if (++frames === 45) {
    if (cost / frames > 6 && quality > 0.5) quality = Math.max(0.5, quality - 0.15)
    stats.avgFrameMs = +(cost / frames).toFixed(2)
    stats.quality = quality
    cost = 0
    frames = 0
  }
  stats.ticks++
}

function wake() {
  if (raf || document.hidden || !anyRunning()) return
  last = 0
  raf = requestAnimationFrame(loop)
}
function sleep() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}
function sync() {
  if (document.hidden || !anyRunning()) sleep()
  else wake()
}

const stats = { ticks: 0, avgFrameMs: 0, quality: 1 }
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", sync)
  window.addEventListener("scroll", () => (lastScroll = performance.now()), { passive: true })
}

/* ---------- Seeded random ---------- */
export function hashSeed(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
function mulberry(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeSprite(r, g, b) {
  const c = document.createElement("canvas")
  c.width = c.height = 32
  const x = c.getContext("2d")
  const grad = x.createRadialGradient(16, 16, 0, 16, 16, 16)
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
  grad.addColorStop(0.5, `rgba(${r},${g},${b},0.92)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  x.fillStyle = grad
  x.fillRect(0, 0, 32, 32)
  return c
}

/**
 * @param canvas   the element to draw into
 * @param preset   key of PRESETS
 * @param seed     any string; each section passes its own
 * @param still    reduced motion: render one static frame, never animate
 */
export function createStarfield(canvas, { preset, seed, still }) {
  const ctx = canvas.getContext("2d", { alpha: true })
  if (!ctx) return null
  const P = PRESETS[preset]
  const rand = mulberry(hashSeed(seed))
  const MAX = tierFor(9999).cap
  const n = MAX

  const ox = new Float32Array(n)
  const oy = new Float32Array(n)
  const depth = new Float32Array(n)
  const age = new Float32Array(n)
  const size = new Float32Array(n)
  const alpha = new Float32Array(n)
  const tw = new Float32Array(n)
  const twF = new Float32Array(n)
  const ph = new Float32Array(n)
  const layer = new Uint8Array(n)
  const accent = new Uint8Array(n)

  const white = makeSprite(238, 241, 244)
  const tint = makeSprite(...P.accent)

  let W = 0
  let H = 0
  let dpr = 1
  let tier = tierFor(1440)
  let count = 0
  let time = rand() * 1000
  let viewOffset = 0
  let mask = null
  let cols = 0
  let rows = 0
  const headX = Math.cos((P.heading * Math.PI) / 180)
  const headY = Math.sin((P.heading * Math.PI) / 180)

  // Spread stars across the frame; edgeBias thins the middle for sections with centred copy
  function place(i, d) {
    let x = 0
    let y = 0
    for (let tries = 0; tries < 4; tries++) {
      x = (rand() - 0.5) * W
      y = (rand() - 0.5) * H
      const r = Math.hypot(x / (W / 2 || 1), y / (H / 2 || 1))
      if (rand() > P.edgeBias * (1 - Math.min(1, r))) break
    }
    ox[i] = x * d
    oy[i] = y * d
    depth[i] = d
  }

  for (let i = 0; i < n; i++) {
    const roll = rand()
    const l = roll < LAYERS[0].share ? 0 : roll < LAYERS[0].share + LAYERS[1].share ? 1 : 2
    const L = LAYERS[l]
    layer[i] = l
    size[i] = L.size[0] + rand() * (L.size[1] - L.size[0])
    alpha[i] = L.alpha[0] + rand() * (L.alpha[1] - L.alpha[0])
    tw[i] = L.twinkle * (0.4 + rand() * 0.6)
    twF[i] = (Math.PI * 2) / (4 + rand() * 8) // 4–12 s, never in step
    ph[i] = rand() * Math.PI * 2
    accent[i] = rand() < 0.012 ? 1 : 0
    age[i] = 99 // already faded in
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const active = Math.floor(count * quality)
    const cx = W / 2
    const cy = H / 2
    for (let i = 0; i < active; i++) {
      const d = depth[i]
      const sx = cx + ox[i] / d + (still ? 0 : Math.sin(time * twF[i] * 0.4 + ph[i]) * 0.5)
      const sy = cy + oy[i] / d + (still ? 0 : Math.cos(time * twF[i] * 0.3 + ph[i]) * 0.5)
      let a = alpha[i]
      if (!still) {
        a *= 1 - tw[i] * (0.5 + 0.5 * Math.sin(time * twF[i] + ph[i]))
        if (age[i] < 3) a *= age[i] / 3
      }
      if (mask) {
        const c = Math.floor(sx / CELL)
        const r = Math.floor((sy + viewOffset) / CELL)
        if (c >= 0 && c < cols && r >= 0 && r < rows) a *= mask[r * cols + c]
      }
      if (a < 0.015) continue
      ctx.globalAlpha = a
      // The sprite's edge is soft, so it is drawn a little wider than the visual diameter
      // ...and never under about a device pixel, or a 1x screen would lose the faint layer entirely
      const dia = Math.max((size[i] * 1.7) / Math.sqrt(d), 1.45 / dpr)
      ctx.drawImage(accent[i] ? tint : white, sx - dia / 2, sy - dia / 2, dia, dia)
    }
    ctx.globalAlpha = 1
  }

  const field = {
    running: false,
    frame(dt) {
      time += dt
      const active = Math.floor(count * quality)
      const k = tier.motion * dt
      const cx = W / 2
      const cy = H / 2
      for (let i = 0; i < active; i++) {
        const L = LAYERS[layer[i]]
        depth[i] += L.depthRate * k // recedes: the field draws the eye inward
        ox[i] += headX * L.drift * k * depth[i]
        oy[i] += headY * L.drift * k * depth[i]
        age[i] += dt
        const sx = cx + ox[i] / depth[i]
        const sy = cy + oy[i] / depth[i]
        if (sx < -MARGIN || sx > W + MARGIN || sy < -MARGIN || sy > H + MARGIN || depth[i] > 1.45) {
          place(i, 0.78 + rand() * 0.12)
          age[i] = 0
        }
      }
      draw()
    },
    /** New canvas size. Stars keep their relative positions, so a resize never jumps the field. */
    resize(width, height) {
      const fresh = !W
      const sx = W ? width / W : 1
      const sy = H ? height / H : 1
      W = width
      H = height
      tier = tierFor(width)
      dpr = Math.min(window.devicePixelRatio || 1, tier.dpr)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      count = Math.min(MAX, tier.cap, Math.round((P.density * tier.density * W * H) / 100000))
      if (fresh) {
        for (let i = 0; i < n; i++) place(i, 0.85 + rand() * 0.15 + rand() * 0.15)
      } else if (sx !== 1 || sy !== 1) {
        for (let i = 0; i < n; i++) {
          ox[i] *= sx
          oy[i] *= sy
        }
      }
      draw()
    },
    /** Dims stars behind text. `rects` are in section coordinates; `height` is the section's. */
    setClearZones(rects, width, height) {
      cols = Math.max(1, Math.ceil(width / CELL))
      rows = Math.max(1, Math.ceil(height / CELL))
      const m = new Float32Array(cols * rows).fill(1)
      rects.forEach((q) => {
        const c0 = Math.max(0, Math.floor(q.l / CELL))
        const c1 = Math.min(cols - 1, Math.floor(q.r / CELL))
        const r0 = Math.max(0, Math.floor(q.t / CELL))
        const r1 = Math.min(rows - 1, Math.floor(q.b / CELL))
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) m[r * cols + c] = P.clear
      })
      // One soft pass, so the protected area has no visible edge
      const out = new Float32Array(m.length)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let sum = 0
          let w = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const rr = r + dr
              const cc = c + dc
              if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue
              sum += m[rr * cols + cc]
              w++
            }
          }
          out[r * cols + c] = Math.min(m[r * cols + c] === 1 ? 1 : 0.5, sum / w)
        }
      }
      mask = out
      if (!field.running) draw()
    },
    setViewOffset(v) {
      viewOffset = v
    },
    start() {
      if (still) {
        draw()
        return
      }
      field.running = true
      wake()
    },
    stop() {
      field.running = false
      sync()
    },
    destroy() {
      field.running = false
      fields.delete(field)
      sync()
    },
    get info() {
      return { preset, seed, stars: Math.floor(count * quality), w: W, h: H, dpr, tier: tier.name, running: field.running }
    },
  }
  fields.add(field)
  return field
}

export const starfieldStats = () => ({ ...stats, rafActive: !!raf, fields: [...fields].map((f) => f.info) })
