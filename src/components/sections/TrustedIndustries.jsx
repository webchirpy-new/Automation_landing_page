import React from "react"
import { trusted } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import BrandCarousel from "../interactions/BrandCarousel"
import ClientStoryScatter from "../interactions/ClientStoryScatter"
import { Marked } from "../ui/Highlight"

/**
 * Project assets. Only the YRE portal is described in the DOCX (the hero "Source"
 * line); every other slot is an explicit placeholder awaiting real screenshots.
 */
const PROJECTS = [
  {
    title: "Young Reporters for the Environment 2026 portal",
    meta: "Taylor’s University · GGAF · RTM",
    body: "One automated platform runs registration, team invites, blind judging and verified certificates, with zero spreadsheets.",
  },
  { title: "Project slot 02" },
  { title: "Project slot 03" },
  { title: "Project slot 04" },
  { title: "Project slot 05" },
]

export default function TrustedIndustries() {
  return (
    <SectionShell id="trusted" theme="light" labelledBy="trusted-title" className="trusted">
      <header className="section-head section-head--center">
        <h2 id="trusted-title" className="t-h2" data-reveal>
          <Marked text={trusted.headline} phrase="behind the engine." tone="light" />
        </h2>
        <p className="t-lead" data-reveal>
          {trusted.sub}
        </p>
      </header>

      <BrandCarousel />

      <ClientStoryScatter
        heading={trusted.clientVoicesHeading}
        phrase="clients say"
        pendingNote="Client testimonials pending approval — no quotes are shown until real, permitted ones are supplied."
        galleryHeading={trusted.galleryHeading}
        projects={PROJECTS}
      />
    </SectionShell>
  )
}
