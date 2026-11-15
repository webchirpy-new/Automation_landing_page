/**
 * Scorecard logic — Launch Kit 01 (§03 scoring, §05 lanes). Pure functions only, so every rule
 * can be checked by hand now and unit-tested later (Phase 7).
 *
 *   gaps   = ticked checks, 0–16
 *   score  = Math.floor(((16 − gaps) / 16) × 100 + 0.5)   (rounded half up)
 *   status = 2 ticks Leaking · 1 tick Partly manual · 0 ticks or "Neither applies" Running
 *   top 3  = 2-tick areas, then 1-tick areas; ties in quick-win order
 *   lane   = most-ticked area group (tie A → C → B), then the AI and ad overrides
 */
import { scorecard } from "../data/automationContent"

export const TOTAL_CHECKS = 16

/** Tie-break order for the top 3: what can show a result within weeks comes first. */
export const QUICK_WIN_ORDER = [
  "instant-reply",
  "follow-up",
  "retention",
  "lead-capture",
  "back-office",
  "sales-pipeline",
  "operations",
  "insights",
]

export const STATUS = {
  leaking: { id: "leaking", label: "Leaking" },
  partly: { id: "partly", label: "Partly manual" },
  running: { id: "running", label: "Running" },
  todo: { id: "todo", label: "To review" },
}

/** Follow-up lanes (Kit 01 §05.1). */
export const LANE_AREAS = {
  A: ["lead-capture", "instant-reply", "follow-up", "sales-pipeline"], // Leads and sales
  C: ["operations", "back-office", "retention"], // Operations and money
  B: ["insights"], // Reports and data
}
export const LANE_NAMES = { A: "Leads and sales", B: "Reports and data", C: "Operations and money", D: "AI direction" }
/** Pain-point ad → lane. PP5 is reply speed, so it belongs in A (Kit 01 correction). */
export const PAIN_POINT_LANE = { 1: "A", 2: "A", 5: "A", 3: "B", 7: "B", 4: "C", 6: "C", 8: "D" }
/** AI-use answers that send a Pain Point 8 lead to lane D. */
const AI_DIRECTION_ANSWERS = new Set(["writing", "tried"])

export const scoreFor = (gaps) => Math.floor(((TOTAL_CHECKS - gaps) / TOTAL_CHECKS) * 100 + 0.5)

export const bandFor = (gaps) => scorecard.bands.find((b) => gaps >= b.minGaps && gaps <= b.maxGaps) || null

export function statusFor(area) {
  if (!area.reviewed) return STATUS.todo
  if (area.gaps >= 2) return STATUS.leaking
  if (area.gaps === 1) return STATUS.partly
  return STATUS.running
}

export function topGaps(areas, n = 3) {
  return areas
    .filter((a) => a.gaps > 0)
    .sort((a, b) => b.gaps - a.gaps || QUICK_WIN_ORDER.indexOf(a.id) - QUICK_WIN_ORDER.indexOf(b.id))
    .slice(0, n)
}

/** "PP5-P02-4x5" → 5. Anything else → null. */
export function painPointFrom(utmContent) {
  const m = /^PP(\d)\b/i.exec(utmContent || "")
  return m ? Number(m[1]) : null
}

/**
 * Lane for the follow-up (not shown to the owner). The ad override wins over the AI override:
 * the AI override only applies to Pain Point 8 leads, whose ad lane is already D.
 */
export function laneFor({ areas, gapCount, aiUse = null, utmContent = null }) {
  const ticks = (ids) => areas.filter((a) => ids.includes(a.id)).reduce((n, a) => n + a.gaps, 0)
  const byGroup = ["A", "C", "B"].map((lane) => ({ lane, ticks: ticks(LANE_AREAS[lane]) }))
  // Most ticks wins; ties keep the A → C → B order because the sort is stable
  let lane = [...byGroup].sort((x, y) => y.ticks - x.ticks)[0].lane
  let reason = "default"

  const pp = painPointFrom(utmContent)
  if (pp === 8 && AI_DIRECTION_ANSWERS.has(aiUse)) {
    lane = "D"
    reason = "ai_override"
  }
  if (pp && PAIN_POINT_LANE[pp] && gapCount <= 2) {
    lane = PAIN_POINT_LANE[pp]
    reason = "ad_override"
  }
  return { lane, name: LANE_NAMES[lane], reason }
}

/** The whole derived scorecard state. Unanswered areas are never counted as "no gap". */
export function summarise(state, { utmContent = null } = {}) {
  const areas = scorecard.areas.map((a) => {
    const answers = a.checks.map((_, i) => !!state.checked[`${a.id}:${i}`])
    const gaps = answers.filter(Boolean).length
    const reviewed = gaps > 0 || !!state.cleared[a.id]
    const area = { ...a, answers, gaps, reviewed }
    return { ...area, status: statusFor(area) }
  })
  const gapCount = areas.reduce((n, a) => n + a.gaps, 0)
  const reviewedCount = areas.filter((a) => a.reviewed).length
  const complete = reviewedCount === areas.length
  const totalAreas = areas.length
  const totalChecks = areas.reduce((n, a) => n + a.checks.length, 0)
  const context = state.context || {}
  return {
    areas,
    gapCount,
    reviewedCount,
    complete,
    totalAreas,
    totalChecks,
    context,
    score: complete ? scoreFor(gapCount) : null,
    band: complete ? bandFor(gapCount) : null,
    top3: topGaps(areas),
    lane: complete ? laneFor({ areas, gapCount, aiUse: context.aiUse, utmContent }) : null,
  }
}

/**
 * The `scorecard_*` hidden fields for the future Tally forms (Kit 02 §04.1). Built now so the
 * Phase 4 integration is only wiring. Nothing calls a network with it.
 */
export function scorecardPayload(summary) {
  if (!summary?.complete) return null
  return {
    // 16 true/false answers in page order, keyed "<area>:<check index>"
    scorecard_answers: Object.fromEntries(summary.areas.flatMap((a) => a.answers.map((v, i) => [`${a.id}:${i}`, v]))),
    scorecard_area_status: Object.fromEntries(summary.areas.map((a) => [a.id, a.status.label])),
    scorecard_gaps: summary.gapCount,
    scorecard_score: summary.score,
    scorecard_band: summary.band?.name ?? null,
    scorecard_top3: summary.top3.map((a) => a.area),
    scorecard_lane: summary.lane?.lane ?? null,
    scorecard_ai_use: summary.context.aiUse ?? null,
    scorecard_enquiry_volume: summary.context.enquiries ?? null,
  }
}
