import "../../styles/invisible-workload.css"
import React, { useCallback, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, LazyMotion, MotionConfig, animate, domAnimation, m } from "motion/react"
import {
  BellRing,
  CalendarDays,
  CheckCheck,
  CircleDashed,
  ClipboardPaste,
  Copy,
  FileSpreadsheet,
  Hourglass,
  MessageCircle,
  MessageCircleOff,
  Moon,
  NotebookPen,
  Paperclip,
  Repeat,
  Send,
  Sun,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { siWhatsapp } from "simple-icons"
import { pattern, uiCopy } from "../../data/automationContent"
import { Marked } from "../ui/Highlight"
import { useStoryClock } from "../../hooks/useStoryClock"
import { useMediaQuery } from "../../hooks/useMediaQuery"

/**
 * 02 "The pattern" — THE INVISIBLE WORKLOAD.
 *
 * Left (55%): one large tilted 3D interface with a floating clock. It becomes, in turn:
 *   01 a WhatsApp chat — a notification lands, the enquiry stays unread, night falls while the
 *      clock and a "no reply" timer run, the customer asks again, morning comes: still waiting;
 *   02 two spreadsheets — row by row the cursor copies (Ctrl+C), carries the value along a link
 *      line and pastes (Ctrl+V), while the report's progress barely moves and Friday runs out;
 *   03 a follow-up list — an interested customer drops in, the reminder fires and is ignored,
 *      the timeline runs past the due day into overdue, and the follow-up stays pending.
 * Right (45%): scene label, the approved headline, one sentence, and three action steps that
 * light up on the same beats as the 3D scene (BEATS).
 * Below: one ring of the team's week, where chasing work grows and customer time shrinks.
 *
 * ~6.2 s per scene, looping while on screen; no playback buttons; three bars show where it is
 * (and jump there). Reduced motion: no autoplay, the clock and timer show their end values.
 * Headlines are the approved `pattern.lines`; all other words are sample copy in `uiCopy.scenes`.
 */
const s = uiCopy.scenes
const DAY_WORD = uiCopy.stories.compare.scene.day1.replace(/\s*\d+$/, "") // "Day"
const EASE = [0.22, 1, 0.36, 1]
const SCENE_MS = 6200
const EXIT = 0.22 // the old scene fades out; the new one mounts once it has gone
const ENTER = 0.38 // …and fades in once the card has finished changing shape

const SCENES = pattern.lines.map((line, i) => ({ id: ["enquiry", "report", "followup"][i], line, support: s.support[i], title: s.titles[i] }))

// When each of the three action steps happens, in seconds after a scene mounts. The 3D scene and
// the steps on the right both read these, so they always move together.
const BEATS = [
  [0.6, 1.5, 4.5], // message arrives · night, no reply · still waiting
  [1.0, 1.62, 2.2], // first copy · first paste · second copy
  [0.75, 2.55, 4.5], // customer added · overdue (Day 2) · still pending (after Day 4)
]
const FLOW_ICONS = [
  [MessageCircle, MessageCircleOff, Hourglass],
  [Copy, ClipboardPaste, Repeat],
  [UserPlus, BellRing, CircleDashed],
]

// The card changes shape with the story: chat → wide pair of sheets → list
const DIMS = {
  wide: [
    [500, 548],
    [580, 500],
    [560, 446],
  ],
  narrow: [
    [318, 500],
    [336, 412],
    [328, 398],
  ],
}

// Notification banners slide down from the top edge of the app, fully opaque (the card clips them
// above its edge, so they come in from "off screen" like a phone notification)
const BANNER_OUT = -96
const t = (delay, duration = 0.45) => ({ delay, duration, ease: EASE })
const rise = (delay, y = 10) => ({ initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: t(delay) })
// Shown from `from` to `to` (seconds), fading in and out
const during = (from, to, fade = 0.15) => ({
  initial: { opacity: 0 },
  animate: { opacity: [0, 1, 1, 0] },
  transition: { delay: from, duration: to - from, times: [0, fade / (to - from), 1 - fade / (to - from), 1] },
})

function WaGlyph({ size = 12 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={siWhatsapp.path} fill="currentColor" />
    </svg>
  )
}

/** Counts a number up with the story, writing text straight into the DOM (no re-renders). */
function useCountUp(ref, { from, to, delay, duration, format, still }) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (still) {
      el.textContent = format(to)
      return undefined
    }
    el.textContent = format(from)
    const ctl = animate(from, to, { delay, duration, ease: [0.42, 0, 0.3, 1], onUpdate: (v) => (el.textContent = format(v)) })
    return () => ctl.stop()
  }, [ref, from, to, delay, duration, format, still])
}

/* =================== 01 · The enquiry waits till morning =================== */
const NIGHT = [BEATS[0][1], BEATS[0][2] - 0.15] // night falls with "no reply", lifts before "still waiting"
const TYPE_AT = 2.55
const AGAIN_AT = 3.25
const GAP_MIN = (([, h, mi]) => Number(h) * 60 + Number(mi))(s.chat.gap.match(/(\d+)\s*h\s*(\d+)/) || [0, 0, 0])
const fmtGap = (v) => `${Math.floor(Math.round(v) / 60)} h ${Math.round(v) % 60} m`

function WaitPill({ still }) {
  const ref = useRef(null)
  const [, noReply, waiting] = BEATS[0]
  useCountUp(ref, { from: 0, to: GAP_MIN, delay: noReply, duration: NIGHT[1] - NIGHT[0], format: fmtGap, still })
  return (
    <m.p
      className="iw-wait"
      initial={{ opacity: 0, y: 10, backgroundColor: "rgba(135, 150, 255, 0.1)", borderColor: "rgba(170, 185, 255, 0.24)" }}
      animate={{ opacity: 1, y: 0, backgroundColor: "rgba(183, 154, 238, 0.18)", borderColor: "rgba(214, 186, 255, 0.5)" }}
      transition={{ ...t(noReply - 0.1), backgroundColor: t(waiting, 0.5), borderColor: t(waiting, 0.5) }}
    >
      <span className="iw-wait__state">
        <m.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={t(waiting - 0.1, 0.25)}>
          <Hourglass size={14} strokeWidth={2} aria-hidden="true" />
          {s.noReply}
        </m.span>
        <m.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(waiting, 0.35)}>
          <i />
          {s.stillWaiting}
        </m.span>
      </span>
      <span className="iw-wait__time" ref={ref} />
    </m.p>
  )
}

function ChatScene({ still }) {
  const c = s.chat
  const [arrive, noReply] = BEATS[0]
  return (
    <div className="iw-chat">
      <header className="iw-bar">
        <span className="iw-avatar">
          AT
          <m.span
            className="iw-badge"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: [0.4, 1, 1, 1.25, 1] }}
            transition={{ delay: arrive + 0.35, duration: AGAIN_AT - arrive, times: [0, 0.08, 0.92, 0.96, 1] }}
          >
            <m.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={t(AGAIN_AT, 0.15)}>
              1
            </m.span>
            <m.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(AGAIN_AT, 0.2)}>
              2
            </m.span>
          </m.span>
        </span>
        <span className="iw-bar__who">
          <b>{c.contact}</b>
          <small>
            <span className="iw-wa">
              <WaGlyph />
            </span>
            {c.app}
          </small>
        </span>
      </header>

      <div className="iw-chat__body">
        <m.p className="iw-chat__day" {...rise(0.4, 4)}>
          <span>{s.today}</span>
        </m.p>
        <m.div className="iw-msg" initial={{ opacity: 0, y: 18, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: arrive + 0.25, type: "spring", stiffness: 240, damping: 22 }}>
          <p className="iw-bubble">
            {c.incoming}
            <time>{c.inTime}</time>
          </p>
        </m.div>
        <m.span className="iw-status" {...rise(arrive + 0.85, 6)}>
          <CheckCheck size={14} strokeWidth={2} aria-hidden="true" />
          {s.unread}
        </m.span>
        {/* the customer, still there, types and asks again */}
        <div className="iw-again">
          <m.span className="iw-typing" {...during(TYPE_AT, AGAIN_AT)}>
            <i />
            <i />
            <i />
          </m.span>
          <m.div className="iw-msg" initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: AGAIN_AT, type: "spring", stiffness: 260, damping: 22 }}>
            <p className="iw-bubble iw-bubble--short">
              {c.followUp}
              <time>{c.followUpTime}</time>
            </p>
          </m.div>
        </div>
        <WaitPill still={still} />
      </div>

      <div className="iw-composer">
        <Paperclip size={15} strokeWidth={1.8} />
        <span>Message</span>
        <Send size={15} strokeWidth={1.8} />
      </div>

      {/* night over the chat while nobody answers */}
      <m.span className="iw-night" {...during(NIGHT[0], NIGHT[1], 0.4)} />

      {/* the notification that announced it */}
      <m.div
        className="iw-banner"
        initial={{ y: BANNER_OUT }}
        animate={{ y: [BANNER_OUT, 0, 0, BANNER_OUT] }}
        transition={{ delay: arrive - 0.1, duration: noReply - arrive + 0.55, times: [0, 0.14, 0.84, 1] }}
      >
        <span className="iw-banner__icon iw-banner__icon--wa">
          <WaGlyph size={15} />
        </span>
        <span className="iw-banner__text">
          <b>{c.contact}</b>
          <small>{c.incoming}</small>
        </span>
      </m.div>
    </div>
  )
}

/* =================== 02 · The report takes all of Friday =================== */
// Sample worksheet values describe the action, never business performance.
const ORDERS = [
  ["Quote", "200"],
  ["Order", "120"],
  ["Order", "80"],
  ["Quote", "150"],
  ["Order", "240"],
]
const COPY_AT = [BEATS[1][0], BEATS[1][2], BEATS[1][2] + 1.2] // three rows by hand; two still to go
const PASTE = 0.62 // seconds from a copy to its paste
const SHEET = { wide: { row: 40, title: 36, gap: 16 }, narrow: { row: 32, title: 30, gap: 10 } }
const SRC = 0.37 // value column of the source sheet (share of the pair's width)
const DST = 0.89 // value column of the report

function useLayoutWidth(ref) {
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    setW(el.offsetWidth) // layout width, unaffected by the 3D tilt
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

function Pane({ title, source, children }) {
  return (
    <div className={`iw-pane ${source ? "iw-pane--source" : ""}`}>
      <p className="iw-pane__title">
        <FileSpreadsheet size={13} strokeWidth={1.8} aria-hidden="true" />
        {title}
      </p>
      <div className="iw-pane__grid">
        <span className="is-head" />
        <span className="is-head">A</span>
        <span className="is-head">B</span>
        {ORDERS.map((row, k) => (
          <React.Fragment key={k}>
            <span className="is-num">{k + 1}</span>
            {children(row, k)}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/** One value in the formula bar: shown from its paste until the next one */
function fxShow(i, list) {
  if (i === 0) return { initial: { opacity: 1 }, animate: { opacity: 0 }, transition: t(list[1].at, 0.15) }
  if (i === list.length - 1) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: t(list[i].at, 0.2) }
  return during(list[i].at, list[i + 1].at, 0.1)
}

function SheetScene({ wide }) {
  const h = s.sheet
  const g = SHEET[wide ? "wide" : "narrow"]
  const panesRef = useRef(null)
  const W = useLayoutWidth(panesRef)
  const rowY = (k) => g.title + g.row * (k + 1) + g.row / 2 + 1
  const H = g.title + g.row * (ORDERS.length + 1) + 2
  const pct = (f) => `${f * 100}%`

  // The cursor: to the source row, copy, carry across, paste; three times
  const stops = COPY_AT.flatMap((a, k) => [
    [SRC, rowY(k), a - 0.22],
    [SRC, rowY(k), a + 0.14],
    [DST, rowY(k), a + PASTE - 0.04],
    [DST, rowY(k), a + PASTE + 0.2],
  ])
  const t0 = stops[0][2]
  const t1 = stops.at(-1)[2] + 0.4
  const times = [...stops.map((p) => (p[2] - t0) / (t1 - t0)), 1]
  const last = stops.at(-1)

  // The formula bar shows the cell being pasted and its value
  const fx = [{ ref: "B1", val: "", at: 0 }, ...COPY_AT.map((a, k) => ({ ref: `B${k + 1}`, val: ORDERS[k][1], at: a + PASTE }))]
  // Report progress creeps up a little with each paste
  const P = COPY_AT.map((a) => a + PASTE)
  const span = P[2] + 0.35 - P[0]
  const progTimes = [0, 0.35, P[1] - P[0], P[1] - P[0] + 0.35, P[2] - P[0], span].map((x) => x / span)

  return (
    <div className="iw-sheet">
      <header className="iw-bar">
        <span className="iw-fileicon">
          <FileSpreadsheet size={17} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="iw-bar__who">
          <b>{h.day}</b>
          <small>{h.task}</small>
        </span>
      </header>

      <div className="iw-fx">
        <span className="iw-fx__ref">
          {fx.map((f, i) => (
            <m.span key={i} {...fxShow(i, fx)}>
              {f.ref}
            </m.span>
          ))}
        </span>
        <i>fx</i>
        <span className="iw-fx__val">
          {fx.map((f, i) => (
            <m.span key={i} {...fxShow(i, fx)}>
              {f.val}
            </m.span>
          ))}
        </span>
      </div>

      <div ref={panesRef} className="iw-panes" style={{ "--row": `${g.row}px`, "--title": `${g.title}px`, "--gap": `${g.gap}px` }}>
        <Pane title={s.ordersFile} source>
          {(row) => row.map((v, j) => <span key={j}>{v}</span>)}
        </Pane>
        <Pane title={h.file}>
          {(row, k) =>
            row.map((v, j) =>
              k < COPY_AT.length ? (
                <m.span
                  key={j}
                  className="iw-paste"
                  initial={{ opacity: 0, backgroundColor: "rgba(140, 170, 255, 0)" }}
                  animate={{ opacity: 1, backgroundColor: ["rgba(140, 170, 255, 0)", "rgba(140, 170, 255, 0.36)", "rgba(140, 170, 255, 0.07)"] }}
                  transition={{ delay: COPY_AT[k] + PASTE, duration: 0.9, opacity: { delay: COPY_AT[k] + PASTE, duration: 0.15 } }}
                >
                  {v}
                </m.span>
              ) : (
                <span key={j} />
              )
            )
          }
        </Pane>

        {/* the link each value travels along */}
        {W > 0 && (
          <svg className="iw-links" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <linearGradient id="iw-link" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#87baff" />
                <stop offset="1" stopColor="#b79aee" />
              </linearGradient>
            </defs>
            {COPY_AT.map((a, k) => {
              const y = rowY(k)
              const x1 = W * SRC + 18
              const x2 = W * DST - 26
              return (
                <m.path
                  key={k}
                  d={`M${x1} ${y}C${x1 + (x2 - x1) * 0.3} ${y - 46} ${x1 + (x2 - x1) * 0.7} ${y - 46} ${x2} ${y}`}
                  className="iw-link"
                  stroke="url(#iw-link)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{
                    pathLength: { delay: a + 0.14, duration: PASTE - 0.18, ease: "easeInOut" },
                    opacity: { delay: a + 0.1, duration: PASTE + 0.45, times: [0, 0.1, 0.75, 1] },
                  }}
                />
              )
            })}
          </svg>
        )}

        {COPY_AT.map((a, k) => (
          <React.Fragment key={k}>
            {/* the copied row: marching dashes */}
            <m.span className="iw-sel" style={{ "--r": k }} {...during(a - 0.05, a + PASTE + 0.35, 0.08)} />
            {/* the shortcuts, pressed by hand */}
            <span className="iw-key-pos" style={{ left: pct(SRC), top: rowY(k) - g.row / 2 }}>
              <m.span className="iw-key" {...during(a, a + 0.55, 0.1)}>
                {s.copyKey}
              </m.span>
            </span>
            <span className="iw-key-pos" style={{ left: pct(DST), top: rowY(k) - g.row / 2 }}>
              <m.span className="iw-key" {...during(a + PASTE, a + PASTE + 0.55, 0.1)}>
                {s.pasteKey}
              </m.span>
            </span>
            {/* the value, carried across */}
            <m.span
              className="iw-ghost"
              initial={{ opacity: 0, left: pct(SRC), top: rowY(k) }}
              animate={{ opacity: [0, 1, 1, 0], left: [pct(SRC), pct(DST)] }}
              transition={{ delay: a + 0.14, duration: PASTE - 0.18, ease: "easeInOut", opacity: { delay: a + 0.12, duration: PASTE - 0.1, times: [0, 0.12, 0.85, 1] } }}
            >
              {ORDERS[k][1]}
            </m.span>
          </React.Fragment>
        ))}
        <m.span
          className="iw-cursor"
          initial={{ opacity: 0, left: pct(SRC), top: stops[0][1] }}
          animate={{ opacity: [0, 1, 1, 0], left: [...stops.map((p) => pct(p[0])), pct(last[0])], top: [...stops.map((p) => p[1]), last[1]] }}
          transition={{ delay: t0, duration: t1 - t0, times, ease: "easeInOut", opacity: { delay: t0, duration: t1 - t0, times: [0, 0.04, 0.93, 1] } }}
        >
          <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
            <path d="M2 1.5l11 6.2-4.6 1.2-2 4.6z" />
          </svg>
        </m.span>
      </div>

      <div className="iw-progress">
        <span>{s.progressLabel}</span>
        <span className="iw-progress__track">
          <m.span
            className="iw-progress__fill"
            initial={{ scaleX: 0.02 }}
            animate={{ scaleX: [0.02, 0.08, 0.08, 0.14, 0.14, 0.2] }}
            transition={{ delay: P[0], duration: span, times: progTimes, ease: "easeOut" }}
          />
        </span>
      </div>
    </div>
  )
}

/* =================== 03 · The follow-up waits for someone to remember =================== */
const TL = { from: 1.7, to: 4.3 } // the timeline (and the clock) run Day 1 → Day 4
function Timeline() {
  const days = [1, 2, 3, 4]
  const at = (i) => TL.from + ((TL.to - TL.from) * i) / (days.length - 1)
  return (
    <div className="iw-tl">
      <div className="iw-tl__track">
        <m.span className="iw-tl__fill" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: TL.from, duration: TL.to - TL.from, ease: "linear" }} />
        {days.map((d, i) => (
          <m.span
            key={d}
            className={`iw-tl__dot ${i === 0 ? "is-due" : ""}`}
            style={{ left: `${(i / (days.length - 1)) * 100}%` }}
            initial={{ scale: 0.6, backgroundColor: i === 0 ? "#2b3346" : "#1d2432" }}
            animate={{ scale: [0.6, 1.25, 1], backgroundColor: i === 0 ? "#6f86ff" : "#d67fb6" }}
            transition={{ delay: i === 0 ? BEATS[2][0] + 0.55 : at(i), duration: 0.45 }}
          >
            {i === 0 && <BellRing size={11} strokeWidth={2.2} aria-hidden="true" />}
          </m.span>
        ))}
      </div>
      <div className="iw-tl__labels">
        {days.map((d) => (
          <span key={d}>
            {DAY_WORD} {d}
          </span>
        ))}
      </div>
    </div>
  )
}

function TodoScene() {
  const td = s.todo
  const [lead, ...rest] = td.items
  const [added, overdue, pending] = BEATS[2]
  const remindAt = added + 0.85
  return (
    <div className="iw-todo">
      <header className="iw-bar">
        <span className="iw-fileicon">
          <NotebookPen size={17} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="iw-bar__who">
          <b>{td.title}</b>
          <small>{td.source}</small>
        </span>
      </header>
      <p className="iw-cols">
        <span>{s.colCustomer}</span>
        <span>{s.colStatus}</span>
      </p>

      {/* the interested customer drops into the top of the list, pushing the rest down */}
      <m.div className="iw-lead-slot" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ delay: added, duration: 0.55, ease: EASE }}>
        <m.article
          className="iw-lead"
          // the glow is inset: the slot clips anything outside the card while it opens
          initial={{ y: -16, scale: 0.97, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(214,186,255,0), inset 0 0 30px -6px rgba(200,150,230,0)" }}
          animate={{ y: 0, scale: 1, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(214,186,255,0.55), inset 0 0 30px -6px rgba(200,150,230,0.45)" }}
          transition={{ ...t(added + 0.1, 0.5), boxShadow: t(pending, 0.6) }}
        >
          <m.span className="iw-lead__edge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(overdue, 0.5)} />
          <div className="iw-lead__who">
            <span className="iw-avatar">KI</span>
            <span className="iw-bar__who">
              <span className="iw-lead__name">
                <b>{lead.who}</b>
                <span className="iw-tag">{s.interested}</span>
              </span>
              <small>{lead.what}</small>
            </span>
          </div>
          <Timeline />
          <div className="iw-lead__row">
            <span className="iw-pending">
              <i />
              {s.pending}
            </span>
            <span className="iw-due">
              <m.span className="iw-due__today" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -8 }} transition={t(overdue - 0.1, 0.3)}>
                {s.dueToday}
              </m.span>
              <m.span
                className="iw-due__late"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
                transition={{ delay: overdue, duration: pending - 0.15 - overdue, times: [0, 0.12, 0.88, 1] }}
              >
                {s.overdue}
              </m.span>
              <m.span className="iw-due__late" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(pending - 0.15, 0.35)}>
                {lead.late}
              </m.span>
            </span>
          </div>
        </m.article>
      </m.div>

      {/* the rest of the list, quietly waiting too */}
      <ul className="iw-queue">
        {rest.map((it, i) => (
          <m.li key={it.who} {...rise(0.45 + i * 0.1)}>
            <span className="iw-box" />
            <b>{it.who}</b>
            <span>{it.late}</span>
          </m.li>
        ))}
      </ul>

      {/* the reminder fires… and nobody acts on it */}
      <m.div className="iw-banner" initial={{ y: BANNER_OUT }} animate={{ y: [BANNER_OUT, 0, 0, BANNER_OUT] }} transition={{ delay: remindAt, duration: 1.6, times: [0, 0.14, 0.84, 1] }}>
        <m.span className="iw-banner__icon" initial={{ rotate: 0 }} animate={{ rotate: [0, -18, 15, -11, 7, 0] }} transition={{ delay: remindAt + 0.2, duration: 0.7 }}>
          <BellRing size={15} strokeWidth={2} aria-hidden="true" />
        </m.span>
        <span className="iw-banner__text">
          <b>
            {s.reminder} · {lead.who}
          </b>
          <small>{lead.what}</small>
        </span>
      </m.div>
    </div>
  )
}

const SCENE_VIEWS = [ChatScene, SheetScene, TodoScene]

/* =================== The clock: a time chip per scene, hands spin while time passes =================== */
const hm = (v) => {
  const total = Math.round(v)
  const h24 = Math.floor(total / 60) % 24
  return `${h24 % 12 || 12}:${String(total % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`
}
const toMin = (str) => {
  const [, h, mi, ap] = str.match(/(\d+):(\d+)\s*(am|pm)/i) || []
  return h ? ((Number(h) % 12) + (ap.toLowerCase() === "pm" ? 12 : 0)) * 60 + Number(mi) : 0
}
// Delays are from the scene change, so they include the old scene's exit (EXIT)
const CLOCKS = [
  // 9:47 pm → 9:12 am the next morning, while the night is over the chat
  { from: toMin(s.chat.inTime), to: toMin(s.chat.outTime) + 24 * 60, delay: EXIT + NIGHT[0], duration: NIGHT[1] - NIGHT[0], label: hm },
  // Friday, 9 am → 5 pm
  { from: 9 * 60, to: 17 * 60, delay: EXIT + 0.8, duration: 4.2, label: (v) => `${s.sheet.day.slice(0, 3)} · ${hm(v)}` },
  // Day 1 → Day 4, with the follow-up timeline
  { from: 1, to: 4, delay: EXIT + TL.from, duration: TL.to - TL.from, ease: "linear", label: (v) => `${DAY_WORD} ${Math.floor(v + 1e-6)}` },
]

function Clock({ scene, runKey, mode }) {
  const ref = useRef(null)
  const textRef = useRef(null)
  // Layout effect: the new scene's label and icon reach the screen in the same frame
  useLayoutEffect(() => {
    const el = ref.current
    const text = textRef.current
    if (!el || !text) return undefined
    const c = CLOCKS[scene]
    const show = (v) => (text.textContent = c.label(v))
    el.classList.remove("is-ticking")
    if (mode !== "play") {
      // not seen yet: the start; reduced motion: the end, where the point is made
      show(mode === "still" ? c.to : c.from)
      el.dataset.phase = mode === "still" ? "end" : "start"
      return undefined
    }
    show(c.from)
    el.dataset.phase = "start"
    const on = window.setTimeout(() => el.classList.add("is-ticking"), c.delay * 1000)
    const ctl = animate(c.from, c.to, {
      delay: c.delay,
      duration: c.duration,
      ease: c.ease || [0.42, 0, 0.3, 1],
      onUpdate: show,
      onComplete: () => {
        el.classList.remove("is-ticking")
        el.dataset.phase = "end"
      },
    })
    return () => {
      window.clearTimeout(on)
      ctl.stop()
    }
  }, [scene, runKey, mode])

  return (
    <span ref={ref} className="iw-clock" data-scene={scene} aria-hidden="true">
      <span className="iw-clock__face">
        {[0, 90, 180, 270].map((a) => (
          <i key={a} className="iw-clock__tick" style={{ "--a": `${a}deg` }} />
        ))}
        <i className="iw-clock__hand iw-clock__hand--h" />
        <i className="iw-clock__hand iw-clock__hand--m" />
        <i className="iw-clock__pin" />
      </span>
      <span className="iw-clock__time">
        {scene === 0 && (
          <>
            <Moon className="iw-clock__moon" size={12} strokeWidth={2} />
            <Sun className="iw-clock__sun" size={12} strokeWidth={2} />
          </>
        )}
        {scene === 2 && <CalendarDays size={12} strokeWidth={2} />}
        <span ref={textRef} />
      </span>
    </span>
  )
}

/* =================== Right side: what happens, step by step =================== */
const DIM = { backgroundColor: "rgba(255, 255, 255, 0.04)", borderColor: "rgba(255, 255, 255, 0.12)", color: "#7f8aa3", boxShadow: "0 0 0 0 rgba(135, 150, 255, 0)" }
const LIT = { backgroundColor: "rgba(120, 140, 255, 0.18)", borderColor: "rgba(170, 185, 255, 0.6)", color: "#e8ecff", boxShadow: "0 0 18px -2px rgba(135, 150, 255, 0.55)" }
const LIT_OUTCOME = { backgroundColor: "rgba(183, 154, 238, 0.22)", borderColor: "rgba(214, 186, 255, 0.65)", color: "#f3eaff", boxShadow: "0 0 20px -2px rgba(183, 154, 238, 0.6)" }

function Flow({ scene }) {
  const beats = BEATS[scene]
  return (
    <ol className="iw-flow">
      {s.flow[scene].map((label, k) => {
        const Icon = FLOW_ICONS[scene][k]
        const outcome = k === beats.length - 1
        return (
          <li key={label} className={`iw-flow__step ${outcome ? "is-outcome" : ""}`}>
            <m.span className="iw-flow__icon" initial={DIM} animate={outcome ? LIT_OUTCOME : LIT} transition={{ delay: beats[k], duration: 0.45 }}>
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
            </m.span>
            <m.span className="iw-flow__label" initial={{ opacity: 0.42 }} animate={{ opacity: 1 }} transition={{ delay: beats[k], duration: 0.45 }}>
              {label}
            </m.span>
            {!outcome && (
              <span className="iw-flow__line" aria-hidden="true">
                <m.i initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: beats[k] + 0.15, duration: Math.max(0.3, beats[k + 1] - beats[k] - 0.15), ease: "linear" }} />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* =================== Below: where the team's week goes =================== */
// Illustrative share of the same week (no figures shown): each moment takes a little more of it.
const CHASE = [0.4, 0.53, 0.66]
const RING_R = 50
const RING_C = 2 * Math.PI * RING_R
const RING_GAP = 4
function Balance({ scene, live }) {
  const chase = live ? CHASE[scene] : 0.26
  const a = chase * RING_C
  return (
    <figure className="iw-balance">
      <div className="iw-ring" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="iw-ring-chase" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8f6ce0" />
              <stop offset="1" stopColor="#e6a3d4" />
            </linearGradient>
            <linearGradient id="iw-ring-serve" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4f7fd8" />
              <stop offset="1" stopColor="#8ce6f0" />
            </linearGradient>
          </defs>
          <circle className="iw-ring__track" cx="60" cy="60" r={RING_R} />
          <circle
            className="iw-ring__arc iw-ring__arc--serve"
            cx="60"
            cy="60"
            r={RING_R}
            stroke="url(#iw-ring-serve)"
            style={{ strokeDasharray: `${RING_C - a - RING_GAP * 2} ${RING_C}`, strokeDashoffset: -(a + RING_GAP) }}
          />
          <circle className="iw-ring__arc iw-ring__arc--chase" cx="60" cy="60" r={RING_R} stroke="url(#iw-ring-chase)" style={{ strokeDasharray: `${a} ${RING_C}` }} />
        </svg>
        <span className="iw-ring__icon">
          <Users size={22} strokeWidth={1.8} />
        </span>
      </div>
      <figcaption className="iw-balance__text">
        <span className="iw-balance__title t-mono">{pattern.chartTitle}</span>
        <span className="iw-balance__line iw-balance__line--chase">
          <i aria-hidden="true">
            <TrendingUp size={15} strokeWidth={2.2} />
          </i>
          {s.balance.chasing}
        </span>
        <span className="iw-balance__line iw-balance__line--serve">
          <i aria-hidden="true">
            <TrendingDown size={15} strokeWidth={2.2} />
          </i>
          {s.balance.serving}
        </span>
      </figcaption>
      <p className="sr-only">{s.note}</p>
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
  // Card size tier (the side-by-side layout itself switches at 900px, in CSS)
  const wide = useMediaQuery("(min-width: 600px)")
  const scene = story.index
  // Scenes start the first time the story is actually seen, so scene 1 never plays to an empty screen
  const live = story.epoch > 0 || story.reduced
  const [w, h] = DIMS[wide ? "wide" : "narrow"][scene]
  const View = SCENE_VIEWS[scene]
  const key = `${scene}-${story.epoch}`
  const instant = story.reduced
  const sc = SCENES[scene]

  return (
    <div className="ptn">
      <header className="ptn-head">
        <div data-reveal>
          <h2 id="pattern-title" className="t-h2 ptn-h">
            {lead} <Marked text={question} phrase="slipping through?" tone="dark" />
          </h2>
        </div>
        <p className="iw-points" data-reveal>
          {pattern.chips.join(", ")}
        </p>
      </header>

      {/* The three moments in full, for screen readers; the motion shows them one at a time */}
      <ol className="sr-only">
        {SCENES.map((x, i) => (
          <li key={x.id}>
            {x.title}: {x.line} {x.support} {s.flow[i].join(", ")}.
          </li>
        ))}
      </ol>

      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <div ref={rootRef} className={`iw ${story.running ? "is-running" : ""} ${instant ? "is-reduced" : ""}`} data-scene={scene} data-reveal>
            <div className="iw-stage">
              <div className="iw-visual" aria-hidden="true">
                <span className="iw-light" />
                <div className="iw-space">
                  <span className="iw-floor" />
                  <div className="iw-tilt">
                    {/* the old scene fades out, the card changes shape, then the new scene fades in */}
                    <m.div className="iw-card" initial={false} animate={{ width: w, height: h }} transition={{ duration: instant ? 0 : 0.4, delay: instant ? 0 : EXIT - 0.04, ease: EASE }}>
                      <span className="iw-card__sheen" />
                      <AnimatePresence mode="wait" initial={false}>
                        {live && (
                          <m.div
                            key={key}
                            className="iw-layer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8, transition: { duration: instant ? 0 : EXIT } }}
                            transition={{ duration: instant ? 0 : 0.32, delay: instant ? 0 : ENTER, ease: EASE }}
                          >
                            <View wide={wide} still={instant} />
                          </m.div>
                        )}
                      </AnimatePresence>
                      <Clock scene={scene} runKey={key} mode={instant ? "still" : live ? "play" : "idle"} />
                    </m.div>
                  </div>
                </div>
              </div>

              <div className="iw-copy">
                <div className="iw-copy__head">
                  <div className="iw-kicker-slot" aria-hidden="true">
                    <AnimatePresence mode="wait" initial={false}>
                      <m.p key={scene} className="iw-kicker" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: EXIT } }} transition={t(0, 0.3)}>
                        <span>{String(scene + 1).padStart(2, "0")}</span>
                        {sc.title}
                      </m.p>
                    </AnimatePresence>
                  </div>
                  <ol ref={stepsRef} className="iw-steps" aria-label={s.stepsLabel}>
                    {SCENES.map((x, i) => (
                      <li key={x.id}>
                        <button
                          type="button"
                          className={`iw-step ${i < scene ? "is-done" : i === scene ? "is-active" : ""}`}
                          aria-label={`${i + 1} of ${SCENES.length}: ${x.title}. ${x.line}`}
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
                <div className="iw-copy__swap" aria-hidden="true">
                  <AnimatePresence mode="wait" initial={false}>
                    <m.div
                      key={key}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, transition: { duration: instant ? 0 : EXIT } }}
                      transition={{ duration: instant ? 0 : 0.35, ease: EASE }}
                    >
                      <p className="iw-line">{sc.line}</p>
                      <p className="iw-support">{sc.support}</p>
                      <Flow scene={scene} />
                    </m.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <Balance scene={scene} live={live} />
          </div>
        </MotionConfig>
      </LazyMotion>
    </div>
  )
}
