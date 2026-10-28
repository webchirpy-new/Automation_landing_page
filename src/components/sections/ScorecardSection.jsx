import React from "react"
import { scorecard } from "../../data/automationContent"
import { SectionShell, Eyebrow } from "../ui/primitives"
import Scorecard from "../interactions/Scorecard"

export default function ScorecardSection() {
  return (
    <SectionShell id="scorecard" theme="light" labelledBy="scorecard-title" className="scorecard-section">
      <header className="section-head section-head--split">
        <div>
          <Eyebrow>{scorecard.label}</Eyebrow>
          <h2 id="scorecard-title" className="t-h2" data-reveal>
            {scorecard.headline}
          </h2>
        </div>
        <p className="t-lead" data-reveal>
          {scorecard.sub}
        </p>
      </header>
      <Scorecard />
    </SectionShell>
  )
}
