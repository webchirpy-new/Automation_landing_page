import { pattern, uiCopy } from "./automationContent"

/**
 * Workload Orbit — geometry and story map. Copy is only ever referenced from the approved
 * `pattern` block (or `uiCopy.orbit`), never retyped here.
 *
 * All circles are internally tangent at one point (TANGENT), the construction taken from the
 * motion reference. Coordinates live in a 1000 × 1000 viewBox. Angles are SVG degrees:
 * 0 = right, 90 = down, 180 = left, 270 = up. Markers only ever travel towards lower angles.
 */
const [customerWork, manualWork, repeatReplies, dataEntry, chasingFollowUps] = pattern.chartLabels
const chipCustomers = pattern.chips[1]
const o = uiCopy.orbit

export const TANGENT = { x: 832, y: 168 }
const AXIS = Math.SQRT1_2

/** Centre of a circle of radius r that touches TANGENT from the inside. */
export const centreOf = (r) => ({ x: TANGENT.x - r * AXIS, y: TANGENT.y + r * AXIS })

export const pointOn = (r, deg, c = centreOf(r)) => {
  const t = (deg * Math.PI) / 180
  return { x: c.x + r * Math.cos(t), y: c.y + r * Math.sin(t) }
}

export const CORE_RADIUS = 198
/** The customer-work disc loses ground with each moment: "hours still disappear". */
export const CORE_SHRINK = [1, 0.88, 0.76, 0.64]

export const REST_ANGLE = 135 // opposite the tangent point, as in the reference
export const START_ANGLE = 315 // the tangent point itself: every marker starts together

/**
 * Stages 2–4, one ring each, in scroll order. Stage 1 is the customer-work core.
 * `line` is the approved story line that belongs to that workload. "Chasing follow-ups" is
 * the fifth category: it shares stage 4 with data entry and adds no scroll step.
 */
export const RINGS = [
  {
    r: 318,
    label: manualWork,
    line: pattern.lines[1], // the report
    travelTo: 100,
    fan: [
      { text: o.channelSheets, angle: 190, side: "r" },
      { text: o.manualAllDay, angle: 62, side: "r", key: true },
    ],
  },
  {
    r: 399,
    label: repeatReplies,
    line: pattern.lines[0], // the enquiry
    travelTo: 85,
    fan: [
      { text: o.channelWebsite, angle: 208, side: "r" },
      { text: o.channelWhatsApp, angle: 180, side: "r" },
      { text: o.waitsOvernight, angle: 14, side: "l", key: true },
    ],
  },
  {
    r: 470,
    label: dataEntry,
    line: pattern.lines[2], // the follow-up
    travelTo: 55,
    fan: [
      { text: chipCustomers, angle: 212, side: "r" },
      { text: chasingFollowUps, angle: 180, side: "r", key: true },
      { text: o.dependsOnMemory, angle: 4, side: "l", key: true },
    ],
  },
]

export const CORE_LABEL = customerWork
/** Stage 1's story-slot text on the two-column layout (stacked layouts show all the chips). */
export const CORE_LINE = chipCustomers
/** The four stages, in order. */
export const STAGES = [customerWork, ...RINGS.map((r) => r.label)]

/**
 * Supporting cards, in stage order. `moment` is the index of the stage each one focuses
 * (0–3, as in STAGES).
 */
export const CARDS = [
  { id: "customer", labels: [customerWork], moment: 0 },
  { id: "manual", labels: [manualWork], moment: 1 },
  { id: "repeat", labels: [repeatReplies], moment: 2 },
  { id: "data", labels: [dataEntry, chasingFollowUps], moment: 3 },
]

/**
 * Master timeline positions, as progress 0–1. The 240vh track gives 215vh of scrubbed
 * distance (75vh entering, 140vh locked), so 1% ≈ 2.15vh. The reveal finishes as the stage
 * locks at 35%; stage 1 then holds ~20vh and stages 2–4 get ~40vh each.
 * Keep in step with `.orbit-track` in sections.css.
 */
export const TIMELINE = {
  reveal: 0.35,
  starts: [0.44, 0.63, 0.815],
  crossfade: 0.04,
}
