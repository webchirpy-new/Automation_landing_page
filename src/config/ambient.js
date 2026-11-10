/**
 * Green ambient bloom placement per chapter (see SectionAmbient). Keyed by section id.
 * Anchors sit in quiet corners/edges away from copy, forms and logos; no two neighbouring
 * chapters share a corner or a drift direction, and durations/phases never line up.
 * Light chapters run quieter than dark ones so white stays white.
 */
const S = (px, vw = 80) => `min(${px}px, ${vw}vw)`

export const ambient = {
  // Hero first fold — upper-left, plus a small bloom at the far right edge
  top: [
    { x: "4%", y: "10%", size: S(640, 90), opacity: 0.26, dx: 28, dy: 18, dur: 26, delay: 3, rot: -10 },
    { x: "100%", y: "62%", size: S(380, 60), opacity: 0.16, dx: -18, dy: -24, dur: 19, delay: 11, rot: 40 },
  ],
  // Businesses that trust Webchirpy band — lower-right, beside the marquee edge
  trust: [{ x: "94%", y: "84%", size: S(460, 70), opacity: 0.18, dx: -24, dy: -14, dur: 22, delay: 6, rot: 120 }],
  pattern: [{ x: "92%", y: "12%", size: S(720), opacity: 0.5, dx: -32, dy: 22, dur: 28, delay: 2, rot: 200 }],
  compare: [{ x: "0%", y: "84%", size: S(600), opacity: 0.2, dx: 26, dy: -20, dur: 17, delay: 9, rot: 300 }],
  scorecard: [{ x: "4%", y: "8%", size: S(660), opacity: 0.48, dx: 22, dy: 30, dur: 24, delay: 14, rot: 70 }],
  engine: [{ x: "100%", y: "62%", size: S(680), opacity: 0.18, dx: -34, dy: 16, dur: 30, delay: 5, rot: 160 }],
  dashboard: [{ x: "0%", y: "42%", size: S(620), opacity: 0.5, dx: 30, dy: -26, dur: 21, delay: 17, rot: 250 }],
  proof: [{ x: "100%", y: "40%", size: S(560), opacity: 0.17, dx: -20, dy: 28, dur: 15, delay: 4, rot: 20 }],
  why: [{ x: "6%", y: "80%", size: S(680), opacity: 0.52, dx: 36, dy: -18, dur: 27, delay: 8, rot: 330 }],
  trusted: [{ x: "92%", y: "14%", size: S(560), opacity: 0.17, dx: -26, dy: 20, dur: 18, delay: 12, rot: 95 }],
  fit: [{ x: "94%", y: "78%", size: S(640), opacity: 0.48, dx: -24, dy: -32, dur: 23, delay: 1, rot: 180 }],
  faq: [{ x: "2%", y: "6%", size: S(480, 70), opacity: 0.12, dx: 18, dy: 24, dur: 29, delay: 15, rot: 50 }],
  audit: [{ x: "64%", y: "0%", size: S(600), opacity: 0.42, dx: 30, dy: 26, dur: 16, delay: 7, rot: 270 }],
  decide: [{ x: "0%", y: "92%", size: S(560), opacity: 0.18, dx: 24, dy: -28, dur: 25, delay: 10, rot: 140 }],
  // Final CTA + footer — green upper-left, a small bloom near the art; footer stays true dark
  final: [
    { x: "6%", y: "8%", size: S(700, 90), opacity: 0.42, dx: 26, dy: 34, dur: 20, delay: 13, rot: 10 },
    { x: "82%", y: "26%", size: S(340, 55), opacity: 0.22, dx: -22, dy: 18, dur: 14, delay: 4, rot: 230 },
  ],
}

//END
