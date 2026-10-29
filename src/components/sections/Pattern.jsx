import React, { useRef, useState } from "react"
import { pattern } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import WorkweekCanvas from "../interactions/WorkweekCanvas"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { Marked } from "../ui/Highlight"

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
  const coreParts = coreLead.split(/(?<=\.)\s+/) // "Same team." · "Same effort."

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

        // Closing: one-time editorial reveal — lead line, masked accent line (shedding a few
        // pixels as the hours "disappear"), paragraph, final statement, then its underline.
        const end = ref.current.querySelector(".pattern__end")
        const q = gsap.utils.selector(end)
        gsap
          .timeline({ scrollTrigger: { trigger: end, start: "top 80%", once: true } })
          .from(q(".pattern__core-lead"), { autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out" }, 0)
          .fromTo(
            q(".pattern__core-accent"),
            { autoAlpha: 0, y: 14, clipPath: "inset(0% 0% 100% 0%)" },
            { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power3.out", clearProps: "clipPath" },
            0.2
          )
          .fromTo(
            q(".pattern__px i"),
            { autoAlpha: 0, y: 0 },
            { keyframes: { autoAlpha: [0, 0.55, 0], y: [0, 4, 10] }, duration: 0.9, ease: "power1.out", stagger: 0.08 },
            1.0 // after the mask clears, so the drift isn't clipped
          )
          .from(q(".pattern__closing"), { autoAlpha: 0, y: 15, duration: 0.7, ease: "power2.out" }, 0.55)
          .from(q(".pattern__final"), { autoAlpha: 0, y: 12, duration: 0.7, ease: "power2.out" }, 0.8)
          .fromTo(
            q(".pattern__final-text"),
            { backgroundSize: "0% 2px" },
            { backgroundSize: "100% 2px", duration: 0.7, ease: "power2.out" },
            1.1
          )
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <SectionShell id="pattern" theme="night" labelledBy="pattern-title" className="pattern">
      <div ref={ref}>
        <div ref={storyRef} className="pattern__story">
          <div className="pattern__top">
            <div className="pattern__intro">
              <h2 id="pattern-title" className="t-h2" data-reveal>
                <Marked text={pattern.headline} phrase="slipping through?" tone="dark" />
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
            <span className="pattern__core-lead">
              {coreParts.map((part, i) => (
                <React.Fragment key={part}>
                  {i > 0 && " "}
                  <span className="pattern__core-part">{part}</span>
                </React.Fragment>
              ))}
            </span>{" "}
            {coreTail && (
              <span className="pattern__core-accent">
                {coreTail}
                <span className="pattern__px" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            )}
          </p>
          <div className="pattern__end-row">
            <p className="pattern__closing">{pattern.closingLine}</p>
            <p className="pattern__final">
              <span className="pattern__final-text">{pattern.subLine}</span>
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
