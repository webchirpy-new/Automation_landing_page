import Lenis from "lenis"
import { gsap, ScrollTrigger } from "./gsap"

/**
 * The page's single smooth-scroll controller (Lenis on the window).
 *
 * - Driven by GSAP's ticker, so there is one animation loop, and every Lenis scroll
 *   frame updates ScrollTrigger — reveals and scrubs stay in lockstep with the page.
 * - Smooths mouse-wheel / trackpad input only, with a light lerp: responsive, little
 *   tail. Touch scrolling stays fully native (syncTouch off).
 * - Not created at all for reduced-motion users or touch-only devices, which keep
 *   native scrolling; it is torn down/recreated if that preference changes.
 * - Same-page hash links scroll smoothly (Lenis, or native smooth scrollIntoView on
 *   touch) but still update the URL and fire `hashchange`, so deep links,
 *   back/forward and hash-driven UI keep working. CSS `scroll-behavior: smooth` is
 *   deliberately not used: ScrollTrigger caches it and would replay native smoothing
 *   under Lenis (e.g. on back/forward scroll restoration).
 */

let lenis = null
export const getLenis = () => lenis

const NATIVE = "(prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse)"

// Ease-in-out cubic, with a duration that grows gently with distance (0.6s–1.4s).
const easing = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
export const scrollDuration = (el) => Math.min(1.4, Math.max(0.6, 0.45 + Math.abs(el.getBoundingClientRect().top) / 4000))

/** Scroll the page to an element through Lenis when active, natively otherwise. */
export function scrollToElement(el, { onComplete } = {}) {
  if (lenis) {
    lenis.scrollTo(el, { offset: -12, duration: scrollDuration(el), easing, onComplete }) // matches html scroll-padding-top
    return
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  onComplete?.()
}

function onAnchorClick(e) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return // native jump
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = e.target.closest?.('a[href^="#"]')
  if (!a || a.classList.contains("skip-link")) return // skip links keep native focus behaviour
  const hash = a.getAttribute("href")
  if (hash.length < 2) return
  e.preventDefault()
  const oldURL = window.location.href
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash)
    window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: window.location.href }))
  }
  const target = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (target) scrollToElement(target)
}

export function initSmoothScroll() {
  if (typeof window === "undefined") return () => {}
  const mq = window.matchMedia(NATIVE)
  const tick = (time) => lenis?.raf(time * 1000) // GSAP ticker seconds → Lenis ms

  const start = () => {
    if (lenis) return
    lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
      autoRaf: false,
      stopInertiaOnNavigate: true,
    })
    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add(tick)
  }
  const stop = () => {
    if (!lenis) return
    gsap.ticker.remove(tick)
    lenis.destroy()
    lenis = null
  }
  const sync = () => (mq.matches ? stop() : start())

  gsap.ticker.lagSmoothing(0) // Lenis and ScrollTrigger must share the same clock
  sync()
  mq.addEventListener("change", sync)
  document.addEventListener("click", onAnchorClick)
  return () => {
    mq.removeEventListener("change", sync)
    document.removeEventListener("click", onAnchorClick)
    stop()
  }
}
