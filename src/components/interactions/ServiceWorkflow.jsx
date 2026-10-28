import React, { useState } from "react"
import AppTile from "../visuals/AppTile"
import PixelIcon from "../visuals/PixelIcon"

/**
 * Mini workflow demos for the eight parts. Every element's REST state is its
 * final, readable state; the motion is a CSS entrance (`.wf-*` + `--d` delay)
 * that only runs inside `.is-playing`. Reduced motion → instant final state.
 * The ordered step list underneath is the text equivalent of the animation.
 */
const d = (s) => ({ "--d": `${s}s` })

function Merge() {
  const src = ["whatsapp", "webform", "gmail", "phone", "meta"]
  return (
    <div className="wf wf--merge">
      <div className="wf-col">
        {src.map((s, i) => (
          <div key={s} className="wf-src">
            <AppTile id={s} size={30} />
            <span className="wf-capsule wf-fly-r" style={d(0.2 + i * 0.18)} />
          </div>
        ))}
      </div>
      <div className="wf-inbox wf-in" style={d(0.1)}>
        <p className="t-mono">One inbox</p>
        {src.map((s, i) => (
          <span key={s} className="wf-bar wf-in" style={d(0.5 + i * 0.18)} />
        ))}
      </div>
      <div className="wf-card wf-in" style={d(1.6)}>
        <PixelIcon name="check" size={14} />
        <span>
          <strong>Record created</strong>
          <span className="wf-tag">tag · WhatsApp</span>
        </span>
      </div>
    </div>
  )
}

function Chat() {
  return (
    <div className="wf wf--chat">
      <p className="wf-bubble wf-bubble--in wf-in" style={d(0.1)}>
        Is the 6pm slot free tomorrow?
      </p>
      <p className="wf-typing wf-blink-out" style={d(0.6)} aria-hidden="true">
        <i />
        <i />
        <i />
      </p>
      <p className="wf-bubble wf-bubble--out wf-in" style={d(1.4)}>
        Yes — 6pm is open. Shall I book it for you?
        <span className="wf-time t-mono">12 sec</span>
      </p>
      <p className="wf-chip wf-in" style={d(2)}>
        <PixelIcon name="people" size={12} /> Hand-off to your team when needed
      </p>
    </div>
  )
}

function Schedule() {
  return (
    <div className="wf wf--schedule">
      <div className="wf-cal">
        {Array.from({ length: 15 }).map((_, i) => (
          <span key={i} className={`wf-cal__cell ${i === 8 ? "is-slot" : ""}`}>
            {i === 8 && <span className="wf-cal__booking wf-slide" style={d(0.4)} />}
          </span>
        ))}
      </div>
      <div className="wf-handoff">
        <span className="wf-owner">Front desk</span>
        <span className="wf-task wf-move" style={d(1.2)}>
          Prep room · 6pm
        </span>
        <span className="wf-owner">Team</span>
      </div>
    </div>
  )
}

function Docs() {
  return (
    <div className="wf wf--docs">
      <div className="wf-sheet">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="wf-sheet__cell wf-in" style={d(0.1 + i * 0.07)} />
        ))}
      </div>
      <span className="wf-arrow" aria-hidden="true">→</span>
      <div className="wf-invoice wf-in" style={d(1)}>
        <p className="t-mono">Invoice</p>
        <span className="wf-line wf-grow-x" style={d(1.2)} />
        <span className="wf-line wf-grow-x" style={d(1.35)} />
        <span className="wf-line wf-line--short wf-grow-x" style={d(1.5)} />
      </div>
      <span className="wf-arrow" aria-hidden="true">→</span>
      <div className="wf-report wf-in" style={d(1.7)}>
        <p className="t-mono">Report</p>
        <div className="wf-bars">
          {[40, 70, 55, 90].map((h, i) => (
            <span key={i} className="wf-grow" style={{ height: `${h}%`, ...d(1.9 + i * 0.1) }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Timeline() {
  return (
    <div className="wf wf--timeline">
      <div className="wf-track">
        <span className="wf-track__fill wf-grow-x" style={d(0.2)} />
        {["Day 1", "Day 3", "Day 7"].map((day, i) => (
          <span key={day} className={`wf-stop ${i === 2 ? "is-skipped" : ""} wf-in`} style={d(0.2 + i * 0.5)}>
            <span className="wf-stop__dot" />
            <span className="t-mono">{day}</span>
          </span>
        ))}
      </div>
      <p className="wf-chip wf-chip--ok wf-in" style={d(1.5)}>
        <PixelIcon name="check" size={12} /> Customer replied — sequence stops
      </p>
    </div>
  )
}

function Kanban() {
  const cols = ["New", "Qualified", "Quote", "Won"]
  return (
    <div className="wf wf--kanban">
      {cols.map((c, i) => (
        <div key={c} className="wf-kcol">
          <p className="t-mono">{c}</p>
          <span className="wf-kcard" />
          {i < 3 && <span className="wf-kcard wf-kcard--faint" />}
        </div>
      ))}
      <span className="wf-deal wf-advance" style={d(0.3)}>
        Deal
      </span>
    </div>
  )
}

function Loop() {
  return (
    <div className="wf wf--loop">
      <svg viewBox="0 0 120 120" className="wf-ring" aria-hidden="true">
        <circle cx="60" cy="60" r="44" className="wf-ring__track" />
        <circle cx="60" cy="60" r="44" className="wf-ring__fill wf-draw" style={d(0.2)} pathLength="100" />
      </svg>
      <span className="wf-loop-pt wf-loop-pt--a wf-in" style={d(0.3)}>
        Renewal
      </span>
      <span className="wf-loop-pt wf-loop-pt--b wf-in" style={d(0.8)}>
        Payment
      </span>
      <span className="wf-loop-pt wf-loop-pt--c wf-in" style={d(1.3)}>
        Review
      </span>
      <p className="wf-chip wf-chip--ok wf-in" style={d(1.9)}>
        <PixelIcon name="check" size={12} /> Paid on time
      </p>
    </div>
  )
}

function Insights() {
  return (
    <div className="wf wf--insights">
      <div className="wf-bars wf-bars--lg">
        {[30, 48, 42, 66, 58, 84].map((h, i) => (
          <span key={i} className="wf-grow" style={{ height: `${h}%`, ...d(0.1 + i * 0.1) }} />
        ))}
      </div>
      <div className="wf-feedback">
        <span className="wf-pulse-back" style={d(1)} />
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="wf-node wf-in" style={d(1.1 + (6 - i) * 0.08)} />
        ))}
      </div>
      <p className="t-mono wf-caption">feeds back into the other seven parts</p>
    </div>
  )
}

const FLOWS = { merge: Merge, chat: Chat, schedule: Schedule, docs: Docs, timeline: Timeline, kanban: Kanban, loop: Loop, insights: Insights }

export default function ServiceWorkflow({ flow, steps, title }) {
  const [run, setRun] = useState(0)
  const Flow = FLOWS[flow]
  return (
    <figure className="workflow">
      <div className="workflow__head">
        <figcaption className="t-mono">{title || "Example workflow"}</figcaption>
        <button type="button" className="workflow__replay" onClick={() => setRun((r) => r + 1)} aria-label="Replay workflow animation">
          ↻
        </button>
      </div>
      <div key={run} className="workflow__stage is-playing" aria-hidden="true">
        {Flow && <Flow />}
      </div>
      <ol className="workflow__steps">
        {steps.map((s, i) => (
          <li key={s}>
            <span className="t-mono">{String(i + 1).padStart(2, "0")}</span> {s}
          </li>
        ))}
      </ol>
    </figure>
  )
}
