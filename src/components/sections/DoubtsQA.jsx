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
 * Left (75%): six question cards, all visible, one lit at a time.
 * Right (25%): one isometric scene for the lit question. Manual plays first while its loader fills,
 * then Automatic plays while its loader fills. Then the next question lights up.
 * Questions 1–5 use the five moments of the day; question 6 uses the closing beat.
 */
const CARD_MS = 5000
const ITEMS = doubts.items
const LAST = ITEMS.length - 1
const DURATIONS = ITEMS.map(() => CARD_MS)

export default function DoubtsQA() {
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const stageRef = useRef(null)
  const sideRef = useRef("manual")
  const [side, setSide] = useState("manual")
  const onProgress = useCallback((p) => {
    listRef.current?.style.setProperty("--p", p.toFixed(4))
    // two-part loader: Manual fills during the first half, Automatic during the second
    stageRef.current?.style.setProperty("--m", Math.min(1, p * 2).toFixed(4))
    stageRef.current?.style.setProperty("--a", Math.max(0, p * 2 - 1).toFixed(4))
    const next = p < 0.5 ? "manual" : "auto"
    if (next !== sideRef.current) {
      sideRef.current = next
      setSide(next)
    }
  }, [])
  const story = useStoryClock({ durations: DURATIONS, rootRef, onProgress })
  const live = story.epoch > 0 || story.reduced

  const [picks, setPicks] = useState(0)
  const verdict = story.index === LAST
  const phase = Math.min(story.index, LAST - 1)
  const showAuto = side === "auto"
  const sceneProps = {
    phase,
    verdict,
    live,
    running: story.running,
    still: story.reduced,
    runKey: `${story.index}-${story.epoch}-${picks}-${side}`,
  }
  const pick = (i) => {
    if (i === story.index) return
    setPicks((n) => n + 1)
    story.go(i, { pause: false })
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
            {/* 75%: the six questions, one lit at a time */}
            <ol ref={listRef} className="qa">
              {ITEMS.map((it, i) => {
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
              })}
            </ol>

            {/* 25%: Manual plays first (loading bar fills), then Automatic plays */}
            <aside ref={stageRef} className={`stage ${showAuto ? "is-auto" : ""}`} aria-label={`${doubts.manualLabel} and ${doubts.autoLabel} animation`}>
              <p className="stage__q" aria-hidden="true">
                <b>{String(story.index + 1).padStart(2, "0")}</b>
                {ITEMS[story.index].q}
              </p>
              <div className="stage__steps" aria-hidden="true">
                <span className={`stage__step ${!showAuto ? "is-on" : ""}`}>
                  <em>{doubts.manualLabel}</em>
                  <i className="stage__load stage__load--m" />
                </span>
                <span className={`stage__step ${showAuto ? "is-on" : ""}`}>
                  <em>{doubts.autoLabel}</em>
                  <i className="stage__load stage__load--a" />
                </span>
              </div>
              <div className="stage__scene">{showAuto ? <AutoScene {...sceneProps} /> : <ManualScene {...sceneProps} />}</div>
              <p key={story.index} className="stage__desc">
                {ITEMS[story.index].desc}
              </p>
            </aside>
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
