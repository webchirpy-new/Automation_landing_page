import React, { useState } from "react"
import { scorecard, uiCopy } from "../../data/automationContent"
import { moduleById } from "../../data/serviceModules"
import { useSite } from "../../context/SiteContext"
import { useIsMobile } from "../../hooks/useMediaQuery"
import PixelIcon from "../visuals/PixelIcon"
import { goToBooking } from "../../lib/scroll"

const C = 2 * Math.PI * 52

function ScoreRing({ summary, compact = false }) {
  const { complete, score, reviewedCount, gapCount } = summary
  const frac = complete ? score / 100 : reviewedCount / 8
  return (
    <div className={`score-ring ${complete ? "is-complete" : ""} ${compact ? "score-ring--compact" : ""}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" className="score-ring__track" />
        <circle cx="60" cy="60" r="52" className="score-ring__fill" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - frac) }} />
      </svg>
      <div className="score-ring__center">
        {complete ? (
          <>
            <span className="score-ring__value">
              {score}
              <small>/100</small>
            </span>
            <span className="score-ring__sub t-mono">
              {gapCount} of 16 gaps
            </span>
          </>
        ) : (
          <>
            <span className="score-ring__value score-ring__value--na">—</span>
            <span className="score-ring__sub t-mono">{reviewedCount} of 8 areas</span>
          </>
        )}
      </div>
    </div>
  )
}

/** 4×2 automation map; a warm route links every reviewed area in order. */
function AutomationMap({ summary }) {
  const pts = summary.areas
    .map((a, i) => (a.reviewed ? `${((i % 4) + 0.5) * 25},${(Math.floor(i / 4) + 0.5) * 50}` : null))
    .filter(Boolean)
    .join(" ")
  return (
    <div className="auto-map" role="list" aria-label="Your automation map">
      <svg className="auto-map__route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {pts && <polyline points={pts} />}
      </svg>
      {summary.areas.map((a) => {
        const state = !a.reviewed ? "todo" : a.gaps === 0 ? "ok" : a.gaps === 1 ? "gap1" : "gap2"
        const label = !a.reviewed ? "not reviewed" : a.gaps === 0 ? "no gaps" : `${a.gaps} gap${a.gaps > 1 ? "s" : ""}`
        return (
          <div key={a.id} role="listitem" className={`auto-map__cell auto-map__cell--${state}`}>
            <PixelIcon name={moduleById[a.id].icon} size={20} animate={false} />
            <span className="auto-map__name">{a.area}</span>
            <span className="auto-map__state t-mono">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Scorecard() {
  const { score, summary, toggleCheck, clearArea, resetScore } = useSite()
  const isMobile = useIsMobile()
  const [openId, setOpenId] = useState(scorecard.areas[0].id)

  const status = summary.complete
    ? `Score ${summary.score} out of 100. ${summary.gapCount} of 16 gaps.`
    : `${uiCopy.scoreNotAssessed}. ${summary.gapCount} gaps selected, ${summary.reviewedCount} of 8 areas reviewed.`

  return (
    <div className="scorecard">
      {/* Summary column (sticky on desktop, compact bar on phones) */}
      <aside className="scorecard__summary" aria-label="Scorecard summary">
        <div className="scorecard__counter t-mono">
          <span>{scorecard.counter.title}</span>
          <span>{scorecard.counter.areas}</span>
          <span>{scorecard.counter.checks}</span>
        </div>
        <div className="scorecard__ring-row">
          <ScoreRing summary={summary} />
          <div className="scorecard__ring-copy">
            <p className="scorecard__state">
              {summary.complete ? (summary.gapCount === 0 ? "No gaps ticked" : "Your automation score") : uiCopy.scoreNotAssessed}
            </p>
            <p className="t-muted scorecard__ring-help">
              {summary.complete
                ? `${summary.gapCount} of 16 gaps`
                : `${summary.gapCount} gaps ticked · review all 8 areas to see your score`}
            </p>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {status}
        </p>

        <AutomationMap summary={summary} />

        {summary.priorities.length > 0 && (
          <div className="scorecard__priorities">
            <p className="t-mono">Your priority order</p>
            <ol>
              {summary.priorities.map((a) => (
                <li key={a.id}>
                  <PixelIcon name={moduleById[a.id].icon} size={14} animate={false} />
                  <span>{a.area}</span>
                  <span className="scorecard__gapcount t-mono">
                    {a.gaps} gap{a.gaps > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="scorecard__cta">
          <button type="button" className="btn btn--primary btn--lg btn--block ember" onClick={goToBooking}>
            <span className="btn__label">{scorecard.button}</span>
          </button>
          <p className="scorecard__under">{scorecard.underButton}</p>
          <button type="button" className="text-link scorecard__reset" onClick={resetScore}>
            {uiCopy.resetScore}
          </button>
        </div>
      </aside>

      {/* Compact sticky status for phones */}
      <div className="scorecard__mini" aria-hidden="true">
        <ScoreRing summary={summary} compact />
        <span>{summary.complete ? `${summary.score}/100 · ${summary.gapCount} of 16 gaps` : `${summary.reviewedCount}/8 areas · ${summary.gapCount} gaps`}</span>
      </div>

      <div className="scorecard__areas">
        <p className="scorecard__helper">{scorecard.helper}</p>
        {summary.areas.map((a, ai) => {
          const open = !isMobile || openId === a.id
          const panelId = `score-panel-${a.id}`
          const head = (
            <>
              <span className="score-area__icon">
                <PixelIcon name={moduleById[a.id].icon} size={22} />
              </span>
              <span className="score-area__titles">
                <span className="score-area__name">{a.area}</span>
                <span className="score-area__promise">{a.promise}</span>
              </span>
              <span className={`score-area__badge t-mono ${a.reviewed ? (a.gaps ? "is-gap" : "is-ok") : ""}`}>
                {a.reviewed ? (a.gaps ? `${a.gaps} gap${a.gaps > 1 ? "s" : ""}` : "No gaps") : "To review"}
              </span>
            </>
          )
          return (
            <section key={a.id} className={`score-area ${a.reviewed ? "is-reviewed" : ""} ${open ? "is-open" : ""}`} aria-labelledby={`score-h-${a.id}`}>
              <h3 id={`score-h-${a.id}`} className="score-area__head">
                {isMobile ? (
                  <button type="button" className="score-area__toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : a.id)}>
                    {head}
                  </button>
                ) : (
                  <span className="score-area__static">{head}</span>
                )}
              </h3>
              <div id={panelId} className="score-area__panel" hidden={!open}>
                {a.checks.map((c, i) => {
                  const id = `chk-${a.id}-${i}`
                  const checked = !!score.checked[`${a.id}:${i}`]
                  return (
                    <label key={id} htmlFor={id} className={`check ${checked ? "is-checked" : ""}`}>
                      <input
                        id={id}
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          toggleCheck(a.id, i)
                        }}
                      />
                      <span className="check__box" aria-hidden="true">
                        <PixelIcon name="check" size={12} animate={false} />
                      </span>
                      <span className="check__text">{c}</span>
                    </label>
                  )
                })}
                <div className="score-area__foot">
                  <button
                    type="button"
                    className={`chip-btn ${score.cleared[a.id] ? "is-on" : ""}`}
                    aria-pressed={!!score.cleared[a.id]}
                    onClick={() => clearArea(a.id)}
                  >
                    {uiCopy.noneApply}
                  </button>
                  {isMobile && ai < summary.areas.length - 1 && (
                    <button type="button" className="text-link" onClick={() => setOpenId(summary.areas[ai + 1].id)}>
                      Next: {summary.areas[ai + 1].area} →
                    </button>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
