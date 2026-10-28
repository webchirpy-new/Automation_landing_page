/** Scroll to an in-page anchor and optionally move focus into it (a11y). */
export function goTo(hash, { focusSelector } = {}) {
  if (typeof document === "undefined") return
  const el = document.querySelector(hash)
  if (!el) return
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  if (window.history?.replaceState) window.history.replaceState(null, "", hash)
  const target = focusSelector ? el.querySelector(focusSelector) : null
  if (target) {
    // Wait for smooth scroll to mostly finish so the focus jump doesn't fight it.
    window.setTimeout(() => target.focus({ preventScroll: true }), reduce ? 0 : 650)
  }
}

export const goToBooking = () => goTo("#book", { focusSelector: "input" })
