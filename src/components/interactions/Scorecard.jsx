import React, { useEffect, useId, useRef } from "react"
import { scorecard, uiCopy, reportForm } from "../../data/automationContent"
import { moduleById } from "../../data/serviceModules"
import { useSite } from "../../context/SiteContext"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import PixelIcon from "../visuals/PixelIcon"
import { goTo, goToBooking } from "../../lib/scroll"
import ContextQuestions from "./ContextQuestions"

const C = 2 * Math.PI * 52
// Corner glow for each card, cycling so neighbours never share a corner.
const CORNERS = ["top-right", "bottom-left", "top-left", "bottom-right"]
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`

function ScoreRing({ summary, compact = false }) {
  const { complete, score, reviewedCount, gapCount, totalAreas, totalChecks } = summary
  // While areas are open the ring shows completion; once all are reviewed it shows the score.
  const raw = complete ? score / 100 : reviewedCount / totalAreas
  // The small phone ring keeps a short start arc at 0%, so it still reads as a progress ring.
  const frac = compact ? Math.max(raw, 0.04) : raw
  const gradId = `ring-${useId().replace(/:/g, "")}`
  return (
    <div className={`score-ring ${complete ? "is-complete" : ""} ${compact ? "score-ring--compact" : ""}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        {/* The site's spectral stroke: cyan → blue → violet → pink (deep tones for white ground) */}
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--spectral-cyan-deep)" />
            <stop offset=".35" stopColor="var(--spectral-blue-deep)" />
            <stop offset=".7" stopColor="var(--spectral-violet-deep)" />
            <stop offset="1" stopColor="var(--spectral-pink-deep)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" className="score-ring__track" />
        <circle cx="60" cy="60" r="52" className="score-ring__fill" style={{ stroke: `url(#${gradId})`, strokeDasharray: C, strokeDashoffset: C * (1 - frac) }} />
      </svg>
      <div className="score-ring__center">
        {complete ? (
          <>
            <span className="score-ring__value">
              {score}
              <small>/100</small>
            </span>
            <span className="score-ring__sub t-mono">
              {gapCount} of {totalChecks} gaps
            </span>
          </>
        ) : (
          <>
            <span className="score-ring__value">
              {reviewedCount}
              <small>/{totalAreas}</small>
            </span>
            <span className="score-ring__sub t-mono">{uiCopy.scoreAreasReviewed}</span>
          </>
        )}
      </div>
    </div>
  )
}

/** 4×2 automation map; a green route links every reviewed area in order. */
function AutomationMap({ summary }) {
  // The chain runs as a snake: across the top row, down at the right end, back along the
  // bottom row, so every link joins two neighbouring cells (row order alone drew a long
  // diagonal from Sales Pipeline back to Operations). Each link is drawn only when both of its
  // cells are reviewed, so the chain grows piece by piece.
  // Phones show the map 2 per row (4 rows), so the cells get room to breathe; the snake
  // and the cell centres follow whichever layout is on screen.
  const twoUp = useMediaQuery("(max-width: 599px)")
  const cols = twoUp ? 2 : 4
  const rows = 8 / cols
  const SNAKE = twoUp ? [0, 1, 3, 2, 4, 5, 7, 6] : [0, 1, 2, 3, 7, 6, 5, 4]
  const at = (i) => [((i % cols) + 0.5) * (100 / cols), (Math.floor(i / cols) + 0.5) * (100 / rows)]
  const links = SNAKE.slice(1)
    .map((i, k) => [SNAKE[k], i])
    .filter(([a, b]) => summary.areas[a]?.reviewed && summary.areas[b]?.reviewed)
  return (
    <div className="auto-map" role="list" aria-label="Your automation map">
      <svg className="auto-map__route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {links.map(([a, b]) => {
          const [x1, y1] = at(a)
          const [x2, y2] = at(b)
          return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </svg>
      {summary.areas.map((a) => {
        // Kit 01 statuses, on the existing colour states: Running / Partly manual / Leaking
        const state = { todo: "todo", running: "ok", partly: "gap1", leaking: "gap2" }[a.status.id]
        return (
          <div key={a.id} role="listitem" className={`auto-map__cell auto-map__cell--${state}`} data-status={a.status.id}>
            <span className="auto-map__icon">
              <PixelIcon name={moduleById[a.id].icon} size={20} animate={false} />
            </span>
            <span className="auto-map__name">{a.area}</span>
            {/* Status as a word, not only a colour */}
            <span className="auto-map__state">
              <i className="auto-map__dot" aria-hidden="true" />
              {a.status.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Scorecard() {
  const { score, summary, toggleCheck, clearArea, resetScore } = useSite()
  /** Scrolls to the first area not yet reviewed. */
  const goToNextArea = () => {
    const next = summary.areas.find((a) => !a.reviewed)
    if (!next) return
    goTo(`#score-h-${next.id}`, { focusSelector: "button, input" })
  }
  const areasRef = useRef(null)

  // The cards' corner glow only drifts while they are on screen.
  useEffect(() => {
    const el = areasRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-live", e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const { totalAreas, totalChecks, reviewedCount, gapCount, complete } = summary
  const gapsLine = `${gapCount} of ${totalChecks} gaps ticked`
  const areasLeft = plural(totalAreas - reviewedCount, "area")
  const status = complete
    ? `Score ${summary.score} out of 100. ${gapCount} of ${totalChecks} gaps.`
    : `${uiCopy.scoreNotAssessed}. ${gapsLine}, ${reviewedCount} of ${totalAreas} areas reviewed.`

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
              {complete ? (gapCount === 0 ? "No gaps ticked" : "Your automation score") : uiCopy.scoreNotAssessed}
            </p>
            <p className="t-muted scorecard__ring-help">
              {complete
                ? `${gapsLine} · all ${totalAreas} areas reviewed`
                : `${gapsLine} · review ${areasLeft} more to see your score`}
            </p>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {status}
        </p>

        <AutomationMap summary={summary} />

        {summary.top3.length > 0 && (
          <div className="scorecard__priorities">
            <p className="t-mono">{scorecard.result.topTitle}</p>
            {/* Kit 01 top 3: 2-tick areas first, ties in quick-win order */}
            <ol style={{ "--pri-rows": Math.ceil(summary.top3.length / 2) }}>
              {summary.top3.map((a, i) => (
                <li key={a.id} data-status={a.status.id}>
                  <span className="pri__rank" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="pri__icon">
                    <PixelIcon name={moduleById[a.id].icon} size={16} animate={false} />
                  </span>
                  <span className="pri__name">{a.area}</span>
                  {/* Two pips = the area's two checks; filled pips are the ticked gaps */}
                  <span className="pri__pips" aria-hidden="true">
                    {a.checks.map((_, k) => (
                      <i key={k} className={k < a.gaps ? "is-on" : ""} />
                    ))}
                  </span>
                  <span className="pri__status">{a.status.label}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="scorecard__cta">
          {complete ? (
            <>
              {/* Kit 01 order: result first, report second, call third */}
              <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => goTo("#score-result")}>
                <span className="btn__label">{scorecard.result.seeResult}</span>
              </button>
              <button type="button" className="btn btn--lg btn--block score-result__book-btn scorecard__book-btn" onClick={goToBooking}>
                <span className="btn__label">{reportForm.bookButton}</span>
              </button>
            </>
          ) : (
            <>
              {/* The result needs all 8 areas: this takes the owner to the next one still open */}
              <button type="button" className="btn btn--primary btn--lg btn--block" onClick={goToNextArea}>
                <span className="btn__label">{scorecard.result.seeResultLeft(totalAreas - reviewedCount)}</span>
              </button>
              <button type="button" className="btn btn--lg btn--block score-result__book-btn scorecard__book-btn" onClick={goToBooking}>
                <span className="btn__label">{reportForm.bookButton}</span>
              </button>
            </>
          )}
          <button type="button" className="text-link scorecard__reset" onClick={resetScore}>
            {uiCopy.resetScore}
          </button>
        </div>
      </aside>

      {/* Compact sticky status for phones */}
      <div className="scorecard__mini" aria-hidden="true">
        <ScoreRing summary={summary} compact />
        <span>{complete ? `${summary.score}/100 · ${gapCount} of ${totalChecks} gaps` : `${reviewedCount}/${totalAreas} areas · ${plural(gapCount, "gap")}`}</span>
      </div>

      <div ref={areasRef} className="scorecard__areas">
        <p className="scorecard__helper">{scorecard.helper}</p>
        {summary.areas.map((a, ai) => {
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
              <span className={`score-area__badge t-mono ${a.reviewed ? (a.gaps ? "is-gap" : "is-ok") : ""}`}>{a.status.label}</span>
            </>
          )
          return (
            <section key={a.id} className={`score-area is-open ${a.reviewed ? "is-reviewed" : ""}`} data-corner={CORNERS[ai % CORNERS.length]} aria-labelledby={`score-h-${a.id}`}>
              <h3 id={`score-h-${a.id}`} className="score-area__head">
                <span className="score-area__static">{head}</span>
              </h3>
              <div id={panelId} className="score-area__panel">
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
                {/* "Neither applies" is a checkbox like the checks above it. Ticking it clears
                    both checks; ticking a check clears it (SiteContext). */}
                <label htmlFor={`chk-${a.id}-none`} className={`check check--none ${score.cleared[a.id] ? "is-checked" : ""}`}>
                  <input id={`chk-${a.id}-none`} type="checkbox" checked={!!score.cleared[a.id]} onChange={() => clearArea(a.id)} />
                  <span className="check__box" aria-hidden="true">
                    <PixelIcon name="check" size={12} animate={false} />
                  </span>
                  <span className="check__text">{uiCopy.noneApply}</span>
                </label>
              </div>
            </section>
          )
        })}
        {/* Kit 01 §02.3: after the 8 areas, before the result. They never change the score. */}
        <ContextQuestions />
      </div>
    </div>
  )
}
