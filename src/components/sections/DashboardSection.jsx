import React, { useCallback, useRef, useState } from "react"
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react"
import { ChevronDown } from "lucide-react"
import { dashboard, uiCopy } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import { Marked } from "../ui/Highlight"
import { useStoryClock } from "../../hooks/useStoryClock"
import { PlayToggle } from "../ui/StoryControls"
import DataConvergence from "../interactions/DataConvergence"
import DashboardDemo from "../interactions/DashboardDemo"

/**
 * 06 — DASHBOARD: "One screen. Eight parts. Data, Dashboard, Decisions."
 *
 * One looping motion story (~12 s) replaces the three text columns: data converges, the
 * dashboard opens, decisions follow. A small three-step control jumps between stages and the loop
 * carries on from there (Data → Dashboard → Decisions → Data …); only the pause button stops it.
 * One sentence explains the current stage, and the full tabbed illustrative dashboard is still one
 * click away for anyone who wants every number.
 * Data is short on purpose: the signals land by ~2 s and the dashboard opens at 2.6 s.
 */
const S = uiCopy.stories.dashboard
const FLOW = dashboard.flow
const STAGE_MS = [1800, 2800, 4500]
const EASE = [0.22, 1, 0.36, 1]
// Picking a stage or a decision never freezes the story: it jumps there and keeps looping
const KEEP_PLAYING = { pause: false, resume: true }

export default function DashboardSection() {
  const rootRef = useRef(null)
  const segRef = useRef(null)
  const [decision, setDecision] = useState(0)
  const [open, setOpen] = useState(false)

  const onProgress = useCallback((p, i) => {
    segRef.current?.style.setProperty("--p", p.toFixed(4))
    if (i === 2) setDecision(Math.min(2, Math.floor(p * 3)))
  }, [])
  const story = useStoryClock({ durations: STAGE_MS, rootRef, onProgress, threshold: 0.35 })
  const stage = story.index

  // Data picked again while it is showing replays the data flow from its first signal
  const pickStage = (i) => story.go(i, { ...KEEP_PLAYING, replay: true })
  const pickDecision = (i) => story.go(2, { ...KEEP_PLAYING, at: i / 3 + 0.01 })

  const toggleFull = () => setOpen((o) => !o)

  return (
    <SectionShell id="dashboard" theme="night" labelledBy="dashboard-title" className="dashboard-section">
      <header className="section-head section-head--center">
        <h2 id="dashboard-title" className="t-h2" data-reveal>
          <Marked text={dashboard.headline} phrase="One screen." tone="dark" />
        </h2>
        <p className="t-lead" data-reveal>
          {dashboard.sub}
        </p>
      </header>

      {/* The three ideas in full, for screen readers; the motion below shows them one at a time */}
      <ol className="sr-only">
        {FLOW.map((f) => (
          <li key={f.title}>
            {f.title}: {f.body} {f.items.join(", ")}.
          </li>
        ))}
      </ol>

      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <div ref={rootRef} className="dc" data-reveal>
            <DataConvergence
              stage={stage}
              decision={decision}
              onDecision={pickDecision}
              running={story.running}
              reduced={story.reduced}
              epoch={story.epoch}
            />

            <div className="dc-bar">
              <div className="dc-controls">
                <div ref={segRef} className="dc-seg" role="group" aria-label={S.stepsLabel}>
                  {FLOW.map((f, i) => (
                    <button
                      key={f.title}
                      type="button"
                      className={`dc-seg__btn ${i === stage ? "is-active" : ""} ${i < stage ? "is-done" : ""}`}
                      aria-pressed={i === stage}
                      onClick={() => pickStage(i)}
                    >
                      <span className="dc-seg__n" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {f.title}
                      <span className="dc-seg__fill" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <PlayToggle playing={story.playing} onToggle={story.toggle} label={S.controlsLabel} />
              </div>
              <div className="dc-caption" aria-hidden="true">
                <AnimatePresence mode="wait" initial={false}>
                  <m.p key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
                    {FLOW[stage].body}
                  </m.p>
                </AnimatePresence>
              </div>
              <p className="dc-foot">{dashboard.footerLabel}</p>
            </div>
          </div>
        </MotionConfig>
      </LazyMotion>

      <div className="dc-more" data-reveal>
        <button type="button" className="dc-more__btn" aria-expanded={open} aria-controls="dashboard-full" onClick={toggleFull}>
          {open ? S.closeFull : S.openFull}
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className="dc-more__chev" />
        </button>
        {open && (
          <div id="dashboard-full" className="dc-more__panel">
            <div className="dc-sample" role="note">
              <strong>{dashboard.sampleTitle}</strong>
              <span>{dashboard.sampleNote}</span>
            </div>
            <p className="dashboard-section__try t-mono">{dashboard.tryIt}</p>
            <DashboardDemo />
          </div>
        )}
      </div>
    </SectionShell>
  )
}
