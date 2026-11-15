import React from "react"
import { SectionShell } from "../ui/primitives"

/** vsl-08 #at-work: one enquiry, start to finish (illustrative, Kit 04 §05). */
export default function TimelineSection({ section: s }) {
  const titleId = `${s.id}-title`
  return (
    <SectionShell id={s.id} theme="light" labelledBy={titleId} className="psec psec--timeline">
      <header className="section-head section-head--center">
        <p className="t-mono psec__eyebrow" data-reveal>
          {s.label}
        </p>
        <h2 id={titleId} className="t-h2" data-reveal>
          {s.title}
        </h2>
      </header>

      <ol className="psec-timeline" data-stagger>
        {s.steps.map((st, i) => (
          <li key={st.time}>
            <span className="psec-timeline__n mark" aria-hidden="true">
              {i + 1}
            </span>
            <p>
              <strong>{st.time}</strong> {st.body}
            </p>
          </li>
        ))}
      </ol>

      <p className="t-muted psec__note psec__note--center" data-reveal>
        {s.note}
      </p>
    </SectionShell>
  )
}
