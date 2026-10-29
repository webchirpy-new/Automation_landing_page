import React from "react"
import { faq } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import FAQAccordion from "../interactions/FAQAccordion"
import { Marked } from "../ui/Highlight"

export default function FAQ() {
  return (
    <SectionShell id="faq" theme="light" labelledBy="faq-title" className="faq">
      <div className="faq__layout">
        <header className="section-head section-head--center">
          <h2 id="faq-title" className="t-h2" data-reveal>
            <Marked text={faq.headline} phrase="before you book the call." tone="light" />
          </h2>
          <p className="t-lead" data-reveal>
            {faq.sub}
          </p>
        </header>
        <FAQAccordion items={faq.items} />
      </div>
    </SectionShell>
  )
}
