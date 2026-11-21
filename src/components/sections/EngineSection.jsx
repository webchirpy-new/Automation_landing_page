import React from "react"
import { engine } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import EngineOrbit from "../interactions/EngineOrbit"
import { Marked } from "../ui/Highlight"

export default function EngineSection() {
  return (
    <SectionShell id="engine" theme="light" labelledBy="engine-title" className="engine-section">
      <header className="section-head section-head--center">
        <h2 id="engine-title" className="t-h2" data-reveal>
          <Marked text={engine.headline} phrase="AI Automation Engine" tone="light" />
        </h2>
        <p className="t-lead" data-reveal>
          {engine.sub}
        </p>
      </header>

      {/* The eight parts as one living engine (replaces the card navigator, EngineExplorer) */}
      <EngineOrbit />

      {/* The workflow-stage diagram (LivingWorkflow) is merged into the cards above: each part's card
          now carries its stage heading. */}
      <div className="cycle">
        <p className="engine-section__closing t-h3" data-reveal>
          {engine.closing}
        </p>
      </div>
    </SectionShell>
  )
}
