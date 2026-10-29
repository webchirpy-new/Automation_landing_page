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

export const goToBooking = () => goTo("#book", { focusSelector: "input" })
