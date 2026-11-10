import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { gsap } from "../../lib/gsap"
import {
  BEATS,
  ORBIT_PRIORITY,
  TIERS,
  cameraDistance,
  computeCorners,
  decideIntroMode,
  getTierName,
  hash01,
  monotoneTrack,
  poseTrack,
  restoreScrollRestoration,
  sceneCentre,
} from "./introConfig"

// Bounded in production so a slow chunk can never hold the Hero back. Development has no cutoff,
// so a cold dev server cannot quietly skip the cinematic being reviewed.
const LOAD_BUDGET = import.meta.env.DEV ? 0 : 4000
const CLEAR = "transform,opacity,visibility,zIndex,filter,clipPath"
const SCROLL_KEYS = new Set(["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"])
const FAILURES = new Set(["asset_timeout", "asset_error", "webgl_unavailable", "gpu_software", "webgl_context_lost"])

const mix = (a, b, t) => a + (b - a) * t

/** Separates "no WebGL at all" from "only a software rasteriser, which we decline". */
function webglFailureReason() {
  try {
    return document.createElement("canvas").getContext("webgl2") ? "gpu_software" : "webgl_unavailable"
  } catch {
    return "webgl_unavailable"
  }
}

/**
 * Orchestrates the first-view cinematic: checking → loading → ready → playing → settling →
 * complete (or skipped). One paused GSAP timeline owns every cue, and skip, scroll, resize,
 * tab-hide, unmount and failure all converge on the same final state: every inline override
 * cleared, so the Hero's real CSS layout is what remains. The tiles are the Hero's own DOM nodes
 * throughout, driven from orbit to their CSS anchor by one interpolation, so there is no swap.
 */
export function useHeroIntro({ foldRef }) {
  // Decided once per page load and held in memory only: a full reload plays the intro again
  const [mode] = useState(decideIntroMode)
  const playing = mode.play
  const [phase, setPhase] = useState(mode.play ? "intro" : "ready")
  const [stageMounted, setStageMounted] = useState(mode.play)
  const [endedBy, setEndedBy] = useState(null)
  const canvasRef = useRef(null)
  const veilRef = useRef(null)
  const backdropRef = useRef(null)
  const skipBtnRef = useRef(null)
  const skipFn = useRef(() => {})

  useLayoutEffect(() => {
    if (!playing) {
      if (import.meta.env.DEV) console.debug(`[hero-intro] not playing: ${mode.reason}`)
      // Scroll restoration was paused for an intro that will not run: hand it back after load
      const restore = () => requestAnimationFrame(restoreScrollRestoration)
      if (document.readyState === "complete") restore()
      else window.addEventListener("load", restore, { once: true })
      return () => window.removeEventListener("load", restore)
    }
    const fold = foldRef.current
    if (!fold) return undefined

    const q = (sel) => [...fold.querySelectorAll(sel)]
    const interactive = [fold.querySelector(".hero__center"), fold.querySelector(".hero__tiles"), fold.querySelector(".hero__meta")]
    const eyebrow = q(".hero__center > .eyebrow")
    const lines = q(".hero__line")
    const punch = q(".hero__punch")
    const body = q(".hero__body")
    const cta = q(".hero-cta")
    const micro = q(".hero__micro")
    const meta = q(".hero__meta")
    const allTiles = q(".htile")
    const mark = q(".hero__mark")
    const copy = [...eyebrow, ...lines, ...punch, ...body, ...cta, ...micro, ...meta]

    let cancelled = false
    let settled = false
    let tl = null
    let sceneApi = null
    let tick = null
    let disposeTimer = 0
    let stallTimer = 0
    let lastKeyTab = false
    const t0 = performance.now()
    const diag = { state: "checking", reason: mode.reason, load: {}, phases: [], settledAtTimeline: null, frames: null }
    const setDiag = (next) => {
      diag.state = next
      if (import.meta.env.DEV) console.debug(`[hero-intro] ${next} (${diag.reason}) at ${Math.round(performance.now() - t0)} ms`)
    }

    interactive.forEach((el) => el?.setAttribute("inert", ""))
    gsap.set(copy, { autoAlpha: 0 })
    gsap.set(allTiles, { autoAlpha: 0 })
    gsap.set(mark, { opacity: 0 }) // keeps its layout slot, so the label never shifts

    const clearInline = () => {
      gsap.killTweensOf([...copy, ...allTiles, ...mark])
      gsap.set([...copy, ...allTiles, ...mark], { clearProps: CLEAR })
      q(".htile__mag").forEach((el) => gsap.set(el, { clearProps: "filter" }))
      q(".htile__btn").forEach((el) => gsap.set(el, { clearProps: "transform" }))
      interactive.forEach((el) => el?.removeAttribute("inert"))
    }

    const stopInput = () => {
      window.removeEventListener("wheel", onUserScroll)
      window.removeEventListener("touchmove", onUserScroll)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pagehide", onHide)
      window.removeEventListener("hashchange", onRoute)
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("focusin", onFocusIn)
    }

    const stopLoop = () => {
      if (tick) gsap.ticker.remove(tick)
      tick = null
      tl?.kill()
      tl = null
    }

    function settle(reason) {
      if (settled || cancelled) return
      settled = true
      diag.reason = reason
      diag.settledAtTimeline = tl ? +tl.time().toFixed(3) : null
      setDiag(reason === "complete" ? "complete" : "skipped")
      clearTimeout(stallTimer)
      stopLoop()
      stopInput()
      const skipHadFocus = document.activeElement === skipBtnRef.current
      clearInline()
      restoreScrollRestoration()
      setEndedBy(reason)
      setPhase("ready")
      if (skipHadFocus) document.getElementById("hero-cta")?.focus({ preventScroll: true })

      // Scene or asset failure: a short, plain fade instead of a dead end
      if (FAILURES.has(reason)) {
        gsap.from(fold.querySelectorAll(".hero__center > *, .hero__meta"), { autoAlpha: 0, y: 12, duration: 0.5, ease: "power2.out", stagger: 0.05 })
        gsap.from(fold.querySelectorAll(".htile"), { autoAlpha: 0, duration: 0.6, delay: 0.1, clearProps: "opacity,visibility" })
      }
      ;[canvasRef.current, veilRef.current, backdropRef.current].forEach((el) => el?.classList.add("is-gone"))
      disposeTimer = window.setTimeout(() => {
        sceneApi?.dispose()
        sceneApi = null
        setStageMounted(false)
      }, 480)
    }
    skipFn.current = () => settle("manual_skip")

    function onUserScroll() {
      settle("user_scroll")
    }
    function onRoute() {
      settle("route_change")
    }
    function onScroll() {
      if (window.scrollY > 4) settle("user_scroll")
    }
    function onKey(e) {
      lastKeyTab = e.key === "Tab"
      if (e.key === "Tab" && !e.shiftKey && document.activeElement === skipBtnRef.current) {
        // Tabbing past Skip lands on the main action instead of jumping below the Hero
        e.preventDefault()
        settle("keyboard")
      } else if (e.key === "Escape" || SCROLL_KEYS.has(e.key)) settle("keyboard")
      else if (e.key === " " && document.activeElement !== skipBtnRef.current) settle("keyboard")
    }
    const startW = window.innerWidth
    const startH = window.innerHeight
    function onResize() {
      if (window.innerWidth !== startW || Math.abs(window.innerHeight - startH) > 120) settle("resize")
    }
    function onHide() {
      settle("visibility_change")
    }
    function onVisibility() {
      if (document.hidden) settle("visibility_change")
    }
    // Keyboard users are never trapped: tabbing into the page ends the intro. Focus that moves
    // without a Tab (a window refocus, a script) is harmless and is ignored.
    function onFocusIn(e) {
      if (lastKeyTab && e.target !== skipBtnRef.current && !e.target.classList?.contains("skip-link")) settle("keyboard")
    }

    window.addEventListener("wheel", onUserScroll, { passive: true })
    window.addEventListener("touchmove", onUserScroll, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    window.addEventListener("pagehide", onHide)
    window.addEventListener("hashchange", onRoute)
    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("focusin", onFocusIn)

    // Never wait on a stalled chunk or font: fall back to the Hero itself
    setDiag("loading")
    if (LOAD_BUDGET) stallTimer = window.setTimeout(() => settle("asset_timeout"), LOAD_BUDGET)
    const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 900))])
    const chunk = import("./introScene").then((m) => {
      diag.load.chunkMs = Math.round(performance.now() - t0)
      return m
    })

    Promise.all([chunk, fontsReady])
      .then(([{ createIntroScene }]) => {
        if (cancelled || settled) return
        diag.load.fontsAndChunkMs = Math.round(performance.now() - t0)
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const foldHeight = fold.clientHeight
        const tierName = getTierName(width)
        const tier = TIERS[tierName]
        const centre = sceneCentre(fold.clientWidth, foldHeight)
        const t1 = performance.now()
        sceneApi = createIntroScene(canvas, {
          width,
          height,
          foldHeight,
          centre,
          distance: cameraDistance(width, height),
          tier,
          corners: computeCorners(fold),
          requireFastGPU: !mode.forced,
        })
        if (!sceneApi) {
          settle(webglFailureReason())
          return
        }
        canvas.addEventListener("webglcontextlost", () => settle("webgl_context_lost"), { once: true })
        diag.load.sceneInitMs = Math.round(performance.now() - t1)
        const t2 = performance.now()
        sceneApi.warmUp()
        diag.load.shaderWarmupMs = Math.round(performance.now() - t2)
        diag.tier = tierName
        diag.voxels = sceneApi.voxelCount
        clearTimeout(stallTimer)
        setDiag("ready")
        startTimeline(sceneApi, tier, centre)
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.error("[hero-intro] asset_error", err)
        settle("asset_error")
      })

    function startTimeline(api, tier, centre) {
      const S = api.state
      const { k } = api
      const foldW = fold.clientWidth
      // A tall, narrow frame has no room beside the aircraft, so its tiles circle above and below
      const tall = fold.clientWidth < 768 ? 1.9 : 1

      /* Orbit tiles: visible tiles only, so a phone or a blocked anchor never flies a ghost */
      const byId = (id) => fold.querySelector(`.htile[data-tile="${id}"]`)
      const usable = (el) => el && !el.classList.contains("is-blocked") && getComputedStyle(el).display !== "none"
      const orbitEls = ORBIT_PRIORITY.map(byId).filter(usable).slice(0, tier.orbit)
      const restEls = allTiles.filter((el) => usable(el) && !orbitEls.includes(el))
      const orbiters = orbitEls.map((el, i) => {
        const w = el.offsetWidth
        return {
          el,
          mag: el.querySelector(".htile__mag"),
          face: el.querySelector(".htile__btn"),
          w,
          ax: el.offsetLeft + w / 2,
          ay: el.offsetTop + el.offsetHeight / 2,
          // Stay inside the frame on narrow screens (depth enlarges the ring on screen)
          radius: Math.min((330 + hash01(i, 21) * 90) * k, (foldW / 2 - 44) / 1.32),
          theta0: (i / orbitEls.length) * Math.PI * 2 + 0.6,
          sweep: Math.PI * (1.2 + hash01(i, 22) * 0.35),
          tiltY: (0.34 + hash01(i, 23) * 0.3) * tall,
          tiltZ: 0.62 + hash01(i, 24) * 0.25,
          display: (78 + hash01(i, 25) * 16) * Math.max(0.62, k),
          // Each tile leaves on its own curve: a sideways bow, never an even radial spray
          bow: (i % 2 ? 1 : -1) * (70 + hash01(i, 26) * 120) * k,
          enter: 0,
          scatter: 0,
          blur: 0,
          px: 0,
          py: 0,
        }
      })
      // Rasterise the orbit tiles now, under the veil. Left hidden, their first visible frame
      // would paint every layer mid-flight, which was the stall as the orbit formed
      orbiters.forEach((o) => gsap.set(o.el, { visibility: "visible", opacity: 0 }))
      const O = { t: 0, lag: 0, swell: 0 }
      const projected = { x: 0, y: 0, scale: 1 }

      function updateTiles() {
        const pl = api.planePos
        // Orbit centre: follows the aircraft, but holds its depth when the aircraft dives away
        const cx = pl.x * 0.72
        const cy = pl.y * 0.72
        const cz = Math.max(-120, Math.min(220, pl.z))
        const cos = Math.cos(O.lag)
        const sin = Math.sin(O.lag)
        orbiters.forEach((o) => {
          const theta = o.theta0 + O.t * o.sweep
          const r = o.radius * (1 + O.swell)
          // The ring leans with the aircraft's roll, a beat behind it
          const rx = Math.cos(theta) * r
          const ry = Math.sin(theta) * r * o.tiltY
          const depth = Math.sin(theta) * o.tiltZ
          api.project(cx + rx * cos - ry * sin, cy + rx * sin + ry * cos, cz + depth * r, projected)
          const m = o.scatter
          const bow = Math.sin(Math.PI * m) * o.bow
          const dx = o.ax - projected.x
          const dy = o.ay - projected.y
          const len = Math.hypot(dx, dy) || 1
          const x = mix(projected.x, o.ax, m) + (-dy / len) * bow
          const y = mix(projected.y, o.ay, m) + (dx / len) * bow
          const far = depth < 0 ? -depth : 0
          // Same element from orbit to anchor; depth decides whether it passes behind the aircraft
          gsap.set(o.el, {
            x: x - o.ax,
            y: y - o.ay,
            scale: mix((o.display * projected.scale * mix(0.7, 1, o.enter)) / o.w, 1, m),
            opacity: o.enter * mix(1 - far * 0.42, 1, m),
            zIndex: depth > 0 || m >= 0.98 ? 3 : 1,
          })
          // The tilt lives on an inner wrapper: on the translated root, perspective would
          // compound with the screen offset and turn a tile edge-on
          gsap.set(o.face, {
            rotationY: mix(Math.cos(theta) * 28, 0, m),
            rotationX: mix(Math.sin(theta) * -14, 0, m),
            transformPerspective: 420,
          })
          // Slight softening only for the far side and while travelling
          const speed = Math.hypot(x - o.px, y - o.py)
          o.px = x
          o.py = y
          // Coarse steps: a filter value changing every frame would re-rasterise the tile every frame
          const blur = m >= 1 || o.enter === 0 ? 0 : Math.min(1, speed / 30 + far * (1 - m) * 0.9)
          const level = blur > 0.66 ? 1 : blur > 0.33 ? 0.5 : 0
          if (level !== o.blur) {
            o.blur = level
            o.mag.style.filter = level ? `blur(${level}px)` : "none"
          }
        })
      }

      tl = gsap.timeline({ paused: true })
      const PI = Math.PI
      const P = api.poses

      /* The aircraft's resting slot, left of the eyebrow, in world units at the page plane */
      const markBox = mark[0]?.getBoundingClientRect()
      const land = markBox && markBox.width ? api.landingFor(markBox) : null
      diag.landing = land ? { slot: { w: markBox.width, h: markBox.height }, craft: land.fit } : null

      /*
       * V5 timing. Same beats in the same order; the only added time is +0.3 s through the loop
       * and front turn (beats 3–8 move by 0.3 s) and +0.4 s on the landing glide. Was 10.1 s.
       *
       * ORIENTATION is one continuous track through the SAME approved key poses, not a chain of
       * sine.inOut tweens: each of those stopped dead at its own end (and two overlapped on spin,
       * pitch and roll), so the craft rocked and snapped between them. Monotone cubic
       * interpolation keeps the angular speed through a key, never overshoots it, and holds
       * exactly where the pose is held (front lock through the impact).
       */
      const FRONT = { spin: 2 * PI, yaw: PI, pitch: P.frontLock.pitch, bank: 0, roll: 0 }
      const LANDED = { spin: 2 * PI, yaw: P.landing.yaw, pitch: P.landing.pitch, bank: P.landing.bank, roll: P.landing.roll - 2 * PI }
      const END = 10.62
      const orient = poseTrack([
        [1.05, { spin: P.underside.spin, yaw: 0, pitch: P.underside.pitch, bank: 0, roll: 0 }], // belly to camera
        [2.45, { spin: 1.75, yaw: 0, pitch: P.underside.pitch, bank: 0, roll: 0 }], // nose follows the path
        [3.2, { spin: 3.15, yaw: 0.35, pitch: -1.06, bank: 0, roll: 1.0 }], // round the loop, side opens
        [4.1, FRONT], // front lock, lined up
        [4.85, FRONT], // held through the impact
        [6.75, { spin: 2 * PI, yaw: PI + 0.55, pitch: -0.62, bank: 0, roll: -2.2 }], // slow roll in dark space
        [7.55, { spin: 2 * PI, yaw: PI, pitch: P.frontLock.pitch, bank: 0, roll: -2 * PI }], // into the portal
        [9.6, { spin: 2 * PI, yaw: P.landing.yaw + 0.08, pitch: P.landing.pitch + 0.05, bank: P.landing.bank, roll: LANDED.roll + 0.1 }],
        [10.5, LANDED], // a last small settle into the approved resting angle
        [END, LANDED],
      ])
      const OT = { t: 1.05 }
      tl.to(OT, { t: END, duration: END - 1.05, ease: "none", onUpdate: () => orient(OT.t, S) }, 1.05)

      /* 01 wallReady (0–1.05): the sealed wall breathes; the aircraft is beyond the frame */
      tl.to(S, { camX: 6, camY: -3, duration: 3.9, ease: "sine.inOut" }, 0)
        .set(S, { planeOpacity: 1, size: 0.2, fogEmit: 1, fog: 0.55 }, 0.9)

      /* 02 undersideEntry (1.05–2.45): small, belly to camera, crossing the lower-right edge.
         u is perceived progress along the approach (introScene.perceivedTable). */
      const lock = api.approachFrac(9) // lined up in front-lock, just before the wall
      tl.to(S, { u: lock, duration: 2.8, ease: "power1.inOut" }, 1.05)
        .to(S, { size: 1, duration: 2.85, ease: "sine.in" }, 1.05)
        .to(S, { glow: 0.12, duration: 1, ease: "sine.out" }, 1.2)

      /* 04 frontLock to impact (3.85–4.25): the lined-up front read, then the nose meets the wall
         centre. The wall breaks when the scene detects that contact, not on a timer. The wake
         thins on the run in, so the contact point stays clear. */
      tl.to(S, { u: 1, duration: 0.4, ease: "power2.in" }, 3.85)
        .to(S, { fog: 0.3, duration: 0.3, ease: "sine.inOut" }, 3.7)
        .to(S, { glow: 0.28, duration: 0.3, ease: "power2.out" }, 4.25)
        .to(S, { camX: 0, camY: 0, duration: 0.5, ease: "sine.out" }, 3.9)
      const cc = api.contactCentre
      tl.set(S, { px: cc.x, py: cc.y, pz: cc.z, free: 1 }, 4.26)

      /* 05–06 lensDebris, slowRoll (4.26–6.9): impact inertia, then a slow roll in dark space.
         The plume dips while the wall bursts, then reads clearly against the black. */
      tl.to(S, { pz: -420, py: cc.y + 30 * k, duration: 1.0, ease: "power3.out" }, 4.26)
        .to(S, { pz: -1000, px: 60 * k, py: 50 * k, duration: 1.7, ease: "sine.inOut" }, 5.26)
        .to(S, { glow: 0.16, duration: 1.2, ease: "sine.inOut" }, 4.9)
        .to(S, { fogVis: 0.5, duration: 0.14, ease: "sine.out" }, 4.22)
        .to(S, { fogVis: 1, duration: 0.7, ease: "sine.inOut" }, 4.7)
        .to(S, { fog: 1, duration: 0.6, ease: "sine.inOut" }, 4.4)

      /* 07 orbitScatter (6.15–8.6): the Hero's own tiles circle it, then leave for their anchors */
      if (orbiters.length) {
        tl.to(O, { t: 1, duration: 2.0, ease: "sine.inOut" }, 5.9)
          .to(O, { swell: 0.16, lag: 0.34, duration: 0.6, ease: "sine.out" }, 6.25)
          .to(O, { swell: 0, lag: 0, duration: 0.8, ease: "sine.inOut" }, 6.85)
        orbiters.forEach((o, i) => {
          tl.to(o, { enter: 1, duration: 0.4, ease: "power2.out" }, 6.15 + i * 0.09)
          tl.to(o, { scatter: 1, duration: 1.05, ease: "power2.inOut" }, 7.4 + i * 0.08)
        })
      }
      restEls.forEach((el, i) => {
        const dx = (fold.clientWidth / 2 - el.offsetLeft) * 0.09
        const dy = (centre.y - el.offsetTop) * 0.09
        tl.fromTo(el, { autoAlpha: 0, scale: 0.74, x: dx, y: dy }, { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.75, ease: "power2.out" }, 7.9 + (i % 7) * 0.06)
      })
      tl.call(() => setPhase("transitioning"), null, 8.7)

      /* Forward portal (6.8–8.2): the craft drives away down the centre, the camera drives in.
         inOut rather than in: it eases to a stop at depth, so turning back for the landing is a
         continuous reversal instead of a dead stop from full speed. */
      const foldMid = { x: fold.clientWidth / 2, y: centre.y }
      const deep = api.screenToWorld(foldMid.x, foldMid.y, -4300)
      tl.to(S, { px: deep.x, py: deep.y, pz: deep.z, duration: 0.75, ease: "sine.inOut" }, 6.9)
        .to(S, { aura: 0.6, glow: 0, duration: 0.8, ease: "sine.inOut" }, 7.0)
        .to(S, { streak: 0.62, duration: 0.3, ease: "power2.out" }, 6.85)
        .to(S, { portal: 0.22, duration: 0.3, ease: "power2.out" }, 6.85)
        .to(S, { travel: 26000, duration: 1.4, ease: "power1.in" }, 6.8)
        // The wake thins while the craft dives into the portal, so it never balls up at the centre
        .to(S, { fog: 0.5, fogVis: 0.6, duration: 0.5, ease: "sine.inOut" }, 6.8)
        .to(S, { fogVis: 1, duration: 0.6, ease: "sine.inOut" }, 7.7)
        .to(S, { camZ: 150, duration: 0.6, ease: "sine.inOut" }, 6.9)
        .to(S, { streak: 0, duration: 0.5, ease: "sine.in" }, 7.7)
        .to(S, { portal: 0, duration: 0.5, ease: "sine.in" }, 7.75)
        .to(S, { camZ: 0, duration: 0.75, ease: "sine.inOut" }, 7.5)
        .to(backdropRef.current, { autoAlpha: 0, duration: 0.6, ease: "none" }, 8.2)

      /* 10 eyebrowLanding (7.65–10.6): the SAME craft turns back, climbs ABOVE the headline area
         to the left of the eyebrow and glides into its slot along ONE path, shrinking as it comes
         (introScene.landingPath). It never crosses the copy, never stops part-way and never pops.
         The wake thins with the craft, stops before it settles and is gone by the hand-off. */
      if (land) {
        // Waypoints stay inside the frame: on a phone the slot sits close to the left edge
        // climb (left of the eyebrow, rising) and crest (above-left of it, already turning right)
        // replace the old hold point: the old path reversed there, which only worked from a stop
        const climb = api.screenToWorld(Math.max(48, land.cx - 140 * k), land.cy + 34 * k, -2500)
        const crest = api.screenToWorld(Math.max(56, land.cx - 92 * k), land.cy - 46 * k, -1300)
        const near = api.screenToWorld(Math.max(30, land.cx - 40 * k), land.cy - 12 * k, -380)
        const slotW = land.fit.w
        const D = api.distance
        const deepW = api.craftSize * land.span * (D / (D - deep.z)) // its width as the portal leaves it (size 1)
        const glide = api.landingPath([deep, climb, crest, near, { x: land.x, y: land.y, z: 0 }], [deepW, 96 * k, 62 * k, 26 * k, slotW], land.span)
        // Time along the one path: up and clear of the headline area before its first line
        // reveals (8.35), then a long, slowing glide to the slot. Monotone, C1, from rest to rest.
        const kn = glide.knots
        const progress = monotoneTrack([[7.65, 0], [8.0, kn[1]], [8.32, kn[2]], [9.55, kn[3]], [10.55, 1]])
        const LG = { t: 7.65 }
        tl.to(LG, { t: 10.55, duration: 2.9, ease: "none", onUpdate: () => glide.at(progress(LG.t), S) }, 7.65)
          .to(S, { aura: 0.05, duration: 0.7, ease: "sine.inOut" }, 9.8)
          // Faint while it climbs past where the headline is about to appear, then a little
          // fuller beside the eyebrow, thinning with the craft itself
          .to(S, { fog: 0.2, duration: 0.4, ease: "sine.inOut" }, 7.65)
          .to(S, { fog: 0.4, duration: 0.5, ease: "sine.inOut" }, 8.35)
          .set(S, { fogEmit: 0 }, 10.0)
          .to(S, { fogVis: 0, duration: 0.5, ease: "sine.inOut" }, 10.0)
          // Hand-off in a single frame to the cached render of this exact pose, same box: the
          // canvas and the DOM mark are never both half-visible
          .set(mark, { opacity: 1 }, 10.6)
          .set(S, { planeOpacity: 0 }, 10.6)
      } else {
        tl.set(S, { fogEmit: 0 }, 7.6)
          .to(S, { fogVis: 0, duration: 0.4 }, 7.6)
          .to(S, { planeOpacity: 0, duration: 0.3, ease: "none" }, 7.9)
          .to(mark, { opacity: 1, duration: 0.3 }, 9.8)
      }

      /* 09 heroReveal (8.2–9.4) and 11 ctaReady (9.65): the copy, one idea at a time */
      const rise = { autoAlpha: 0, yPercent: 42, clipPath: "inset(0% -6% 100% -6%)", filter: "blur(5px)" }
      const risen = { autoAlpha: 1, yPercent: 0, clipPath: "inset(-14% -6% -18% -6%)", filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
      const lift = { autoAlpha: 0, y: 12, filter: "blur(3px)" }
      const lifted = { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }
      tl.fromTo(eyebrow, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 8.2)
      if (lines[0]) tl.fromTo(lines[0], rise, risen, 8.35)
      if (lines[1]) tl.fromTo(lines[1], rise, risen, 8.6)
      tl.fromTo(punch, rise, risen, 8.9)
        .fromTo(body, lift, lifted, 9.18)
        .call(
          () => {
            // The real controls are live now, so Skip retires instead of sitting over the copy
            interactive.forEach((el) => el?.removeAttribute("inert"))
            if (document.activeElement === skipBtnRef.current) document.getElementById("hero-cta")?.focus({ preventScroll: true })
            if (skipBtnRef.current) gsap.to(skipBtnRef.current, { autoAlpha: 0, duration: 0.22, ease: "none" })
          },
          null,
          9.65
        )
        .fromTo(cta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out" }, 9.65)
        .fromTo([...micro, ...meta], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.36, ease: "none" }, 9.9)
      tl.to({}, { duration: 0.001 }, END) // the hand-off frame is always rendered before completion

      /* Real-clock log of every beat, so reported timings are measurements */
      BEATS.forEach((b) => {
        tl.call(() => diag.phases.push({ id: b.id, name: b.name, planned: b.start, wallClock: +((performance.now() - diag.playStart) / 1000).toFixed(3) }), null, b.start)
      })

      /*
       * The timeline is stepped here from its own clock, never from GSAP's global one. Scene set-up
       * blocks the main thread, and a global clock would jump forward by that whole stall on its
       * first tick, silently swallowing the wall hold and pressure build. The clock starts on the
       * first real frame and a long frame costs at most MAX_STEP, so no beat can be skipped.
       */
      const MAX_STEP = 66
      const held = import.meta.env.DEV && window.__heroIntroHold
      const end = tl.duration()
      const gaps = []
      let last = 0
      tick = () => {
        if (!tl) return
        const now = performance.now()
        const gap = last ? now - last : 0
        last = now
        if (!held) {
          if (gap) gaps.push([+tl.time().toFixed(2), +gap.toFixed(1)])
          tl.time(Math.min(end, tl.time() + (Math.min(gap, MAX_STEP) / 1000) * tier.timeScale))
        }
        updateTiles()
        api.render(tl?.time() ?? end)
        if (!held && tl && tl.time() >= end) finish()
      }
      function finish() {
        diag.completedMs = Math.round(performance.now() - diag.playStart)
        settle("complete")
      }
      diag.frames = gaps
      diag.impact = api.impact
      diag.timeScale = tier.timeScale
      gsap.ticker.add(tick)
      // One real frame before the veil lifts, so the wall replaces it without a flash
      updateTiles()
      api.render(0)
      veilRef.current?.classList.add("is-gone")
      if (import.meta.env.DEV) Object.assign(window.__heroIntro ?? (window.__heroIntro = {}), { tl, state: S, api, O, skip: () => settle("manual_skip"), duration: end })
      diag.playStart = performance.now()
      setDiag("playing")
    }

    // Diagnostics stay out of normal visits: development, or an explicit QA run of a build
    if (import.meta.env.DEV || mode.forced) window.__heroIntro = { ...window.__heroIntro, diag }

    return () => {
      cancelled = true
      clearTimeout(stallTimer)
      clearTimeout(disposeTimer)
      stopLoop()
      stopInput()
      clearInline()
      sceneApi?.dispose()
      sceneApi = null
      skipFn.current = () => {}
    }
  }, [playing, mode, foldRef])

  const skip = useCallback(() => skipFn.current(), [])


  return { played: mode.play, phase, endedBy, stageMounted, skip, canvasRef, veilRef, backdropRef, skipBtnRef }
}
