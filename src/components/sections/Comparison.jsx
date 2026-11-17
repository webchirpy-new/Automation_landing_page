import React, { useCallback, useRef } from "react"
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react"
import { comparison, uiCopy } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import { Marked } from "../ui/Highlight"
import { goTo } from "../../lib/scroll"
import { useStoryClock } from "../../hooks/useStoryClock"
import { AutoScene, ManualScene } from "../interactions/TwoRooms"

/**
 * 03 — TWO TYPES OF BUSINESSES: "Two rooms. Two realities."
 *
 * The same business in two 2.5D rooms, played through the five approved moments of the day
 * (comparison.rows) in sync, about 5 s each, then a short final beat, then back to moment 1.
 * Only the current moment's two lines are on screen; the full comparison is in the page for
 * assistive tech (sr-only list below the header).
 * No playback buttons: it plays on its own while on screen, pauses off screen, and does not
 * auto-play under reduced motion. The five progress bars jump to a moment and keep playing.
 */
const EASE = [0.22, 1, 0.36, 1]
const PHASE_MS = 5000
const VERDICT_MS = 4200
const ROWS = comparison.rows
const DURATIONS = [...ROWS.map(() => PHASE_MS), VERDICT_MS]
const S = uiCopy.stories.compare

function Caption({ k, tone, text, verdict }) {
  const manual = tone === "manual"
  return (
    <div className={`rx-caption rx-caption--${tone} ${verdict ? "is-verdict" : ""}`} aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <m.p key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
          <span className={`mark ${manual ? "mark--x" : "mark--ok"}`}>{manual ? "✗" : "✓"}</span>
          <span>{text}</span>
        </m.p>
      </AnimatePresence>
    </div>
  )
}

export default function Comparison() {
  const rootRef = useRef(null)
  const stepsRef = useRef(null)
  const onProgress = useCallback((p) => stepsRef.current?.style.setProperty("--p", p.toFixed(4)), [])
  const story = useStoryClock({ durations: DURATIONS, rootRef, onProgress })

  // Actors start the first time the rooms are actually seen, so phase 1 never plays to an empty screen.
  const live = story.epoch > 0 || story.reduced

  const verdict = story.index === ROWS.length
  const phase = Math.min(story.index, ROWS.length - 1)
  const row = ROWS[phase]

  return (
    <SectionShell id="compare" theme="light" labelledBy="compare-title" className="compare">
      <header className="section-head section-head--center">
        <h2 id="compare-title" className="t-h2" data-reveal>
          <Marked text={comparison.headline} phrase="Which one are you?" tone="light" />
        </h2>
        <p className="t-lead" data-reveal>
          {comparison.sub}
        </p>
      </header>

      {/* The whole comparison, for screen readers. The animated captions below repeat it visually. */}
      <div className="sr-only">
        <p>{S.srIntro}</p>
        <ol>
          {ROWS.map((r) => (
            <li key={r.row}>
              {r.row}. {comparison.room1.title}: {r.manual}. {comparison.room2.title}: {r.automated}.
            </li>
          ))}
        </ol>
      </div>

      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <div ref={rootRef} className={`rx ${story.running ? "is-running" : ""} ${verdict ? "is-verdict" : ""}`} data-reveal>
            <div className="rx-context" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                <m.p
                  key={phase}
                  className="rx-context__line"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <span className="rx-context__n">{String(phase + 1).padStart(2, "0")}</span>
                  <span>{row.row}</span>
                </m.p>
              </AnimatePresence>
            </div>

            <div className="rx-rooms">
              <article className={`rx-room rx-room--manual ${phase === 1 ? "is-night" : ""}`} aria-labelledby="room1-title">
                <header className="rx-room__head">
                  <p className="rx-room__label t-mono">{S.room1Label}</p>
                  <h3 id="room1-title" className="rx-room__title">
                    {comparison.room1.title}
                  </h3>
                  <p className="rx-room__tag">{comparison.room1.tagline}</p>
                </header>
                <ManualScene phase={phase} verdict={verdict} live={live} running={story.running} />
                <Caption tone="manual" k={verdict ? "verdict" : phase} text={verdict ? S.verdict.manual : row.manual} verdict={verdict} />
              </article>

              <article className={`rx-room rx-room--auto ${phase === 1 ? "is-night" : ""}`} aria-labelledby="room2-title">
                <header className="rx-room__head">
                  <p className="rx-room__label t-mono">{S.room2Label}</p>
                  <h3 id="room2-title" className="rx-room__title">
                    {comparison.room2.title}
                  </h3>
                  <p className="rx-room__tag">{comparison.room2.tagline}</p>
                </header>
                <AutoScene phase={phase} verdict={verdict} live={live} running={story.running} />
                <Caption tone="auto" k={verdict ? "verdict" : phase} text={verdict ? S.verdict.auto : row.automated} verdict={verdict} />
              </article>
            </div>

            <div className="rx-timeline">
              <ol ref={stepsRef} className="rx-steps" aria-label={S.timelineLabel}>
                {ROWS.map((r, i) => {
                  const state = verdict || i < story.index ? "is-done" : i === story.index ? "is-active" : ""
                  return (
                    <li key={r.row}>
                      <button
                        type="button"
                        className={`rx-step ${state}`}
                        aria-label={`${i + 1} of ${ROWS.length}: ${r.row}`}
                        aria-current={i === phase ? "step" : undefined}
                        onClick={() => story.go(i, { pause: false })}
                      >
                        <span className="rx-step__bar">
                          <span className="rx-step__fill" />
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
              <p className="rx-timeline__count t-mono" aria-hidden="true">
                {String(phase + 1).padStart(2, "0")} / {String(ROWS.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        </MotionConfig>
      </LazyMotion>

      <div className="compare__close" data-reveal>
        <p className="t-h3">{comparison.closingQuestion}</p>
        <a
          className="text-link text-link--lg"
          href="#scorecard"
          onClick={(e) => {
            e.preventDefault()
            goTo("#scorecard")
          }}
        >
          {comparison.link}
        </a>
      </div>
    </SectionShell>
  )
}
