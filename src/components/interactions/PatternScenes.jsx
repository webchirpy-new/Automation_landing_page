import React, { useEffect, useRef, useState } from "react"
import { CheckCheck, FileSpreadsheet, Moon, NotebookPen, Sun } from "lucide-react"
import { pattern, uiCopy } from "../../data/automationContent"
import { Marked } from "../ui/Highlight"
import { Eyebrow } from "../ui/primitives"

/**
 * 02 "The pattern" — three illustrated scenes, one per approved line, then the week bar.
 * Each scene is a small product-style mock (sample data, labelled as such) that plays once
 * when it scrolls into view. The `is-in` class drives CSS animations only, so under reduced
 * motion everything simply shows its final state.
 */
const s = uiCopy.scenes
const [customerWork, manualWork, repeatReplies, dataEntry, chasingFollowUps] = pattern.chartLabels

/** Illustrative share of the week, in legend order. Not measured data (see the caption). */
const WEEK = [
  { key: "c", label: customerWork, share: 30 },
  { key: "m", label: manualWork, share: 22 },
  { key: "r", label: repeatReplies, share: 18 },
  { key: "d", label: dataEntry, share: 16 },
  { key: "f", label: chasingFollowUps, share: 14 },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") return setInView(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

const Tick = () => (
  <span className="pattern__tick" aria-hidden="true">
    <svg viewBox="0 0 16 16">
      <path d="m3.6 8.4 2.9 2.8 5.9-6.4" />
    </svg>
  </span>
)

/* ---------- Scene mocks (decorative; the approved line below each one carries the meaning) ---------- */

function ChatMock() {
  const c = s.chat
  return (
    <div className="ptn-mock ptn-chat" aria-hidden="true">
      <div className="ptn-mock__bar">
        <span className="ptn-avatar">AT</span>
        <span className="ptn-mock__who">
          <b>{c.contact}</b>
          <small>{c.app}</small>
        </span>
      </div>
      <div className="ptn-chat__body">
        <p className="ptn-bubble ptn-bubble--in">
          {c.incoming}
          <time>{c.inTime}</time>
        </p>
        <p className="ptn-seen">
          <CheckCheck />
          {c.seen}
        </p>
        <div className="ptn-night">
          <Moon className="ptn-night__moon" />
          <span className="ptn-night__line" />
          <b className="ptn-night__gap">{c.gap}</b>
          <span className="ptn-night__line" />
          <Sun className="ptn-night__sun" />
        </div>
        <p className="ptn-bubble ptn-bubble--out">
          {c.reply}
          <time>{c.outTime}</time>
        </p>
      </div>
    </div>
  )
}

const SHEET_ROWS = 6
const SHEET_COLS = 4
function SheetMock() {
  const h = s.sheet
  return (
    <div className="ptn-mock ptn-sheet" aria-hidden="true">
      <div className="ptn-mock__bar">
        <span className="ptn-fileicon">
          <FileSpreadsheet />
        </span>
        <span className="ptn-mock__who">
          <b>{h.file}</b>
          <small>{h.day}</small>
        </span>
      </div>
      <div className="ptn-sheet__grid">
        {Array.from({ length: SHEET_ROWS * SHEET_COLS }, (_, i) => (
          <i key={i} style={{ "--n": i }} data-head={i < SHEET_COLS || undefined} />
        ))}
      </div>
      <div className="ptn-day">
        <div className="ptn-day__track">
          <span className="ptn-day__fill">{h.task}</span>
        </div>
        <div className="ptn-day__ends">
          <span>{h.start}</span>
          <span>{h.end}</span>
        </div>
      </div>
    </div>
  )
}

function TodoMock() {
  const t = s.todo
  return (
    <div className="ptn-mock ptn-todo" aria-hidden="true">
      <div className="ptn-mock__bar">
        <span className="ptn-fileicon ptn-fileicon--note">
          <NotebookPen />
        </span>
        <span className="ptn-mock__who">
          <b>{t.title}</b>
          <small>{t.source}</small>
        </span>
      </div>
      <ul className="ptn-todo__list">
        {t.items.map((item, i) => (
          <li key={item.who} style={{ "--n": i }}>
            <span className="ptn-box" />
            <span className="ptn-todo__text">
              <b>{item.who}</b>
              <small>{item.what}</small>
            </span>
            <span className="ptn-late">{item.late}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SCENES = [
  { id: "enquiry", line: pattern.lines[0], tag: repeatReplies, cat: "r", note: s.waitsOvernight, Mock: ChatMock },
  { id: "report", line: pattern.lines[1], tag: manualWork, cat: "m", note: s.manualAllDay, Mock: SheetMock },
  { id: "followup", line: pattern.lines[2], tag: chasingFollowUps, cat: "f", note: s.dependsOnMemory, Mock: TodoMock },
]

function Scene({ scene, index }) {
  const [ref, inView] = useInView(0.15)
  const { Mock } = scene
  return (
    <li ref={ref} className={`ptn-card${inView ? " is-in" : ""}`} data-cat={scene.cat} style={{ "--k": index }}>
      <div className="ptn-card__stage">
        <Mock />
      </div>
      <div className="ptn-card__copy">
        <span className="ptn-card__meta">
          <span className="t-mono">0{index + 1}</span>
          <span className="ptn-card__tag">
            <i className="ptn-swatch" data-cat={scene.cat} aria-hidden="true" />
            {scene.tag}
          </span>
        </span>
        <p className="ptn-card__line">{scene.line}</p>
        <span className="ptn-card__note">{scene.note}</span>
      </div>
    </li>
  )
}

function WeekBar() {
  const [ref, inView] = useInView(0.3)
  return (
    <figure ref={ref} className={`ptn-week${inView ? " is-in" : ""}`} aria-labelledby="ptn-week-title" aria-describedby="ptn-week-note">
      <div className="ptn-week__head">
        <h3 id="ptn-week-title" className="ptn-week__title">
          {pattern.chartTitle}
        </h3>
        <figcaption className="ptn-week__caption t-mono">
          <span aria-hidden="true">{s.disclaimer}</span>
          <span id="ptn-week-note" className="sr-only">
            {s.note}
          </span>
        </figcaption>
      </div>
      <div className="ptn-week__bar" aria-hidden="true">
        {WEEK.map((w) => (
          <span key={w.key} className="ptn-week__seg" data-cat={w.key} style={{ "--share": w.share }}>
            <span className="ptn-week__label">{w.label}</span>
          </span>
        ))}
      </div>
      <ul className="ptn-week__legend">
        {WEEK.map((w) => (
          <li key={w.key}>
            <i className="ptn-swatch" data-cat={w.key} aria-hidden="true" />
            {w.label}
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default function PatternScenes() {
  const cut = pattern.headline.indexOf("So why")
  const lead = pattern.headline.slice(0, cut).trim()
  const question = pattern.headline.slice(cut)

  return (
    <div className="ptn">
      <header className="ptn-head">
        <div data-reveal>
          <Eyebrow>{pattern.label}</Eyebrow>
          <h2 id="pattern-title" className="t-h2 ptn-h">
            {lead} <Marked text={question} phrase="slipping through?" tone="dark" />
          </h2>
        </div>
        <ul className="ptn-chips" aria-label={s.pointsLabel} data-reveal>
          {pattern.chips.map((c) => (
            <li key={c}>
              <Tick />
              {c}
            </li>
          ))}
        </ul>
      </header>

      <ol className="ptn-cards">
        {SCENES.map((scene, i) => (
          <Scene key={scene.id} scene={scene} index={i} />
        ))}
      </ol>

      <WeekBar />
    </div>
  )
}
