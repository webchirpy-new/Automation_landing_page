import React from "react"
import { scorecard } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import Scorecard from "../interactions/Scorecard"

export default function ScorecardSection() {
  return (
    <SectionShell id="scorecard" theme="light" labelledBy="scorecard-title" className="scorecard-section">
      <header className="section-head section-head--center">
        <h2 id="scorecard-title" className="t-h2" data-reveal>
          {scorecard.headline}
        </h2>
        <p className="t-lead" data-reveal>
          {scorecard.sub}
        </p>
      </header>
      <Scorecard />
    </SectionShell>
  )
}
