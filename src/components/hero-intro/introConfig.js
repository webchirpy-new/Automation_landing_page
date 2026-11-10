/**
 * Shared, deterministic maths for the Hero's "Automation Dimension" intro.
 * Pure helpers only: both the WebGL scene (during the intro) and the CSS 3D corner cubes
 * (after it) read the same grid, camera distance and corner list, so the hand-off lines up.
 */

/** Tile ids that fly the orbit, in priority order. Hidden/blocked tiles are skipped at runtime. */
export const ORBIT_PRIORITY = ["whatsapp", "gmail", "hubspot", "sheets", "calendar", "chat"]

/**
 * Master timeline event labels (desktop seconds). The total is about 10.6 s (V5: +0.3 s through
 * the loop and front turn, +0.4 s on the landing; was 10.1 s). Tablet and phone run the same beats
 * a little faster through timeScale. `lensDebris` marks the planned contact; the wall itself breaks
 * when the scene detects the nose tip at the wall face (diag.impact).
 */
export const BEATS = [
  { id: 1, name: "wallReady", start: 0 },
  { id: 2, name: "undersideEntry", start: 1.05 },
  { id: 3, name: "loopStart", start: 2.45 },
  { id: 4, name: "frontLock", start: 3.85 },
  { id: 5, name: "lensDebris", start: 4.26 },
  { id: 6, name: "slowRoll", start: 4.85 },
  { id: 7, name: "orbitScatter", start: 6.15 },
  { id: 8, name: "portal", start: 6.85 },
  { id: 10, name: "eyebrowLanding", start: 7.65 },
  { id: 9, name: "heroReveal", start: 8.2 },
  { id: 11, name: "ctaReady", start: 9.65 },
  { id: 12, name: "markHandoff", start: 10.6 },
]

/**
 * Spectral fog trail (see spectralFog.js). Sizes and spacing are fractions of the aircraft's
 * current world length, so the plume tapers by itself as the craft shrinks into its slot.
 * Tuned against stepped frames at 1440×900 and 390×844.
 */
export const FOG = {
  trailOpacity: 0.4, // per-sprite alpha at full intensity; many sprites overlap
  emissionSpacing: 0.06, // one sprite per this much travel (× craft length)
  minRate: 20, // sprites per second even when the craft barely moves
  maxRate: 150, // sprites per second at most
  trailLifetime: 1.3, // seconds, ±25% per sprite
  spread: 0.14, // emission jitter (× craft length)
  drift: 0.2, // curl drift (× sprite size)
  size: 0.42, // birth size (× craft length)
  grow: 1.9, // size at end of life (× birth size)
  shed: 0.75, // rearward shed speed at birth (craft lengths per second)
  maxPerFrame: 8,
  // Approved spectral family (V4 tokens, mid tones so the plume reads on the white wall too)
  colors: ["#75E3F1", "#6298E9", "#9D85E7", "#B4A4EB", "#DF9BCB"],
}

/**
 * Monotone cubic interpolation (Fritsch–Carlson) through (t, v) keys. C1-continuous, never
 * overshoots a key, and flat across repeated values, so a held pose stays held and a turn that
 * continues through a key keeps its speed instead of stopping at it.
 */
export function monotoneTrack(keys) {
  const n = keys.length
  const t = keys.map((k) => k[0])
  const v = keys.map((k) => k[1])
  const d = []
  for (let i = 0; i < n - 1; i++) d.push((v[i + 1] - v[i]) / (t[i + 1] - t[i]))
  const m = new Array(n).fill(0)
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) continue
    const w1 = 2 * (t[i + 1] - t[i]) + (t[i] - t[i - 1])
    const w2 = (t[i + 1] - t[i]) + 2 * (t[i] - t[i - 1])
    m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])
  }
  // End tangents stay 0: every track starts from rest and settles into rest
  return (x) => {
    if (x <= t[0]) return v[0]
    if (x >= t[n - 1]) return v[n - 1]
    let i = 0
    while (x > t[i + 1]) i++
    const h = t[i + 1] - t[i]
    const s = (x - t[i]) / h
    const s2 = s * s
    const s3 = s2 * s
    return (2 * s3 - 3 * s2 + 1) * v[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * v[i + 1] + (s3 - s2) * h * m[i + 1]
  }
}

/** One monotone track per pose channel, from [time, pose] keys. */
export function poseTrack(keys, channels = ["spin", "yaw", "pitch", "bank", "roll"]) {
  const tracks = channels.map((c) => [c, monotoneTrack(keys.map(([t, p]) => [t, p[c] ?? 0]))])
  return (time, out) => {
    for (const [c, f] of tracks) out[c] = f(time)
    return out
  }
}

export const TIERS = {
  desktop: { orbit: 4, streaks: 12, faint: 14, craft: 500, lens: 6, pitch: 18, cornerDepth: 6, topDepth: 5, timeScale: 1, dpr: 1.5, antialias: true, fog: 280 },
  tablet: { orbit: 3, streaks: 8, faint: 6, craft: 480, lens: 5, pitch: 22, cornerDepth: 5, topDepth: 3, timeScale: 1.08, dpr: 1.5, antialias: true, fog: 210 },
  mobile: { orbit: 3, streaks: 5, faint: 3, craft: 390, lens: 4, pitch: 22, cornerDepth: 3, topDepth: 0, timeScale: 1.14, dpr: 1.5, antialias: false, fog: 140 },
}

export const getTierName = (width) => (width <= 767 ? "mobile" : width < 1280 ? "tablet" : "desktop")

/**
 * Decides once per page load whether the cinematic plays, and why not. Nothing is persisted:
 * every full load or reload of the homepage plays it again from the wall. `?intro=1` forces it
 * for QA (skipping the GPU gate), `?intro=0` disables it. Reduced motion always wins. Deep links,
 * a page already scrolled (index.html turns off scroll restoration for eligible loads, so this
 * only catches a real scroll) and constrained devices go straight to the Hero.
 */
export function decideIntroMode() {
  const none = (reason) => ({ play: false, forced: false, reason })
  if (typeof window === "undefined") return none("server")
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return none("reduced_motion")
  const params = new URLSearchParams(window.location.search)
  const param = params.get("intro")
  if (param === "0") return none("disabled_by_param")
  if (param === "1") return { play: true, forced: true, reason: "forced" }
  if (window.location.hash) return none("deep_link")
  if (window.scrollY > 4) return none("restored_scroll")
  if (document.hidden) return none("visibility_change")
  if (navigator.connection?.saveData) return none("data_saver")
  if (navigator.deviceMemory <= 2) return none("low_memory")
  if (navigator.hardwareConcurrency <= 2) return none("low_cpu")
  return { play: true, forced: false, reason: "page_load" }
}

/**
 * index.html switches scroll restoration to "manual" for eligible loads, so a reload starts at
 * the wall instead of wherever the page was left. Once the intro is over (or never started),
 * hand restoration back so back/forward between in-page anchors behaves normally.
 */
export function restoreScrollRestoration() {
  try {
    if (window.__wcIntroScrollReset && "scrollRestoration" in history) history.scrollRestoration = "auto"
    window.__wcIntroScrollReset = false
  } catch {
    /* history API unavailable: nothing to restore */
  }
}

/** Stable 0–1 hash, so voxel and tile behaviour is the same on every load. */
export function hash01(a, b = 0, c = 0) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/** Camera distance in CSS px. The world plane z=0 maps 1:1 to CSS pixels at this distance. */
export const cameraDistance = (w, h) => Math.min(1800, Math.max(900, Math.max(w, h)))

/** The vanishing point: the fold's visible centre, in fold coordinates. */
export const sceneCentre = (w, foldH) => ({
  x: w / 2,
  y: Math.min(foldH, typeof window === "undefined" ? foldH : window.innerHeight) / 2,
})

/** Grid fitted to the fold so whole cubes meet every corner. Cells stay within a few % of square. */
export function gridFor(w, foldH, tierName) {
  const base = Math.max(TIERS[tierName].pitch, Math.sqrt((w * foldH) / 7200))
  const cols = Math.max(1, Math.round(w / base))
  const foldRows = Math.max(1, Math.round(foldH / base))
  return { cols, foldRows, pitchX: w / cols, pitchY: foldH / foldRows }
}

const relRect = (el, fr, pad) => {
  const r = el.getBoundingClientRect()
  return { l: r.left - fr.left - pad, t: r.top - fr.top - pad, r: r.right - fr.left + pad, b: r.bottom - fr.top + pad, w: r.width }
}

/** Per-corner fill (TL, TR, BL, BR): how much of each stepped edge survives. 0 = the V4 look. */
export const CORNER_FILL = {
  desktop: [0.12, 0.2, 0.08, 0.06],
  tablet: [0.12, 0.2, 0.08, 0.06],
  mobile: [0, 0, 0, 0], // phones keep the V4 density so the copy keeps its room
}

/**
 * The surviving corner cubes: a sparse stepped cluster in each fold corner, with any cell that
 * would touch the copy, CTA, footnote or a tile removed.
 */
export function computeCorners(fold) {
  const w = fold.clientWidth
  const h = fold.clientHeight
  const tierName = getTierName(w)
  const tier = TIERS[tierName]
  const grid = gridFor(w, h, tierName)
  const { cols, foldRows, pitchX, pitchY } = grid
  const fr = fold.getBoundingClientRect()
  const keep = [...fold.querySelectorAll(".hero__center > *, .hero__cta > *")]
    .map((el) => relRect(el, fr, 16))
    .filter((r) => r.w > 0)
  // The footnote spans the fold, so measure its actual text lines rather than its box
  fold.querySelectorAll(".hero__meta > *").forEach((el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    for (const r of range.getClientRects()) {
      keep.push({ l: r.left - fr.left - 8, t: r.top - fr.top - 8, r: r.right - fr.left + 8, b: r.bottom - fr.top + 8 })
    }
  })
  fold.querySelectorAll(".htile:not(.is-blocked)").forEach((t) => {
    if (!t.offsetWidth) return
    keep.push({ l: t.offsetLeft - 10, t: t.offsetTop - 10, r: t.offsetLeft + t.offsetWidth + 10, b: t.offsetTop + t.offsetHeight + 10 })
  })

  const cells = []
  // V5: about 20% more surviving cubes per corner, balanced per corner (the sparse top-right
  // gains most). Only the stepped edge is filled in; cube size, depth and spacing are unchanged.
  const fill = CORNER_FILL[tierName]
  const corners = [
    { sx: 0, sy: 0, n: tier.topDepth, id: 1, f: fill[0] },
    { sx: 1, sy: 0, n: tier.topDepth, id: 2, f: fill[1] },
    { sx: 0, sy: 1, n: tier.cornerDepth, id: 3, f: fill[2] },
    { sx: 1, sy: 1, n: tier.cornerDepth, id: 4, f: fill[3] },
  ]
  corners.forEach(({ sx, sy, n, id, f }) => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i; j++) {
        const reach = (i + j) / Math.max(1, n - 1)
        if (reach > 0.34 && hash01(i, j, id) > 0.92 - reach * 0.72 + f) continue
        const col = sx ? cols - 1 - i : i
        const row = sy ? foldRows - 1 - j : j
        const l = col * pitchX
        const t = row * pitchY
        const hit = keep.some((k) => l < k.r && l + pitchX > k.l && t < k.b && t + pitchY > k.t)
        const key = `${col}:${row}`
        // On a very short fold the top and bottom clusters can reach the same cell
        if (!hit && !cells.some((c) => c.key === key)) cells.push({ col, row, key })
      }
    }
  })
  return { ...grid, cells, width: w, height: h, tierName }
}

/**
 * Idle float values per tile: deterministic and staggered. Visible drift, not a scale pulse:
 * desktop 6–14 px vertical and 2–6 px horizontal; tablet ×0.7, phone ×0.42.
 */
export function floatFor(index, amp = 1) {
  const h = (salt) => hash01(index + 1, salt)
  return {
    y: (6 + h(1) * 8) * amp * (h(2) > 0.5 ? -1 : 1),
    x: (2 + h(3) * 4) * amp * (h(4) > 0.5 ? -1 : 1),
    rotation: (1 + h(5)) * (h(6) > 0.5 ? -1 : 1),
    scale: 1.02 + h(7) * 0.015,
    // Half-periods: yoyo means the full cycle is twice this (4.5–9 s)
    yDur: 2.25 + h(8) * 2.25,
    xDur: 2.6 + h(9) * 1.9,
    scaleDur: 2.4 + h(10) * 2.1,
    delay: h(11) * 1.6,
  }
}
