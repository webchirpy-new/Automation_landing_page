/**
 * Art direction for the Dark Space Depth starfield. Same motion language everywhere; each dark
 * section only changes density, heading and where it keeps clear.
 *
 * density   stars per 100,000 CSS px² of the canvas, before the device tier
 * heading   drift direction in degrees (0 = right, 90 = down)
 * clear     star brightness left behind text (0 = none, 1 = untouched)
 * edgeBias  0–1: how strongly stars avoid the middle of the frame
 * accent    the rare muted colour speck, in rgb. The reference itself is pure neutral grey
 *
 * Starting density comes from the supplied reference (about 390 points per 100k px² at its
 * faintest visible threshold, 110 at its brighter one), reduced so copy stays first.
 */
export const PRESETS = {
  hero: { density: 66, heading: 45, clear: 0.16, edgeBias: 0, accent: [188, 214, 232] },
  narrative: { density: 48, heading: 52, clear: 0.22, edgeBias: 0, accent: [176, 222, 196] },
  data: { density: 34, heading: 38, clear: 0.2, edgeBias: 0.2, accent: [176, 222, 196] },
  story: { density: 30, heading: 60, clear: 0.2, edgeBias: 0, accent: [176, 222, 196] },
  cta: { density: 52, heading: 30, clear: 0.2, edgeBias: 0.55, accent: [176, 222, 196] },
}

/** The real dark sections, by id. */
export const SECTION_PRESET = {
  pattern: "narrative",
  scorecard: "data",
  dashboard: "data",
  why: "story",
  fit: "narrative",
  audit: "cta",
  final: "cta",
}

/*
 * Far, mid, near. share of stars, CSS px diameter, brightness, drift px/s, depth change per
 * second (the slow forward travel), twinkle depth. Sizes and speeds follow the brief; brightness
 * follows the reference, where most points peak near a third of full white and few pass 75%.
 */
export const LAYERS = [
  { share: 0.66, size: [0.35, 0.8], alpha: [0.3, 0.52], drift: 0.12, depthRate: 0.0006, twinkle: 0.2 },
  { share: 0.27, size: [0.6, 1.1], alpha: [0.46, 0.72], drift: 0.34, depthRate: 0.0018, twinkle: 0.26 },
  { share: 0.07, size: [0.9, 1.7], alpha: [0.7, 0.92], drift: 0.68, depthRate: 0.004, twinkle: 0.3 },
]

/** Device tiers. Density is per area; on a small screen that is still far fewer stars in total. */
export function tierFor(width) {
  if (width <= 767) return { name: "mobile", density: 1.2, motion: 0.65, dpr: 1.5, cap: 320 }
  if (width <= 1439) return { name: "tablet", density: 0.95, motion: 0.8, dpr: 1.5, cap: 620 }
  return { name: "desktop", density: 1, motion: 1, dpr: 1.75, cap: 1000 }
}
