import React, { useState } from "react"
import { SectionShell } from "../ui/primitives"
import { useSite } from "../../context/SiteContext"
import SectionButton from "./SectionButton"

/**
 * vsl-07 #test: the 3-question test (Kit 04 §04). Every "I'd have to ask someone" pre-ticks the
 * Insights check "I cannot see how the business is doing without asking someone" in the
 * scorecard below. Nothing is stored or sent. (The TestComplete tracking event is deferred.)
 */
export default function TestSection({ section: s }) {
  const { setCheck } = useSite()
  const [answers, setAnswers] = useState(() => s.questions.map(() => null)) // "known" | "ask" | null
  const titleId = `${s.id}-title`

  const answer = (qi, value) => {
    setAnswers((prev) => prev.map((a, i) => (i === qi ? value : a)))
    if (value === "ask") setCheck("insights", 0, true)
  }

  const done = answers.every(Boolean)
  const known = answers.filter((a) => a === "known").length
  const result = done ? s.results.find((r) => known >= r.min && known <= r.max) : null

  return (
    <SectionShell id={s.id} theme="light" labelledBy={titleId} className="psec psec--test">
      <div className="psec-card psec-test">
        <p className="t-mono psec__eyebrow">{s.eyebrow}</p>
        <h2 id={titleId} className="t-h3">
          {s.title}
        </h2>

        <ol className="psec-test__list">
          {s.questions.map((q, qi) => {
            const qid = `${s.id}-q${qi}`
            return (
              <li key={qid} className="psec-test__q">
                <p id={qid}>
                  <strong>
                    {qi + 1}. {q.lead}
                  </strong>{" "}
                  {q.text}
                </p>
                <div className="psec-test__answers" role="group" aria-labelledby={qid}>
                  {["known", "ask"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`chip-btn psec-chip ${answers[qi] === v ? "is-on" : ""}`}
                      aria-pressed={answers[qi] === v}
                      onClick={() => answer(qi, v)}
                    >
                      {s.answers[v]}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>

        <div aria-live="polite">
          {result && (
            <div className="psec-test__result">
              <p className="t-mono psec__label">{result.label.replace("{n}", known)}</p>
              <p>{result.body}</p>
            </div>
          )}
        </div>

        <SectionButton button={s.button} />
      </div>
    </SectionShell>
  )
}
