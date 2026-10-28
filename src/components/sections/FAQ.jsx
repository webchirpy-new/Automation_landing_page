import React from "react"
import { faq } from "../../data/automationContent"
import { SectionShell, Eyebrow } from "../ui/primitives"
import FAQAccordion from "../interactions/FAQAccordion"

export default function FAQ() {
  return (
    <SectionShell id="faq" theme="light" labelledBy="faq-title" className="faq">
      <div className="faq__layout">
        <header className="faq__head">
          <Eyebrow>{faq.label}</Eyebrow>
          <h2 id="faq-title" className="t-h2" data-reveal>
            {faq.headline}
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
