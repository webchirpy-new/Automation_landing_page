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
const SENTENCE_GAP = /(?<=[.?!])\s+(?=\S)/

export function Marked({ text, phrase, tone = "light" }) {
  if (!text.includes(phrase)) return text
  // Each sentence of a heading starts on its own line (`.sent-br` is a line break only inside
  // .t-h2/.t-display), so two-sentence headings never split mid-phrase on narrow screens.
  return text.split(SENTENCE_GAP).map((s, k) => {
    const i = s.indexOf(phrase)
    return (
      <React.Fragment key={k}>
        {k > 0 && (
          <>
            {" "}
            <span className="sent-br" aria-hidden="true" />
          </>
        )}
        {i < 0 ? (
          s
        ) : (
          <>
            {s.slice(0, i)}
            <FlowText tone={tone}>{phrase}</FlowText>
            {s.slice(i + phrase.length)}
          </>
        )}
      </React.Fragment>
    )
  })
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
