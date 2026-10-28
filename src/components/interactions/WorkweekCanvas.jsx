import React, { useLayoutEffect, useRef, useState } from "react"
import PixelIcon from "../visuals/PixelIcon"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK, REDUCED } from "../../lib/motionTokens"

/*
 * "The Disappearing Workweek" — a conceptual Mon–Fri week. Symbolic slots, NOT
 * measured hours. Letters map to the five legend categories (c m r d f, same order
 * as the chart labels); an uppercase letter is a slot that starts as customer work
 * and is taken over by repetitive work as the section reveals.
 */
const CATS = { c: 0, m: 1, r: 2, d: 3, f: 4 }
const CAT_CLASS = ["wk--c", "wk--m", "wk--r", "wk--d", "wk--f"]
const DAYS = [
  { name: "Mon", slots: "cMcfcr" },
  { name: "Tue", slots: "rcMcdf" },
  { name: "Wed", slots: "cRmfcD" },
  { name: "Thu", slots: "cmRdfc" },
  { name: "Fri", slots: "DdMddc" },
]

// Slots each problem statement spotlights, as [day, slot]. The first one anchors the micro-label.
const SPOTS = [
  { cells: [[1, 0], [0, 5]], icon: "clock", note: "waits overnight" },
  { cells: [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]], icon: "backOffice", note: "manual all day" },
  { cells: [[2, 3], [0, 3], [1, 5], [3, 4]], icon: "followUp", note: "depends on memory" },
]

// A few fixed "time drain" pixels (% of the grid) near the crowded days. Decorative only.
const PIXELS = [
  { x: 15, y: 34, s: 6 },
  { x: 34, y: 62, s: 4 },
  { x: 53, y: 24, s: 8 },
  { x: 58, y: 72, s: 4 },
  { x: 74, y: 46, s: 6 },
  { x: 89, y: 16, s: 8 },
  { x: 96, y: 58, s: 4 },
]

function slotMarks(di, si) {
  const marks = {}
  SPOTS.forEach((s, i) =>
    s.cells.forEach(([d, slot], k) => {
      if (d !== di || slot !== si) return
      marks[`data-s${i}`] = ""
      if (k === 0) marks[`data-a${i}`] = ""
    })
  )
  return marks
}

/** `spot` is the problem statement currently in focus (0–2), or null. */
export default function WorkweekCanvas({ id, title, labels, disclaimer, note, spot }) {
  const root = useRef(null)
  const grid = useRef(null)
  const [pos, setPos] = useState([])

  // Pin each micro-label above its anchor slot, or beside it when "above" would cover
  // that day's name. Re-measure whenever the grid resizes.
  useLayoutEffect(() => {
    const g = grid.current
    const place = () => {
      const gr = g.getBoundingClientRect()
      setPos(
        SPOTS.map((_, i) => {
          const a = g.querySelector(`[data-a${i}]`)
          const c = g.querySelector(`[data-callout="${i}"]`)
          if (!a || !c) return null
          const r = a.getBoundingClientRect()
          const day = a.parentElement.querySelector(".wk__dayname").getBoundingClientRect()
          const w = c.offsetWidth
          const h = c.offsetHeight
          const coversDay = r.top - h - 8 < day.bottom && r.left < day.right && r.right > day.left
          if (coversDay) {
            const before = r.left - gr.left - w - 10
            return { left: before >= 0 ? before : r.right - gr.left + 10, top: r.top - gr.top + (r.height - h) / 2 }
          }
          // In the mobile row layout, never cover the day-name column
          const minLeft = day.right <= r.left ? day.right - gr.left + 4 : 0
          const left = Math.min(Math.max(r.left - gr.left + r.width / 2 - w / 2, minLeft), Math.max(gr.width - w, 0))
          return { left, top: r.top - gr.top - h - 8 }
        })
      )
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(g)
    return () => ro.disconnect()
  }, [])

  // Entrance: days appear, customer work fills the week, then repetitive work crowds in.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root)
        const cust = q(".wk-cell__cust")
        const fill = q(".wk-cell__fill")
        const px = q(".wk__px")
        gsap.set(cust, { scaleY: 0 })
        gsap.set(fill, { scaleX: 0 })

        const tl = gsap.timeline({ scrollTrigger: { trigger: grid.current, start: "top 80%", once: true } })
        tl.from(q(".wk__dayname"), { autoAlpha: 0, y: 8, duration: 0.4, ease: "power2.out", stagger: 0.06 })
          .to(cust, { scaleY: 1, duration: 0.45, ease: "power2.out", stagger: 0.02 }, "-=0.1")
          .to(fill, { scaleX: 1, duration: 0.55, ease: "power2.inOut", stagger: 0.06 }, "+=0.2")

        // Time-drain pixels loop only after the week has filled, and only while on screen
        const drain = gsap.timeline({ paused: true, repeat: -1 })
        px.forEach((p, i) => {
          const t = i * 0.45
          drain
            .set(p, { y: -6, autoAlpha: 0 }, t)
            .to(p, { autoAlpha: 0.85, duration: 0.5, ease: "power1.out" }, t)
            .to(p, { y: 22, autoAlpha: 0, duration: 1.7, ease: "power1.in" }, t + 0.5)
        })
        let filled = false
        let onScreen = false
        const sync = () => (filled && onScreen ? drain.play() : drain.pause())
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (st) => {
            onScreen = st.isActive
            sync()
          },
        })
        tl.eventCallback("onComplete", () => {
          filled = true
          sync()
        })
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  // Spotlight change: cross-fade the micro-labels (instant under reduced motion).
  useGSAP(
    () => {
      const instant = window.matchMedia(REDUCED).matches
      gsap.utils.toArray("[data-callout]", grid.current).forEach((el, i) =>
        gsap.to(el, {
          autoAlpha: i === spot ? 1 : 0,
          y: i === spot ? 0 : 6,
          duration: instant ? 0 : 0.35,
          ease: "power2.out",
          overwrite: true,
        })
      )
    },
    { scope: root, dependencies: [spot] }
  )

  return (
    <figure ref={root} id={id} className="wk" data-spot={spot ?? undefined} aria-labelledby={`${id}-title`}>
      <div className="wk__head">
        <h3 id={`${id}-title`} className="wk__title">
          {title}
        </h3>
        <span className="badge badge--outline t-mono">{disclaimer}</span>
      </div>

      <div ref={grid} className="wk__grid" aria-hidden="true">
        {DAYS.map((d, di) => (
          <div key={d.name} className="wk__day">
            <span className="wk__dayname t-mono">{d.name}</span>
            {[...d.slots].map((ch, si) => {
              const cat = CATS[ch.toLowerCase()]
              const yields = ch !== ch.toLowerCase()
              return (
                <span key={si} className="wk-cell" {...slotMarks(di, si)}>
                  {(cat === 0 || yields) && <i className="wk-cell__cust wk--c" />}
                  {cat !== 0 && <i className={`wk-cell__fill ${CAT_CLASS[cat]}`} />}
                </span>
              )
            })}
          </div>
        ))}
        {PIXELS.map((p, i) => (
          <i key={i} className="wk__px" style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--s": `${p.s}px` }} />
        ))}
        {SPOTS.map((s, i) => (
          <span key={s.note} data-callout={i} className="wk__callout" style={pos[i] || undefined}>
            <PixelIcon name={s.icon} size={14} animate={false} />
            {s.note}
          </span>
        ))}
      </div>

      <ul className="wk__legend">
        {labels.map((l, i) => (
          <li key={l}>
            <i className={`wk-swatch ${CAT_CLASS[i]}`} aria-hidden="true" />
            {l}
          </li>
        ))}
      </ul>
      <figcaption className="wk__note">{note}</figcaption>
    </figure>
  )
}
