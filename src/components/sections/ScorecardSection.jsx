import React from "react"
import { scorecard } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import Scorecard from "../interactions/Scorecard"
import ScoreResult from "../interactions/ScoreResult"
import { Marked } from "../ui/Highlight"

export default function ScorecardSection() {
  return (
    <SectionShell id="scorecard" theme="night" labelledBy="scorecard-title" className="scorecard-section">
      <header className="section-head section-head--center">
        <h2 id="scorecard-title" className="t-h2" data-reveal>
          <Marked text={scorecard.headline} phrase="Find your gaps." tone="dark" />
        </h2>
        <p className="t-lead" data-reveal>
          {scorecard.sub}
        </p>
      </header>
      <Scorecard />
      {/* Free result + dummy report form, once all 8 areas are reviewed (Kit 01 §03.3) */}
      <ScoreResult />
    </SectionShell>
  )
}
