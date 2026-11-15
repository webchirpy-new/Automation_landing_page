import React from "react"
import { SectionShell } from "../ui/primitives"

/** vsl-05 #story: before → three steps → after, plus what did not change (Kit 04 §02). */
export default function StorySection({ section: s }) {
  const titleId = `${s.id}-title`
  return (
    <SectionShell id={s.id} theme="light" labelledBy={titleId} className="psec psec--story">
      <header className="section-head section-head--center">
        <h2 id={titleId} className="t-h2" data-reveal>
          {s.title}
        </h2>
      </header>

      <div className="psec-story">
        <div className="psec-card psec-story__before" data-reveal>
          <p className="t-mono psec__label">{s.before.label}</p>
          <p>{s.before.body}</p>
        </div>

        <ol className="psec-story__steps" data-stagger>
          {s.steps.map((st) => (
            <li key={st.label} className="psec-card">
              <p className="t-mono psec__label">{st.label}</p>
              <p>
                <strong>{st.title}</strong> {st.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="psec-card psec-card--accent psec-story__after" data-reveal>
          <p className="t-mono psec__label">{s.after.label}</p>
          <p>{s.after.body}</p>
        </div>
      </div>

      <div className="psec-story__foot" data-reveal>
        <p>
          <span className="t-mono psec__label">{s.unchanged.label}</span> {s.unchanged.body}
        </p>
        <p className="t-muted psec__note">{s.honestNote}</p>
      </div>
    </SectionShell>
  )
}
