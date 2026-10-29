import React, { useEffect, useRef } from "react"

/**
 * Self-organising pixel field (hero signature).
 *
 * - A quiet grid of tiny squares fills the host (the hero section).
 * - Pointer proximity energises nearby cells (warm accent), movement/drag leaves a
 *   decaying trail, a press/tap sends a ring ripple.
 * - Optional (when `stageRef` is given): on a loop, scattered pixels fly in and
 *   assemble into three glyphs on a route — Captured → Replied → Followed up —
 *   inside the stage element, then dissolve and re-scatter.
 * - `intensity` (0–1) scales how strongly the pointer lights the grid.
 *
 * Performance: one canvas, typed arrays, a cached base-grid bitmap, cells drawn
 * in 8 energy buckets (8 fillStyle changes per frame), rAF only while visible.
 * Reduced motion: one static frame with the motif assembled, no pointer effects.
 * Touch: host keeps `touch-action: pan-y` so vertical scrolling is never trapped;
 * taps ripple, sideways drags paint.
 */

// 7×7 glyph bitmaps
const GLYPHS = [
  // Captured — arrow into a tray
  ["...#...", "...#...", ".#####.", "..###..", "...#...", "#.....#", "#######"],
  // Replied — speech bubble with dots
  ["#######", "#.....#", "#.#.#.#", "#.....#", "#######", ".#.....", "#......"],
  // Followed up — check
  ["......#", ".....##", "#...##.", "##.##..", ".###...", "..#....", "......."],
]

export const MOTIF_X = { desktop: [0.4, 0.62, 0.84], mobile: [0.18, 0.5, 0.82] }

const LEVELS = 8
const CYCLE = 9400
const T_IN = 1700
const T_HOLD = 6800
const T_OUT = 8000

const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t)

// grid-dot #DCD9E4 → sun #FDC003 → solar orange #F45E00 → accent red #DE2A06
const RAMP = [
  [220, 217, 228],
  [253, 192, 3],
  [244, 94, 0],
  [222, 42, 6],
]
function bucketColor(b) {
  const t = ((b + 1) / LEVELS) * (RAMP.length - 1)
  const i = Math.min(RAMP.length - 2, Math.floor(t))
  const c = RAMP[i].map((v, j) => Math.round(v + (RAMP[i + 1][j] - v) * (t - i)))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

export default function PixelField({ stageRef, onAssembleChange, className = "", intensity = 1 }) {
  const canvasRef = useRef(null)
  const cbRef = useRef(onAssembleChange)
  cbRef.current = onAssembleChange

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return undefined
    const ctx = canvas.getContext("2d")
    if (!ctx) return undefined

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const colors = Array.from({ length: LEVELS }, (_, b) => bucketColor(b))

    let W = 0
    let H = 0
    let dpr = 1
    let pitch = 14
    let dot = 2
    let cols = 0
    let rows = 0
    let energy = new Float32Array(0)
    let buckets = []
    let bucketLen = new Int32Array(LEVELS)
    let base = null
    let particles = []
    let route = []
    let mobile = false

    const pointer = { x: -1e4, y: -1e4, cx: 0, cy: 0, inside: false, down: false, dirty: false }
    const trail = []
    const ripples = []
    let lastTrail = 0

    let raf = 0
    let running = false
    let visible = false
    let last = performance.now()
    let cycleStart = performance.now() + 500
    let assembled = false

    const rand = (seed) => {
      let s = seed
      return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    }
    let rng = rand(7)

    function scatterPoint() {
      return { x: rng() * W, y: rng() * H }
    }

    function buildMotif() {
      particles = []
      route = []
      const stage = stageRef?.current
      if (!stage) return
      const cr = canvas.getBoundingClientRect()
      const sr = stage.getBoundingClientRect()
      const sx = sr.left - cr.left
      const sy = sr.top - cr.top
      const anchors = mobile ? MOTIF_X.mobile : MOTIF_X.desktop
      const cy = sy + sr.height / 2
      const gy = Math.round(cy / pitch) - 3
      const origins = anchors.map((f) => Math.round((sx + sr.width * f) / pitch) - 3)

      GLYPHS.forEach((g, gi) => {
        g.forEach((row, ry) => {
          for (let rx = 0; rx < row.length; rx++) {
            if (row[rx] !== "#") continue
            const col = origins[gi] + rx
            const r = gy + ry
            const s = scatterPoint()
            particles.push({ tx: col * pitch + pitch / 2, ty: r * pitch + pitch / 2, sx: s.x, sy: s.y, d: rng() * 600, g: gi })
          }
        })
      })
      // Route: lead-in from the source tiles (desktop) and links between glyphs.
      const ry = gy + 3
      const segs = []
      if (!mobile) segs.push([Math.round((sx + sr.width * 0.24) / pitch), origins[0] - 2])
      segs.push([origins[0] + 8, origins[1] - 2], [origins[1] + 8, origins[2] - 2])
      segs.forEach(([a, b]) => {
        for (let c = a; c <= b; c++) route.push({ x: c * pitch + pitch / 2, y: ry * pitch + pitch / 2 })
      })
    }

    function layout() {
      const r = host.getBoundingClientRect()
      W = Math.max(1, Math.round(r.width))
      H = Math.max(1, Math.round(r.height))
      mobile = W < 768
      // Phones: finer pitch so three 7-cell glyphs (84px) sit apart at 320–430px.
      pitch = mobile ? 12 : 14
      dot = 2
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      cols = Math.ceil(W / pitch)
      rows = Math.ceil(H / pitch)
      energy = new Float32Array(cols * rows)
      buckets = Array.from({ length: LEVELS }, () => new Int32Array(cols * rows))
      bucketLen = new Int32Array(LEVELS)

      base = document.createElement("canvas")
      base.width = W * dpr
      base.height = H * dpr
      const b = base.getContext("2d")
      b.setTransform(dpr, 0, 0, dpr, 0, 0)
      b.fillStyle = "#e3e0ea"
      const off = pitch / 2 - dot / 2
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) b.fillRect(x * pitch + off, y * pitch + off, dot, dot)

      rng = rand(11)
      buildMotif()
      if (reduce || !running) drawStatic()
    }

    function inject(cx, cy, radiusCells, strength, ring) {
      const R = radiusCells * pitch
      const c0 = Math.max(0, Math.floor((cx - R) / pitch))
      const c1 = Math.min(cols - 1, Math.ceil((cx + R) / pitch))
      const r0 = Math.max(0, Math.floor((cy - R) / pitch))
      const r1 = Math.min(rows - 1, Math.ceil((cy + R) / pitch))
      for (let y = r0; y <= r1; y++) {
        for (let x = c0; x <= c1; x++) {
          const dx = x * pitch + pitch / 2 - cx
          const dy = y * pitch + pitch / 2 - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          let v
          if (ring) {
            const band = pitch * 1.3
            const dd = Math.abs(dist - ring)
            if (dd > band) continue
            v = (1 - dd / band) * strength
          } else {
            if (dist > R) continue
            const k = 1 - dist / R
            v = k * k * strength
          }
          const i = y * cols + x
          if (v > energy[i]) energy[i] = v
        }
      }
    }

    function drawCells() {
      bucketLen.fill(0)
      for (let i = 0; i < energy.length; i++) {
        const e = energy[i]
        if (e < 0.04) continue
        const b = Math.min(LEVELS - 1, (e * LEVELS) | 0)
        buckets[b][bucketLen[b]++] = i
      }
      for (let b = 0; b < LEVELS; b++) {
        const n = bucketLen[b]
        if (!n) continue
        ctx.fillStyle = colors[b]
        const s = dot + ((b + 1) / LEVELS) * (pitch * 0.62 - dot)
        const off = pitch / 2 - s / 2
        const arr = buckets[b]
        for (let k = 0; k < n; k++) {
          const i = arr[k]
          const x = i % cols
          const y = (i / cols) | 0
          ctx.fillRect(x * pitch + off, y * pitch + off, s, s)
        }
      }
    }

    function drawMotif(t) {
      const s = pitch * 0.62
      // 0..1 assembly progress per particle, plus fade on dissolve
      const outK = t > T_HOLD ? clamp01((t - T_HOLD) / (T_OUT - T_HOLD)) : 0
      const restK = t > T_OUT ? 1 : 0
      for (let p = 0; p < particles.length; p++) {
        const q = particles[p]
        let k = restK ? 0 : clamp01((t - q.d) / (T_IN - 600))
        k = easeOut(k)
        if (outK) k = 1 - easeOut(outK)
        const x = q.sx + (q.tx - q.sx) * k
        const y = q.sy + (q.ty - q.sy) * k
        const alpha = 0.28 + 0.72 * k
        ctx.globalAlpha = alpha
        ctx.fillStyle = k > 0.98 ? "#de2a06" : "#ff7a1a"
        const size = (dot + 1) + (s - dot - 1) * k
        ctx.fillRect(x - size / 2, y - size / 2, size, size)
      }
      // Route + travelling signal head once assembled
      if (t > T_IN - 200 && t < T_HOLD + 400 && route.length) {
        const a = clamp01((t - (T_IN - 200)) / 400) * (t > T_HOLD ? 1 - clamp01((t - T_HOLD) / 400) : 1)
        const rs = Math.max(2, pitch * 0.22)
        ctx.globalAlpha = 0.85 * a
        ctx.fillStyle = "#ff7a1a"
        for (let i = 0; i < route.length; i += 1) ctx.fillRect(route[i].x - rs / 2, route[i].y - rs / 2, rs, rs)
        const n = route.length
        const head = Math.floor(((t - T_IN) / 1500) * n) % n
        if (head >= 0) {
          ctx.globalAlpha = a
          ctx.fillStyle = "#de2a06"
          for (let j = 0; j < Math.min(4, n); j++) {
            const r = route[(((head - j) % n) + n) % n]
            const hs = pitch * (0.62 - j * 0.1)
            ctx.fillRect(r.x - hs / 2, r.y - hs / 2, hs, hs)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    function setAssembled(v) {
      if (v !== assembled) {
        assembled = v
        if (cbRef.current) cbRef.current(v)
      }
    }

    function drawStatic() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (base) ctx.drawImage(base, 0, 0, W, H)
      if (reduce && particles.length) {
        drawMotif(T_IN + 400)
        setAssembled(true)
      }
    }

    function frame(now) {
      raf = 0
      if (!running) return
      const dt = Math.min(64, now - last)
      last = now

      // Pointer: read rect once per frame (no DOM writes in this loop).
      if (pointer.dirty) {
        const cr = canvas.getBoundingClientRect()
        pointer.x = pointer.cx - cr.left
        pointer.y = pointer.cy - cr.top
        pointer.dirty = false
        if (now - lastTrail > 16) {
          trail.push({ x: pointer.x, y: pointer.y, t: now, s: pointer.down ? 1 : 0.6 })
          lastTrail = now
          if (trail.length > 48) trail.shift()
        }
      }

      const decay = Math.pow(0.9, dt / 16.7)
      for (let i = 0; i < energy.length; i++) energy[i] *= decay

      if (pointer.inside) inject(pointer.x, pointer.y, pointer.down ? 4 : 3.2, (pointer.down ? 1 : 0.8) * intensity)
      for (let i = trail.length - 1; i >= 0; i--) {
        const age = now - trail[i].t
        if (age > 700) {
          trail.splice(0, i + 1)
          break
        }
        inject(trail[i].x, trail[i].y, 1.8, (1 - age / 700) * 0.85 * trail[i].s * intensity)
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const age = now - ripples[i].t
        if (age > 900) {
          ripples.splice(i, 1)
          continue
        }
        const r = (age / 900) * pitch * 10
        inject(ripples[i].x, ripples[i].y, r / pitch + 2, (1 - age / 900) * intensity, r)
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.drawImage(base, 0, 0, W, H)
      drawCells()

      const t = now - cycleStart
      // The assembling motif only runs when a stage element is supplied.
      if (t >= 0 && particles.length) {
        if (t > CYCLE) {
          cycleStart = now
          rng = rand(((now | 0) % 9973) + 3)
          particles.forEach((q) => {
            const s = scatterPoint()
            q.sx = s.x
            q.sy = s.y
            q.d = rng() * 600
          })
        }
        drawMotif(Math.max(0, now - cycleStart))
        const tt = now - cycleStart
        setAssembled(tt > T_IN && tt < T_HOLD)
      }

      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (reduce || running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    // Pointer handling on the host (canvas itself is pointer-events: none).
    const onMove = (e) => {
      pointer.cx = e.clientX
      pointer.cy = e.clientY
      pointer.inside = true
      pointer.dirty = true
    }
    const onDown = (e) => {
      onMove(e)
      pointer.down = true
      const cr = canvas.getBoundingClientRect()
      ripples.push({ x: e.clientX - cr.left, y: e.clientY - cr.top, t: performance.now() })
      if (ripples.length > 6) ripples.shift()
    }
    const onUp = () => {
      pointer.down = false
    }
    const onLeave = (e) => {
      pointer.down = false
      if (e.pointerType === "mouse") pointer.inside = false
    }
    const onTouchEnd = (e) => {
      if (e.pointerType !== "mouse") pointer.inside = false
      pointer.down = false
    }

    if (!reduce) {
      host.addEventListener("pointermove", onMove, { passive: true })
      host.addEventListener("pointerdown", onDown, { passive: true })
      host.addEventListener("pointerup", onTouchEnd, { passive: true })
      host.addEventListener("pointercancel", onTouchEnd, { passive: true })
      host.addEventListener("pointerleave", onLeave, { passive: true })
      window.addEventListener("pointerup", onUp, { passive: true })
    }

    const ro = new ResizeObserver(() => layout())
    ro.observe(host)
    if (stageRef?.current) ro.observe(stageRef.current)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !document.hidden) start()
      else stop()
    })
    io.observe(host)

    const onVis = () => {
      if (document.hidden) stop()
      else if (visible) start()
    }
    document.addEventListener("visibilitychange", onVis)

    layout()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerdown", onDown)
      host.removeEventListener("pointerup", onTouchEnd)
      host.removeEventListener("pointercancel", onTouchEnd)
      host.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("pointerup", onUp)
    }
  }, [stageRef, intensity])

  return <canvas ref={canvasRef} className={`pixel-field ${className}`} aria-hidden="true" />
}
