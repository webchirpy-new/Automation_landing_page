import React, { useEffect, useRef } from "react"

/**
 * Marked — renders an approved heading `text` with exactly one existing `phrase` highlighted.
 * The words, order and punctuation are untouched; the phrase is just wrapped, so screen
 * readers read the sentence once.
 *
 * The highlight lives inside the letters: soft spectral colour clouds clipped to the text, drifting
 * slowly. `tone` picks the variant that stays readable on that ground ("dark": white neutral
 * islands on charcoal; "light": near-black islands and deep tones on white). A wrapped phrase
 * flows on every line. The flow runs only while the phrase is near the viewport, and is a
 * static gradient under reduced motion (see `.hl-flow` in global.css).
 */
export function Marked({ text, phrase, tone = "light" }) {
  const i = text.indexOf(phrase)
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <FlowText tone={tone}>{phrase}</FlowText>
      {text.slice(i + phrase.length)}
    </>
  )
}

/** A highlighted phrase in the shared spectral material (styles/spectral.css). */
export function FlowText({ tone, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-on", e.isIntersecting), { rootMargin: "10% 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <span ref={ref} className={`hl-flow hl-flow--${tone}`}>
      {children}
    </span>
  )
}
