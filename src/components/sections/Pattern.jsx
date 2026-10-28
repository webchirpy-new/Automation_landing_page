import React, { useRef, useState } from "react"
import { pattern } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import WorkweekCanvas from "../interactions/WorkweekCanvas"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

const DISCLAIMER = "Illustration · not measured data"
const NOTE =
  "Illustration, not measured data: the team stays the same size while manual work, repeat replies, data entry and chasing follow-ups take a growing share of the week away from customer work."
const SPOT_ICONS = ["chat", "invoice", "followUp"]

export default function Pattern() {
  const ref = useRef(null)
  const storyRef = useRef(null)
  const [active, setActive] = useState(0)
  const [preview, setPreview] = useState(null)
  const activeRef = useRef(0)
  // An explicit pick wins over scroll storytelling until the visitor leaves the section.
  const manual = useRef(false)
  const shown = preview ?? active

  const select = (i) => {
    manual.current = true
    activeRef.current = i
    setActive(i)
  }

  // Emphasis only — the approved sentence is rendered in full.
  const cut = pattern.sameTeam.indexOf("And ")
  const coreLead = cut > 0 ? pattern.sameTeam.slice(0, cut).trim() : pattern.sameTeam
  const coreTail = cut > 0 ? pattern.sameTeam.slice(cut) : ""

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Walk the spotlight 1 → 2 → 3 as the story block scrolls past; no pinning.
        ScrollTrigger.create({
          trigger: storyRef.current,
          start: "top 55%",
          end: "bottom 60%",
          onUpdate: (st) => {
            if (manual.current) return
            const i = Math.min(2, Math.floor(st.progress * 3))
            if (i !== activeRef.current) {
              activeRef.current = i
              setActive(i)
            }
          },
          onLeave: () => (manual.current = false),
          onLeaveBack: () => (manual.current = false),
        })

        const core = ref.current.querySelector(".pattern__core")
        gsap.from(core.children, {
          yPercent: 35,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: core, start: "top 85%", once: true },
        })
        const final = ref.current.querySelector(".pattern__final")
        gsap.fromTo(
          final.querySelector(".pattern__rule"),
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: final, start: "top 95%", end: "top 70%", scrub: 0.6 } }
        )
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <SectionShell id="pattern" theme="paper" labelledBy="pattern-title" className="pattern">
      <div ref={ref}>
        <div ref={storyRef} className="pattern__story">
          <div className="pattern__top">
            <div className="pattern__intro">
              <h2 id="pattern-title" className="t-h2" data-reveal>
                {pattern.headline}
              </h2>
              <ul className="pattern__points" data-reveal aria-label="What you already have">
                {pattern.chips.map((c) => (
                  <li key={c}>
                    <span className="pattern__tick">
                      <PixelIcon name="check" size={12} animate={false} />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <WorkweekCanvas
              id="pattern-week"
              title={pattern.chartTitle}
              labels={pattern.chartLabels}
              disclaimer={DISCLAIMER}
              note={NOTE}
              spot={shown}
            />
          </div>

          <div className="spot" role="group" aria-label="Where work slips through" data-reveal>
            {pattern.lines.map((line, i) => (
              <button
                key={line}
                type="button"
                className="spot__btn"
                aria-pressed={i === active}
                aria-controls="pattern-week"
                data-shown={i === shown || undefined}
                onClick={() => select(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setPreview(i)}
                onPointerLeave={() => setPreview(null)}
              >
                <span className="spot__icon">
                  <PixelIcon name={SPOT_ICONS[i]} size={20} animate={false} />
                </span>
                <span>{line}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pattern__end">
          <p className="pattern__core">
            <span>{coreLead}</span> {coreTail && <span className="pattern__core-accent">{coreTail}</span>}
          </p>
          <div className="pattern__end-row">
            <p className="pattern__closing" data-reveal>
              {pattern.closingLine}
            </p>
            <p className="pattern__final" data-reveal>
              {pattern.subLine}
              <span className="pattern__rule" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
