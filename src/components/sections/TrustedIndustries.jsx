import React from "react"
import { trusted } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import BrandCarousel from "../interactions/BrandCarousel"
import VideoTestimonials from "../interactions/VideoTestimonials"
import { Marked } from "../ui/Highlight"
import { siteConfig } from "../../config/site"

export default function TrustedIndustries() {
  return (
    <SectionShell id="trusted" theme="night" labelledBy="trusted-title" className="trusted">
      <header className="section-head section-head--center">
        <h2 id="trusted-title" className="t-h2" data-reveal>
          <Marked text={trusted.headline} phrase="behind the engine." tone="dark" />
        </h2>
        <p className="t-lead" data-reveal>
          {trusted.sub}
        </p>
      </header>

      <BrandCarousel />

      {siteConfig.showClientStories && <VideoTestimonials heading={trusted.clientVoicesHeading} phrase="clients say" />}
    </SectionShell>
  )
}
