import React from "react"
import { scorecard, opportunityLibrary, reportForm } from "../../data/automationContent"
import { moduleById } from "../../data/serviceModules"
import { useSite } from "../../context/SiteContext"
import { goToBooking } from "../../lib/scroll"
import PixelIcon from "../visuals/PixelIcon"

/**
 * The free result (Launch Kit 01 §03.3): score, band, band message, biggest gap, top 3 with
 * what each usually means. Shown before any form. The report (what we would automate first,
 * effort, time) stays for the WhatsApp report until the delivery team confirms it (D16).
 * The lane is calculated in context but never shown to the owner.
 */
export default function ScoreResult() {
  const { summary, openModal } = useSite()
  if (!summary.complete) return null
  const { score, band, gapCount, totalChecks, top3 } = summary
  const r = scorecard.result
  const biggest = top3[0]

  return (
    <div id="score-result" className="score-result on-light" tabIndex={-1}>
      <div className="score-result__head">
        <p className="t-mono score-result__label">{r.label}</p>
        <p className="score-result__score">
          <strong>{score} / 100</strong> · {band.name}
        </p>
        <p className="score-result__message">{band.message}</p>
        <p>
          {r.gapsLine(gapCount, totalChecks)}
          {biggest && (
            <>
              {" "}
              {r.biggestLine} <strong>{biggest.area}</strong>: {opportunityLibrary[biggest.id].meaning}
            </>
          )}
        </p>
      </div>

      {top3.length > 0 && (
        <div className="score-result__top">
          <p className="t-mono score-result__label">{r.topTitle}</p>
          <ol className="score-result__list">
            {top3.map((a) => (
              <li key={a.id}>
                <span className="score-result__icon">
                  <PixelIcon name={moduleById[a.id].icon} size={18} animate={false} />
                </span>
                <span>
                  <strong>{a.area}</strong> <span className="score-result__status t-mono">{a.status.label}</span>
                  <span className="t-muted score-result__meaning">{opportunityLibrary[a.id].meaning}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Closing CTA panel: two equal next steps */}
      <div className="score-result__report">
        <div className="score-result__report-copy">
          <span className="score-result__report-icon" aria-hidden="true">
            <PixelIcon name="people" size={22} />
          </span>
          <div>
            <h3 className="t-h3">{reportForm.heading}</h3>
            <p className="t-muted">{reportForm.body}</p>
          </div>
        </div>
        <div className="score-result__actions">
          {/* The form opens in a modal from this CTA (SiteModals: "report") */}
          <button type="button" className="btn btn--primary btn--lg score-result__cta" onClick={() => openModal("report")}>
            <span className="btn__label">{reportForm.button}</span>
          </button>
          <button type="button" className="btn btn--lg score-result__book-btn" onClick={goToBooking}>
            <span className="btn__label">{reportForm.bookButton}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
