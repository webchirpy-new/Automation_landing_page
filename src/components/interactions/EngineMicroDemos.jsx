import React from "react"
import { m } from "motion/react"
import { Bell, Check, Contact, CreditCard, FileText, Globe, Heart, Mail, MessageCircle, Phone, Receipt, Send, Sparkles, Star, Table2, Zap } from "lucide-react"
import { automationDemos } from "../../data/automationDemos"
import { moduleById } from "../../data/serviceModules"

/**
 * ENGINE MICRO-DEMOS — one ~2 s visual per part of the engine, shown inside the engine's core.
 * Each demo plays once when it mounts (the engine remounts it per part) and ends on its result
 * state, so a paused engine always shows a finished, readable frame.
 *
 * Strings are the existing illustrative examples from data/automationDemos.js and the step labels
 * in data/serviceModules.js — nothing new is claimed here.
 */
const EASE = [0.22, 1, 0.36, 1]
const pop = (delay) => ({ initial: { opacity: 0, scale: 0.4 }, animate: { opacity: 1, scale: 1 }, transition: { delay, type: "spring", stiffness: 520, damping: 22 } })
const rise = (delay, y = 8) => ({ initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4, ease: EASE } })

function Ok({ delay, size = 11 }) {
  return (
    <m.span className="md-ok" {...pop(delay)}>
      <Check size={size} strokeWidth={3} aria-hidden="true" />
    </m.span>
  )
}

/* 01 · Lead Capture: four channels drop into one tagged list */
function LeadCapture() {
  const d = automationDemos["lead-capture"]
  const icons = [MessageCircle, Globe, Mail, Phone]
  const widths = [72, 58, 66, 48]
  return (
    <div className="md md--leads">
      <div className="md-leads__src">
        {icons.map((Icon, i) => (
          <m.span
            key={i}
            className="md-chan"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: [0, 1, 1, 0.45], x: [-10, 0, 0, 0] }}
            transition={{ delay: 0.1 + i * 0.26, duration: 1.1, times: [0, 0.25, 0.6, 1] }}
          >
            <Icon size={13} strokeWidth={2} aria-hidden="true" />
          </m.span>
        ))}
      </div>
      <div className="md-flow" aria-hidden="true">
        <m.span className="md-flow__line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.5 }} />
      </div>
      <div className="md-card md-list">
        <span className="md-card__title">{d.title}</span>
        {icons.map((Icon, i) => (
          <m.div key={i} className="md-row" {...rise(0.35 + i * 0.26, 0)} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
            <span className="md-row__src">
              <Icon size={10} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="md-bar" style={{ width: `${widths[i]}%` }} />
            <Ok delay={0.55 + i * 0.26} size={9} />
          </m.div>
        ))}
      </div>
    </div>
  )
}

/* 02 · Instant Reply: a question at 9:40 pm, answered in the same minute */
function InstantReply() {
  const d = automationDemos["instant-reply"]
  const ask = d.items[0]
  const answer = d.items.find((x) => x.type === "out")
  return (
    <div className="md md--chat">
      <m.div className="md-bubble md-bubble--in" {...rise(0.1)}>
        {ask.text}
        <span className="md-time">{ask.time}</span>
      </m.div>
      <div className="md-reply-slot">
        <m.span
          className="md-typing"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 0.55, duration: 0.75, times: [0, 0.15, 0.8, 1] }}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </m.span>
        <m.div className="md-bubble md-bubble--out" {...rise(1.25)}>
          {answer.text.split(". ")[0]}.
          <span className="md-time">
            <Zap size={10} strokeWidth={2.4} aria-hidden="true" /> {answer.time}
          </span>
        </m.div>
      </div>
    </div>
  )
}

/* 03 · Operations: one order moves itself through its stages */
function Operations() {
  const d = automationDemos.operations
  return (
    <div className="md md--ops">
      <m.div className="md-ops__order" {...rise(0.05)}>
        <span className="md-ops__id">{d.order.id}</span>
        <span>{d.assign.text}</span>
      </m.div>
      <div className="md-ops__track">
        <span className="md-ops__rail" />
        <m.span className="md-ops__fill" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.45, duration: 1.5, ease: "easeInOut" }} />
        {d.stages.map((s, i) => (
          <div key={s.label} className="md-ops__stage" style={{ "--x": `${i * 50}%` }}>
            <span className="md-ops__dot">
              <Ok delay={0.45 + i * 0.75} size={10} />
            </span>
            <span className="md-ops__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* 04 · Back Office: entered once, filled everywhere */
function BackOffice() {
  const d = automationDemos["back-office"]
  const icons = { sheets: Table2, crm: Contact, invoice: Receipt }
  return (
    <div className="md md--sync">
      <m.div className="md-card md-sync__src" {...rise(0.05)}>
        <span className="md-card__title">
          <FileText size={11} strokeWidth={2.2} aria-hidden="true" /> {d.source.title}
        </span>
        {d.source.fields.map(([k, v]) => (
          <span key={k} className="md-sync__field">
            <span>{k}</span>
            <b>{v}</b>
          </span>
        ))}
      </m.div>
      <svg className="md-sync__wires" viewBox="0 0 40 120" preserveAspectRatio="none" aria-hidden="true">
        {[20, 60, 100].map((y, i) => (
          <m.path
            key={y}
            d={`M0 60C20 60 20 ${y} 40 ${y}`}
            className="md-sync__wire"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.45 + i * 0.3, duration: 0.45, ease: "easeOut" }}
          />
        ))}
      </svg>
      <div className="md-sync__targets">
        {d.targets.map((t, i) => {
          const Icon = icons[t.tool] || FileText
          return (
            <m.div key={t.title} className="md-sync__t" initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 + i * 0.3, duration: 0.3 }}>
              <Icon size={12} strokeWidth={2.2} aria-hidden="true" />
              <span>{t.title}</span>
              <Ok delay={0.85 + i * 0.3} size={9} />
            </m.div>
          )
        })}
      </div>
    </div>
  )
}

/* 05 · Follow-up: Day 1, Day 3 … until the customer replies */
function FollowUp() {
  const steps = moduleById["follow-up"].steps
  const reply = automationDemos["follow-up"].items.find((x) => x.type === "in" && x.text.startsWith("Yes"))
  return (
    <div className="md md--follow">
      <div className="md-tl">
        <span className="md-tl__rail" />
        <m.span className="md-tl__fill" initial={{ scaleX: 0 }} animate={{ scaleX: 0.5 }} transition={{ delay: 0.3, duration: 0.9, ease: "easeInOut" }} />
        <m.span
          className="md-tl__send"
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: ["0%", "0%", "50%", "50%"], opacity: [0, 1, 1, 0] }}
          transition={{ delay: 0.2, duration: 1.2, times: [0, 0.15, 0.85, 1], ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Send size={10} strokeWidth={2.4} />
        </m.span>
        {steps.map((s, i) => (
          <div key={s} className={`md-tl__step ${i === 2 ? "is-stopped" : ""}`} style={{ "--x": `${i * 50}%` }}>
            <span className="md-tl__node">{i < 2 ? <Ok delay={0.3 + i * 0.9} size={9} /> : null}</span>
            <span className="md-tl__label">{s}</span>
          </div>
        ))}
      </div>
      <m.div className="md-bubble md-bubble--in md-bubble--reply" {...rise(1.55)}>
        {reply.text}
      </m.div>
    </div>
  )
}

/* 06 · Sales Pipeline: one deal walks New → Won */
function SalesPipeline() {
  const cols = moduleById["sales-pipeline"].steps
  const deal = automationDemos["sales-pipeline"].deal
  const n = cols.length
  return (
    <div className="md md--pipe">
      <div className="md-pipe__cols">
        {cols.map((c, i) => (
          <div key={c} className={`md-pipe__col ${i === n - 1 ? "is-won" : ""}`}>
            <span className="md-pipe__label">{c}</span>
            <span className="md-pipe__ghost" />
          </div>
        ))}
      </div>
      <m.div
        className="md-pipe__deal"
        initial={{ left: "0%" }}
        animate={{ left: cols.map((_, i) => `${(i * 100) / n}%`) }}
        transition={{ delay: 0.3, duration: 1.8, ease: "easeInOut" }}
      >
        <span className="md-pipe__avatar">{deal.name.split(" ").map((w) => w[0]).join("")}</span>
        <span className="md-bar" />
      </m.div>
      <m.span className="md-pipe__won" {...pop(2.05)}>
        <Check size={11} strokeWidth={3} aria-hidden="true" />
      </m.span>
    </div>
  )
}

/* 07 · Retention: the reminder loop that brings a customer back */
function Retention() {
  const steps = moduleById.retention.steps
  const icons = [Bell, CreditCard, Star]
  return (
    <div className="md md--loop">
      <div className="md-loop">
        <svg viewBox="0 0 100 100" className="md-loop__svg" aria-hidden="true">
          <circle cx="50" cy="50" r="38" className="md-loop__ring" />
          <m.circle
            cx="50"
            cy="50"
            r="38"
            className="md-loop__done"
            transform="rotate(-90 50 50)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 1.9, ease: "easeInOut" }}
          />
        </svg>
        {icons.map((Icon, i) => (
          <m.span
            key={i}
            className="md-loop__station"
            style={{ "--a": `${i * 120 - 90}deg` }}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.6, duration: 0.3 }}
          >
            <Icon size={11} strokeWidth={2.2} aria-hidden="true" />
          </m.span>
        ))}
        {/* the customer, back again */}
        <m.span className="md-loop__who" {...pop(1.9)} aria-hidden="true">
          <Heart size={16} strokeWidth={2.2} fill="currentColor" />
        </m.span>
      </div>
      <ul className="md-checks">
        {steps.map((s, i) => (
          <m.li key={s} {...rise(0.25 + i * 0.6, 4)}>
            <Ok delay={0.4 + i * 0.6} size={9} />
            {s}
          </m.li>
        ))}
      </ul>
    </div>
  )
}

/* 08 · Insights: scattered numbers settle into one clear chart and a summary */
function Insights() {
  const bars = [34, 48, 42, 63, 82]
  const summary = moduleById.insights.steps[2]
  const dots = [
    [8, 20],
    [22, 62],
    [36, 14],
    [50, 48],
    [64, 26],
    [78, 70],
    [90, 36],
    [16, 84],
    [58, 80],
  ]
  return (
    <div className="md md--insights">
      <div className="md-ins__plot">
        {dots.map(([x, y], i) => (
          <m.span
            key={i}
            className="md-ins__dot"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 0.3, y: 20 }}
            transition={{ delay: 0.35 + (i % 4) * 0.08, duration: 0.6, ease: "easeIn" }}
          />
        ))}
        {bars.map((h, i) => (
          <m.span
            key={i}
            className="md-ins__bar"
            style={{ left: `${8 + i * 19}%`, height: `${h}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.75 + i * 0.1, duration: 0.55, ease: EASE }}
          />
        ))}
        <svg className="md-ins__trend" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <m.path
            d="M12 70L31 56L50 62L69 40L88 20"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.35, duration: 0.6, ease: "easeInOut" }}
          />
        </svg>
      </div>
      <m.div className="md-ins__chip" {...rise(1.75)}>
        <Sparkles size={11} strokeWidth={2.2} aria-hidden="true" />
        {summary}
      </m.div>
    </div>
  )
}

const DEMOS = {
  "lead-capture": LeadCapture,
  "instant-reply": InstantReply,
  operations: Operations,
  "back-office": BackOffice,
  "follow-up": FollowUp,
  "sales-pipeline": SalesPipeline,
  retention: Retention,
  insights: Insights,
}

export default function EngineMicroDemo({ id }) {
  const Demo = DEMOS[id]
  return Demo ? <Demo /> : null
}
