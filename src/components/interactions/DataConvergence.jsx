import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, animate, m } from "motion/react"
import { ArrowRightLeft, Sparkles, Target, Wrench } from "lucide-react"
import { dashboard, uiCopy } from "../../data/automationContent"
import { dashboardTabs } from "../../data/dashboardData"
import { serviceModules } from "../../data/serviceModules"
import PixelIcon from "../visuals/PixelIcon"
import { useMediaQuery } from "../../hooks/useMediaQuery"

/**
 * DATA → DASHBOARD → DECISIONS — one living system for the dark Dashboard chapter.
 *
 * Stage 0 (Data): one signal per engine part drifts in from the edges and runs down a thin wire
 * into a small core; each arrival lights one of the core's eight dots.
 * Stage 1 (Dashboard): the core opens (clip-path morph) into one compact dashboard. Numbers are the
 * approved ILLUSTRATIVE overview figures and say so on the panel.
 * Stage 2 (Decisions): the three approved decisions, one at a time, each lighting the part of the
 * dashboard it comes from. Then the panel closes back into the core and the loop restarts.
 *
 * Geometry (wire curves, signal positions) is measured from the real layout, so the wires always
 * end in the core at any width. Wide screens: signals on both sides, decision to the right.
 * Narrow: signals in an arc above, decision in that same band once the signals have landed.
 */
const S = uiCopy.stories.dashboard
const OV = dashboardTabs[0] // the overview tab: illustrative sample figures
const FLOW = dashboard.flow
const DECISIONS = FLOW[2].items
const DECISION_META = [
  { Icon: ArrowRightLeft, focus: "chart" },
  { Icon: Wrench, focus: "status" },
  { Icon: Target, focus: "hours" },
]
const LEAK = serviceModules.findIndex((p) => p.id === "follow-up")
const EASE = [0.22, 1, 0.36, 1]
const WIDE_Q = "(min-width: 1120px)"

// Wide layout: signal anchors as fractions of the stage (left column, right column)
const WIDE_SOURCES = [
  [0.075, 0.16],
  [0.035, 0.5],
  [0.075, 0.84],
  [0.215, 0.06],
  [0.925, 0.16],
  [0.965, 0.5],
  [0.925, 0.84],
  [0.785, 0.94],
]

function sourcePoints(geo, wide) {
  const { w, h, cx, cy } = geo
  if (wide) return WIDE_SOURCES.map(([fx, fy]) => [fx * w, fy * h])
  // Narrow: a ring around the core, inside the (still folded) panel's area
  const r = Math.min(w * 0.4, 170)
  return Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 - 67.5) * Math.PI) / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  })
}

function wirePath([sx, sy], [cx, cy], wide) {
  if (wide) {
    const dx = cx - sx
    return `M${sx} ${sy}C${sx + dx * 0.62} ${sy} ${cx - dx * 0.18} ${cy} ${cx} ${cy}`
  }
  // A gentle swirl into the core: control point turned 28° off the straight line
  const mx = (sx + cx) / 2 - cx
  const my = (sy + cy) / 2 - cy
  const t = (28 * Math.PI) / 180
  const qx = cx + mx * Math.cos(t) - my * Math.sin(t)
  const qy = cy + mx * Math.sin(t) + my * Math.cos(t)
  return `M${sx} ${sy}Q${qx} ${qy} ${cx} ${cy}`
}

/** Measures the stage and the panel's centre; re-measures on resize. */
function useGeometry(stageRef, boardRef) {
  const [geo, setGeo] = useState(null)
  useLayoutEffect(() => {
    const stage = stageRef.current
    const board = boardRef.current
    if (!stage || !board) return undefined
    const measure = () => {
      const next = {
        w: stage.clientWidth,
        h: stage.clientHeight,
        cx: board.offsetLeft + board.offsetWidth / 2,
        cy: board.offsetTop + board.offsetHeight / 2,
        bw: board.offsetWidth,
        top: board.offsetTop,
      }
      setGeo((g) => (g && Object.keys(next).every((k) => Math.abs(g[k] - next[k]) < 0.5) ? g : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    ro.observe(board)
    return () => ro.disconnect()
  }, [stageRef, boardRef])
  return geo
}

/** Counts up to `value` each time `play` turns on; shows the final value otherwise. */
function Ticker({ value, suffix = "", play, delay = 0, duration = 1.4 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const fmt = (v) => `${Math.round(v).toLocaleString("en-IN")}${suffix}`
    if (!play) {
      el.textContent = fmt(value)
      return undefined
    }
    el.textContent = fmt(0)
    const controls = animate(0, value, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (el.textContent = fmt(v)) })
    return () => controls.stop()
  }, [value, suffix, play, delay, duration])
  return <span ref={ref}>{`${value.toLocaleString("en-IN")}${suffix}`}</span>
}

function Trend({ stage, epoch, focus }) {
  // Illustrative shape only: the source gives months but no values
  const line = "M0 50C40 47 62 41 96 38S160 30 196 26S262 15 300 8"
  const area = `${line}L300 64L0 64Z`
  return (
    <div className="dc-chart dc-focusable">
      <div className="dc-chart__head">
        <span className="dc-chart__note">{S.trendNote}</span>
      </div>
      {/* Scales uniformly (no non-scaling strokes), so the path-length draw stays exact */}
      <svg className="dc-chart__svg" viewBox="0 0 300 64" aria-hidden="true">
        <defs>
          <linearGradient id="dc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#87baff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#87baff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dc-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8ce6f0" />
            <stop offset="0.45" stopColor="#87baff" />
            <stop offset="0.8" stopColor="#b79aee" />
            <stop offset="1" stopColor="#f0bedf" />
          </linearGradient>
        </defs>
        {[16, 32, 48].map((y) => (
          <line key={y} className="dc-chart__grid" x1="0" x2="300" y1={y} y2={y} />
        ))}
        <m.path key={`a${epoch}`} d={area} fill="url(#dc-area)" initial={{ opacity: 0 }} animate={{ opacity: stage >= 1 ? 1 : 0 }} transition={{ delay: stage >= 1 ? 1.7 : 0, duration: 0.7 }} />
        <m.path
          key={`l${epoch}`}
          d={line}
          className="dc-chart__line"
          stroke="url(#dc-line)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: stage >= 1 ? 1 : 0 }}
          transition={{ delay: stage >= 1 ? 0.75 : 0, duration: 1.2, ease: "easeInOut" }}
        />
        {/* next month's target, shown with the third decision */}
        <line className={`dc-chart__target ${focus === "hours" ? "is-on" : ""}`} x1="0" x2="300" y1="3" y2="3" />
        {/* the latest point, pulsing with the first decision */}
        <g className={`dc-chart__end ${focus === "chart" ? "is-on" : ""}`}>
          <circle className="dc-chart__ping" cx="300" cy="8" r="4.5" />
          <circle className="dc-chart__dot" cx="300" cy="8" r="4" />
        </g>
      </svg>
      <div className="dc-chart__months" aria-hidden="true">
        {OV.trend.months.map((mo) => (
          <span key={mo}>{mo}</span>
        ))}
      </div>
    </div>
  )
}

export default function DataConvergence({ stage, decision, onDecision, running, reduced, epoch }) {
  const stageRef = useRef(null)
  const boardRef = useRef(null)
  const geo = useGeometry(stageRef, boardRef)
  const wide = useMediaQuery(WIDE_Q)
  const focus = stage === 2 ? DECISION_META[decision].focus : null
  const counting = stage === 1 && !reduced
  const points = geo ? sourcePoints(geo, wide) : []
  const hub = geo ? [geo.cx, geo.cy] : [0, 0]

  // Where the decision card sits: right of the panel (wide) or in the band above it (narrow)
  const cardStyle = geo
    ? wide
      ? { left: geo.cx + geo.bw / 2 + 44, width: Math.min(300, geo.w - (geo.cx + geo.bw / 2 + 44)), top: geo.cy }
      : { left: 0, right: 0, top: geo.top / 2 - 6 }
    : undefined

  return (
    <div
      ref={stageRef}
      className={`dc-stage ${running ? "is-running" : ""}`}
      data-stage={stage}
      data-focus={focus || undefined}
      data-layout={wide ? "wide" : "narrow"}
    >
      {/* Wires and signals */}
      {geo && (
        <svg className="dc-wires" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="dc-spec" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={geo.w} y2={geo.h}>
              <stop offset="0" stopColor="#8ce6f0" />
              <stop offset="0.35" stopColor="#87baff" />
              <stop offset="0.68" stopColor="#b79aee" />
              <stop offset="1" stopColor="#f0bedf" />
            </linearGradient>
          </defs>
          {points.map((p, i) => {
            const d = wirePath(p, hub, wide)
            return (
              <g key={i} style={{ "--i": i }}>
                <m.path
                  key={`w${epoch}`}
                  d={d}
                  className="dc-wire"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.9, ease: "easeInOut" }}
                />
                {stage === 0 && <path key={`c${epoch}`} d={d} pathLength="1" className="dc-comet" stroke="url(#dc-spec)" style={{ "--delay": `${0.9 + i * 0.17}s` }} />}
                {stage === 1 && i % 2 === 0 && <path d={d} pathLength="1" className="dc-comet dc-comet--live" stroke="url(#dc-spec)" style={{ "--delay": `${0.4 + i * 0.55}s` }} />}
              </g>
            )
          })}
          {wide && stage === 2 && (
            <path
              className="dc-link"
              d={`M${geo.cx + geo.bw / 2} ${geo.cy}H${geo.cx + geo.bw / 2 + 44}`}
              stroke="url(#dc-spec)"
            />
          )}
        </svg>
      )}

      {geo &&
        points.map(([x, y], i) => {
          const part = serviceModules[i]
          // drift in from outside, along the line away from the core
          const len = Math.hypot(x - geo.cx, y - geo.cy) || 1
          const ox = ((x - geo.cx) / len) * 18
          const oy = ((y - geo.cy) / len) * 18
          return (
            <div key={part.id} className="dc-signal-pos" style={{ left: x, top: y }}>
              <m.span
                key={`s${epoch}`}
                className="dc-signal"
                title={part.part}
                initial={{ opacity: 0, x: ox, y: oy, scale: 0.8 }}
                animate={{ opacity: stage === 0 ? 1 : stage === 1 ? 0.42 : 0.16, x: 0, y: 0, scale: 1 }}
                transition={{ delay: stage === 0 ? 0.05 + i * 0.06 : 0, duration: 0.6, ease: EASE }}
              >
                <PixelIcon name={part.icon} size={16} />
              </m.span>
            </div>
          )
        })}

      {/* The core that opens into the dashboard */}
      <div ref={boardRef} className="dc-board" role="group" aria-label={dashboard.header.title}>
        <div className="dc-board__glow" aria-hidden="true" />
        <div className="dc-board__ui">
          <div className="dc-board__content">
            <header className="dc-head">
              <span className="dc-head__dot" aria-hidden="true" />
              <span className="dc-head__title">{dashboard.header.title}</span>
              <span className="dc-head__period">{dashboard.header.period}</span>
              <span className="dc-head__badge">{dashboard.header.note}</span>
            </header>

            <div className="dc-hours dc-focusable">
              <span className="dc-label">{OV.main.label}</span>
              <div className="dc-hours__row">
                <span className="dc-hours__value">
                  <Ticker key={`h${epoch}`} value={OV.main.value} suffix={OV.main.suffix} play={counting} delay={0.5} />
                </span>
                <span className="dc-hours__delta">{OV.main.delta}</span>
              </div>
            </div>

            <div className="dc-stats">
              {OV.stats.slice(0, 2).map((st, i) => (
                <div key={st.label} className="dc-stat">
                  <span className="dc-stat__value">
                    <Ticker key={`s${i}${epoch}`} value={st.value} play={counting} delay={0.65 + i * 0.12} />
                  </span>
                  <span className="dc-stat__label">{st.label}</span>
                </div>
              ))}
            </div>

            <Trend stage={stage} epoch={epoch} focus={focus} />

            <div className="dc-status dc-focusable">
              <ol className="dc-status__parts">
                {serviceModules.map((p, i) => (
                  <li
                    key={p.id}
                    className={`dc-status__part ${focus === "status" && i === LEAK ? "is-leak" : ""}`}
                    style={{ "--i": i }}
                    title={p.part}
                  >
                    <span className="sr-only">{p.part}</span>
                  </li>
                ))}
              </ol>
              <span className="dc-status__label">{S.statusLabel}</span>
            </div>
          </div>
        </div>

        {/* Stage 0: the core, with one dot per part */}
        <div className="dc-core" aria-hidden="true">
          <span className="dc-core__orb">
            <Sparkles size={20} strokeWidth={1.8} />
          </span>
          {serviceModules.map((p, i) => (
            <span key={`${p.id}${epoch}`} className="dc-core__dot" style={{ "--a": `${i * 45 - 90}deg`, "--delay": `${1.75 + i * 0.17}s` }} />
          ))}
        </div>
      </div>

      {/* Stage 2: one decision at a time */}
      <div className="dc-decision-pos" style={cardStyle}>
        <AnimatePresence mode="wait">
          {stage === 2 && (
            <m.div
              key={decision}
              className="dc-decision"
              initial={{ opacity: 0, x: wide ? -14 : 0, y: wide ? 0 : 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: wide ? 10 : 0, y: wide ? 0 : -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span className="dc-decision__icon" aria-hidden="true">
                {React.createElement(DECISION_META[decision].Icon, { size: 18, strokeWidth: 2 })}
              </span>
              <span className="dc-decision__body">
                <span className="dc-decision__label">
                  {S.decisionLabel} · {decision + 1} {S.decisionOf} {DECISIONS.length}
                </span>
                <span className="dc-decision__text">{DECISIONS[decision]}</span>
              </span>
            </m.div>
          )}
        </AnimatePresence>
        {stage === 2 && (
          <div className="dc-decision__dots">
            {DECISIONS.map((d, i) => (
              <button
                key={d}
                type="button"
                className={`dc-dot ${i === decision ? "is-on" : ""}`}
                aria-label={`${S.decisionLabel} ${i + 1}: ${d}`}
                aria-pressed={i === decision}
                onClick={() => onDecision(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
