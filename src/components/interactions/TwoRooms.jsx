import React, { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, animate, m } from "motion/react"
import {
  BellOff,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCheck,
  Clock,
  FileSpreadsheet,
  Heart,
  Hourglass,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  PenLine,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react"
import { siWhatsapp } from "simple-icons"
import { uiCopy } from "../../data/automationContent"
import { P, bar, cylinder, face, floorCircle, planeMatrix, prism } from "../visuals/isoKit"

/**
 * TWO ROOMS — premium 2.5D isometric workspaces for "Two types of businesses".
 *
 * Same business, same extruded platform, same object slots in both rooms, so every stage compares
 * like for like:
 *   back (phone / chat channel) · left (email inbox / email channel) · right corner (clock / bookings)
 *   centre (the person / the AI core) · right (paper stack / dashboard) · front-left (task cards / person)
 *
 * Each stage is one short film, played in both rooms from the same clock (`runKey`):
 *   1. the SAME customer situation arrives in both rooms (a WhatsApp message card, same words);
 *   2. the manual room handles it by hand — it lands in one inbox, waits, gets forgotten, piles up;
 *   3. the automated room handles it — captured by the core, answered, scheduled, done;
 *   4. both outcomes stay on screen, labelled, until the next stage.
 * The persistent 3D objects (isoKit extrusions) carry state between stages; the story itself is a
 * layer of readable HTML cards and labels laid over the SVG at scene points, each following timed
 * `stops` (appear → hold → move → leave). Changing `runKey` remounts the whole layer, so a stage
 * picked again replays from its start and no earlier timer can leak into it.
 * Idle loops (clock, core float, pipe flow, orbit) are CSS/SMIL and pause with the story (`running`).
 */

// Extra headroom above the platform (y from 46) gives the story cards room to float in
const VIEW = { x: 28, y: 46, w: 464, h: 340 } // keep in sync with .rx-scene aspect-ratio
const VIEWBOX = `${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`
const pct = ([x, y]) => ({ left: `${((x - VIEW.x) / VIEW.w) * 100}%`, top: `${((y - VIEW.y) / VIEW.h) * 100}%` })
const EASE = [0.22, 1, 0.36, 1]
const copy = uiCopy.stories.compare.scene

// Reduced motion: no autoplay, and every stage shows its end state at once. Each animated piece
// reads this and starts at its final values (Motion's `initial={false}`).
const StillCtx = createContext(false)
const useInit = () => {
  const still = useContext(StillCtx)
  return (v) => (still ? false : v)
}

/* ------------------------------------------------------------------ static geometry */

const PLAT = prism({ at: P(0, 0, 0), w: 220, h: 220, r: 26, depth: 20, seg: 10 })
const PLAT_INSET = face("floor", P(0, 0, 0), 12, 12, 196, 196, 18, 8)
const DOTS_MATRIX = planeMatrix("floor", P(0, 0, 0))

// Shared anchor points (screen)
const CENTER = P(110, 110, 0) // [260, 238]
const INBOX_TOP = P(40, 178, 18) // left corner: tray / email channel
const PHONE_TOP = P(40, 100, 6) // back-left: phone / chat channel
const CORNER_TOP = P(182, 38, 16) // right corner: clock / bookings channel
const SPHERE = [CENTER[0], CENTER[1] - 66]
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
const line = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`
const PIPES = {
  chat: line(PEDESTALS.chat.foot, CENTER),
  email: line(PEDESTALS.email.foot, CENTER),
  calendar: line(PEDESTALS.calendar.foot, CENTER),
  monitor: line(MONITOR_FOOT, CENTER),
}
const OUT = {
  calendar: line(CENTER, PEDESTALS.calendar.foot),
  monitor: line(CENTER, MONITOR_FOOT),
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
      {lin(
        "moon",
        [
          [0, "#fbf8ee"],
          [0.6, "#dfe0ea"],
          [1, "#aab0c6"],
        ],
        [0, 0, 1, 1]
      )}
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

/** A dimensional check coin ("done"). */
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

/** A coral count sphere (unread items), popping in at `delay`. */
function Count({ uid, at: [x, y], n, delay }) {
  const init = useInit()
  return (
    <g transform={`translate(${x} ${y})`}>
      <m.g initial={init({ scale: 0.2, opacity: 0 })} animate={{ scale: 1, opacity: 1 }} transition={{ delay, type: "spring", stiffness: 480, damping: 20 }}>
        <circle r="9" cy="1.6" className="rx3-count__side" />
        <circle r="9" fill={`url(#${uid}-coral)`} />
        <text y="3.6" className="rx3-count__n">
          {n}
        </text>
      </m.g>
    </g>
  )
}

/** Moves its children from one screen point to another (with fade in/out). */
function Travel({ from: [x1, y1], to: [x2, y2], delay = 0, dur = 0.8, scaleTo = 1, children }) {
  if (useContext(StillCtx)) return null
  return (
    <m.g
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], x: [0, 0, x2 - x1, x2 - x1], y: [0, 0, y2 - y1, y2 - y1], scale: [1, 1, scaleTo, scaleTo] }}
      transition={{ delay, duration: dur + 0.3, times: [0, 0.12, 0.88, 1], ease: "easeInOut" }}
    >
      <g transform={`translate(${x1} ${y1})`}>{children}</g>
    </m.g>
  )
}

/** Pops in on a spring at a point. */
function Pop({ at: [x, y], delay = 0, children }) {
  const init = useInit()
  return (
    <g transform={`translate(${x} ${y})`}>
      <m.g initial={init({ opacity: 0, scale: 0.3 })} animate={{ opacity: 1, scale: 1 }} transition={{ delay, type: "spring", stiffness: 420, damping: 19 }}>
        {children}
      </m.g>
    </g>
  )
}

/** A bright dash that runs once along a floor pipe: something moving between two parts (CSS, pauses with the story). */
function Comet({ d, uid, delay = 0, dur = 0.7 }) {
  return <path className="rx-comet" d={d} pathLength="1" stroke={`url(#${uid}-spec)`} style={{ "--delay": `${delay}s`, "--dur": `${dur}s` }} />
}

/** A slow amber ring on the floor: something is sitting there, waiting. */
function WaitRing({ u, v, r, delay }) {
  const init = useInit()
  return (
    <m.ellipse
      {...floorCircle(u, v, 0, r)}
      className="rx3-wait-ring"
      initial={init({ opacity: 0 })}
      animate={{ opacity: [0, 0.95, 0.4, 0.95, 0.4, 0.95] }}
      transition={{ delay, duration: 4, ease: "easeInOut" }}
    />
  )
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

/* ------------------------------------------------------------------ the story layer (HTML over the SVG) */

/*
 * Every overlay follows `stops`: [{ t, at, o, s }] — seconds after the stage starts, a scene point,
 * opacity (default 1) and scale (default 1). Appearing, holding, flying and leaving are all stops.
 */
const show = (at, t, until) => [
  { t, at, o: 0, s: 0.9 },
  { t: t + 0.35, at },
  ...(until ? [{ t: until - 0.3, at }, { t: until, at, o: 0, s: 0.96 }] : []),
]
// Appears at `from`, waits, then flies into `to` and shrinks away (a message landing in an inbox)
const land = (from, to, t, depart, arrive, s = 0.25) => [
  { t, at: from, o: 0, s: 0.9 },
  { t: t + 0.35, at: from },
  { t: depart, at: from },
  { t: arrive - 0.12, at: to, o: 1, s },
  { t: arrive, at: to, o: 0, s },
]
// Grows out of `from` and settles at `to` (a reply leaving the core)
const emerge = (from, to, t, dur = 0.55) => [
  { t, at: from, o: 0, s: 0.3 },
  { t: t + dur, at: to },
]
// Holds, then sinks and fades (something being forgotten)
const sink = (at, t, fade, by = 22) => [
  { t, at, o: 0, s: 0.9 },
  { t: t + 0.35, at },
  { t: fade, at },
  { t: fade + 0.7, at: [at[0], at[1] + by], o: 0.3, s: 0.92 },
]

function Ui({ stops, anchor = "c", children }) {
  const init = useInit()
  const t0 = stops[0].t
  const span = Math.max(0.01, stops.at(-1).t - t0)
  const times = stops.map((p) => (p.t - t0) / span)
  const pos = stops.map((p) => pct(p.at))
  const tr = { delay: t0, duration: span, times, ease: "easeInOut" }
  return (
    <m.div className={`rx-ui-pos rx-ui-pos--${anchor}`} initial={init(pos[0])} animate={{ left: pos.map((p) => p.left), top: pos.map((p) => p.top) }} transition={tr}>
      <m.div
        className="rx-ui"
        initial={init({ opacity: stops[0].o ?? 1, scale: stops[0].s ?? 1 })}
        animate={{ opacity: stops.map((p) => p.o ?? 1), scale: stops.map((p) => p.s ?? 1) }}
        transition={tr}
      >
        {children}
      </m.div>
    </m.div>
  )
}

/** A short status label with an icon. Tones: warn (red), wait (amber), auto (brand), ok (done), plain. */
function Tag({ tone = "auto", icon: Icon, children }) {
  return (
    <span className={`rx-tag rx-tag--${tone}`}>
      {Icon && <Icon size={13} strokeWidth={2.4} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}

/** Text that counts from one value to another (a waiting timer, a clock), straight into the DOM. */
function Ticker({ from, to, t, dur, format, still }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (still) {
      el.textContent = format(to)
      return undefined
    }
    el.textContent = format(from)
    const ctl = animate(from, to, { delay: t, duration: dur, ease: [0.42, 0, 0.3, 1], onUpdate: (v) => (el.textContent = format(v)) })
    return () => ctl.stop()
  }, [from, to, t, dur, format, still])
  return <span ref={ref} className="rx-ticker" />
}
const hm = (v) => {
  const total = Math.round(v / 5) * 5
  const h24 = Math.floor(total / 60) % 24
  return `${h24 % 12 || 12}:${String(total % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`
}
const span = (v) => {
  const mins = Math.round(v / 5) * 5
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, "0")} m`
}
const label = (prefix) => (fmt) => (v) => `${prefix} · ${fmt(v)}`

function WaGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={siWhatsapp.path} fill="currentColor" />
    </svg>
  )
}

/** The customer's WhatsApp message: same card, same words, in both rooms. */
function MsgCard({ text, time, kicker = copy.newEnquiry, who = copy.customer, mini }) {
  return (
    <div className={`rx-msg ${mini ? "rx-msg--mini" : ""}`}>
      <span className="rx-msg__kicker">{kicker}</span>
      <span className="rx-msg__app">
        <WaGlyph />
      </span>
      <span className="rx-msg__who">
        <b>{who}</b>
        {time && <time>{time}</time>}
      </span>
      {text && <span className="rx-msg__text">{text}</span>}
    </div>
  )
}

/** The automated answer, leaving the core. */
function ReplyCard({ text, foot }) {
  return (
    <div className="rx-reply">
      <span className="rx-reply__text">{text}</span>
      <span className="rx-reply__foot">
        <CheckCheck size={13} strokeWidth={2.4} aria-hidden="true" />
        {foot}
      </span>
    </div>
  )
}

function BookCard() {
  return (
    <div className="rx-book">
      <span className="rx-book__icon">
        <CalendarCheck size={16} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="rx-book__text">
        <b>{copy.booked}</b>
        <small>{copy.bookedWhen}</small>
      </span>
      <span className="rx-book__ok">
        <Check size={11} strokeWidth={3} aria-hidden="true" />
      </span>
    </div>
  )
}

/** A paper reminder, written by hand. */
function NoteCard() {
  return (
    <div className="rx-note">
      <PenLine size={13} strokeWidth={2.2} aria-hidden="true" />
      <span>
        <b>{copy.noteText}</b>
        <small>{copy.noteWhen}</small>
      </span>
    </div>
  )
}

/** The report being filled in by hand: one row per paste. */
function SheetCard({ fills }) {
  const init = useInit()
  return (
    <div className="rx-sheet">
      <span className="rx-sheet__title">
        <FileSpreadsheet size={12} strokeWidth={2} aria-hidden="true" />
        {copy.reportFile}
      </span>
      <span className="rx-sheet__grid">
        {copy.reportRows.map((row, k) =>
          row.map((v, j) => (
            <m.span key={`${k}${j}`} initial={init({ opacity: 0, backgroundColor: "rgba(240, 180, 74, 0)" })} animate={{ opacity: 1, backgroundColor: ["rgba(240, 180, 74, 0.45)", "rgba(240, 180, 74, 0)"] }} transition={{ delay: fills[k], duration: 0.9, opacity: { delay: fills[k], duration: 0.12 } }}>
              {v}
            </m.span>
          ))
        )}
        {[0, 1].map((j) => (
          <span key={`e${j}`} className="is-empty" />
        ))}
      </span>
    </div>
  )
}

/** Admin tasks, ticked off by the system one after another. */
function ChecklistCard({ at, doneAt }) {
  const init = useInit()
  return (
    <div className="rx-check">
      <span className="rx-check__title">{copy.adminTitle}</span>
      {copy.adminItems.map((it, i) => (
        <span key={it} className="rx-check__row">
          <m.span className="rx-check__box" initial={init({ backgroundColor: "rgba(122, 76, 242, 0)", borderColor: "#cfd4ea" })} animate={{ backgroundColor: "#5b52e8", borderColor: "#5b52e8" }} transition={{ delay: at[i], duration: 0.3 }}>
            <m.span initial={init({ opacity: 0, scale: 0.4 })} animate={{ opacity: 1, scale: 1 }} transition={{ delay: at[i] + 0.05, type: "spring", stiffness: 500, damping: 22 }}>
              <Check size={10} strokeWidth={3.2} aria-hidden="true" />
            </m.span>
          </m.span>
          {it}
        </span>
      ))}
      <m.span className="rx-check__done" initial={init({ opacity: 0, y: 4 })} animate={{ opacity: 1, y: 0 }} transition={t(doneAt, 0.35)}>
        <CheckCheck size={12} strokeWidth={2.4} aria-hidden="true" />
        {copy.allDone}
      </m.span>
    </div>
  )
}
function t(delay, duration = 0.45) {
  return { delay, duration, ease: EASE }
}

/* ------------------------------------------------------------------ scene points for the story */

const AT = {
  msgIn: [136, 98], // where the customer's message appears (top-left, both rooms)
  phone: [200, 180], // Room 1: phone screen
  chat: [200, 172], // Room 2: chat channel
  email: [122, 200],
  calendar: [404, 192],
  overSlot: [200, 150], // above the phone / chat channel
  clockTop: [404, 170],
  core: [260, 168],
  overCore: [260, 134],
  reply: [388, 94],
  overTray: [122, 176],
  overCalendar: [404, 172],
  floorFront: [214, 300],
  note: [352, 112],
  sheet: [126, 112],
  stack: [330, 150],
  overSheet: [126, 140],
  overCards: [342, 236],
  overStack: [330, 128],
  belowPerson: [214, 304],
  checklist: [400, 104],
  hiring: [280, 292],
  overMonitor: [330, 108],
  rightMid: [384, 282],
  overTimeline: [260, 72],
  exitLeft: [44, 120],
}

/* ------------------------------------------------------------------ Room 1: the manual grind */

const M_SHEETS = [2, 2, 3, 7, 10]
const M_CARDS = [2, 2, 3, 4, 6]
const CLOCK_FAST = [true, true, true, true, false]
const MSG_LAND = 1.65 // a message lands in its inbox (both rooms)
const OTHERS = uiCopy.scenes.todo.items.map((it) => it.who) // more customers, next month

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

function InboxTray({ uid }) {
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
      <m.circle cx={cx} cy={cy} r="18" className="rx3-clock__wait" initial={false} animate={{ opacity: waiting ? 1 : 0 }} transition={{ duration: 0.4 }} />
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
            transition={{ delay: live && i >= prev ? 0.45 + (i - prev) * 0.7 : 0, duration: 0.5, ease: EASE }}
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
            transition={{ delay: live && i >= prev ? 1.2 + (i - prev) * 0.55 : 0, duration: 0.45, ease: EASE }}
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

const PHONE_BADGE = [PHONE_TOP[0] + 20, PHONE_TOP[1] - 16]
const TRAY_BADGE = [INBOX_TOP[0] + 30, INBOX_TOP[1] - 16]

/** Room 1, in the SVG: what lands, what waits, who arrives. */
function ManualActors({ uid, phase }) {
  const init = useInit()
  switch (phase) {
    case 0:
    case 1:
      // the enquiry lands on the phone: unread, and the floor around it starts to "wait"
      return (
        <>
          <Count uid={uid} at={PHONE_BADGE} n={1} delay={MSG_LAND} />
          <WaitRing u={40} v={100} r={30} delay={MSG_LAND + 0.6} />
        </>
      )
    case 2:
      return <WaitRing u={40} v={100} r={30} delay={MSG_LAND + 0.6} />
    case 4:
      // more enquiries than one person can answer, and a second desk to fill
      return (
        <>
          {[1, 2, 3].map((n, i) => (
            <Count key={n} uid={uid} at={PHONE_BADGE} n={n} delay={0.95 + i * 0.5} />
          ))}
          <Count uid={uid} at={TRAY_BADGE} n={2} delay={1.9} />
          {[P(120, 188, 0), P(184, 186, 0)].map((at, i) => (
            <m.g key={i} initial={init({ opacity: 0, y: 16 })} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 + i * 0.45, type: "spring", stiffness: 220, damping: 20 }}>
              <Person uid={uid} at={at} />
            </m.g>
          ))}
        </>
      )
    default:
      return null
  }
}

/** Room 1, in words: same message in, then a manual outcome. */
function ManualStory({ phase, still }) {
  const msg = (i, kicker) => (
    <Ui stops={land(AT.msgIn, AT.phone, 0.3, 1.1, MSG_LAND)}>
      <MsgCard text={copy.messages[i]} time={copy.times[i]} kicker={kicker} />
    </Ui>
  )
  switch (phase) {
    case 0:
      return (
        <>
          {msg(0)}
          <Ui stops={show(AT.overTray, 1.9)} anchor="b">
            <Tag tone="plain" icon={Inbox}>
              {copy.oneOfFive}
            </Tag>
          </Ui>
          <Ui stops={show(AT.overSlot, 2.3, 3.7)} anchor="b">
            <Tag tone="warn" icon={BellOff}>
              {copy.unread}
            </Tag>
          </Ui>
          <Ui stops={show(AT.clockTop, 2.7)} anchor="b">
            <Tag tone="wait" icon={Clock}>
              <Ticker from={0} to={175} t={2.9} dur={2.2} format={label(copy.noReply)(span)} still={still} />
            </Tag>
          </Ui>
          <Ui stops={show(AT.overSlot, 3.9)} anchor="b">
            <Tag tone="warn" icon={Hourglass}>
              {copy.stillWaiting}
            </Tag>
          </Ui>
        </>
      )
    case 1:
      return (
        <>
          {msg(1)}
          <Ui stops={show(AT.floorFront, 0.9)}>
            <Tag tone="plain" icon={Moon}>
              {copy.officeClosed}
            </Tag>
          </Ui>
          <Ui stops={show(AT.clockTop, 1.9)} anchor="b">
            <Tag tone="wait" icon={Clock}>
              <Ticker from={23 * 60 + 40} to={33 * 60} t={2} dur={2.3} format={hm} still={still} />
            </Tag>
          </Ui>
          <Ui stops={show(AT.overSlot, 2.4, 4.3)} anchor="b">
            <Tag tone="warn" icon={BellOff}>
              {copy.unreadNight}
            </Tag>
          </Ui>
          {/* by morning, the customer has gone elsewhere */}
          <Ui stops={[{ t: 4.3, at: AT.overSlot, o: 0, s: 0.9 }, { t: 4.6, at: AT.overSlot }, { t: 5.5, at: AT.exitLeft, o: 0, s: 0.9 }]}>
            <MsgCard who={copy.customer} kicker={copy.customer} mini />
          </Ui>
          <Ui stops={show(AT.overSlot, 5.0)} anchor="b">
            <Tag tone="warn" icon={LogOut}>
              {copy.boughtElsewhere}
            </Tag>
          </Ui>
        </>
      )
    case 2:
      return (
        <>
          {msg(2, copy.customerReply)}
          {/* a reminder on paper… */}
          <Ui stops={sink(AT.note, 1.9, 3.9)}>
            <NoteCard />
          </Ui>
          <Ui stops={show(AT.clockTop, 2.7)} anchor="b">
            <Tag tone="wait" icon={Clock}>
              {copy.daysLater}
            </Tag>
          </Ui>
          {/* …that nobody remembers */}
          <Ui stops={show([AT.note[0], AT.note[1] - 6], 4.5)} anchor="b">
            <Tag tone="warn" icon={BellOff}>
              {copy.forgotten}
            </Tag>
          </Ui>
          <Ui stops={show(AT.overSlot, 5.0)} anchor="b">
            <Tag tone="warn" icon={Hourglass}>
              {copy.stillWaiting}
            </Tag>
          </Ui>
        </>
      )
    case 3: {
      // copy from the paper stack, paste into the report: by hand, row after row, all day
      const copies = [1.2, 2.4, 3.6]
      return (
        <>
          <Ui stops={show(AT.sheet, 0.5)}>
            <SheetCard fills={copies.map((c) => c + 0.6)} />
          </Ui>
          {copies.map((c) => (
            <React.Fragment key={c}>
              <Ui stops={show(AT.stack, c, c + 0.65)} anchor="b">
                <Tag tone="plain">{copy.copyKey}</Tag>
              </Ui>
              <Ui stops={show(AT.overSheet, c + 0.6, c + 1.25)}>
                <Tag tone="plain">{copy.pasteKey}</Tag>
              </Ui>
            </React.Fragment>
          ))}
          <Ui stops={show(AT.clockTop, 1)} anchor="b">
            <Tag tone="wait" icon={Clock}>
              <Ticker from={9 * 60} to={18 * 60} t={1.1} dur={3.9} format={hm} still={still} />
            </Tag>
          </Ui>
          <Ui stops={show(AT.overCards, 5.0)} anchor="b">
            <Tag tone="warn" icon={Hourglass}>
              {copy.stillPending}
            </Tag>
          </Ui>
        </>
      )
    }
    case 4:
      return (
        <>
          {OTHERS.map((who, i) => (
            <Ui key={who} stops={land([AT.msgIn[0] + i * 10, AT.msgIn[1] - 8 + i * 12], AT.phone, 0.2 + i * 0.5, 0.55 + i * 0.5, 0.95 + i * 0.5, 0.3)}>
              <MsgCard who={who} mini />
            </Ui>
          ))}
          <Ui stops={show(AT.overStack, 2.0)} anchor="b">
            <Tag tone="warn" icon={Hourglass}>
              {copy.backlog}
            </Tag>
          </Ui>
          <Ui stops={show(AT.hiring, 3.0)} anchor="l">
            <Tag tone="warn" icon={UserPlus}>
              {copy.hiring}
            </Tag>
          </Ui>
        </>
      )
    default:
      return null
  }
}

export function ManualScene({ phase, verdict, live, running, runKey, still = false }) {
  const uid = `rxm${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const night = phase === 1
  const shuttle = phase === 3 && live
  return (
    <StillCtx.Provider value={still}>
      <div className={`rx-scene rx-scene--manual ${verdict ? "is-verdict" : ""} ${running ? "" : "is-paused"}`}>
        <svg className="rx-svg" viewBox={VIEWBOX} aria-hidden="true" focusable="false">
          <Defs uid={uid} />
          <Platform uid={uid} />
          <Phone uid={uid} lit={live} />
          <InboxTray uid={uid} />
          <DeskClock uid={uid} fast={live && CLOCK_FAST[phase]} waiting={phase === 1} />
          {/* drawn before the person, who walks in front of it on admin day */}
          <PaperStack uid={uid} count={M_SHEETS[phase]} phase={phase} live={live} />
          {/* the person in the middle of everything; gone home after hours; carrying paper on admin day */}
          <m.g initial={false} animate={{ opacity: night ? 0 : 1, y: night ? 6 : 0 }} transition={{ duration: 0.55 }}>
            <m.g
              key={shuttle ? `shuttle${runKey}` : "still"}
              initial={{ x: 0, y: 0 }}
              animate={shuttle ? { x: [0, 52, -40, 52, -40, 52, -40, 0], y: [0, -6, -2, -6, -2, -6, -2, 0] } : { x: 0, y: 0 }}
              transition={{ duration: 4.6, ease: "easeInOut", delay: 0.9 }}
            >
              <Person uid={uid} at={CENTER} />
              {phase === 3 && (
                <m.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  <Card at={[CENTER[0] + 2, CENTER[1] - 86]} w={18} h={22} />
                </m.g>
              )}
            </m.g>
          </m.g>
          <TaskCards uid={uid} count={M_CARDS[phase]} phase={phase} live={live} />
          <NightSky uid={uid} on={night} />
          <AnimatePresence>
            {live && (
              <m.g key={runKey} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <ManualActors uid={uid} phase={phase} />
              </m.g>
            )}
          </AnimatePresence>
        </svg>
        <AnimatePresence>
          {live && (
            <m.div key={runKey} className="rx-layer" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <ManualStory phase={phase} still={still} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </StillCtx.Provider>
  )
}

/* ------------------------------------------------------------------ Room 2: the automated business */

const A_LEVEL = [0, 1, 2, 3, 4]
// Which channels light up in each stage
const LIT = [{ chat: 1 }, { chat: 1, calendar: 1 }, { chat: 1 }, { email: 1 }, { chat: 1, email: 1, calendar: 1 }]
// When the core lights up in each stage (seconds), to sync its pulse with arrivals
const CORE_PULSE = [2.05, 2.05, 2.05, 1.3, 1.6]

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
        <m.g key={pulse} initial={{ scale: 1 }} animate={{ scale: pulse ? [1, 1.12, 1] : 1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ originX: "50%", originY: "50%" }}>
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
          <m.rect key={i} x={10 + i * 11} width="7.5" rx="1.5" fill={`url(#${uid}-vivid)`} initial={false} animate={{ height: h, attrY: 40 - h }} transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 120, damping: 18 }} />
        ))}
        {grow && (
          <>
            <m.path d="M10 31L21 25L32 27L43 15L51 10" className="rx3-screen__trend" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.5, duration: 0.9, ease: "easeInOut" }} />
            <m.path d="M45 10L51 10L51 16" className="rx3-screen__trend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.3, duration: 0.3 }} />
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
        const delay = on ? 2.4 + i * 0.12 : 0
        return (
          <m.g key={i} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.4, delay }}>
            <Shadow uid={uid} at={P(b.u + 6, b.v + 6, 0)} r={11} o={0.7} />
            <m.path d={g.right} initial={false} animate={{ d: g.right }} transition={{ delay, duration: 0.8, ease: EASE }} className={`rx3-bar rx3-bar--r${i}`} />
            <m.path d={g.left} initial={false} animate={{ d: g.left }} transition={{ delay, duration: 0.8, ease: EASE }} className={`rx3-bar rx3-bar--l${i}`} />
            <m.path d={g.top} initial={false} animate={{ d: g.top }} transition={{ delay, duration: 0.8, ease: EASE }} className={`rx3-bar rx3-bar--t${i}`} />
          </m.g>
        )
      })}
    </g>
  )
}

const FOLLOW = { start: 2.1, step: 0.8 } // scheduled follow-ups go out on Day 1, 3 and 7
function Timeline({ uid }) {
  const { y, xs } = TIMELINE
  const { start, step } = FOLLOW
  const init = useInit()
  return (
    <m.g initial={init({ opacity: 0, y: 8 })} animate={{ opacity: 1, y: 0 }} transition={{ delay: start - 0.3, duration: 0.45, ease: EASE }}>
      <rect x={xs[0] - 4} y={y - 3} width={xs[2] - xs[0] + 8} height="8" rx="4" className="rx3-track__side" transform="translate(1.5 2.4)" />
      <rect x={xs[0] - 4} y={y - 3} width={xs[2] - xs[0] + 8} height="8" rx="4" className="rx3-track" />
      <m.rect x={xs[0] - 4} y={y - 3} height="8" rx="4" fill={`url(#${uid}-vivid)`} initial={init({ width: 0 })} animate={{ width: xs[2] - xs[0] + 8 }} transition={{ delay: start, duration: step * 2, ease: "linear" }} />
      {xs.map((x) => (
        <g key={x}>
          <circle cx={x} cy={y + 3.2} r="10" className="rx3-node__side" />
          <circle cx={x} cy={y + 1} r="10" className="rx3-node" />
        </g>
      ))}
      {/* each scheduled message goes out on its day: sent */}
      {xs.map((x, i) => (
        <Pop key={x} at={[x, y + 1]} delay={start + i * step}>
          <Coin uid={uid} at={[0, 0]} r={10} />
        </Pop>
      ))}
    </m.g>
  )
}

/** Room 2, in the SVG: what flows where. */
function AutoActors({ uid, phase }) {
  switch (phase) {
    case 0:
      return <Comet d={PIPES.chat} uid={uid} delay={MSG_LAND} dur={0.45} />
    case 1:
      return (
        <>
          <Comet d={PIPES.chat} uid={uid} delay={MSG_LAND} dur={0.45} />
          {/* the booking goes to the calendar */}
          <Comet d={OUT.calendar} uid={uid} delay={3.5} dur={0.5} />
        </>
      )
    case 2:
      return (
        <>
          <Comet d={PIPES.chat} uid={uid} delay={MSG_LAND} dur={0.45} />
          <Timeline uid={uid} />
        </>
      )
    case 3:
      return (
        <>
          {/* invoices and sheets come in, through the core, onto the dashboard */}
          {[0, 1, 2].map((i) => (
            <Travel key={`in${i}`} from={[INBOX_TOP[0], INBOX_TOP[1] - 22]} to={[SPHERE[0], SPHERE[1]]} delay={0.4 + i * 0.5} dur={0.7} scaleTo={0.35}>
              <Card at={[0, 0]} w={17} h={21} tone={i === 1 ? "invoice" : "paper"} />
            </Travel>
          ))}
          {[0, 1, 2].map((i) => (
            <Comet key={i} d={OUT.monitor} uid={uid} delay={1.3 + i * 0.6} dur={0.55} />
          ))}
        </>
      )
    case 4:
      return (
        <>
          {[PIPES.chat, PIPES.email, PIPES.calendar].map((d, i) => (
            <Comet key={i} d={d} uid={uid} delay={0.95 + i * 0.5} dur={0.45} />
          ))}
          {/* every one of them answered */}
          {[PEDESTALS.chat, PEDESTALS.email, PEDESTALS.calendar].map((p, i) => (
            <Pop key={i} at={[p.top[0], p.top[1] - 26]} delay={2.0 + i * 0.2}>
              <Coin uid={uid} at={[0, 0]} r={8} />
            </Pop>
          ))}
        </>
      )
    default:
      return null
  }
}

/** Room 2, in words: the same message in, then the automated outcome. */
function AutoStory({ phase }) {
  const msg = (i, kicker) => (
    <Ui stops={land(AT.msgIn, AT.chat, 0.3, 1.1, MSG_LAND)}>
      <MsgCard text={copy.messages[i]} time={copy.times[i]} kicker={kicker} />
    </Ui>
  )
  const captured = (
    <Ui stops={show(AT.overCore, 2.0, 2.9)} anchor="b">
      <Tag tone="auto" icon={Inbox}>
        {copy.captured}
      </Tag>
    </Ui>
  )
  switch (phase) {
    case 0:
      return (
        <>
          {msg(0)}
          {captured}
          <Ui stops={emerge(AT.core, AT.reply, 2.6)}>
            <ReplyCard text={copy.replies[0]} foot={copy.repliedFast} />
          </Ui>
          <Ui stops={show(AT.overCalendar, 3.7)} anchor="b">
            <Tag tone="ok" icon={Inbox}>
              {copy.oneInbox}
            </Tag>
          </Ui>
        </>
      )
    case 1:
      return (
        <>
          {msg(1)}
          <Ui stops={show(AT.floorFront, 0.9)}>
            <Tag tone="auto" icon={Moon}>
              {copy.allHours}
            </Tag>
          </Ui>
          <Ui stops={emerge(AT.core, AT.reply, 2.3)}>
            <ReplyCard text={copy.replies[1]} foot={copy.replied} />
          </Ui>
          <Ui stops={show(AT.overCalendar, 3.0, 3.75)} anchor="b">
            <Tag tone="auto" icon={UserCheck}>
              {copy.qualified}
            </Tag>
          </Ui>
          <Ui stops={show(AT.overCalendar, 4.0)} anchor="b">
            <BookCard />
          </Ui>
        </>
      )
    case 2:
      return (
        <>
          {msg(2, copy.customerReply)}
          <Ui stops={show(AT.overTimeline, FOLLOW.start - 0.2)} anchor="b">
            <Tag tone="auto" icon={CalendarClock}>
              {copy.scheduled}
            </Tag>
          </Ui>
          {[copy.day1, copy.day3, copy.day7].map((d, i) => (
            <Ui key={d} stops={show([TIMELINE.xs[i], TIMELINE.y - 14], FOLLOW.start - 0.2 + i * 0.1)} anchor="b">
              <span className="rx-day">{d}</span>
            </Ui>
          ))}
          {[0, 1, 2].map((i) => (
            <Ui key={i} stops={show([TIMELINE.xs[i], TIMELINE.y + 26], FOLLOW.start + i * FOLLOW.step + 0.1)}>
              <span className="rx-sent">
                <Check size={10} strokeWidth={3} aria-hidden="true" />
                {copy.sent}
              </span>
            </Ui>
          ))}
          {/* …until the customer answers */}
          <Ui stops={show(AT.rightMid, 4.4)}>
            <MsgCard text={copy.yesReply} kicker={copy.customerReply} />
          </Ui>
        </>
      )
    case 3:
      return (
        <>
          <Ui stops={show(AT.checklist, 0.8)}>
            <ChecklistCard at={[1.85, 2.45, 3.05]} doneAt={3.5} />
          </Ui>
          <Ui stops={show(AT.belowPerson, 3.9)}>
            <Tag tone="ok" icon={Heart}>
              {copy.customers}
            </Tag>
          </Ui>
        </>
      )
    case 4:
      return (
        <>
          {OTHERS.map((who, i) => (
            <Ui key={who} stops={land([AT.msgIn[0] + i * 10, AT.msgIn[1] - 8 + i * 12], [PEDESTALS.chat, PEDESTALS.email, PEDESTALS.calendar].map((p) => [p.top[0], p.top[1] - 8])[i], 0.2 + i * 0.5, 0.55 + i * 0.5, 0.95 + i * 0.5, 0.3)}>
              <MsgCard who={who} mini />
            </Ui>
          ))}
          <Ui stops={show(AT.overMonitor, 3.1)} anchor="b">
            <Tag tone="ok" icon={LayoutDashboard}>
              {copy.oneScreen}
            </Tag>
          </Ui>
          <Ui stops={show(AT.belowPerson, 3.7)}>
            <Tag tone="ok" icon={Users}>
              {copy.sameTeam}
            </Tag>
          </Ui>
        </>
      )
    default:
      return null
  }
}

export function AutoScene({ phase, verdict, live, running, runKey, still = false }) {
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

  // The core answers each arrival with one pulse; a new run cancels the old timer
  useEffect(() => {
    if (!live || !CORE_PULSE[phase]) return undefined
    const id = window.setTimeout(() => setPulse((p) => p + 1), CORE_PULSE[phase] * 1000)
    return () => window.clearTimeout(id)
  }, [phase, live, runKey])

  const lit = live ? LIT[phase] : {}
  return (
    <StillCtx.Provider value={still}>
      <div className={`rx-scene rx-scene--auto ${verdict ? "is-verdict" : ""} ${running ? "" : "is-paused"}`}>
        <svg ref={svgRef} className="rx-svg" viewBox={VIEWBOX} aria-hidden="true" focusable="false">
          <Defs uid={uid} auto />
          <Platform uid={uid} auto />
          <Pipes uid={uid} />
          <Pedestal uid={uid} p={PEDESTALS.chat} lit={!!lit.chat} />
          <Pedestal uid={uid} p={PEDESTALS.email} lit={!!lit.email} />
          <Pedestal uid={uid} p={PEDESTALS.calendar} lit={!!lit.calendar} />
          <Core uid={uid} pulse={pulse} busy={live && (phase === 1 || phase === 3 || phase === 4)} />
          <Monitor uid={uid} level={A_LEVEL[phase]} grow={phase === 4} />
          <m.g initial={false} animate={{ opacity: night ? 0 : 1, y: night ? 6 : 0 }} transition={{ duration: 0.55 }}>
            <Person uid={uid} at={FRONT_PERSON} />
          </m.g>
          <GrowthBars uid={uid} on={phase === 4} />
          <NightSky uid={uid} on={night} />
          <AnimatePresence>
            {live && (
              <m.g key={runKey} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <AutoActors uid={uid} phase={phase} />
              </m.g>
            )}
          </AnimatePresence>
        </svg>
        <AnimatePresence>
          {live && (
            <m.div key={runKey} className="rx-layer" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <AutoStory phase={phase} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </StillCtx.Provider>
  )
}

