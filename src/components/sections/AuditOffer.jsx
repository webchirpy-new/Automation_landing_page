import React, { useRef } from "react"
import { audit } from "../../data/automationContent"
import { SectionShell, CTAButton } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import { goToBooking } from "../../lib/scroll"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { Marked } from "../ui/Highlight"

const DELIV_ICONS = ["leadCapture", "salesPipeline", "check", "backOffice"]

export default function AuditOffer() {
  const ref = useRef(null)
  // One elegant unfold of the ticket's sheet on first view. All copy is in the
  // DOM and readable at rest; reduced motion shows it unfolded.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".ticket", start: "top 75%", once: true } })
        tl.from(".ticket__sheet", { rotateX: -88, transformOrigin: "50% 0%", duration: 0.9, ease: "power3.out" })
          .from(".ticket__item", { autoAlpha: 0, y: 10, stagger: 0.08, duration: 0.4 }, "-=0.35")
          .from(".ticket__seal", { scale: 1.6, autoAlpha: 0, rotate: -20, duration: 0.45, ease: "back.out(2)" }, "-=0.2")
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <SectionShell id="audit" theme="night" labelledBy="audit-title" className="audit">
      <div ref={ref}>
        <header className="section-head section-head--center">
          <h2 id="audit-title" className="t-h2" data-reveal>
            <Marked text={audit.headline} phrase="Everything we promise." tone="dark" />
          </h2>
          <p className="t-lead" data-reveal>
            {audit.sub}
          </p>
        </header>

        <div className="ticket">
          <div className="ticket__stub">
            <span className="ticket__tag t-mono">{audit.ticketTag}</span>
            <p className="ticket__total-label t-mono">{audit.total.label}</p>
            <p className="ticket__price">{audit.total.value}</p>
            <p className="ticket__note">{audit.total.note}</p>
            
          </div>
          <div className="ticket__perf" aria-hidden="true" />
          <div className="ticket__sheet">
            <h3 className="ticket__heading">
              {audit.ticketHeading} <span className="t-mono ticket__dur">· {audit.ticketDuration}</span>
            </h3>
            <ol className="ticket__list">
              {audit.deliverables.map((d, i) => (
                <li key={d.title} className="ticket__item px-host">
                  <span className="ticket__icon">
                    <PixelIcon name={DELIV_ICONS[i]} size={20} />
                  </span>
                  <div>
                    <h4>{d.title}</h4>
                    <p className="t-muted">{d.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="promises">
          <h3 className="t-mono promises__title" data-reveal>
            {audit.promisesTitle}
          </h3>
          <ol className="promises__list" data-stagger>
            {audit.promises.map((p, i) => (
              <li key={p.title} data-reveal>
                <span className="promises__n t-mono">{String(i + 1).padStart(2, "0")}</span>
                <h4>{p.title}</h4>
                <p className="t-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="audit__cta" data-reveal>
          <CTAButton size="lg" onClick={goToBooking}>
            {audit.button}
          </CTAButton>
          <p className="audit__under">{audit.underButton}</p>
        </div>
      </div>
    </SectionShell>
  )
}
