import React from "react"
import { engine } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import AutomationEngine from "../interactions/AutomationEngine"
import LivingWorkflow from "../interactions/LivingWorkflow"
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

      <AutomationEngine />

      <div className="cycle">
        <header className="cycle__head">
          <h3 className="t-h3" data-reveal>
            {engine.cycleHeading}
          </h3>
          <p className="t-muted" data-reveal>
            {engine.cycleSub}
          </p>
        </header>
        <LivingWorkflow />
        <p className="engine-section__closing t-h3" data-reveal>
          {engine.closing}
        </p>
      </div>
    </SectionShell>
  )
}
