import React, { useRef } from "react"
import { why, uiCopy } from "../../data/automationContent"
import { SectionShell, CTAButton } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import { useSite } from "../../context/SiteContext"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

const STORY_ICONS = ["cross", "backOffice", "check"] // problem → build → tested
const DIFF_ICONS = ["leadCapture", "check", "insights"]

export default function WhyWebchirpy() {
  const ref = useRef(null)
  const { openModal } = useSite()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".story__line-fill",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".story", start: "top 70%", end: "bottom 60%", scrub: 0.5 } }
        )
        gsap.fromTo(
          ".founder__frame",
          { clipPath: "inset(12% 12% 12% 12% round 32px)" },
          { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".founder", start: "top 75%", once: true } }
        )
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <SectionShell id="why" theme="light" labelledBy="why-title" className="why">
      <div ref={ref}>
        <header className="section-head section-head--center">
          <h2 id="why-title" className="t-h2 why__title" data-reveal>
            {why.headline}
          </h2>
          <p className="t-lead" data-reveal>
            {why.sub}
          </p>
        </header>

        <ul className="proof-points" data-reveal>
          {why.proofPoints.map((p) => (
            <li key={p.value}>
              <span className="proof-points__value">{p.value}</span>
              <span className="proof-points__label">{p.label}</span>
            </li>
          ))}
        </ul>

        <div className="why__split">
          <div className="story">
            <h3 className="t-mono story__title">{why.storyTitle}</h3>
            <span className="story__line" aria-hidden="true">
              <span className="story__line-fill" />
            </span>
            <ol>
              {why.story.map((s, i) => (
                <li key={s.title} className="story__stop px-host" data-reveal>
                  <span className="story__icon">
                    <PixelIcon name={STORY_ICONS[i]} size={22} />
                  </span>
                  <div>
                    <h4 className="story__stop-title">{s.title}</h4>
                    <p className="t-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="founder">
            <div className="founder__frame">
              <div className="founder__portrait" role="img" aria-label="Founder portrait placeholder — approved photo pending">
                <span className="founder__mono" aria-hidden="true">
                  VS
                </span>
                <span className="founder__pending t-mono">{uiCopy.assetPending} · portrait</span>
              </div>
              <button type="button" className="founder__play" onClick={() => openModal("video:founder")}>
                <PixelIcon name="play" size={16} />
                {why.founderVideoButton}
              </button>
            </div>
            <div className="founder__card glass">
              <p className="founder__name">{why.founderCard.name}</p>
              <ul className="founder__roles t-mono">
                {why.founderCard.roles.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="why__founder-copy">
          <h3 className="t-h3" data-reveal>
            {why.founderHeadline}
          </h3>
          <p className="t-lead" data-reveal>
            {why.founderIntro}
          </p>
        </div>

        <ul className="diffs">
          {why.differences.map((d, i) => (
            <li key={d.title} className="diff px-host" data-reveal>
              <span className="diff__icon">
                <PixelIcon name={DIFF_ICONS[i]} size={22} />
              </span>
              <p className="t-mono diff__kicker">{d.kicker}</p>
              <h4 className="diff__title">{d.title}</h4>
              <p className="t-muted">{d.body}</p>
            </li>
          ))}
        </ul>

        <div className="why__close" data-reveal>
          <p className="t-h3">{why.closingLine}</p>
          <CTAButton size="lg" onClick={() => openModal("lead")}>
            {why.button}
          </CTAButton>
        </div>
      </div>
    </SectionShell>
  )
}
