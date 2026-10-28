import React, { useRef } from "react"
import { fit } from "../../data/automationContent"
import { SectionShell, CTAButton } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import { goToBooking } from "../../lib/scroll"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

export default function AudienceFit() {
  const ref = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".branch", start: "top 80%", once: true } })
        tl.fromTo(".branch__stem", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, ease: "power1.in" })
          .fromTo([".branch__good", ".branch__other"], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: "power2.out" })
          .to(".branch__dot--good", { motionPath: { path: ".branch__good", align: ".branch__good", alignOrigin: [0.5, 0.5] }, duration: 1, ease: "power2.inOut" }, "<")
          .to(".branch__dot--other", { motionPath: { path: ".branch__other", align: ".branch__other", alignOrigin: [0.5, 0.5] }, duration: 1.3, ease: "power2.inOut" }, "<")
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <SectionShell id="fit" theme="light" labelledBy="fit-title" className="fit">
      <div ref={ref}>
        <header className="section-head section-head--center">
          <h2 id="fit-title" className="t-h2" data-reveal>
            {fit.headline}
          </h2>
          <p className="t-lead" data-reveal>
            {fit.sub}
          </p>
        </header>

        <svg className="branch" viewBox="0 0 400 90" aria-hidden="true">
          <path className="branch__stem" d="M200 0 V30" />
          <path className="branch__good" d="M200 30 C200 60 100 56 100 90" />
          <path className="branch__other" d="M200 30 C200 60 300 56 300 90" />
          <rect className="branch__dot branch__dot--good" x="95" y="80" width="10" height="10" />
          <rect className="branch__dot branch__dot--other" x="296" y="82" width="8" height="8" />
        </svg>

        <div className="fit__cols">
          <section className="fit__col fit__col--good" aria-labelledby="fit-good" data-reveal>
            <h3 id="fit-good" className="fit__title">
              {fit.good.title}
            </h3>
            <p className="fit__lead">{fit.good.lead}</p>
            <ul>
              {fit.good.items.map((it) => (
                <li key={it}>
                  <PixelIcon name="check" size={14} animate={false} />
                  {it}
                </li>
              ))}
            </ul>
            <CTAButton onClick={goToBooking} className="fit__cta">
              {fit.good.button}
            </CTAButton>
          </section>
          <section className="fit__col fit__col--other" aria-labelledby="fit-other" data-reveal>
            <h3 id="fit-other" className="fit__title">
              {fit.notFit.title}
            </h3>
            <p className="fit__lead">{fit.notFit.lead}</p>
            <ul>
              {fit.notFit.items.map((it) => (
                <li key={it}>
                  <span className="fit__dash" aria-hidden="true" />
                  {it}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <p className="fit__under" data-reveal>
          {fit.lineUnder}
        </p>
      </div>
    </SectionShell>
  )
}
