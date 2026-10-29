import React, { useLayoutEffect, useRef, useState } from "react"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

/**
 * Marked — renders an approved heading `text` with exactly one existing `phrase`
 * highlighted. The words, order and punctuation are untouched; the phrase is just
 * wrapped, so screen readers read the sentence once.
 *
 * tone="light": a feathered warm marker (pale yellow → gold → soft orange) tilted
 * −1.5° behind the upright text. tone="dark": a short warm underline with a faint
 * amber backing. Strips are measured per wrapped line (getClientRects), so a phrase
 * that wraps gets one strip per line, never a full-line bar. They reveal left-to-right
 * once in view, then stay static; under reduced motion they are simply there.
 */
export function Marked({ text, phrase, tone = "light" }) {
  const i = text.indexOf(phrase)
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <Highlight tone={tone}>{phrase}</Highlight>
      {text.slice(i + phrase.length)}
    </>
  )
}

function Highlight({ tone, children }) {
  const root = useRef(null)
  const words = useRef(null)
  const [lines, setLines] = useState([])

  useLayoutEffect(() => {
    const host = root.current.parentElement // the heading — positioned + isolated in CSS
    const measure = () => {
      const hr = host.getBoundingClientRect()
      const fs = parseFloat(getComputedStyle(host).fontSize)
      const pad = fs * 0.12
      setLines(
        [...words.current.getClientRects()]
          .filter((r) => r.width > 1)
          .map((r) =>
            tone === "dark"
              ? { left: r.left - hr.left, top: r.top - hr.top + r.height * 0.06, width: r.width, height: r.height * 0.92 }
              : { left: r.left - hr.left - pad, top: r.top - hr.top + r.height * 0.4, width: r.width + pad * 2, height: r.height * 0.52 }
          )
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    document.fonts?.ready.then(() => root.current && measure())
    return () => ro.disconnect()
  }, [tone])

  // Reveal once, a beat after the heading's own entrance.
  const ready = lines.length > 0
  useGSAP(
    () => {
      if (!ready) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const marks = root.current.querySelectorAll(".hl__mark")
        gsap.fromTo(
          marks,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            delay: 0.35,
            scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
            onComplete: () => root.current?.classList.add("is-swept"),
          }
        )
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [ready] }
  )

  return (
    <span ref={root} className={`hl hl--${tone}`}>
      {lines.map((l, i) => (
        <span key={i} className="hl__mark" style={l} aria-hidden="true" />
      ))}
      <span ref={words} className="hl__text">
        {children}
      </span>
    </span>
  )
}
