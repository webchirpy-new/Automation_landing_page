import React, { useRef } from "react"
import { dashboard } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import DashboardDemo from "../interactions/DashboardDemo"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

export default function DashboardSection() {
  const flowRef = useRef(null)

  // One data capsule travels DATA → DASHBOARD → DECISIONS along a MotionPath.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`${MOTION_OK} and (min-width: 768px)`, () => {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true })
        tl.fromTo(".ddd__capsule", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
          .to(".ddd__capsule", {
            motionPath: { path: ".ddd__route", align: ".ddd__route", alignOrigin: [0.5, 0.5] },
            duration: 3.2,
            ease: "sine.inOut",
          }, 0)
          .to(".ddd__capsule", { autoAlpha: 0, duration: 0.25 }, 3)
        gsap.utils.toArray(".ddd__step").forEach((s, i) => {
          tl.add(() => {
            s.classList.add("is-hit")
            gsap.delayedCall(0.8, () => s.classList.remove("is-hit"))
          }, 0.2 + i * 1.4)
        })
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()))
        io.observe(flowRef.current)
        return () => {
          io.disconnect()
          tl.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: flowRef }
  )

  return (
    <SectionShell id="dashboard" theme="night" labelledBy="dashboard-title" className="dashboard-section">
      <header className="section-head section-head--center">
        <h2 id="dashboard-title" className="t-h2" data-reveal>
          {dashboard.headline}
        </h2>
        <p className="t-lead" data-reveal>
          {dashboard.sub}
        </p>
      </header>

      <div ref={flowRef} className="ddd" data-reveal>
        <svg className="ddd__svg" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path className="ddd__route" d="M60 20 L940 20" />
        </svg>
        <span className="ddd__capsule" aria-hidden="true" />
        <ol className="ddd__steps">
          {dashboard.flow.map((f, i) => (
            <li key={f.title} className="ddd__step">
              <span className="ddd__node t-mono">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="ddd__title">{f.title}</h3>
              <p className="ddd__body">{f.body}</p>
              <ul className="ddd__items">
                {f.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <p className="dashboard-section__try t-mono">{dashboard.tryIt}</p>
      <DashboardDemo />
    </SectionShell>
  )
}
