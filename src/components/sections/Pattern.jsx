import React, { useRef } from "react"
import { pattern } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

// Where each pathway stalls (fraction of track) and what it is waiting on.
const STALLS = [
  { at: 0.34, icon: "clock", wait: "waits overnight" },
  { at: 0.58, icon: "backOffice", wait: "manual all day" },
  { at: 0.78, icon: "followUp", wait: "depends on memory" },
]

// Conceptual composition only — NOT measured data (no percentages shown).
const WEEK_BEFORE = [6, 1, 1, 1, 1]
const WEEK_AFTER = [2, 2, 2, 2, 2]

export default function Pattern() {
  const ref = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray(".path-row", ref.current).forEach((row, i) => {
          const pkt = row.querySelector(".path-row__packet")
          const at = STALLS[i].at
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 80%", once: true } })
          tl.fromTo(row.querySelector(".path-row__done"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: "power2.out" })
            .fromTo(pkt, { left: "0%" }, { left: `${at * 100}%`, duration: 0.9, ease: "power2.out" }, 0)
            .from(row.querySelector(".path-row__gap"), { autoAlpha: 0, duration: 0.3 }, 0.8)
            .add(() => row.classList.add("is-stalled"))
        })

        const segs = gsap.utils.toArray(".week__seg", ref.current)
        segs.forEach((s, i) => gsap.set(s, { flexGrow: WEEK_BEFORE[i] }))
        gsap.to(segs, {
          flexGrow: (i) => WEEK_AFTER[i],
          ease: "none",
          scrollTrigger: { trigger: ".week", start: "top 80%", end: "bottom 40%", scrub: 0.8 },
        })

        gsap.fromTo(
          ".repair__line",
          { drawSVG: "0%" },
          { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: ".repair", start: "top 85%", end: "top 45%", scrub: 0.6 } }
        )
        gsap.to(".repair__gap", {
          autoAlpha: 0,
          scrollTrigger: { trigger: ".repair", start: "top 70%", end: "top 45%", scrub: 0.6 },
        })
        ScrollTrigger.refresh()
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <SectionShell id="pattern" theme="paper" labelledBy="pattern-title" className="pattern">
      <div ref={ref}>
        <header className="section-head section-head--center">
          <h2 id="pattern-title" className="t-h2" data-reveal>
            {pattern.headline}
          </h2>
          <ul className="chips" data-reveal aria-label="What you already have">
            {pattern.chips.map((c) => (
              <li key={c} className="chip">
                <PixelIcon name="check" size={12} />
                {c}
              </li>
            ))}
          </ul>
        </header>

        <div className="pattern__paths">
          {pattern.lines.map((line, i) => (
            <div key={line} className="path-row" data-reveal style={{ "--at": STALLS[i].at }}>
              <p className="path-row__text">{line}</p>
              <div className="path-row__track" aria-hidden="true">
                <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="path-row__svg">
                  <line x1="0" y1="4" x2={STALLS[i].at * 100} y2="4" className="path-row__done" />
                  <line x1={STALLS[i].at * 100 + 2} y1="4" x2={STALLS[i].at * 100 + 10} y2="4" className="path-row__gap" />
                  <line x1={STALLS[i].at * 100 + 12} y1="4" x2="100" y2="4" className="path-row__rest" />
                </svg>
                <span className="path-row__packet" style={{ left: `${STALLS[i].at * 100}%` }} />
                <span className="path-row__stall t-mono" style={{ left: `${STALLS[i].at * 100}%` }}>
                  <PixelIcon name={STALLS[i].icon} size={14} />
                  {STALLS[i].wait}
                </span>
              </div>
            </div>
          ))}
          <p className="pattern__same t-h3" data-reveal>
            {pattern.sameTeam}
          </p>
        </div>

        <figure className="week" data-reveal aria-labelledby="week-title">
          <div className="week__head">
            <h3 id="week-title" className="t-mono">
              {pattern.chartTitle}
            </h3>
            <span className="badge badge--outline t-mono">Illustration · not measured data</span>
          </div>
          <div className="week__team" aria-hidden="true">
            <PixelIcon name="people" size={18} />
            <span className="t-mono">Same team</span>
            <span className="week__team-line" />
          </div>
          <div className="week__bar" aria-hidden="true">
            {pattern.chartLabels.map((l, i) => (
              <span key={l} className={`week__seg week__seg--${i}`} style={{ flexGrow: WEEK_AFTER[i] }}>
                <span className="week__seg-label">{l}</span>
              </span>
            ))}
          </div>
          <ul className="week__legend">
            {pattern.chartLabels.map((l, i) => (
              <li key={l}>
                <span className={`week__swatch week__seg--${i}`} aria-hidden="true" />
                {l}
              </li>
            ))}
          </ul>
          <figcaption className="sr-only">
            Illustration, not measured data: the team stays the same size while manual work, repeat replies, data entry and
            chasing follow-ups take a growing share of the week away from customer work.
          </figcaption>
        </figure>

        <div className="pattern__close">
          <p className="pattern__closing" data-reveal>
            {pattern.closingLine}
          </p>
          <div className="repair" aria-hidden="true">
            <svg viewBox="0 0 400 20" preserveAspectRatio="none">
              <line x1="0" y1="10" x2="400" y2="10" className="repair__base" />
              <line x1="180" y1="10" x2="220" y2="10" className="repair__gap" />
              <line x1="0" y1="10" x2="400" y2="10" className="repair__line" />
            </svg>
          </div>
          <p className="pattern__sub t-mono" data-reveal>
            {pattern.subLine}
          </p>
        </div>
      </div>
    </SectionShell>
  )
}
