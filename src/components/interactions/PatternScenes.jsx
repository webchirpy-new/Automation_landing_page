import "../../styles/invisible-workload.css"
import React, { useCallback, useRef } from "react"
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react"
import { Bell, FileSpreadsheet, Moon, NotebookPen, Sun, MessageCircle, ArrowUpRight, MoreHorizontal, Paperclip, Send, Copy, Clipboard, CalendarDays, Clock3 } from "lucide-react"
import { siWhatsapp } from "simple-icons"
import { pattern, uiCopy } from "../../data/automationContent"
import { Marked } from "../ui/Highlight"
import { Eyebrow } from "../ui/primitives"
import { useStoryClock } from "../../hooks/useStoryClock"
import { useMediaQuery } from "../../hooks/useMediaQuery"

/**
 * 02 "The pattern" — THE INVISIBLE WORKLOAD.
 *
 * One continuous motion piece instead of three cards: a single tilted 2.5D surface that morphs from
 * a WhatsApp chat (the enquiry waits) into a spreadsheet (the report eats Friday) into a follow-up
 * list (nobody remembers), while a floating clock and a time rail keep time passing across all
 * three. One approved line at a time; ~4.6 s each; loops; pauses off screen; no autoplay under
 * reduced motion. Below it, a quiet strip shows where the week goes (illustrative, no figures) and
 * lights the part of the week each moment takes.
 *
 * Every string comes from `pattern` and the existing sample copy in `uiCopy.scenes`.
 */
const s = uiCopy.scenes
const DAYS = uiCopy.stories.compare.scene
const [customerWork, manualWork, repeatReplies, dataEntry, chasingFollowUps] = pattern.chartLabels
const EASE = [0.22, 1, 0.36, 1]
const SCENE_MS = 4600

/** Equal visual motifs describe kinds of work; no quantitative proportions. */
const WEEK = [
  { key: "c", label: customerWork },
  { key: "m", label: manualWork },
  { key: "r", label: repeatReplies },
  { key: "d", label: dataEntry },
  { key: "f", label: chasingFollowUps },
]

const SCENES = [
  { id: "enquiry", line: pattern.lines[0], tag: repeatReplies, lights: ["r"], icon: MessageCircle,
    title: "Missed enquiry", context: "A customer is ready. The inbox isn't.",
    details: [["Arrives", "A message after working hours"], ["Waits", "The same reply, typed by hand"], ["Resumes", "When someone checks the inbox"]],
    note: "An interested customer. A conversation on hold." },
  { id: "report", line: pattern.lines[1], tag: manualWork, lights: ["m", "d"], icon: FileSpreadsheet,
    title: "Manual reporting", context: "The data exists. Bringing it together takes the day.",
    details: [["Collect", "Numbers scattered across sheets"], ["Copy", "One cell, then the next"], ["Check", "Every entry needs another look"]],
    note: "More copying. Less time for customer work." },
  { id: "followup", line: pattern.lines[2], tag: chasingFollowUps, lights: ["f"], icon: Bell,
    title: "Forgotten follow-up", context: "The next step depends on someone's memory.",
    details: [["Promise", "A quote to send. A call to return."], ["Postpone", "Today's work pushes it back"], ["Chase", "The reminder is still pending"]],
    note: "The task stays open. The customer keeps waiting." },
]

// The one surface changes shape with the story: phone-like chat → wide sheet → list
const DIMS = {
  wide: [
    [366, 438],
    [476, 390],
    [408, 448],
  ],
  narrow: [
    [286, 414],
    [308, 358],
    [304, 440],
  ],
}

const t = (delay, duration = 0.45) => ({ delay, duration, ease: EASE })
const rise = (delay) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: t(delay) })

function WaGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
      <path d={siWhatsapp.path} fill="currentColor" />
    </svg>
  )
}

/* ---------- 01 · The enquiry waits ---------- */
function ChatScene() {
  const c = s.chat
  return (
    <div className="iw-chat">
      <header className="iw-bar">
        <span className="iw-avatar">AT</span>
        <span className="iw-bar__who">
          <b>{c.contact}</b>
          <small>
            <span className="iw-wa">
              <WaGlyph />
            </span>
            {c.app}
          </small>
        </span>
        <MoreHorizontal className="iw-app-menu" size={18} />
      </header>
      <div className="iw-chat-date"><span>Customer enquiry</span></div>
      <div className="iw-chat__body">
        <m.p
          className="iw-bubble iw-bubble--in"
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 22 }}
        >
          {c.incoming}
          <time>{c.inTime}</time>
        </m.p>
        <m.p className="iw-unread" {...rise(0.65)}><i />1 unread enquiry</m.p>
        <m.p className="iw-unanswered" {...rise(1.5)}>Waiting for a response...</m.p>
        <m.p className="iw-bubble iw-bubble--out" {...rise(3.15)}>
          {c.reply}<time>{c.outTime}</time>
        </m.p>
      </div>
      <div className="iw-composer"><Paperclip size={14} /><span>Message</span><Send size={14} /></div>
      {/* the night falls over the screen while nobody answers, then morning */}
      <m.span className="iw-night" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.15, 0.15, 0] }} transition={{ delay: 0.9, duration: 2.6, times: [0, 0.25, 0.75, 1] }} />
    </div>
  )
}

/* ---------- 02 · The report takes all of Friday ---------- */
const COLS = 5
const ROWS = 6
// Copy → paste, by hand: [from cell, to cell]
const COPIES = [
  [6, 19],
  [12, 24],
  [8, 26],
]
const cellPos = (i) => ({ left: `${(i % COLS) * (100 / COLS)}%`, top: `${Math.floor(i / COLS) * (100 / ROWS)}%` })
// Sample worksheet values describe the action, never business performance.
const CELL_DATA = ["", "A", "B", "C", "D", "1", "200", "Quote", "120", "Open", "2", "80", "150", "Order", "Due", "3", "240", "Quote", "90", "", "4", "60", "Order", "210", "", "5", "", "Due", "160", "Open"]

function SheetScene() {
  const h = s.sheet
  const path = COPIES.flatMap(([a, b]) => [a, b])
  // cell centres as plain percentages (Motion tweens numbers, not calc())
  const at = (i) => [`${((i % COLS) + 0.5) * (100 / COLS)}%`, `${(Math.floor(i / COLS) + 0.5) * (100 / ROWS)}%`]
  return (
    <div className="iw-sheet">
      <header className="iw-bar">
        <span className="iw-fileicon">
          <FileSpreadsheet size={15} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="iw-bar__who">
          <b>{h.file}</b>
          <small>{h.day}</small>
        </span>
      </header>
      <div className="iw-sheet-tools"><span><Copy size={12} />Copy</span><span><Clipboard size={12} />Paste</span><span className="iw-sheet-tools__source">Source sheets <ArrowUpRight size={11} /></span></div>
      <div className="iw-formula"><span>C4</span><i>fx</i><span>Manual entry / copy / paste</span></div>
      <div className="iw-grid">
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <m.span
            key={i}
            className={`iw-cell ${i < COLS || i % COLS === 0 ? "is-head" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={t(0.2 + (i % COLS) * 0.04 + Math.floor(i / COLS) * 0.05, 0.3)}
          >
            {!COPIES.some(([, b]) => b === i) && <span>{CELL_DATA[i]}</span>}
          </m.span>
        ))}
        {/* each copy: the source cell is marked, the cursor carries it, the target fills */}
        {COPIES.map(([a, b], k) => (
          <React.Fragment key={k}>
            <m.span
              className="iw-copied"
              style={cellPos(a)}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ delay: 0.75 + k * 1.05, duration: 1, times: [0, 0.1, 0.7, 1] }}
            />
            <m.span className="iw-pasted" style={cellPos(b)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(1.2 + k * 1.05, 0.3)}>
              <span>{CELL_DATA[a]}</span>
            </m.span>
          </React.Fragment>
        ))}
        <m.span
          className="iw-cursor"
          initial={{ opacity: 0, left: at(path[0])[0], top: at(path[0])[1] }}
          animate={{ opacity: [0, 1, 1, 1, 1, 1, 1, 0], left: [path[0], ...path, path.at(-1)].map((i) => at(i)[0]), top: [path[0], ...path, path.at(-1)].map((i) => at(i)[1]) }}
          transition={{ delay: 0.55, duration: 3.4, times: [0, .06, .19, .37, .5, .68, .81, 1], ease: "easeInOut" }}
        >
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
            <path d="M2 1.5l11 6.2-4.6 1.2-2 4.6z" />
          </svg>
        </m.span>
      </div>
      <div className="iw-task">
        <span>{h.task}</span>
        <span className="iw-task__track">
          <m.span className="iw-task__fill" initial={{ scaleX: 0 }} animate={{ scaleX: 0.92 }} transition={{ delay: 0.5, duration: 3.6, ease: "linear" }} />
        </span>
      </div>
      <div className="iw-sheet-tabs"><span className="is-selected">Weekly report</span><span>Enquiries</span><span>Orders</span></div>
      {/* loose documents drifting in to be copied */}
      {[0, 1].map((k) => (
        <m.span
          key={k}
          className={`iw-doc iw-doc--${k}`}
          style={{ z: 40 }}
          initial={{ opacity: 0, x: 10, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ delay: 1.3 + k * 1.1, type: "spring", stiffness: 140, damping: 18 }}
        >
          <i />
          <i />
          <i />
        </m.span>
      ))}
    </div>
  )
}

/* ---------- 03 · The follow-up waits for someone to remember ---------- */
const LATE_AT = [1.5, 2.35, 3.2]
function TodoScene() {
  const td = s.todo
  const first = td.items[0]
  return (
    <div className="iw-todo">
      <header className="iw-bar">
        <span className="iw-fileicon">
          <NotebookPen size={15} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="iw-bar__who">
          <b>{td.title}</b>
          <small>{td.source}</small>
        </span>
      </header>
      <div className="iw-todo-summary"><span><CalendarDays size={12} />Customer reminders</span><span>Awaiting action</span></div>
      <ul className="iw-todo__list">
        {td.items.map((item, i) => (
          <m.li key={item.who} {...rise(0.3 + i * 0.15)}>
            <m.span
              className="iw-todo__mark"
              initial={{ backgroundColor: "rgba(255,255,255,0.14)" }}
              animate={{ backgroundColor: "rgba(183,154,238,0.95)" }}
              transition={t(LATE_AT[i] - 0.15, 0.4)}
            />
            <span className="iw-box" />
            <span className="iw-todo__text">
              <b>{item.who}</b>
              <small>{item.what}</small>
            </span>
            <m.span className="iw-late" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={t(LATE_AT[i], 0.4)}>
              {item.late}
            </m.span>
          </m.li>
        ))}
      </ul>
      <div className="iw-follow-timeline">
        <div className="iw-follow-timeline__track"><m.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: .45, duration: 2.6, ease: "linear" }} />
          {[0,1,2].map((i) => <m.b key={i} style={{ left: `${i * 50}%` }} initial={{ backgroundColor: "#474e60" }} animate={{ backgroundColor: "#b5a5de" }} transition={{ delay: .6 + i * 1.1 }} />)}
        </div>
        <div className="iw-follow-timeline__labels"><span>{DAYS.day1}</span><span>{DAYS.day3}</span><span>{DAYS.day7}</span></div>
      </div>
      {/* the reminder that nobody acts on */}
      <m.div
        className="iw-notify"
        style={{ z: 46 }}
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2.7, type: "spring", stiffness: 240, damping: 20 }}
      >
        <span className="iw-notify__icon">
          <Bell size={13} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="iw-notify__text">
          <b>{first.who}</b>
          <small>{first.what}</small>
        </span>
        <span className="iw-notify__status">Pending</span><i className="iw-notify__pending" />
      </m.div>
    </div>
  )
}

const SCENE_VIEWS = [ChatScene, SheetScene, TodoScene]

/* ---------- Time, running under all three ---------- */
function TimeRail({ scene }) {
  const c = s.chat
  const h = s.sheet
  const ends =
    scene === 0
      ? [
          <>
            <Moon size={12} strokeWidth={2} aria-hidden="true" /> {c.inTime}
          </>,
          <>
            {c.outTime} <Sun size={12} strokeWidth={2} aria-hidden="true" />
          </>,
        ]
      : scene === 1
        ? [h.start, h.end]
        : [null, null]
  const ticks = scene === 2 ? [DAYS.day1, DAYS.day3, DAYS.day7] : []
  return (
    <div className="iw-rail">
      <span className="iw-rail__end">{ends[0]}</span>
      <span className="iw-rail__track">
        <m.span className="iw-rail__fill" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 2.9, ease: "easeInOut" }} />
        <m.span className="iw-rail__head" initial={{ left: "0%" }} animate={{ left: "100%" }} transition={{ delay: 0.7, duration: 2.9, ease: "easeInOut" }} />
        {ticks.map((d, i) => (
          <span key={d} className="iw-rail__tick" style={{ left: `${[16, 48, 86][i]}%` }}>
            <i />
            <small>{d}</small>
          </span>
        ))}
        {scene === 0 && (
          <m.span className="iw-rail__gap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(3.4, 0.4)}>
            {c.gap}
          </m.span>
        )}
      </span>
      <span className="iw-rail__end">{ends[1]}</span>
    </div>
  )
}

function Clock() {
  return (
    <span className="iw-clock" aria-hidden="true">
      <span className="iw-clock__face">
        {[0, 90, 180, 270].map((a) => (
          <i key={a} className="iw-clock__tick" style={{ transform: `rotate(${a}deg) translateY(-22px)` }} />
        ))}
        <i className="iw-clock__hand iw-clock__hand--h" />
        <i className="iw-clock__hand iw-clock__hand--m" />
        <i className="iw-clock__pin" />
      </span>
    </span>
  )
}

/* ---------- Where the week goes ---------- */
function WeekStrip({ lights }) {
  return (
    <figure className="iw-work" aria-labelledby="iw-work-title">
      <figcaption id="iw-work-title">{pattern.chartTitle}</figcaption>
      <ul className="iw-work__items">
        {WEEK.map((w, i) => (
          <li key={w.key} className={lights.includes(w.key) ? "is-lit" : ""}>
            <span className="iw-work__threads" aria-hidden="true">
              {Array.from({ length: 9 }, (_, j) => <i key={j} style={{ "--delay": `${j * .13 + i * .2}s` }} />)}
            </span>
            <span>{w.label}</span>
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

  const rootRef = useRef(null)
  const stepsRef = useRef(null)
  const onProgress = useCallback((p) => stepsRef.current?.style.setProperty("--p", p.toFixed(4)), [])
  const story = useStoryClock({ durations: SCENES.map(() => SCENE_MS), rootRef, onProgress, threshold: 0.3 })
  const wide = useMediaQuery("(min-width: 900px)")
  const scene = story.index
  const live = true
  const [w, h] = DIMS[wide ? "wide" : "narrow"][scene]
  const View = SCENE_VIEWS[scene]
  const key = `${scene}-${Math.max(0, story.epoch - 1)}`

  return (
    <div className="ptn">
      <header className="ptn-head">
        <div data-reveal>
          <Eyebrow>{pattern.label}</Eyebrow>
          <h2 id="pattern-title" className="t-h2 ptn-h">
            {lead} <Marked text={question} phrase="slipping through?" tone="dark" />
          </h2>
        </div>
        <ul className="iw-points" aria-label={s.pointsLabel} data-reveal>
          {pattern.chips.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </header>

      {/* The three moments in full, for screen readers; the motion shows them one at a time */}
      <ol className="sr-only">
        {SCENES.map((sc) => (
          <li key={sc.id}>{sc.line}</li>
        ))}
      </ol>

      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <div ref={rootRef} className={`iw ${story.running ? "is-running" : ""} ${story.reduced ? "is-reduced" : ""}`} data-scene={scene} data-reveal>
            <div className="iw-stage">
              <span className="iw-stage__label" aria-hidden="true">The invisible workload</span>
              <span className="iw-stage__orbit" aria-hidden="true" />
              <span className="iw-stage__chapter" aria-hidden="true"><i />Everyday work / {String(scene + 1).padStart(2, "0")} of 03</span>
              <div className="iw-visual" aria-hidden="true">
                <span className="iw-light" />
                <div className="iw-space">
                  <span className="iw-floor" />
                  <div className="iw-tilt">
                    <m.div className="iw-card" initial={false} animate={{ width: w, height: h }} transition={{ duration: story.reduced ? 0 : .42, delay: story.reduced ? 0 : .2, ease: EASE }}>
                      <span className="iw-card__sheen" />
                      <AnimatePresence mode="wait" initial={false}>
                        {live && (
                          <m.div
                            key={key}
                            className="iw-layer"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6, transition: { duration: story.reduced ? 0 : .2 } }}
                            transition={{ duration: story.reduced ? 0 : .28, ease: EASE }}
                          >
                            <View />
                          </m.div>
                        )}
                      </AnimatePresence>
                      <Clock />
                    </m.div>
                  </div>
                </div>
                <div className="iw-rail-wrap">
                  <AnimatePresence mode="wait" initial={false}>
                    {live && (
                      <m.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .2 } }} transition={t(0, .28)}>
                        <TimeRail scene={scene} />
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="iw-copy">
                <div className="iw-copy__swap" aria-hidden="true">
                  <AnimatePresence mode="wait" initial={false}>
                    <m.div key={scene} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: story.reduced ? 0 : .2, ease: EASE }}>
                      <p className="iw-kicker">
                        <span>{String(scene + 1).padStart(2, "0")}</span>
                        {SCENES[scene].tag}
                      </p>
                      <p className="iw-line">{SCENES[scene].line}</p>
                      <p className="iw-context">{SCENES[scene].context}</p>
                      <dl className="iw-details">
                        {SCENES[scene].details.map(([label, detail], i) => <div key={label} style={{ "--detail-delay": `${i * .18}s` }}><dt><i />{label}</dt><dd>{detail}</dd></div>)}
                      </dl>
                      <p className="iw-scene-note"><Clock3 size={13} />{SCENES[scene].note}</p>
                    </m.div>
                  </AnimatePresence>
                </div>
                <ol ref={stepsRef} className="iw-steps" aria-label={pattern.label}>
                  {SCENES.map((sc, i) => (
                    <li key={sc.id}>
                      <button
                        type="button"
                        className={`iw-step ${i < scene ? "is-done" : i === scene ? "is-active" : ""}`}
                        aria-label={`${i + 1} of ${SCENES.length}: ${sc.line}`}
                        aria-current={i === scene ? "step" : undefined}
                        onClick={() => story.go(i, { pause: story.reduced })}
                      >
                        <span className="iw-step__bar">
                          <span className="iw-step__fill" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="iw-journey" aria-hidden="true">
                {SCENES.map((sc, i) => { const Icon = sc.icon; return <div key={sc.id} className={scene === i ? "is-current" : ""}><span className="iw-journey__icon"><Icon size={17} strokeWidth={1.5} /></span><span><small>0{i + 1}</small>{sc.title}</span>{i < 2 && <span className="iw-journey__link"><i /></span>}</div> })}
              </div>
            </div>

            <WeekStrip lights={SCENES[scene].lights} />
          </div>
        </MotionConfig>
      </LazyMotion>
    </div>
  )
}
