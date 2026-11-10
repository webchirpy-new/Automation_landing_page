import React from "react"

/**
 * Pixel-SVG hybrid icon system. Every glyph is drawn on a 16×16 grid from
 * rectangles, rendered crisp. Layers:
 *   base   — ink (currentColor)
 *   muted  — 35% ink
 *   accent — green accent; carries the 1–3 frame "operation" motion (see components.css)
 *
 * Motion plays when an ancestor has `.is-active`, `[aria-expanded=true]`,
 * `[aria-selected=true]` or is hovered/focused (`.px-host`). Rest state is static.
 * Each rect gets `--i` (stagger) and optional `--dx/--dy` (travel) CSS vars.
 * A layer may use `polys` instead of `rects` for anti-aliased diagonals (status glyphs).
 */

const R = (x, y, w = 1, h = 1, vars) => ({ x, y, w, h, vars })

export const recipes = {
  /* 1 Lead Capture — five signals snap into one tray */
  leadCapture: {
    layers: [
      {
        cls: "base",
        rects: [R(2, 8, 1, 7), R(13, 8, 1, 7), R(2, 14, 12, 1), R(3, 10, 3, 1), R(10, 10, 3, 1), R(5, 10, 1, 3), R(10, 10, 1, 3), R(5, 12, 6, 1)],
      },
      {
        cls: "accent",
        anim: "drop",
        rects: [
          R(1, 1, 2, 2, { dx: 6, dy: 9 }),
          R(4, 3, 2, 2, { dx: 3, dy: 7 }),
          R(7, 1, 2, 2, { dx: 0, dy: 9 }),
          R(10, 3, 2, 2, { dx: -3, dy: 7 }),
          R(13, 1, 2, 2, { dx: -6, dy: 9 }),
        ],
      },
    ],
  },
  /* 2 Instant Reply — typing dots resolve into a reply */
  instantReply: {
    layers: [
      {
        cls: "base",
        rects: [R(2, 2, 12, 1), R(1, 3, 1, 7), R(14, 3, 1, 7), R(2, 10, 12, 1), R(3, 11, 2, 1), R(3, 12, 1, 2)],
      },
      { cls: "accent", anim: "blink", rects: [R(4, 6, 2, 2), R(7, 6, 2, 2), R(10, 6, 2, 2)] },
      { cls: "accent", anim: "bolt", rects: [R(12, 0, 2, 1), R(11, 1, 2, 1), R(12, 2, 2, 1)] },
    ],
  },
  /* 3 Operations — calendar slot snaps into place */
  operations: {
    layers: [
      {
        cls: "base",
        rects: [R(2, 3, 12, 1), R(2, 3, 1, 11), R(13, 3, 1, 11), R(2, 13, 12, 1), R(2, 6, 12, 1), R(5, 1, 1, 3), R(10, 1, 1, 3)],
      },
      { cls: "muted", rects: [R(4, 8, 2, 1), R(7, 8, 2, 1), R(10, 8, 2, 1), R(4, 10, 2, 1), R(7, 10, 2, 1)] },
      { cls: "accent", anim: "slot", rects: [R(10, 10, 2, 2, { dx: 5, dy: 0 })] },
    ],
  },
  /* 4 Back Office — rows stack onto the sheet */
  backOffice: {
    layers: [
      { cls: "muted", rects: [R(5, 1, 9, 1), R(13, 1, 1, 10)] },
      { cls: "base", rects: [R(2, 4, 10, 1), R(2, 4, 1, 11), R(11, 4, 1, 11), R(2, 14, 10, 1)] },
      { cls: "accent", anim: "stack", rects: [R(4, 7, 6, 1), R(4, 9, 6, 1), R(4, 11, 4, 1)] },
    ],
  },
  /* 5 Follow-up — signal pulses through Day 1 → 3 → 7 */
  followUp: {
    layers: [
      { cls: "base", rects: [R(1, 11, 14, 1), R(3, 3, 10, 1), R(2, 4, 1, 3), R(13, 4, 1, 3), R(12, 6, 3, 1), R(13, 7, 1, 1)] },
      { cls: "accent", anim: "seq", rects: [R(1, 10, 3, 3), R(6, 10, 3, 3), R(12, 10, 3, 3)] },
    ],
  },
  /* 6 Sales Pipeline — one block advances */
  salesPipeline: {
    layers: [
      { cls: "base", rects: [R(1, 11, 3, 3), R(5, 8, 3, 6), R(9, 5, 3, 9), R(0, 14, 16, 1)] },
      { cls: "accent", anim: "grow", rects: [R(13, 2, 2, 12)] },
    ],
  },
  /* 7 Retention — the loop closes around a heart */
  retention: {
    layers: [
      {
        cls: "base",
        rects: [R(5, 1, 6, 1), R(3, 2, 2, 1), R(2, 3, 1, 2), R(1, 5, 1, 6), R(14, 5, 1, 6), R(2, 11, 1, 2), R(13, 11, 1, 2), R(3, 13, 2, 1), R(11, 13, 2, 1), R(5, 14, 6, 1)],
      },
      { cls: "accent", anim: "close", rects: [R(11, 2, 2, 1), R(13, 3, 1, 2)] },
      { cls: "accent", anim: "beat", rects: [R(5, 6, 2, 1), R(9, 6, 2, 1), R(4, 7, 8, 2), R(5, 9, 6, 1), R(6, 10, 4, 1), R(7, 11, 2, 1)] },
    ],
  },
  /* 8 Insights — bars rise, sparkle answers */
  insights: {
    layers: [
      { cls: "base", rects: [R(1, 14, 14, 1)] },
      { cls: "accent", anim: "rise", rects: [R(2, 10, 2, 4), R(6, 7, 2, 7), R(10, 4, 2, 10)] },
      { cls: "accent", anim: "twinkle", rects: [R(13, 0, 1, 3), R(12, 1, 3, 1)] },
    ],
  },

  /* Utility glyphs */
  /* Branch — one route splits into three (engine workflow, Stage 03) */
  branch: {
    layers: [
      { cls: "base", rects: [R(1, 7, 3, 3), R(4, 8, 4, 1), R(8, 3, 1, 11), R(9, 3, 2, 1), R(9, 8, 2, 1), R(9, 13, 2, 1)] },
      { cls: "accent", anim: "seq", rects: [R(11, 2, 3, 3), R(11, 7, 3, 3), R(11, 12, 3, 3)] },
    ],
  },
  form: {
    layers: [
      { cls: "base", rects: [R(1, 2, 14, 1), R(1, 2, 1, 12), R(14, 2, 1, 12), R(1, 13, 14, 1), R(1, 5, 14, 1)] },
      { cls: "muted", rects: [R(3, 7, 6, 1), R(3, 9, 8, 1)] },
      { cls: "accent", anim: "blink", rects: [R(3, 3, 1, 1), R(5, 3, 1, 1), R(9, 11, 4, 1)] },
    ],
  },
  mail: {
    layers: [
      { cls: "base", rects: [R(1, 3, 14, 1), R(1, 3, 1, 10), R(14, 3, 1, 10), R(1, 12, 14, 1)] },
      { cls: "accent", anim: "stack", rects: [R(2, 4, 2, 1), R(4, 5, 2, 1), R(6, 6, 4, 1), R(10, 5, 2, 1), R(12, 4, 2, 1)] },
    ],
  },
  headset: {
    layers: [
      { cls: "base", rects: [R(5, 1, 6, 1), R(3, 2, 2, 1), R(11, 2, 2, 1), R(2, 3, 1, 4), R(13, 3, 1, 4), R(1, 7, 3, 4), R(12, 7, 3, 4), R(13, 11, 1, 2), R(9, 13, 4, 1)] },
      { cls: "accent", anim: "seq", rects: [R(5, 7, 1, 2), R(7, 6, 1, 4), R(9, 7, 1, 2)] },
    ],
  },
  chat: {
    layers: [
      { cls: "base", rects: [R(1, 2, 10, 1), R(1, 2, 1, 7), R(10, 2, 1, 4), R(1, 8, 5, 1), R(2, 9, 1, 2)] },
      { cls: "accent", rects: [R(7, 7, 8, 1), R(7, 7, 1, 6), R(14, 7, 1, 6), R(7, 12, 8, 1), R(12, 13, 1, 2)] },
      { cls: "accent", anim: "blink", rects: [R(9, 9, 1, 1), R(11, 9, 1, 1)] },
    ],
  },
  crm: {
    layers: [
      { cls: "base", rects: [R(1, 2, 4, 12), R(6, 2, 4, 9), R(11, 2, 4, 6)] },
      { cls: "accent", anim: "grow", rects: [R(11, 9, 4, 5)] },
    ],
  },
  invoice: {
    layers: [
      { cls: "base", rects: [R(3, 1, 8, 1), R(11, 1, 1, 1), R(12, 2, 1, 1), R(13, 3, 1, 12), R(3, 1, 1, 14), R(3, 14, 11, 1)] },
      { cls: "muted", rects: [R(5, 4, 4, 1), R(5, 6, 6, 1), R(5, 8, 6, 1)] },
      { cls: "accent", anim: "stack", rects: [R(8, 11, 4, 2)] },
    ],
  },
  chart: {
    layers: [
      { cls: "base", rects: [R(1, 1, 1, 14), R(1, 14, 14, 1)] },
      { cls: "accent", anim: "rise", rects: [R(4, 9, 2, 5), R(8, 6, 2, 8), R(12, 3, 2, 11)] },
    ],
  },
  /* Status glyphs: meaning wins over pixels — solid 2.4-unit strokes with clean diagonals */
  check: {
    layers: [{ cls: "accent", polys: ["3.35,7.65 6.39,10.69 12.55,2.76 14.45,4.24 6.61,14.31 1.65,9.35"] }],
  },
  cross: {
    layers: [
      {
        cls: "base",
        polys: ["2.65,4.35 4.35,2.65 13.35,11.65 11.65,13.35", "11.65,2.65 13.35,4.35 4.35,13.35 2.65,11.65"],
      },
    ],
  },
  help: {
    layers: [
      { cls: "base", rects: [R(7, 2, 2, 12), R(2, 7, 12, 2)] },
    ],
  },
  clock: {
    layers: [
      { cls: "base", rects: [R(5, 1, 6, 1), R(3, 2, 2, 1), R(11, 2, 2, 1), R(2, 3, 1, 2), R(13, 3, 1, 2), R(1, 5, 1, 6), R(14, 5, 1, 6), R(2, 11, 1, 2), R(13, 11, 1, 2), R(3, 13, 2, 1), R(11, 13, 2, 1), R(5, 14, 6, 1)] },
      { cls: "accent", anim: "seq", rects: [R(7, 4, 2, 4), R(9, 7, 3, 2)] },
    ],
  },
  play: {
    layers: [{ cls: "base", rects: [R(4, 2, 2, 12), R(6, 4, 2, 8), R(8, 5, 2, 6), R(10, 6, 2, 4), R(12, 7, 1, 2)] }],
  },
  people: {
    layers: [
      { cls: "base", rects: [R(3, 2, 4, 4), R(1, 8, 8, 6)] },
      { cls: "accent", anim: "seq", rects: [R(10, 3, 3, 3), R(9, 8, 6, 6)] },
    ],
  },
  seal: {
    layers: [
      { cls: "accent", rects: [R(5, 0, 6, 1), R(2, 1, 3, 1), R(11, 1, 3, 1), R(1, 2, 1, 3), R(14, 2, 1, 3), R(0, 5, 1, 6), R(15, 5, 1, 6), R(1, 11, 1, 3), R(14, 11, 1, 3), R(2, 14, 3, 1), R(11, 14, 3, 1), R(5, 15, 6, 1)] },
      { cls: "accent", anim: "stack", rects: [R(4, 8, 2, 2), R(6, 10, 2, 2), R(8, 8, 2, 2), R(10, 6, 2, 2)] },
    ],
  },
}

export default function PixelIcon({ name, size = 24, title, className = "", animate = true }) {
  const recipe = recipes[name]
  if (!recipe) return null
  return (
    <svg
      className={`px-icon ${animate ? "px-icon--anim" : ""} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {recipe.layers.map((layer, li) => (
        <g key={li} className={`px-${layer.cls} ${layer.anim ? `px-a-${layer.anim}` : ""}`}>
          {layer.polys?.map((pts) => <polygon key={pts} points={pts} shapeRendering="geometricPrecision" />)}
          {layer.rects?.map((r, ri) => (
            <rect
              key={ri}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              style={{
                "--i": ri,
                ...(r.vars ? { "--dx": `${r.vars.dx}px`, "--dy": `${r.vars.dy}px` } : null),
              }}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}
