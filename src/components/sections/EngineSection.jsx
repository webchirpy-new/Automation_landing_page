import React, { useRef, useState } from "react"
import { engine } from "../../data/automationContent"
import { moduleByName } from "../../data/serviceModules"
import { SectionShell } from "../ui/primitives"
import AutomationEngine from "../interactions/AutomationEngine"
import PixelIcon from "../visuals/PixelIcon"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

export default function EngineSection() {
  const cycleRef = useRef(null)
  const [stage, setStage] = useState(3) // SSR / reduced motion: all stages lit

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        setStage(-1)
        const st = ScrollTrigger.create({
          trigger: cycleRef.current,
          start: "top 75%",
          end: "bottom 55%",
          onUpdate: (self) => setStage(self.progress <= 0 ? -1 : Math.min(3, Math.floor(self.progress * 4))),
          onLeave: () => setStage(3),
        })
        const axis = window.matchMedia("(max-width: 899px)").matches ? "scaleY" : "scaleX"
        gsap.fromTo(
          ".cycle__line-fill",
          { [axis]: 0 },
          { [axis]: 1, ease: "none", scrollTrigger: { trigger: cycleRef.current, start: "top 75%", end: "bottom 55%", scrub: 0.5 } }
        )
        gsap.fromTo(
          ".cycle__loop path",
          { drawSVG: "0%" },
          { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: ".cycle__loop", start: "top 85%", end: "bottom 60%", scrub: 0.5 } }
        )
        return () => st.kill()
      })
      return () => mm.revert()
    },
    { scope: cycleRef }
  )

  return (
    <SectionShell id="engine" theme="night" labelledBy="engine-title" className="engine-section">
      <header className="section-head section-head--center">
        <h2 id="engine-title" className="t-h2" data-reveal>
          {engine.headline}
        </h2>
        <p className="t-lead" data-reveal>
          {engine.sub}
        </p>
      </header>

      <AutomationEngine />

      <div ref={cycleRef} className="cycle">
        <header className="cycle__head">
          <h3 className="t-h3" data-reveal>
            {engine.cycleHeading}
          </h3>
          <p className="t-muted" data-reveal>
            {engine.cycleSub}
          </p>
        </header>
        <div className="cycle__track">
          <span className="cycle__line" aria-hidden="true">
            <span className="cycle__line-fill" />
          </span>
          <ol className="cycle__stages">
            {engine.stages.map((s, i) => (
              <li key={s.title} className={`cycle__stage ${stage >= i ? "is-on" : ""}`}>
                <span className="cycle__num t-mono">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="cycle__title">{s.title}</h4>
                <ul className="cycle__parts">
                  {s.parts.map((p) => (
                    <li key={p} className="chip chip--dark px-host">
                      <PixelIcon name={moduleByName[p].icon} size={12} /> {p}
                    </li>
                  ))}
                </ul>
                <p className="cycle__body">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="cycle__loop" aria-hidden="true">
            <svg viewBox="0 0 1000 60" preserveAspectRatio="none">
              <path d="M940 4 C940 50 900 54 800 54 L200 54 C100 54 60 50 60 4" />
            </svg>
          </div>
          <p className="cycle__loopline t-mono">↺ {engine.loopLine}</p>
        </div>
        <p className="engine-section__closing t-h3" data-reveal>
          {engine.closing}
        </p>
      </div>
    </SectionShell>
  )
}
