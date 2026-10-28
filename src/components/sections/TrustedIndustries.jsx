import React from "react"
import { trusted, hero, uiCopy } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import { useSite } from "../../context/SiteContext"
import { siteConfig } from "../../config/site"

/**
 * Work gallery. Only the YRE portal is described in the DOCX (the hero "Source"
 * line); every other slot is an explicit placeholder awaiting real screenshots.
 */
const GALLERY = [
  {
    title: "Young Reporters for the Environment 2026 portal",
    meta: "Taylor’s University · GGAF · RTM",
    body: "One automated platform runs registration, team invites, blind judging and verified certificates, with zero spreadsheets.",
    size: "xl",
  },
  { title: "Project slot 02", size: "tall" },
  { title: "Project slot 03", size: "sm" },
  { title: "Project slot 04", size: "sm" },
  { title: "Project slot 05", size: "full" },
]

export default function TrustedIndustries() {
  const { openModal } = useSite()
  return (
    <SectionShell id="trusted" theme="paper" labelledBy="trusted-title" className="trusted">
      <header className="section-head section-head--center">
        <h2 id="trusted-title" className="t-h2" data-reveal>
          {trusted.headline}
        </h2>
        <p className="t-lead" data-reveal>
          {trusted.sub}
        </p>
      </header>

      <div className="clients" data-reveal>
        <ul className="clients__grid" aria-label={hero.logoStripHeading}>
          {trusted.clients.map((c) => (
            <li key={c}>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className="clients__note t-mono">{uiCopy.logosPending}</p>
      </div>

      <div className="voices" data-reveal>
        <h3 className="t-h3">{trusted.clientVoicesHeading}</h3>
        <div className="voices__row">
          <p className="voices__pending">
            Client testimonials pending approval — no quotes are shown until real, permitted ones are supplied.
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => openModal("video:testimonial")}>
            <span className="btn__label">
              ▶ Client story {siteConfig.testimonialVideoUrl ? "" : `· ${uiCopy.assetPending}`}
            </span>
          </button>
        </div>
      </div>

      <div className="gallery">
        <h3 className="t-h3 gallery__title" data-reveal>
          {trusted.galleryHeading}
        </h3>
        <ul className="gallery__grid">
          {GALLERY.map((g) => (
            <li key={g.title} className={`gallery__item gallery__item--${g.size} ${g.body ? "has-copy" : "is-pending"}`} data-reveal>
              <div className="gallery__shot" aria-hidden="true">
                <PixelIcon name={g.body ? "form" : "chart"} size={28} animate={false} />
                <span className="t-mono">Screenshot · {uiCopy.assetPending}</span>
              </div>
              <div className="gallery__copy">
                <h4>{g.title}</h4>
                {g.meta && <p className="t-mono">{g.meta}</p>}
                {g.body && <p className="t-muted">{g.body}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  )
}
