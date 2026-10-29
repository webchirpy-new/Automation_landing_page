import React, { useEffect, useRef, useState } from "react"
import { brands } from "../../data/brands"
import { gsap, useGSAP } from "../../lib/gsap"

/**
 * BrandCarousel — one row of the 13 approved logo cards flowing right to left.
 *
 * Layers: the track carries the continuous GSAP loop (xPercent); each card carries its
 * own tilt / selection transform in CSS, so the two never fight. The track holds three
 * identical sets with the canonical (focusable) set in the middle; the outer copies are
 * aria-hidden and out of the tab order. Moving one set width wraps seamlessly.
 *
 * Without JS, under reduced motion and on phones it is a manual swipe row instead.
 */

const COPIES = 3
const LIVE = "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
const PX_PER_S = 62 // constant drift speed; one circuit lands between 35s and 60s
const TILT = [-2.4, 1.8, -1.2, 2.6, -2, 1.2, -2.8, 2.2, -1.6, 2.8, -0.9, 1.6, -2.2]
const lean = (r) => r + (r < 0 ? -1.5 : 1.5) // selected: a little further the same way, never flat

export default function BrandCarousel() {
  const root = useRef(null)
  const viewport = useRef(null)
  const track = useRef(null)
  const loop = useRef(null)
  const [live, setLive] = useState(false)
  const [sel, setSel] = useState(null)
  const [focusIn, setFocusIn] = useState(false)
  const hold = sel !== null || focusIn

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(LIVE, () => {
        setLive(true)
        // The canonical set lays out identically in the swipe row, so it can be measured now.
        const set = track.current.children[1].offsetWidth
        loop.current = gsap.to(track.current, {
          xPercent: -100 / COPIES,
          duration: gsap.utils.clamp(35, 60, set / PX_PER_S),
          ease: "none",
          repeat: -1,
        })
        return () => {
          loop.current = null
          setLive(false)
        }
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  // Selection or keyboard focus eases the flow to a stop; release eases it back from where it is.
  useEffect(() => {
    if (!loop.current) return
    gsap.to(loop.current, { timeScale: hold ? 0 : 1, duration: hold ? 0.45 : 0.9, ease: "power2.out", overwrite: true })
  }, [hold])

  // Click outside any card, or Escape, releases the selection.
  useEffect(() => {
    if (sel === null) return
    const outside = (e) => !e.target.closest?.(".bc-card") && setSel(null)
    const escape = (e) => e.key === "Escape" && setSel(null)
    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", escape)
    }
  }, [sel])

  // Keyboard focus may land on a card that has drifted out of view: an extra `x` offset
  // (separate from the loop's xPercent) brings it to ~35% of the viewport.
  const reveal = (e) => {
    if (!loop.current || !e.currentTarget.matches(":focus-visible")) return
    viewport.current.scrollLeft = 0 // undo the browser's scroll-into-view on the clipped viewport
    const set = track.current.offsetWidth / COPIES
    const target = viewport.current.offsetWidth * 0.35 - e.currentTarget.closest(".bc__item").offsetLeft
    gsap.to(track.current, { x: target + loop.current.progress() * set, duration: 0.6, ease: "power2.out", overwrite: "auto" })
  }
  useEffect(() => {
    if (!focusIn && loop.current) gsap.to(track.current, { x: 0, duration: 0.9, ease: "power2.inOut", overwrite: "auto" })
  }, [focusIn])

  return (
    <div ref={root} className={`bc ${live ? "is-live" : ""}`}>
      <div
        ref={viewport}
        className="bc__viewport"
        role="region"
        aria-roledescription="carousel"
        aria-labelledby="trusted-title"
        onFocus={(e) => e.target.matches(":focus-visible") && setFocusIn(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocusIn(false)}
      >
        <div ref={track} className="bc__track">
          {Array.from({ length: COPIES }, (_, c) => (
            <ul key={c} className={`bc__set ${c !== 1 ? "is-clone" : ""}`} aria-hidden={c !== 1 || undefined}>
              {brands.map((b, i) => (
                <li
                  key={b.name}
                  className="bc__item"
                  style={{
                    "--r": `${TILT[i]}deg`,
                    "--r-sel": `${lean(TILT[i])}deg`,
                    "--fd": `${4.5 + (i % 4) * 0.7}s`,
                    "--fdel": `${-i * 0.8}s`,
                  }}
                >
                  <div className="bc__float">
                    <button
                      type="button"
                      className="bc-card"
                      aria-pressed={sel === i}
                      tabIndex={c !== 1 ? -1 : undefined}
                      onClick={() => setSel((s) => (s === i ? null : i))}
                      onFocus={reveal}
                    >
                      <span className="bc-card__logo">
                        <img src={b.logo} alt={`${b.name} logo`} width="150" height="100" decoding="async" draggable="false" />
                      </span>
                      <span className="bc-card__name" aria-hidden="true">
                        {b.name}
                      </span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  )
}
