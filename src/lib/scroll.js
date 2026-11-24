import { scrollDuration, scrollToElement, getLenis } from "./smoothScroll"

/** Scroll to an in-page anchor and optionally move focus into it (a11y). */
export function goTo(hash, { focusSelector } = {}) {
  if (typeof document === "undefined") return
  const el = document.querySelector(hash)
  if (!el) return
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const target = focusSelector ? el.querySelector(focusSelector) : null
  // Move focus once the scroll has landed so the focus jump doesn't fight it.
  const focus = () => target?.focus({ preventScroll: true })
  if (getLenis()) scrollToElement(el, { onComplete: focus })
  else {
    scrollToElement(el)
    if (target) window.setTimeout(focus, reduce ? 0 : Math.round(scrollDuration(el) * 1000))
  }
  if (window.history?.replaceState) window.history.replaceState(null, "", hash)
}

// Every booking CTA opens the booking form in a pop-up (no long scroll). SiteProvider registers the
// opener; before it mounts (or if it ever unmounts) the CTA falls back to scrolling to #book.
let openBookingModal = null
export const setBookingOpener = (fn) => {
  openBookingModal = fn
}
export const goToBooking = () => (openBookingModal ? openBookingModal() : goTo("#book", { focusSelector: "input" }))

/**
 * Deep links from ads (e.g. `vsl-07-…html#test`): the browser tries to jump to the hash before
 * React has rendered the section, so the jump is lost. Once the page has loaded and laid out,
 * jump straight to the target (no animation: the visitor expects to land there).
 */
export function landOnHash() {
  if (typeof window === "undefined") return () => {}
  const hash = window.location.hash
  if (!hash || hash.length < 2) return () => {}
  let cancelled = false
  const jump = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (cancelled) return
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (!el) return
        const lenis = getLenis()
        if (lenis) lenis.scrollTo(el, { offset: -12, immediate: true, force: true })
        else el.scrollIntoView({ block: "start" })
      })
    )
  if (document.readyState === "complete") jump()
  else window.addEventListener("load", jump, { once: true })
  return () => {
    cancelled = true
    window.removeEventListener("load", jump)
  }
}
