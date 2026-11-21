import React, { useCallback, useRef, useState } from "react"
import { LazyMotion, MotionConfig, domAnimation } from "motion/react"
import { doubts } from "../../data/automationContent"
import { SectionShell, CTAButton } from "../ui/primitives"
import { Marked } from "../ui/Highlight"
import { goToBooking } from "../../lib/scroll"
import { useStoryClock } from "../../hooks/useStoryClock"
import { AutoScene, ManualScene } from "../interactions/TwoRooms"
import "../../styles/doubts-qa.css"

/**
 * "Same doubts. Different outcome."
 * Left: questions 1-3. Centre: the Manual and Automatic scenes playing together (no text).
 * Right: questions 4-6. One question is lit at a time and the scenes follow it.
 * Questions 1–5 use the five moments of the day; question 6 uses the closing beat.
 */
const CARD_MS = 5000
const ITEMS = doubts.items
const LAST = ITEMS.length - 1
const DURATIONS = ITEMS.map(() => CARD_MS)

export default function DoubtsQA() {
  const rootRef = useRef(null)
  const onProgress = useCallback((p) => {
    rootRef.current?.style.setProperty("--p", p.toFixed(4))
  }, [])
  const story = useStoryClock({ durations: DURATIONS, rootRef, onProgress })
  const live = story.epoch > 0 || story.reduced

  const [picks, setPicks] = useState(0)
  const verdict = story.index === LAST
  const phase = Math.min(story.index, LAST - 1)
  const sceneProps = {
    phase,
    verdict,
    live,
    running: story.running,
    still: story.reduced,
    runKey: `${story.index}-${story.epoch}-${picks}`,
  }
  const pick = (i) => {
    if (i === story.index) return
    setPicks((n) => n + 1)
    story.go(i, { pause: false })
  }

  const renderCard = (it, i) => {
    const active = i === story.index
    return (
      <li key={it.q} className="qa__li">
        <div className={`qa__card ${active ? "is-active" : ""}`} onClick={() => pick(i)}>
          <h3 className="qa__h">
            <button type="button" className="qa__q" aria-current={active ? "true" : undefined} onClick={() => pick(i)}>
              <span className="qa__n">{String(i + 1).padStart(2, "0")}</span>
              <span>{it.q}</span>
            </button>
          </h3>
          <p className="qa__row qa__row--manual">
            <b aria-hidden="true">✗</b>
            <span>
              <span className="sr-only">{doubts.manualLabel}: </span>
              {it.manual}
            </span>
          </p>
          <p className="qa__row qa__row--auto">
            <b aria-hidden="true">✓</b>
            <span>
              <span className="sr-only">{doubts.autoLabel}: </span>
              {it.auto}
            </span>
          </p>
          <span className="qa__bar" aria-hidden="true">
            <i />
          </span>
        </div>
      </li>
    )
  }

  return (
    <SectionShell id="proof" theme="light" labelledBy="doubts-title" className="doubts">
      <header className="section-head section-head--center">
        <h2 id="doubts-title" className="t-h2" data-reveal>
          <Marked text={doubts.headline} phrase="Different outcome." tone="light" />
        </h2>
        <p className="t-lead" data-reveal>
          {doubts.sub}
        </p>
      </header>

      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <div ref={rootRef} className="doubts__grid" data-reveal>
            {/* left: questions 1-3 */}
            <ol className="qa qa--left">
              {ITEMS.slice(0, 3).map((it, i) => renderCard(it, i))}
            </ol>

            {/* centre: Manual and Automatic scenes play together, no text */}
            <div className="stage" aria-label={`${doubts.manualLabel} and ${doubts.autoLabel} animation`}>
              <div className="stage__scene" role="img" aria-label={doubts.manualLabel}>
                <ManualScene {...sceneProps} />
              </div>
              <div className="stage__scene stage__scene--auto" role="img" aria-label={doubts.autoLabel}>
                <AutoScene {...sceneProps} />
              </div>
            </div>

            {/* right: questions 4-6 */}
            <ol className="qa qa--right">
              {ITEMS.slice(3).map((it, i) => renderCard(it, i + 3))}
            </ol>
          </div>
        </MotionConfig>
      </LazyMotion>

      <div className="doubts__cta" data-reveal>
        <CTAButton onClick={goToBooking} size="lg">
          {doubts.button}
        </CTAButton>
      </div>
    </SectionShell>
  )
}
