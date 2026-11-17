import React, { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, m } from "motion/react"
import { Bell, CalendarCheck, Check, Clock, Heart, Mail, MessageCircle, Moon, StickyNote, UserPlus, Users } from "lucide-react"
import { uiCopy } from "../../data/automationContent"
import { P, bar, bubblePath, cylinder, face, floorCircle, planeMatrix, prism } from "../visuals/isoKit"

/**
 * TWO ROOMS — premium 2.5D isometric workspaces for "Two types of businesses".
 *
 * Same business, same extruded platform, same object slots in both rooms, so every stage compares
 * like for like:
 *   back (phone / chat channel) · left (email inbox / email channel) · right corner (clock / bookings)
 *   centre (the person / the AI core) · right (paper stack / dashboard) · front-left (task cards / person)
 *
 * Objects are real extrusions (isoKit): lit top faces, shaded side walls, rounded edges with a rim
 * light, contact shadows. No 3D library and no blur filters: depth comes from geometry, gradients and
 * radial shadows. Words that must stay readable are HTML chips laid over the SVG at scene points.
 *
 * `phase` 0–4 follows comparison.rows; each phase mounts its own short sequence (setup → action →
 * outcome) and persistent objects tween between states, so looping never snaps. Idle loops (clock,
 * core float, pipe flow, orbit) are CSS/SMIL and pause with the story (`running`).
 */

const VIEW = { x: 28, y: 70, w: 464, h: 316 } // keep in sync with .rx-scene aspect-ratio
const VIEWBOX = `${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`
const pct = ([x, y]) => ({ left: `${((x - VIEW.x) / VIEW.w) * 100}%`, top: `${((y - VIEW.y) / VIEW.h) * 100}%` })
const EASE = [0.22, 1, 0.36, 1]
const copy = uiCopy.stories.compare.scene

/* ------------------------------------------------------------------ static geometry */

const PLAT = prism({ at: P(0, 0, 0), w: 220, h: 220, r: 26, depth: 20, seg: 10 })
const PLAT_INSET = face("floor", P(0, 0, 0), 12, 12, 196, 196, 18, 8)
const DOTS_MATRIX = planeMatrix("floor", P(0, 0, 0))

// Shared anchor points (screen)
const CENTER = P(110, 110, 0) // [260, 238]
// Slots: nothing tall sits straight behind the centre, so the hub never hides a channel
const INBOX_TOP = P(40, 178, 18) // left corner: tray / email channel
const PHONE_TOP = P(40, 100, 6) // back-left: phone / chat channel
const CORNER_TOP = P(182, 38, 16) // right corner: clock / bookings channel
const SPHERE = [CENTER[0], CENTER[1] - 66]
const MONITOR_C = P(122, 52, 45) // back-right: paper stack / dashboard
const FRONT_PERSON = P(120, 182, 0) // front-left

// Room 1
const PHONE = prism({ at: P(24, 74, 6), w: 32, h: 52, r: 7, depth: 6 })
const PHONE_SCREEN = face("floor", P(24, 74, 6), 3, 4, 26, 44, 5)
const PHONE_ROW = face("floor", P(24, 74, 6), 6, 10, 20, 8, 3)
const TRAY = prism({ at: P(9, 153, 18), w: 62, h: 50, r: 10, depth: 18 })
const TRAY_CAVITY = face("floor", P(9, 153, 18), 6, 6, 50, 38, 6)
const ENVELOPES = [0, 1].map((i) => prism({ plane: "wallL", at: P(16 + i * 4, 167 + i * 12, 38 - i * 5), w: 42, h: 27, r: 2, depth: 1.5 }))
const CRADLE = prism({ at: P(173, 29, 7), w: 18, h: 18, r: 5, depth: 7 })
const CLOCK_C = [CORNER_TOP[0], CORNER_TOP[1] - 16]
const SHEET_JITTER = [
  [0, 0],
  [2, -2],
  [-2, 1],
  [3, 2],
  [-1, -3],
  [2, 1],
  [-3, 0],
  [1, 3],
  [-2, -1],
  [3, -2],
]
const SHEETS = SHEET_JITTER.map(([du, dv], i) => prism({ at: P(88 + du, 14 + dv, 2.7 * (i + 1)), w: 48, h: 60, r: 3, depth: 2.3 }))
const CARD_OFFSETS = [
  [0, 0],
  [8, -6],
  [-6, 8],
  [10, 4],
  [2, 12],
  [12, -8],
]
const CARDS = CARD_OFFSETS.map(([du, dv], i) => prism({ at: P(156 + du, 105 + dv, 2.4 * (i + 1)), w: 44, h: 30, r: 4, depth: 2 }))
const NOTE_C = [334, 140]

// Room 2
const PEDESTALS = {
  chat: { u: 20, v: 80, Icon: MessageCircle },
  email: { u: 20, v: 158, Icon: Mail },
  calendar: { u: 162, v: 18, Icon: CalendarCheck },
}
for (const p of Object.values(PEDESTALS)) {
  p.base = prism({ at: P(p.u, p.v, 13), w: 40, h: 40, r: 10, depth: 13 })
  p.tile = prism({ at: P(p.u + 8, p.v + 8, 16), w: 24, h: 24, r: 7, depth: 3 })
  p.iconMatrix = planeMatrix("floor", P(p.u + 12, p.v + 12, 16))
  p.glow = floorCircle(p.u + 20, p.v + 20, 13, 27)
  p.top = P(p.u + 20, p.v + 20, 16)
  p.foot = P(p.u + 20, p.v + 20, 0)
}
const CORE_BASE = cylinder(110, 110, 30, 9)
const CORE_GLOW = floorCircle(110, 110, 0, 54)
const MONITOR = prism({ plane: "wallL", at: P(92, 52, 70), w: 60, h: 50, r: 6, depth: 5 })
const MONITOR_SCREEN_M = planeMatrix("wallL", P(92, 52, 70))
const MONITOR_STAND = prism({ at: P(114, 46, 5), w: 18, h: 12, r: 3, depth: 5 })
const MONITOR_NECK = prism({ plane: "wallL", at: P(121, 52, 21), w: 4, h: 16, r: 1, depth: 2 })
const MONITOR_FOOT = P(123, 52, 0)
const BARS = [0, 1, 2, 3].map((i) => ({ u: 148 + i * 16, v: 116 }))
const BAR_H = [18, 28, 40, 54]
const pipe = (from) => `M${from[0].toFixed(1)} ${from[1].toFixed(1)}L${CENTER[0]} ${CENTER[1]}`
const PIPES = {
  chat: pipe(PEDESTALS.chat.foot),
  email: pipe(PEDESTALS.email.foot),
  calendar: pipe(PEDESTALS.calendar.foot),
  monitor: pipe(MONITOR_FOOT),
}
// Orbit around the core sphere: a tilted ellipse, drawn in two halves around the sphere
const ORBIT = { rx: 42, ry: 12, rot: -14 }
const orbitPoint = (deg) => {
  const a = (deg * Math.PI) / 180
  const r = (ORBIT.rot * Math.PI) / 180
  const x = ORBIT.rx * Math.cos(a)
  const y = ORBIT.ry * Math.sin(a)
  return [SPHERE[0] + x * Math.cos(r) - y * Math.sin(r), SPHERE[1] + x * Math.sin(r) + y * Math.cos(r)]
}
const arc = (from, to, sweep) => {
  const [x1, y1] = orbitPoint(from)
  const [x2, y2] = orbitPoint(to)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${ORBIT.rx} ${ORBIT.ry} ${ORBIT.rot} 0 ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}
const ORBIT_BACK = arc(180, 360, 1)
const ORBIT_FRONT = arc(0, 180, 1)
const ORBIT_LOOP = `${arc(0, 180, 1)}${arc(180, 360, 1).replace(/^M[^A]+/, "")}`
const TIMELINE = { y: 112, xs: [190, 260, 330] }

/* ------------------------------------------------------------------ palettes */

const MANUAL = {
  top: ["#f6f5f2", "#e9e6e0"],
  inset: ["#f1efea", "#e4e0d8"],
  side: ["#e0ddd6", "#d3cfc7", "#c6c1b8", "#b8b2a8"],
  objTop: ["#ffffff", "#ebe7df"],
  objSide: ["#d9d3c8", "#bdb5a8"],
  body: ["#6b707d", "#454a56", "#2c3039"],
  head: ["#efe8dd", "#b9ad9b"],
  dot: "rgba(70, 64, 54, 0.12)",
}
const AUTO = {
  top: ["#ffffff", "#eef0fb"],
  inset: ["#fbfbff", "#eceffc"],
  side: ["#e6e9f8", "#d9ddf3", "#c9cfee", "#b6bde6"],
  objTop: ["#ffffff", "#eef0fa"],
  objSide: ["#dfe3f6", "#bcc3e6"],
  body: ["#5c6396", "#3c4277", "#262a52"],
  head: ["#f4f5fb", "#c3c9e3"],
  dot: "rgba(74, 115, 255, 0.14)",
}
const SPEC = ["#3cc8ea", "#4a73ff", "#7a4cf2", "#cf4aa6"]

/* ------------------------------------------------------------------ shared drawing */

function Defs({ uid, auto }) {
  const c = auto ? AUTO : MANUAL
  const lin = (id, stops, [x1, y1, x2, y2] = [0, 0, 0, 1]) => (
    <linearGradient id={`${uid}-${id}`} x1={x1} y1={y1} x2={x2} y2={y2}>
      {stops.map(([o, col, op = 1]) => (
        <stop key={o} offset={o} stopColor={col} stopOpacity={op} />
      ))}
    </linearGradient>
  )
  return (
    <defs>
      <radialGradient id={`${uid}-sh`}>
        <stop offset="0" stopColor="#151827" stopOpacity="0.34" />
        <stop offset="0.5" stopColor="#151827" stopOpacity="0.13" />
        <stop offset="1" stopColor="#151827" stopOpacity="0" />
      </radialGradient>
      {lin("pt", [
        [0, c.top[0]],
        [1, c.top[1]],
      ])}
      {lin(
        "pi",
        [
          [0, c.inset[0]],
          [1, c.inset[1]],
        ],
        [0, 0, 1, 1]
      )}
      {lin(
        "ps",
        [
          [0, c.side[0]],
          [0.497, c.side[1]],
          [0.503, c.side[2]],
          [1, c.side[3]],
        ],
        [0, 0, 1, 0]
      )}
      {lin("ot", [
        [0, c.objTop[0]],
        [1, c.objTop[1]],
      ])}
      {lin(
        "os",
        [
          [0, c.objSide[0]],
          [1, c.objSide[1]],
        ],
        [0, 0, 1, 0]
      )}
      {lin(
        "pb",
        [
          [0, c.body[0]],
          [0.55, c.body[1]],
          [1, c.body[2]],
        ],
        [0, 0, 1, 0]
      )}
      <radialGradient id={`${uid}-ph`} cx="0.36" cy="0.3" r="0.8">
        <stop offset="0" stopColor={c.head[0]} />
        <stop offset="1" stopColor={c.head[1]} />
      </radialGradient>
      <pattern id={`${uid}-dots`} width="11" height="11" patternUnits="userSpaceOnUse" patternTransform={DOTS_MATRIX}>
        <circle cx="5.5" cy="5.5" r="0.9" fill={c.dot} />
      </pattern>
      <linearGradient id={`${uid}-spec`} gradientUnits="userSpaceOnUse" x1="40" y1="110" x2="480" y2="360">
        {SPEC.map((col, i) => (
          <stop key={col} offset={i / 3} stopColor={col} />
        ))}
      </linearGradient>
      {lin("moon", [
        [0, "#fbf8ee"],
        [0.6, "#dfe0ea"],
        [1, "#aab0c6"],
      ], [0, 0, 1, 1])}
      {auto ? (
        <>
          {lin(
            "vivid",
            SPEC.map((col, i) => [i / 3, col]),
            [0, 0, 1, 1]
          )}
          {lin(
            "vside",
            [
              [0, "#3a5bd9"],
              [1, "#5b2fbf"],
            ],
            [0, 0, 1, 0]
          )}
          <radialGradient id={`${uid}-orb`} cx="0.34" cy="0.28" r="0.85">
            <stop offset="0" stopColor="#e6fbff" />
            <stop offset="0.22" stopColor="#5fd6f2" />
            <stop offset="0.52" stopColor="#4a73ff" />
            <stop offset="0.8" stopColor="#7a4cf2" />
            <stop offset="1" stopColor="#c8489f" />
          </radialGradient>
          <radialGradient id={`${uid}-glass`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="0.92" stopColor="#b9c6ff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.75" />
          </radialGradient>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0" stopColor="#7a4cf2" stopOpacity="0.42" />
            <stop offset="0.45" stopColor="#4a73ff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#4a73ff" stopOpacity="0" />
          </radialGradient>
          {lin("screen", [
            [0, "#fbfcff"],
            [1, "#eef1ff"],
          ])}
        </>
      ) : (
        <>
          <radialGradient id={`${uid}-coral`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#ffb3a8" />
            <stop offset="0.55" stopColor="#ec6b5f" />
            <stop offset="1" stopColor="#c8473f" />
          </radialGradient>
          {lin(
            "amber",
            [
              [0, "#fbe2a0"],
              [1, "#f0b44a"],
            ],
            [0, 0, 1, 1]
          )}
          {lin(
            "screen",
            [
              [0, "#4a505e"],
              [1, "#262a33"],
            ],
            [0, 0, 1, 1]
          )}
          <radialGradient id={`${uid}-dial`} cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ece8e1" />
          </radialGradient>
        </>
      )}
    </defs>
  )
}

function Platform({ uid, auto }) {
  return (
    <g>
      <ellipse cx={CENTER[0]} cy="362" rx="246" ry="24" fill={`url(#${uid}-sh)`} />
      <path d={PLAT.body} fill={`url(#${uid}-ps)`} />
      <path d={PLAT.face} fill={`url(#${uid}-pt)`} />
      <path d={PLAT_INSET} fill={`url(#${uid}-pi)`} className="rx3-inset" />
      <path d={PLAT_INSET} fill={`url(#${uid}-dots)`} />
      <path d={PLAT.front} className={auto ? "rx3-rim rx3-rim--auto" : "rx3-rim"} stroke={auto ? `url(#${uid}-spec)` : undefined} />
    </g>
  )
}

/** Soft contact shadow on the floor under a point, radius in world units. */
function Shadow({ uid, at, r = 14, o = 1 }) {
  const [cx, cy] = at
  return <ellipse cx={cx} cy={cy} rx={r * 1.414} ry={r * 0.707} fill={`url(#${uid}-sh)`} opacity={o} />
}

/** An extruded object: side walls, lit top, rim light on the front edges. */
function Solid({ uid, shape, top, side, rim = true }) {
  return (
    <g>
      <path d={shape.body} fill={side || `url(#${uid}-os)`} />
      <path d={shape.face} fill={top || `url(#${uid}-ot)`} />
      {rim && <path d={shape.front} className="rx3-edge" />}
    </g>
  )
}

/** A minimal professional figure: shaded capsule body, lapel, sphere head. Base at screen point. */
function Person({ uid, at: [x, y] }) {
  const rx = 16
  const ry = 8
  const H = 28
  const dome = 12
  return (
    <g>
      <Shadow uid={uid} at={[x, y + 1]} r={17} />
      <path
        d={`M${x - rx} ${y - H}L${x - rx} ${y}A${rx} ${ry} 0 0 0 ${x + rx} ${y}L${x + rx} ${y - H}A${rx} ${dome} 0 0 0 ${x - rx} ${y - H}Z`}
        fill={`url(#${uid}-pb)`}
      />
      <path d={`M${x - 6} ${y - H - 10}L${x} ${y - H + 4}L${x + 6} ${y - H - 10}`} className="rx3-lapel" />
      <ellipse cx={x - 6} cy={y - H - 4} rx="6" ry="3.4" className="rx3-sheen" />
      <circle cx={x} cy={y - H - dome - 12} r="10" fill={`url(#${uid}-ph)`} className="rx3-head" />
      <ellipse cx={x - 3.4} cy={y - H - dome - 15.5} rx="3.6" ry="2.4" className="rx3-sheen" />
    </g>
  )
}

/** A camera-facing 3D speech bubble, anchored at its tail tip. */
function Bubble({ uid, at: [x, y], w = 36, h = 24, tone = "neutral", lines = true, check = false }) {
  const bx = x - 8
  const by = y - h - 7
  return (
    <g className={`rx3-bubble rx3-bubble--${tone}`}>
      <path d={bubblePath(bx + 2.2, by + 2.8, w, h)} className="rx3-bubble__side" />
      <path d={bubblePath(bx, by, w, h)} className="rx3-bubble__face" fill={tone === "reply" ? `url(#${uid}-vivid)` : undefined} />
      {lines && (
        <>
          <rect x={bx + 7} y={by + 7} width={w - (check ? 22 : 14)} height="2.6" rx="1.3" className="rx3-bubble__line" />
          <rect x={bx + 7} y={by + 13} width={w - (check ? 26 : 20)} height="2.6" rx="1.3" className="rx3-bubble__line" />
        </>
      )}
      {check && <path d={`M${bx + w - 13} ${by + 12}l3 3l5.5 -6`} className="rx3-bubble__check" />}
    </g>
  )
}

/** A camera-facing card with thickness (document, invoice, task). Centre at screen point. */
function Card({ at: [x, y], w = 20, h = 25, tone = "paper" }) {
  return (
    <g className={`rx3-card rx3-card--${tone}`}>
      <rect x={x - w / 2 + 1.8} y={y - h / 2 + 2.2} width={w} height={h} rx="3" className="rx3-card__side" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="3" className="rx3-card__face" />
      <rect x={x - w / 2 + 4} y={y - h / 2 + 5} width={w - 8} height="2.2" rx="1.1" className="rx3-card__line" />
      <rect x={x - w / 2 + 4} y={y - h / 2 + 10} width={w - 11} height="2.2" rx="1.1" className="rx3-card__line" />
      <rect x={x - w / 2 + 4} y={y - h / 2 + 15} width={w - 9} height="2.2" rx="1.1" className="rx3-card__line" />
    </g>
  )
}

/** A dimensional check coin. */
function Coin({ uid, at: [x, y], r = 8 }) {
  return (
    <g>
      <circle cx={x} cy={y + 2.2} r={r} fill={`url(#${uid}-vside)`} />
      <circle cx={x} cy={y} r={r} fill={`url(#${uid}-vivid)`} />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.45} rx={r * 0.45} ry={r * 0.25} className="rx3-sheen" />
      <path d={`M${x - r * 0.42} ${y + 0.3}l${r * 0.3} ${r * 0.3}l${r * 0.55} -${r * 0.6}`} className="rx3-coin__check" />
    </g>
  )
}

/** A coral count sphere (unread items). */
function Count({ uid, at: [x, y], n, delay }) {
  if (!n) return null
  return (
    <g transform={`translate(${x} ${y})`}>
      <m.g key={n} initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay, type: "spring", stiffness: 480, damping: 20 }}>
        <circle r="9" cy="1.6" className="rx3-count__side" />
        <circle r="9" fill={`url(#${uid}-coral)`} />
        <text y="3.6" className="rx3-count__n">
          {n}
        </text>
      </m.g>
    </g>
  )
}

/** Something arriving from above: falls in with its shadow growing beneath it. */
function Arrive({ uid, to: [x, y], floor, delay = 0, dur = 0.9, sink = true, children }) {
  return (
    <>
      {floor && (
        <m.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.9, 0] }} transition={{ delay, duration: dur + 0.5, times: [0, 0.6, 0.85, 1] }}>
          <Shadow uid={uid} at={floor} r={10} />
        </m.g>
      )}
      <m.g
        initial={{ opacity: 0, x: -34, y: -74 }}
        animate={
          sink
            ? { opacity: [0, 1, 1, 1, 0], x: [-34, 0, 0, 0, 0], y: [-74, 0, 0, 0, 10], scale: [0.85, 1, 1, 1, 0.55] }
            : { opacity: [0, 1], x: [-34, 0], y: [-74, 0], scale: [0.85, 1] }
        }
        transition={sink ? { delay, duration: dur + 0.5, times: [0, 0.6, 0.66, 0.82, 1], ease: "easeOut" } : { delay, duration: dur, ease: EASE }}
      >
        <g transform={`translate(${x} ${y})`}>{children}</g>
      </m.g>
    </>
  )
}

/** Moves its children from one screen point to another (with fade in/out). */
function Travel({ from: [x1, y1], to: [x2, y2], delay = 0, dur = 0.8, scaleTo = 1, keep = false, children }) {
  return (
    <m.g
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: keep ? [0, 1, 1, 1] : [0, 1, 1, 0],
        x: [0, 0, x2 - x1, x2 - x1],
        y: [0, 0, y2 - y1, y2 - y1],
        scale: [1, 1, scaleTo, scaleTo],
      }}
      transition={{ delay, duration: dur + 0.3, times: [0, 0.12, 0.88, 1], ease: "easeInOut" }}
    >
      <g transform={`translate(${x1} ${y1})`}>{children}</g>
    </m.g>
  )
}

/** Pops in on a spring at a point. */
function Pop({ at: [x, y], delay = 0, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <m.g initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, type: "spring", stiffness: 420, damping: 19 }}>
        {children}
      </m.g>
    </g>
  )
}

/** A bright dash that runs once along a floor pipe (CSS, so it pauses with the story). */
function Comet({ d, uid, delay = 0, dur = 0.7 }) {
  return <path className="rx-comet" d={d} pathLength="1" stroke={`url(#${uid}-spec)`} style={{ "--delay": `${delay}s`, "--dur": `${dur}s` }} />
}

function NightSky({ uid, on }) {
  return (
    <m.g className="rx-night" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.6 }}>
      <circle cx="72" cy="104" r="22" className="rx3-moon__halo" />
      <circle cx="72" cy="104" r="13" fill={`url(#${uid}-moon)`} />
      <circle cx="77" cy="99" r="11" className="rx3-moon__shade" />
      <circle className="rx-night__star" cx="116" cy="86" r="1.4" />
      <circle className="rx-night__star" cx="148" cy="112" r="1" />
      <circle className="rx-night__star" cx="44" cy="134" r="1.2" />
    </m.g>
  )
}

/** HTML text chip over the SVG, anchored bottom-centre, left-middle or right-middle at a point. */
function Chip({ at, delay = 0, tone = "auto", icon: Icon, align = "center", rot = 0, fadeTo, children }) {
  const enter = { opacity: 1, y: 0, scale: 1 }
  return (
    <div className={`rx-chip-pos rx-chip-pos--${align}`} style={pct(at)}>
      <m.div
        className={`rx-chip rx-chip--${tone}`}
        style={{ rotate: rot }}
        initial={{ opacity: 0, y: 8, scale: 0.94 }}
        animate={fadeTo ? { ...enter, opacity: [0, 1, 1, fadeTo.opacity] } : enter}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
        transition={fadeTo ? { delay, duration: fadeTo.at, times: [0, 0.18, 0.75, 1], ease: EASE } : { delay, duration: 0.45, ease: EASE }}
      >
        {Icon && <Icon size={13} strokeWidth={2.2} aria-hidden="true" />}
        <span>{children}</span>
      </m.div>
    </div>
  )
}

/** One chip whose words step through a sequence: Replied → Qualified → Booked. */
function ChipSequence({ at, start, step, items, icon: Icon }) {
  const [i, setI] = useState(-1)
  const count = items.length
  // Scheduled once per mount (the phase remounts this), never restarted by a parent re-render
  useEffect(() => {
    const ids = Array.from({ length: count }, (_, k) => window.setTimeout(() => setI(k), (start + k * step) * 1000))
    return () => ids.forEach(window.clearTimeout)
  }, [count, start, step])
  return (
    <div className="rx-chip-pos" style={pct(at)}>
      <AnimatePresence>
        {i >= 0 && (
          <m.div
            className="rx-chip rx-chip--auto rx-chip--seq"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <Icon size={13} strokeWidth={2.4} aria-hidden="true" />
            <AnimatePresence mode="wait" initial={false}>
              <m.span key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.12 }}>
                {items[i]}
              </m.span>
            </AnimatePresence>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ Room 1: the manual grind */

const M_SHEETS = [2, 2, 3, 7, 10]
const M_CARDS = [2, 2, 3, 4, 6]
const M_TRAY = [1, 1, 1, 2, 4]
const M_PHONE = [0, 1, 1, 1, 3]

function Phone({ uid, lit }) {
  return (
    <g>
      <Shadow uid={uid} at={P(40, 100, 0)} r={26} o={0.8} />
      <Solid uid={uid} shape={PHONE} />
      <path d={PHONE_SCREEN} fill={`url(#${uid}-screen)`} />
      <m.path d={PHONE_ROW} className="rx3-phone__row" initial={false} animate={{ opacity: lit ? 1 : 0 }} transition={{ duration: 0.4 }} />
    </g>
  )
}

function Inbox({ uid }) {
  return (
    <g>
      <Shadow uid={uid} at={P(40, 178, 0)} r={38} o={0.85} />
      <path d={TRAY.body} fill={`url(#${uid}-os)`} />
      <path d={TRAY.face} fill={`url(#${uid}-ot)`} />
      <path d={TRAY_CAVITY} className="rx3-cavity" />
      {ENVELOPES.map((e, i) => (
        <g key={i}>
          <path d={e.body} className="rx3-envelope__side" />
          <path d={e.face} className="rx3-envelope" />
          <path d="M0 0L21 13L42 0" transform={e.matrix} className="rx3-envelope__flap" />
        </g>
      ))}
      {/* front walls redrawn over the envelopes, so they sit inside the tray */}
      <path d={TRAY.walls} fill={`url(#${uid}-os)`} fillRule="evenodd" />
      <path d={TRAY.front} className="rx3-edge" />
    </g>
  )
}

function DeskClock({ uid, fast, waiting }) {
  const [cx, cy] = CLOCK_C
  return (
    <g>
      <Shadow uid={uid} at={P(182, 40, 0)} r={22} o={0.8} />
      <Solid uid={uid} shape={CRADLE} />
      <circle cx={cx + 3.5} cy={cy + 2.5} r="22" className="rx3-clock__back" />
      <circle cx={cx} cy={cy} r="22" fill={`url(#${uid}-dial)`} className="rx3-clock__face" />
      <ellipse cx={cx - 8} cy={cy - 10} rx="7" ry="4" className="rx3-sheen" />
      <m.circle
        cx={cx}
        cy={cy}
        r="18"
        className="rx3-clock__wait"
        initial={false}
        animate={{ opacity: waiting ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x={cx - 0.9} y={cy - 19} width="1.8" height="3.6" className="rx3-clock__tick" transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <g transform={`translate(${cx} ${cy})`} className={`rx-clock ${fast ? "is-fast" : ""}`}>
        <g className="rx-clock__boost">
          <rect className="rx-clock__hand rx-clock__hand--m" x="-1.1" y="-15" width="2.2" height="15" rx="1.1" />
        </g>
        <rect className="rx-clock__hand rx-clock__hand--h" x="-1.3" y="-10" width="2.6" height="10" rx="1.3" />
        <circle className="rx-clock__pin" r="2.4" />
      </g>
    </g>
  )
}

function PaperStack({ uid, count, phase, live }) {
  const prev = M_SHEETS[(phase + M_SHEETS.length - 1) % M_SHEETS.length]
  return (
    <g>
      <Shadow uid={uid} at={P(112, 44, 0)} r={42} o={0.75} />
      <AnimatePresence>
        {SHEETS.slice(0, count).map((s, i) => (
          <m.g
            key={i}
            initial={{ opacity: 0, y: -26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.35 } }}
            transition={{ delay: live && i >= prev ? 0.45 + (i - prev) * 0.75 : 0, duration: 0.5, ease: EASE }}
          >
            <path d={s.body} className="rx3-sheet__side" />
            <path d={s.face} className={`rx3-sheet ${i % 3 === 1 ? "rx3-sheet--grid" : ""}`} />
            {i === count - 1 && (
              <g transform={s.matrix} className="rx3-sheet__print">
                <rect x="8" y="9" width="32" height="2.6" rx="1.3" />
                <rect x="8" y="16" width="26" height="2.6" rx="1.3" />
                <rect x="8" y="23" width="29" height="2.6" rx="1.3" />
              </g>
            )}
          </m.g>
        ))}
      </AnimatePresence>
    </g>
  )
}

function TaskCards({ uid, count, phase, live }) {
  const prev = M_CARDS[(phase + M_CARDS.length - 1) % M_CARDS.length]
  return (
    <g>
      <Shadow uid={uid} at={P(180, 120, 0)} r={32} o={0.6} />
      <AnimatePresence>
        {CARDS.slice(0, count).map((c, i) => (
          <m.g
            key={i}
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            transition={{ delay: live && i >= prev ? 1.2 + (i - prev) * 0.6 : 0, duration: 0.45, ease: EASE }}
          >
            <path d={c.body} className="rx3-sheet__side" />
            <path d={c.face} className="rx3-taskcard" />
            <g transform={c.matrix}>
              <rect x="6" y="8" width="8" height="8" rx="1.8" className="rx3-taskcard__box" />
              <rect x="18" y="8.5" width="19" height="2.4" rx="1.2" className="rx3-taskcard__line" />
              <rect x="18" y="14" width="13" height="2.4" rx="1.2" className="rx3-taskcard__line" />
            </g>
          </m.g>
        ))}
      </AnimatePresence>
    </g>
  )
}

function ReminderNote({ uid }) {
  const [x, y] = NOTE_C
  return (
    <m.g initial={{ opacity: 0, y: 10, scale: 0.7 }} animate={{ opacity: [0, 1, 1, 0.55], y: [10, 0, 0, 4], scale: [0.7, 1, 1, 0.96] }} transition={{ delay: 0.6, duration: 2.6, times: [0, 0.18, 0.7, 1], ease: "easeOut" }}>
      <rect x={x - 19} y={y - 17} width="40" height="36" rx="6" className="rx3-note__side" transform="translate(2.4 3)" />
      <rect x={x - 19} y={y - 17} width="40" height="36" rx="6" fill={`url(#${uid}-amber)`} />
      <ellipse cx={x - 9} cy={y - 11} rx="7" ry="3" className="rx3-sheen" />
      <Bell x={x - 8.5} y={y - 8} width={18} height={18} strokeWidth={2} className="rx3-note__icon" aria-hidden="true" />
      {/* pending ring that stalls part-way */}
      <circle cx={x + 21} cy={y - 17} r="7.5" className="rx3-pending__track" />
      <m.circle
        cx={x + 21}
        cy={y - 17}
        r="7.5"
        className="rx3-pending__arc"
        transform={`rotate(-90 ${x + 21} ${y - 17})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 0.32 }}
        transition={{ delay: 1, duration: 1.1, ease: "easeOut" }}
      />
      <Pop at={[x + 21, y - 17]} delay={2.5}>
        <circle r="5.5" fill={`url(#${uid}-coral)`} />
        <rect x="-0.9" y="-3.2" width="1.8" height="4" rx="0.9" className="rx3-missed" />
        <circle cy="2.6" r="0.95" className="rx3-missed" />
      </Pop>
    </m.g>
  )
}

function ManualActors({ uid, phase }) {
  const bubble = <Bubble uid={uid} at={[0, 0]} tone="neutral" />
  switch (phase) {
    case 0:
      return (
        <>
          {/* the enquiry lands in one of the inboxes… */}
          <Arrive uid={uid} to={[INBOX_TOP[0], INBOX_TOP[1] - 8]} floor={P(40, 178, 0)} delay={0.2}>
            {bubble}
          </Arrive>
          {/* …and waits: a slow amber pulse around the tray */}
          <m.ellipse
            {...floorCircle(40, 178, 18, 34)}
            className="rx3-wait-ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.35, 0.9, 0.35] }}
            transition={{ delay: 1.6, duration: 3, ease: "easeInOut" }}
          />
        </>
      )
    case 1:
      return (
        <>
          {/* after hours: it lands on the phone, waits all night, and by morning has gone elsewhere */}
          <m.g
            initial={{ opacity: 0, x: -34, y: -74 }}
            animate={{ opacity: [0, 1, 1, 1, 0], x: [-34, 0, 0, 0, -150], y: [-74, 0, 0, 0, -40] }}
            transition={{ delay: 0.6, duration: 4, times: [0, 0.22, 0.6, 0.68, 1], ease: "easeInOut" }}
          >
            <g transform={`translate(${PHONE_TOP[0]} ${PHONE_TOP[1] - 20})`}>{bubble}</g>
          </m.g>
        </>
      )
    case 2:
      return (
        <>
          <Pop at={[CENTER[0] + 30, CENTER[1] - 86]} delay={0.3}>
            <circle cx="-14" cy="20" r="2.6" className="rx3-thought" />
            <circle cx="-8" cy="11" r="4" className="rx3-thought" />
            <circle r="11" className="rx3-thought" />
            <text y="5" className="rx3-thought__q">
              ?
            </text>
          </Pop>
          <ReminderNote uid={uid} />
        </>
      )
    case 3:
      return null
    case 4:
      return (
        <>
          {[P(120, 188, 0), P(184, 186, 0)].map((at, i) => (
            <m.g key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.5, type: "spring", stiffness: 220, damping: 20 }}>
              <Person uid={uid} at={at} />
            </m.g>
          ))}
          {[0, 1].map((i) => (
            <Pop key={i} at={[PHONE_TOP[0] - 12 + i * 28, PHONE_TOP[1] - 34 - i * 14]} delay={1.6 + i * 0.5}>
              <Bubble uid={uid} at={[0, 0]} w={30} h={20} tone="neutral" />
            </Pop>
          ))}
        </>
      )
    default:
      return null
  }
}

function manualChips(phase) {
  switch (phase) {
    case 0:
      return (
        <Chip at={[INBOX_TOP[0], INBOX_TOP[1] - 40]} delay={1.9} tone="warn" icon={Clock}>
          {copy.waiting}
        </Chip>
      )
    case 1:
      return (
        <Chip at={[PHONE_TOP[0] + 28, PHONE_TOP[1] - 40]} align="left" delay={1.7} tone="warn" icon={Moon}>
          {copy.tillMorning}
        </Chip>
      )
    case 2:
      return (
        <Chip at={[NOTE_C[0] + 30, NOTE_C[1] + 12]} align="left" delay={1.2} tone="note" icon={StickyNote} rot={-3} fadeTo={{ opacity: 0.4, at: 2.8 }}>
          {copy.followUp}
        </Chip>
      )
    case 4:
      return (
        <Chip at={[CENTER[0] - 50, CENTER[1] + 8]} delay={1.4} tone="warn" icon={UserPlus}>
          {copy.hiring}
        </Chip>
      )
    default:
      return null
  }
}

export function ManualScene({ phase, verdict, live, running }) {
  const uid = `rxm${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const night = phase === 1
  const shuttle = phase === 3 && live
  return (
    <div className={`rx-scene rx-scene--manual ${verdict ? "is-verdict" : ""} ${running ? "" : "is-paused"}`}>
      <svg className="rx-svg" viewBox={VIEWBOX} aria-hidden="true" focusable="false">
        <Defs uid={uid} />
        <Platform uid={uid} />
        <Phone uid={uid} lit={phase >= 1} />
        <Count uid={uid} at={[PHONE_TOP[0] + 20, PHONE_TOP[1] - 16]} n={M_PHONE[phase]} delay={live ? (phase === 1 ? 1.5 : 1.2) : 0} />
        <Inbox uid={uid} />
        <Count uid={uid} at={[INBOX_TOP[0] + 30, INBOX_TOP[1] - 16]} n={M_TRAY[phase]} delay={live ? (phase === 0 ? 1.4 : 1.2) : 0} />
        <DeskClock uid={uid} fast={phase === 1 || phase === 3} waiting={phase === 1} />
        {/* drawn before the person, who walks in front of it on admin day */}
        <PaperStack uid={uid} count={M_SHEETS[phase]} phase={phase} live={live} />
        {/* the person in the middle of everything; gone home after hours; carrying paper on admin day */}
        <m.g initial={false} animate={{ opacity: night ? 0 : 1, y: night ? 6 : 0 }} transition={{ duration: 0.55 }}>
          <m.g
            key={shuttle ? "shuttle" : "still"}
            initial={{ x: 0, y: 0 }}
            animate={shuttle ? { x: [0, -64, 32, -64, 32, 0], y: [0, -5, -2, -5, -2, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 4.3, ease: "easeInOut", delay: 0.2 }}
          >
            <Person uid={uid} at={CENTER} />
            {phase === 3 && (
              <m.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Card at={[CENTER[0] + 2, CENTER[1] - 86]} w={18} h={22} />
              </m.g>
            )}
          </m.g>
        </m.g>
        <TaskCards uid={uid} count={M_CARDS[phase]} phase={phase} live={live} />
        <NightSky uid={uid} on={night} />
        <AnimatePresence>
          {live && (
            <m.g key={phase} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <ManualActors uid={uid} phase={phase} />
            </m.g>
          )}
        </AnimatePresence>
      </svg>
      <AnimatePresence>
        {live && (
          <div key={phase} className="rx-chips">
            {manualChips(phase)}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ Room 2: the automated business */

const A_LEVEL = [0, 1, 2, 3, 4]

function Pipes({ uid }) {
  return (
    <g>
      {Object.entries(PIPES).map(([k, d]) => (
        <g key={k}>
          <path d={d} className="rx3-pipe" />
          <path d={d} className="rx3-pipe__core" stroke={`url(#${uid}-spec)`} />
          <path d={d} className="rx3-pipe__flow" stroke={`url(#${uid}-spec)`} />
        </g>
      ))}
    </g>
  )
}

function Pedestal({ uid, p, lit }) {
  const Icon = p.Icon
  return (
    <g>
      <Shadow uid={uid} at={p.foot} r={31} o={0.75} />
      <m.ellipse {...p.glow} fill={`url(#${uid}-glow)`} initial={false} animate={{ opacity: lit ? 1 : 0 }} transition={{ duration: 0.4 }} />
      <Solid uid={uid} shape={p.base} />
      <path d={p.tile.body} fill={`url(#${uid}-vside)`} />
      <path d={p.tile.face} fill={`url(#${uid}-vivid)`} />
      <path d={p.tile.front} className="rx3-edge rx3-edge--soft" />
      <g transform={p.iconMatrix}>
        <Icon x={0} y={0} width={16} height={16} strokeWidth={2.2} className="rx3-tile__icon" aria-hidden="true" />
      </g>
    </g>
  )
}

function Core({ uid, pulse, busy }) {
  return (
    <g>
      <ellipse {...CORE_GLOW} fill={`url(#${uid}-glow)`} />
      <ellipse {...floorCircle(110, 110, 0, 46)} className="rx3-core__ring" stroke={`url(#${uid}-spec)`} />
      <path d={CORE_BASE.body} fill={`url(#${uid}-os)`} />
      <ellipse {...CORE_BASE.top} fill={`url(#${uid}-ot)`} />
      <ellipse {...CORE_BASE.top} className="rx3-core__lip" stroke={`url(#${uid}-spec)`} />
      <ellipse cx={SPHERE[0]} cy={CORE_BASE.top.cy} rx="21" ry="8.5" fill={`url(#${uid}-sh)`} className="rx3-core__shadow" />
      <g className="rx3-core__float">
        <m.g key={pulse} initial={{ scale: 1 }} animate={{ scale: pulse ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ originX: "50%", originY: "50%" }}>
          <path d={ORBIT_BACK} className={`rx3-orbit rx3-orbit--back ${busy ? "is-busy" : ""}`} stroke={`url(#${uid}-spec)`} />
          <circle cx={SPHERE[0]} cy={SPHERE[1]} r="28" fill={`url(#${uid}-glass)`} />
          <circle cx={SPHERE[0]} cy={SPHERE[1]} r="19" fill={`url(#${uid}-orb)`} />
          <ellipse cx={SPHERE[0] - 7} cy={SPHERE[1] - 9} rx="7" ry="4.2" className="rx3-sheen rx3-sheen--strong" transform={`rotate(-25 ${SPHERE[0] - 7} ${SPHERE[1] - 9})`} />
          <circle cx={SPHERE[0]} cy={SPHERE[1]} r="28" className="rx3-glass__rim" />
          <path d={ORBIT_FRONT} className="rx3-orbit" stroke={`url(#${uid}-spec)`} />
          {[0, 1].map((k) => (
            <circle key={k} r="3.6" className={`rx3-sat rx3-sat--${k}`}>
              {/* constant speed: changing a SMIL duration mid-loop would make the satellites jump */}
              <animateMotion dur="5s" begin={`${-k * 2.5}s`} repeatCount="indefinite" path={ORBIT_LOOP} />
              {/* dimmed while passing behind the sphere */}
              <animate attributeName="opacity" dur="5s" begin={`${-k * 2.5}s`} repeatCount="indefinite" values="1;1;0.15;0.15;1" keyTimes="0;0.47;0.53;0.97;1" />
            </circle>
          ))}
        </m.g>
      </g>
    </g>
  )
}

function Monitor({ uid, level, grow }) {
  const hs = [11, 17, 15, 24].map((h, i) => Math.max(3, Math.round(h * (0.35 + level * 0.17) + (grow ? i * 1.5 : 0))))
  return (
    <g>
      <Shadow uid={uid} at={MONITOR_FOOT} r={26} o={0.8} />
      <Solid uid={uid} shape={MONITOR_STAND} />
      <Solid uid={uid} shape={MONITOR_NECK} rim={false} />
      <path d={MONITOR.body} fill={`url(#${uid}-os)`} />
      <path d={MONITOR.face} fill={`url(#${uid}-ot)`} />
      <g transform={MONITOR_SCREEN_M}>
        <rect x="4" y="4" width="52" height="42" rx="4" fill={`url(#${uid}-screen)`} className="rx3-screen" />
        <circle cx="9" cy="9" r="1.5" className="rx3-screen__dot" />
        <circle cx="13.5" cy="9" r="1.5" className="rx3-screen__dot" />
        {hs.map((h, i) => (
          <m.rect
            key={i}
            x={10 + i * 11}
            width="7.5"
            rx="1.5"
            fill={`url(#${uid}-vivid)`}
            initial={false}
            animate={{ height: h, attrY: 40 - h }}
            transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 120, damping: 18 }}
          />
        ))}
        {grow && (
          <>
            <m.path
              d="M10 31L21 25L32 27L43 15L51 10"
              className="rx3-screen__trend"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 0.9, ease: "easeInOut" }}
            />
            <m.path d="M45 10L51 10L51 16" className="rx3-screen__trend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.3 }} />
          </>
        )}
      </g>
      <path d={MONITOR.front} className="rx3-edge" />
    </g>
  )
}

function GrowthBars({ uid, on }) {
  return (
    <g>
      {BARS.map((b, i) => {
        const h = on ? BAR_H[i] : 0.01
        const g = bar(b.u, b.v, 12, h)
        return (
          <m.g key={i} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.4, delay: on ? 0.5 + i * 0.12 : 0 }}>
            <Shadow uid={uid} at={P(b.u + 6, b.v + 6, 0)} r={11} o={0.7} />
            <m.path d={g.right} initial={false} animate={{ d: g.right }} transition={{ delay: on ? 0.55 + i * 0.12 : 0, duration: 0.8, ease: EASE }} className={`rx3-bar rx3-bar--r${i}`} />
            <m.path d={g.left} initial={false} animate={{ d: g.left }} transition={{ delay: on ? 0.55 + i * 0.12 : 0, duration: 0.8, ease: EASE }} className={`rx3-bar rx3-bar--l${i}`} />
            <m.path d={g.top} initial={false} animate={{ d: g.top }} transition={{ delay: on ? 0.55 + i * 0.12 : 0, duration: 0.8, ease: EASE }} className={`rx3-bar rx3-bar--t${i}`} />
          </m.g>
        )
      })}
    </g>
  )
}

function Timeline({ uid }) {
  const { y, xs } = TIMELINE
  return (
    <m.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
      <rect x={xs[0] - 4} y={y - 3} width={xs[2] - xs[0] + 8} height="8" rx="4" className="rx3-track__side" transform="translate(1.5 2.4)" />
      <rect x={xs[0] - 4} y={y - 3} width={xs[2] - xs[0] + 8} height="8" rx="4" className="rx3-track" />
      <m.rect
        x={xs[0] - 4}
        y={y - 3}
        height="8"
        rx="4"
        fill={`url(#${uid}-vivid)`}
        initial={{ width: 0 }}
        animate={{ width: xs[2] - xs[0] + 8 }}
        transition={{ delay: 0.7, duration: 2.1, ease: "easeInOut" }}
      />
      {xs.map((x) => (
        <g key={x}>
          <circle cx={x} cy={y + 3.2} r="10" className="rx3-node__side" />
          <circle cx={x} cy={y + 1} r="10" className="rx3-node" />
        </g>
      ))}
      {/* a scheduled message travelling Day 1 → Day 3 → Day 7 */}
      <m.g
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: [0, 1, 1, 1, 0], x: [0, 0, xs[1] - xs[0], xs[2] - xs[0], xs[2] - xs[0]] }}
        transition={{ delay: 0.55, duration: 2.4, times: [0, 0.08, 0.45, 0.9, 1], ease: "easeInOut" }}
      >
        <circle cx={xs[0]} cy={y - 15} r="5" fill={`url(#${uid}-vivid)`} />
        <ellipse cx={xs[0] - 1.6} cy={y - 16.8} rx="1.8" ry="1.1" className="rx3-sheen rx3-sheen--strong" />
      </m.g>
      {xs.map((x, i) => (
        <Pop key={x} at={[x, y + 1]} delay={0.75 + i * 1.05}>
          <Coin uid={uid} at={[0, 0]} r={10} />
        </Pop>
      ))}
    </m.g>
  )
}

function AutoActors({ uid, phase }) {
  const reply = <Bubble uid={uid} at={[0, 0]} tone="reply" check />
  switch (phase) {
    case 0:
      return (
        <>
          <Arrive uid={uid} to={[PEDESTALS.email.top[0], PEDESTALS.email.top[1] - 8]} floor={PEDESTALS.email.foot} delay={0.2}>
            <Bubble uid={uid} at={[0, 0]} tone="neutral" />
          </Arrive>
          <Comet d={PIPES.email} uid={uid} delay={1.35} dur={0.6} />
          <Travel from={[SPHERE[0] + 6, SPHERE[1] - 6]} to={[SPHERE[0] + 28, SPHERE[1] - 48]} delay={2} dur={0.6} keep>
            {reply}
          </Travel>
        </>
      )
    case 1:
      return (
        <>
          <Arrive uid={uid} to={[PEDESTALS.chat.top[0], PEDESTALS.chat.top[1] - 8]} floor={PEDESTALS.chat.foot} delay={0.6}>
            <Bubble uid={uid} at={[0, 0]} tone="neutral" />
          </Arrive>
          <Comet d={PIPES.chat} uid={uid} delay={1.75} dur={0.55} />
          {/* booked: the bookings channel confirms */}
          <Comet d={`M${CENTER[0]} ${CENTER[1]}L${PEDESTALS.calendar.foot[0]} ${PEDESTALS.calendar.foot[1]}`} uid={uid} delay={3.3} dur={0.55} />
          <Pop at={[PEDESTALS.calendar.top[0], PEDESTALS.calendar.top[1] - 24]} delay={3.85}>
            <Coin uid={uid} at={[0, 0]} r={9} />
          </Pop>
        </>
      )
    case 2:
      return (
        <>
          <Timeline uid={uid} />
          <Arrive uid={uid} to={[TIMELINE.xs[2] + 22, TIMELINE.y - 8]} delay={2.6} sink={false}>
            <Bubble uid={uid} at={[0, 0]} w={30} h={20} tone="neutral" />
          </Arrive>
        </>
      )
    case 3:
      return (
        <>
          {[0, 1, 2].map((i) => (
            <Travel key={`in${i}`} from={[INBOX_TOP[0], INBOX_TOP[1] - 22]} to={[SPHERE[0], SPHERE[1]]} delay={0.3 + i * 0.6} dur={0.75} scaleTo={0.35}>
              <Card at={[0, 0]} w={17} h={21} tone={i === 1 ? "invoice" : "paper"} />
            </Travel>
          ))}
          {[0, 1, 2].map((i) => (
            <Travel key={`out${i}`} from={[SPHERE[0], SPHERE[1]]} to={[MONITOR_C[0] + 2, MONITOR_C[1] - 6]} delay={1.15 + i * 0.6} dur={0.6} scaleTo={0.4}>
              <Coin uid={uid} at={[0, 0]} r={7} />
            </Travel>
          ))}
          <Comet d={PIPES.monitor} uid={uid} delay={1.2} dur={0.6} />
          <Comet d={PIPES.monitor} uid={uid} delay={1.8} dur={0.6} />
          <Comet d={PIPES.monitor} uid={uid} delay={2.4} dur={0.6} />
          <Pop at={[MONITOR_C[0] + 30, MONITOR_C[1] - 38]} delay={3.1}>
            <Coin uid={uid} at={[0, 0]} r={9} />
          </Pop>
        </>
      )
    case 4:
      return (
        <>
          {Object.values(PIPES).map((d, i) => (
            <Comet key={`a${i}`} d={d} uid={uid} delay={0.2 + i * 0.22} dur={0.65} />
          ))}
          {Object.values(PIPES).map((d, i) => (
            <Comet key={`b${i}`} d={d} uid={uid} delay={1.7 + i * 0.2} dur={0.65} />
          ))}
        </>
      )
    default:
      return null
  }
}

function autoChips(phase) {
  const above = [SPHERE[0], SPHERE[1] - 38]
  switch (phase) {
    case 0:
      return (
        <Chip at={[SPHERE[0] + 74, SPHERE[1] - 58]} align="left" delay={2.4} icon={Check}>
          {copy.replied}
        </Chip>
      )
    case 1:
      return (
        <>
          <Chip at={[SPHERE[0] - 36, SPHERE[1] - 32]} align="right" delay={0.9} tone="soft" icon={Clock}>
            {copy.allHours}
          </Chip>
          <ChipSequence at={above} start={2.2} step={0.8} items={[copy.replied, copy.qualified, copy.booked]} icon={Check} />
        </>
      )
    case 2:
      return (
        <>
          {[copy.day1, copy.day3, copy.day7].map((d, i) => (
            <Chip key={d} at={[TIMELINE.xs[i], TIMELINE.y - 14]} delay={0.15 + i * 0.1} tone="quiet">
              {d}
            </Chip>
          ))}
          <Chip at={[TIMELINE.xs[2] + 54, TIMELINE.y - 22]} align="left" delay={3.1} icon={Check}>
            {copy.replied}
          </Chip>
        </>
      )
    case 3:
      return (
        <Chip at={[FRONT_PERSON[0] - 24, FRONT_PERSON[1] + 2]} align="right" delay={1.2} tone="soft" icon={Heart}>
          {copy.customers}
        </Chip>
      )
    case 4:
      return (
        <Chip at={[FRONT_PERSON[0], FRONT_PERSON[1] - 76]} delay={1.4} icon={Users}>
          {copy.sameTeam}
        </Chip>
      )
    default:
      return null
  }
}

// When the core lights up in each phase (seconds), to sync its pulse with arrivals
const CORE_PULSE = [1.95, 2.3, 0, 1.05, 0.9]

export function AutoScene({ phase, verdict, live, running }) {
  const uid = `rxa${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const svgRef = useRef(null)
  const night = phase === 1
  const [pulse, setPulse] = useState(0)

  // SMIL orbit pauses with the story (CSS loops pause through the class below)
  useEffect(() => {
    const svg = svgRef.current
    if (!svg?.pauseAnimations) return
    if (running) svg.unpauseAnimations()
    else svg.pauseAnimations()
  }, [running])

  // The core answers each arrival with one pulse, timed per phase
  useEffect(() => {
    if (!live || !CORE_PULSE[phase]) return undefined
    const id = window.setTimeout(() => setPulse((p) => p + 1), CORE_PULSE[phase] * 1000)
    return () => window.clearTimeout(id)
  }, [phase, live])

  const lit = { email: phase === 0 || phase === 3, chat: phase === 1, calendar: phase === 1 }
  return (
    <div className={`rx-scene rx-scene--auto ${verdict ? "is-verdict" : ""} ${running ? "" : "is-paused"}`}>
      <svg ref={svgRef} className="rx-svg" viewBox={VIEWBOX} aria-hidden="true" focusable="false">
        <Defs uid={uid} auto />
        <Platform uid={uid} auto />
        <Pipes uid={uid} />
        <Pedestal uid={uid} p={PEDESTALS.chat} lit={live && lit.chat} />
        <Pedestal uid={uid} p={PEDESTALS.email} lit={live && lit.email} />
        <Pedestal uid={uid} p={PEDESTALS.calendar} lit={live && lit.calendar} />
        <Core uid={uid} pulse={pulse} busy={live && (phase === 1 || phase === 3)} />
        <Monitor uid={uid} level={A_LEVEL[phase]} grow={phase === 4} />
        <m.g initial={false} animate={{ opacity: night ? 0 : 1, y: night ? 6 : 0 }} transition={{ duration: 0.55 }}>
          <Person uid={uid} at={FRONT_PERSON} />
        </m.g>
        <GrowthBars uid={uid} on={phase === 4} />
        <NightSky uid={uid} on={night} />
        <AnimatePresence>
          {live && (
            <m.g key={phase} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <AutoActors uid={uid} phase={phase} />
            </m.g>
          )}
        </AnimatePresence>
      </svg>
      <AnimatePresence>
        {live && (
          <div key={phase} className="rx-chips">
            {autoChips(phase)}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
