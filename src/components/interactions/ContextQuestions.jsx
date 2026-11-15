import React from "react"
import { scorecard } from "../../data/automationContent"
import { useSite } from "../../context/SiteContext"

/**
 * The two context questions (Launch Kit 01 §02.3). One tap each; they do not change the score.
 * They set the follow-up lane (AI use) and size the opportunity (enquiry volume).
 */
export default function ContextQuestions() {
  const { summary, setContext } = useSite()
  const answers = summary.context
  return (
    <section className="score-area score-context is-open" aria-labelledby="score-context-title">
      <h3 id="score-context-title" className="score-context__title">
        {scorecard.result.contextTitle}
      </h3>
      <p className="t-muted score-context__note">{scorecard.result.contextNote}</p>
      {scorecard.context.map((q) => {
        const qid = `ctx-${q.id}`
        return (
          <div key={q.id} className="score-context__q">
            <p id={qid} className="score-context__question">
              {q.question}
            </p>
            <div className="score-context__options" role="group" aria-labelledby={qid}>
              {q.options.map((o) => {
                const on = answers[q.id] === o.id
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    className={`chip-btn score-context__opt ${on ? "is-on" : ""}`}
                    onClick={() => setContext(q.id, o.id)}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}
