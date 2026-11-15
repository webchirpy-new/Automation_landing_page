import React, { useRef } from "react"
import { pattern, persistent } from "../../data/automationContent"
import { SectionShell, CTAButton } from "../ui/primitives"
import PatternScenes from "../interactions/PatternScenes"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { goToBooking } from "../../lib/scroll"
import { Marked } from "../ui/Highlight"

/** Words wrapped for the entrance cascade; the approved sentence stays intact for readers. */
const Words = ({ text }) =>
  text.split(" ").map((word, i) => (
    <React.Fragment key={`${word}-${i}`}>
      {i > 0 && " "}
      <span className="pattern__word">{word}</span>
    </React.Fragment>
  ))

export default function Pattern() {
  const ref = useRef(null)

  // Emphasis only — the approved sentence is rendered in full.
  const cut = pattern.sameTeam.indexOf("And ")
  const coreLead = pattern.sameTeam.slice(0, cut).trim()
  const coreTail = pattern.sameTeam.slice(cut)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const end = ref.current.querySelector(".pattern__end")
        const q = gsap.utils.selector(end)

        // Resolution: the sentence cascades in once, then stays at full strength in both scroll
        // directions (a scrubbed brighten would leave it dim whenever the visitor stopped)…
        gsap.fromTo(
          q(".pattern__word, .pattern__core-accent"),
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: end, start: "top 86%", once: true } }
        )
        // …then the reasoning and the CTA settle in once, after the whole story.
        gsap
          .timeline({ scrollTrigger: { trigger: q(".pattern__end-row")[0], start: "top 86%", once: true } })
          .from(q(".pattern__closing"), { autoAlpha: 0, y: 15, duration: 0.7, ease: "power2.out" }, 0)
          .from(q(".pattern__final"), { autoAlpha: 0, y: 15, duration: 0.7, ease: "power2.out" }, 0.14)
          .from(q(".pattern__cta"), { autoAlpha: 0, y: 12, duration: 0.6, ease: "power2.out" }, 0.45)
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <SectionShell id="pattern" theme="night" labelledBy="pattern-title" className="pattern">
      <div ref={ref}>
        <PatternScenes />

        <div className="pattern__end">
          <p className="pattern__core">
            <span className="pattern__core-lead">
              <Words text={coreLead} />
            </span>{" "}
            <span className="pattern__core-accent">
              <Marked text={coreTail} phrase={coreTail} tone="dark" />
            </span>
          </p>
          <div className="pattern__end-row">
            <p className="pattern__closing">{pattern.closingLine}</p>
            <p className="pattern__final">{pattern.subLine}</p>
          </div>
          <div className="pattern__cta">
            <CTAButton onClick={goToBooking} size="lg">
              {persistent.stickyBar.button}
            </CTAButton>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
