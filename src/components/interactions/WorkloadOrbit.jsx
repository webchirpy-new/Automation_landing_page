import React, { useRef, useState } from "react"
import { pattern, uiCopy } from "../../data/automationContent"
import { CARDS, CORE_LABEL, CORE_LINE, CORE_RADIUS, CORE_SHRINK, REST_ANGLE, RINGS, STAGES, START_ANGLE, TANGENT, TIMELINE, centreOf, pointOn } from "../../data/workloadOrbit"
import { gsap, useGSAP } from "../../lib/gsap"
import { getLenis } from "../../lib/smoothScroll"
import { Marked } from "../ui/Highlight"
import { OrbitCardArt, OrbitCardIcon } from "../visuals/OrbitCardArt"

/**
 * Workload Orbit — one master GSAP timeline, scrubbed by the scroll position of a tall track
 * while the stage inside it stays sticky. The timeline moves the geometry (discs, markers,
 * trails, fan positions, core) and derives the current stage from its progress.
 *
 * Text never lives on the scrub: scroll-linked opacity leaves words half-faded wherever the
 * visitor stops, in either direction. Lines, labels and cards read the derived stage and switch
 * on a short timed CSS transition, so at rest text is always fully on or fully off.
 * Clicking a control scrolls to that stage instead of forking the state.
 *
 * Sticky (CSS) rather than a ScrollTrigger pin: no spacer to re-measure, and it stays stable
 * under Lenis and through mobile address-bar resizes. Without room or motion the stage sits in
 * normal flow and the same timeline is simply stepped by the controls.
 */
const MODES = {
  scrub: "(prefers-reduced-motion: no-preference) and (min-height: 600px)",
  short: "(prefers-reduced-motion: no-preference) and (max-height: 599.98px)",
  reduced: "(prefers-reduced-motion: reduce)",
}
const VIEW = 1000
const LAST_MOMENT = RINGS.length

export default function WorkloadOrbit() {
  const root = useRef(null)
  const square = useRef(null)
  const goRef = useRef(() => {})
  const momentRef = useRef(0)
  const [moment, setMoment] = useState(0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MODES, (ctx) => {
        const { scrub, reduced } = ctx.conditions
        const q = gsap.utils.selector(root)
        const { starts, reveal: R } = TIMELINE
        const fade = TIMELINE.crossfade
        const P = 1 // the timeline's length is 1, so tween positions read as scroll progress
        const nextStart = (i) => (i + 1 < starts.length ? starts[i + 1] : P)
        // Each stage's resting progress, used by the controls and the non-scrub modes.
        const holds = [(R + starts[0]) / 2, ...starts.map((s, i) => (s + fade + nextStart(i)) / 2)]

        const el = {
          marks: q(".orbit-mark"),
          labels: q(".orbit-tag"),
          trails: q(".orbit-trail"),
          outlines: q(".orbit-outline"),
          fans: q(".orbit-fan"),
          core: q(".orbit-core")[0],
          coreEdge: q(".orbit-core-edge")[0],
        }

        // Everything the render step needs; the timeline tweens these plain numbers.
        const state = {
          markers: RINGS.map(() => ({ a: START_ANGLE })),
          fans: RINGS.flatMap((ring, i) => ring.fan.map((f) => ({ ring: i, a: ring.travelTo, to: f.angle, node: null }))),
          core: { k: 1 },
        }
        state.fans.forEach((f, i) => (f.node = el.fans[i]))
        const centres = RINGS.map((r) => centreOf(r.r))
        let scale = 1

        const render = () => {
          RINGS.forEach((ring, i) => {
            const a = state.markers[i].a
            const p = pointOn(ring.r, a, centres[i])
            el.marks[i + 1]?.setAttribute("transform", `translate(${p.x} ${p.y})`)
            const tag = el.labels[i + 1]
            if (tag) tag.style.transform = `translate3d(${p.x * scale}px, ${p.y * scale}px, 0) translate(-50%, -100%)`
            const trail = el.trails[i]
            if (trail) {
              trail.setAttribute("transform", `rotate(${a} ${centres[i].x} ${centres[i].y})`)
              trail.setAttribute("stroke-dasharray", `${Math.max(0, REST_ANGLE - a) / 360} 1`)
            }
          })
          // The core keeps touching the tangent point as it shrinks.
          const r = CORE_RADIUS * state.core.k
          const c = centreOf(r)
          for (const n of [el.core, el.coreEdge]) {
            n.setAttribute("r", r)
            n.setAttribute("cx", c.x)
            n.setAttribute("cy", c.y)
          }
          state.fans.forEach((f) => {
            const p = pointOn(RINGS[f.ring].r, f.a, centres[f.ring])
            f.node.style.transform = `translate3d(${p.x * scale}px, ${p.y * scale}px, 0)`
          })
        }

        const measure = () => {
          scale = square.current.clientWidth / VIEW
          const home = el.labels[0]
          // Offset to the outer side of the marker, so the label never sits on the bright core.
          if (home) home.style.transform = `translate3d(${TANGENT.x * scale}px, ${TANGENT.y * scale}px, 0) translate(-26%, -100%)`
          render()
        }
        const ro = new ResizeObserver(measure)
        ro.observe(square.current)
        measure()

        const syncMoment = (p) => {
          let m = 0
          starts.forEach((s, i) => {
            if (p >= s + fade * 0.4) m = i + 1
          })
          if (m !== momentRef.current) {
            momentRef.current = m
            setMoment(m)
          }
        }

        gsap.set(el.labels, { opacity: 0 })
        gsap.set([...el.trails, ...el.outlines], { opacity: 0 })
        gsap.set(q(".orbit-disc"), { opacity: 0, scale: 0.55, svgOrigin: `${TANGENT.x} ${TANGENT.y}` })
        gsap.set(el.marks, { opacity: 0 })

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          paused: !scrub,
          onUpdate: () => {
            render()
            syncMoment(tl.progress())
          },
          scrollTrigger: scrub
            ? {
                trigger: q(".orbit-track")[0],
                start: "top 75%",
                end: "bottom bottom",
                scrub: 0.45,
                onToggle: (st) => root.current?.toggleAttribute("data-live", st.isActive),
              }
            : undefined,
        })

        // Reveal — the discs unfold out of the tangent point, core first…
        tl.to(q(".orbit-disc"), { opacity: 1, scale: 1, duration: R * 0.65, ease: "power2.out", stagger: { each: R * 0.09, from: "end" } }, 0)
        // …and the markers leave it together, sweeping round their rims to the far side.
        tl.to(el.marks, { opacity: 1, duration: R * 0.15, stagger: R * 0.06 }, R * 0.25)
        RINGS.forEach((_, i) => {
          tl.to(state.markers[i], { a: REST_ANGLE, duration: R * 0.65, ease: "power3.inOut" }, R * (0.275 + i * 0.06))
        })
        // Labels arrive during the entrance only, and finish at full strength.
        tl.to(el.labels, { opacity: 1, duration: R * 0.12, stagger: R * 0.03 }, R * 0.7)

        // Stages 2–4. Stage 1 is the resting orbit straight after the reveal.
        RINGS.forEach((ring, i) => {
          const s = starts[i]
          const end = nextStart(i)
          const fans = state.fans.filter((f) => f.ring === i)

          // Ring lights up
          tl.to(el.outlines[i], { opacity: 1, duration: fade }, s)
          tl.to(el.trails[i], { opacity: 1, duration: fade }, s)
          if (i < LAST_MOMENT - 1) {
            tl.to(el.outlines[i], { opacity: 0, duration: fade }, end)
            tl.to(el.trails[i], { opacity: 0.32, duration: fade }, end)
          }

          // The marker keeps slipping along its rim for as long as the stage lasts
          tl.to(state.markers[i], { a: ring.travelTo, duration: end - s - 0.004, ease: "sine.out" }, s)

          // Fan labels burst out of the marker, spread along the rim, then keep drifting
          fans.forEach((f, k) => {
            const stop = f.to + (f.to > ring.travelTo ? 4 : -4)
            tl.fromTo(f, { a: ring.travelTo + 34 }, { a: stop, duration: fade * 2, ease: "power3.out", immediateRender: false }, s + k * 0.006)
            tl.to(f, { a: f.to, duration: Math.max(0.01, end - s - fade * 2 - 0.02), ease: "none" }, s + fade * 2 + k * 0.006)
          })

          // Customer work loses ground with every moment
          tl.to(state.core, { k: CORE_SHRINK[i + 1], duration: fade * 2.4, ease: "power2.inOut" }, s)
        })

        tl.fromTo(q(".orbit-progress i"), { scaleX: 0 }, { scaleX: 1, duration: P - R, transformOrigin: "0 50%" }, R)
        tl.to({}, { duration: 0.001 }, P - 0.001) // keeps duration exactly 1

        // Controls land on a moment by scrolling to it, or by stepping the paused timeline.
        goRef.current = (m) => {
          const target = holds[Math.max(0, Math.min(LAST_MOMENT, m))]
          if (scrub) {
            const st = tl.scrollTrigger
            const y = st.start + (st.end - st.start) * target
            const lenis = getLenis()
            if (lenis) lenis.scrollTo(y, { duration: 1.15, easing: (t) => 1 - (1 - t) ** 3 })
            else window.scrollTo({ top: y, behavior: "smooth" })
          } else if (reduced) {
            tl.progress(target)
            render()
            syncMoment(target)
          } else {
            tl.tweenTo(tl.duration() * target, { duration: 0.9, ease: "power2.inOut" })
          }
        }

        if (!scrub) {
          // Static modes rest on the finished reveal; idle pulses run only with motion on.
          tl.progress(holds[0])
          render()
          syncMoment(holds[0])
          if (!reduced) root.current.setAttribute("data-live", "")
        }

        return () => {
          ro.disconnect()
          root.current?.removeAttribute("data-live")
          goRef.current = () => {}
          momentRef.current = 0
          setMoment(0)
        }
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  const go = (m) => goRef.current(m)
  const cut = pattern.headline.indexOf("So why")
  const lead = pattern.headline.slice(0, cut).trim()
  const question = pattern.headline.slice(cut)
  const chips = (cls, extra = {}) => (
    <ul className={cls} {...extra}>
      {pattern.chips.map((c) => (
        <li key={c}>
          <span className="pattern__tick">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m3.6 8.4 2.9 2.8 5.9-6.4" />
            </svg>
          </span>
          {c}
        </li>
      ))}
    </ul>
  )

  return (
    <div ref={root} className="orbit" data-moment={moment}>
      <div className="orbit-track">
        <div className="orbit-stage">
          <div className="orbit-main">
            <div className="orbit-copy">
              <h2 id="pattern-title" className="t-h2 orbit-h" data-reveal>
                <span className="orbit-h__lead">{lead}</span> <Marked text={question} phrase="slipping through?" tone="dark" />
              </h2>
              <div data-reveal className="orbit-chips-desk">
                {chips("pattern__points", { "aria-label": uiCopy.orbit.pointsLabel })}
              </div>
            </div>

            <figure className="orbit-visual" aria-labelledby="orbit-note">
              <figcaption id="orbit-note" className="sr-only">
                {uiCopy.orbit.note}
              </figcaption>
              <div className="orbit-canvas">
                <div ref={square} className="orbit-square" aria-hidden="true">
                  <span className="orbit-glow" />
                  <svg className="orbit-svg" viewBox={`0 0 ${VIEW} ${VIEW}`} fill="none">
                    <defs>
                      <radialGradient id="orbit-g0" cx="0.72" cy="0.26" r="0.86">
                        <stop stopColor="#d7dbf4" stopOpacity=".26" />
                        <stop offset=".6" stopColor="#6e749e" stopOpacity=".15" />
                        <stop offset="1" stopColor="#2d335b" stopOpacity=".2" />
                      </radialGradient>
                      <radialGradient id="orbit-g1" cx="0.7" cy="0.28" r="0.84">
                        <stop stopColor="#e6e2fb" stopOpacity=".34" />
                        <stop offset=".68" stopColor="#7b81ac" stopOpacity=".2" />
                        <stop offset="1" stopColor="#383e69" stopOpacity=".26" />
                      </radialGradient>
                      <radialGradient id="orbit-g3" cx="0.66" cy="0.3" r="0.82">
                        <stop stopColor="#fbfaff" />
                        <stop offset=".5" stopColor="#d6d8f6" />
                        <stop offset=".8" stopColor="#a99ad8" />
                        <stop offset="1" stopColor="#6c6fae" />
                      </radialGradient>
                      {/* Pearl sheen over the core: cyan low-left, rose high-right, clear centre */}
                      <linearGradient id="orbit-sheen" x1="0" y1="1" x2="1" y2="0">
                        <stop stopColor="#8ce6f0" stopOpacity=".7" />
                        <stop offset=".42" stopColor="#87baff" stopOpacity="0" />
                        <stop offset=".6" stopColor="#b79aee" stopOpacity="0" />
                        <stop offset="1" stopColor="#f0bedf" stopOpacity=".75" />
                      </linearGradient>
                      {/* One halo per hue, so neighbouring markers glow in different colours */}
                      {[
                        ["#8ce6f0", "#87baff"],
                        ["#c9b8f5", "#9b7fe6"],
                        ["#f0bedf", "#b79aee"],
                        ["#87baff", "#8ce6f0"],
                      ].map(([a, b], i) => (
                        <radialGradient key={a + i} id={`orbit-halo-${i}`}>
                          <stop stopColor={a} stopOpacity=".72" />
                          <stop offset=".5" stopColor={b} stopOpacity=".22" />
                          <stop offset="1" stopColor={b} stopOpacity="0" />
                        </radialGradient>
                      ))}
                      <linearGradient id="orbit-neo" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#8ce6f0" />
                        <stop offset=".4" stopColor="#87baff" />
                        <stop offset=".72" stopColor="#b79aee" />
                        <stop offset="1" stopColor="#f0bedf" />
                      </linearGradient>
                      <linearGradient id="orbit-ring" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#a8ecf3" />
                        <stop offset=".45" stopColor="#c9b8f5" />
                        <stop offset="1" stopColor="#f0bedf" />
                      </linearGradient>
                    </defs>

                    {/* Discs, largest to smallest; each touches the tangent point */}
                    {[...RINGS].reverse().map((ring, i) => {
                      const c = centreOf(ring.r)
                      return <circle key={ring.r} className="orbit-disc" cx={c.x} cy={c.y} r={ring.r} fill={`url(#orbit-g${i === 2 ? 1 : 0})`} stroke="#d5daf6" strokeOpacity=".18" />
                    })}
                    <g className="orbit-disc">
                      <circle className="orbit-core" cx={centreOf(CORE_RADIUS).x} cy={centreOf(CORE_RADIUS).y} r={CORE_RADIUS} fill="url(#orbit-g3)" fillOpacity=".92" />
                      <circle className="orbit-core-edge" cx={centreOf(CORE_RADIUS).x} cy={centreOf(CORE_RADIUS).y} r={CORE_RADIUS} fill="url(#orbit-sheen)" fillOpacity=".5" stroke="#fff" strokeOpacity=".5" />
                    </g>

                    {RINGS.map((ring) => {
                      const c = centreOf(ring.r)
                      return (
                        <g key={ring.r}>
                          <circle className="orbit-outline" cx={c.x} cy={c.y} r={ring.r} stroke="url(#orbit-ring)" strokeOpacity=".8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                          <circle className="orbit-trail" cx={c.x} cy={c.y} r={ring.r} stroke="url(#orbit-neo)" strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="0 1" vectorEffect="non-scaling-stroke" />
                        </g>
                      )
                    })}

                    {/* Markers: 0 sits on the tangent point, the rest are placed by the timeline */}
                    <g className="orbit-mark orbit-mark--home" transform={`translate(${TANGENT.x} ${TANGENT.y})`}>
                      <circle className="orbit-halo" r="36" fill="url(#orbit-halo-0)" />
                      <circle r="9" fill="url(#orbit-neo)" />
                    </g>
                    {RINGS.map((ring, i) => {
                      const p = pointOn(ring.r, START_ANGLE)
                      return (
                        <g key={ring.r} className="orbit-mark" data-m={i + 1} transform={`translate(${p.x} ${p.y})`}>
                          <circle className="orbit-halo" r="46" fill={`url(#orbit-halo-${i + 1})`} />
                          <circle className="orbit-dot" r="10" fill="url(#orbit-neo)" />
                        </g>
                      )
                    })}
                  </svg>

                  <span className="orbit-tag orbit-tag--home" data-active={moment === 0 || undefined}>
                    {CORE_LABEL}
                  </span>
                  {RINGS.map((ring, i) => (
                    <span key={ring.label} className="orbit-tag" data-m={i + 1} data-active={moment === i + 1 || undefined}>
                      {ring.label}
                    </span>
                  ))}
                  {RINGS.flatMap((ring, i) =>
                    ring.fan.map((f) => (
                      <span key={f.text} className={`orbit-fan orbit-fan--${f.side} ${f.key ? "orbit-fan--key" : ""}`} data-active={moment === i + 1 || undefined}>
                        <i />
                        <b>{f.text}</b>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="orbit-story" role="group" aria-label={uiCopy.orbit.groupLabel}>
                <button type="button" className="orbit-arrow" aria-label={uiCopy.orbit.prev} disabled={moment === 0} onClick={() => go(moment - 1)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m15 5-7 7 7 7" />
                  </svg>
                </button>
                <div className="orbit-slot">
                  {chips("orbit-slotchips pattern__points", { "aria-label": uiCopy.orbit.pointsLabel, "data-active": moment === 0 || undefined })}
                  {/* Repeats a chip that is already in the list on this layout, so readers skip it */}
                  <p className="orbit-line orbit-line--core" aria-hidden="true" data-active={moment === 0 || undefined}>
                    {CORE_LINE}
                  </p>
                  {RINGS.map((ring, i) => (
                    <p key={ring.line} className="orbit-line" data-active={moment === i + 1 || undefined}>
                      {ring.line}
                    </p>
                  ))}
                  <span className="orbit-progress" aria-hidden="true">
                    <i />
                  </span>
                </div>
                <button type="button" className="orbit-arrow" aria-label={uiCopy.orbit.next} disabled={moment === LAST_MOMENT} onClick={() => go(moment + 1)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="orbit-meta">
                {/* The conceptual-illustration note stays as the figure's caption (#orbit-note) */}
                <div className="orbit-dots">
                  {STAGES.map((stage, i) => (
                    <button key={stage} type="button" className="orbit-dotbtn" aria-label={stage} aria-pressed={moment === i} onClick={() => go(i)}>
                      <i />
                    </button>
                  ))}
                </div>
              </div>
            </figure>
          </div>

          <div className="orbit-support" data-reveal>
            <h3 className="orbit-support__title">{pattern.chartTitle}</h3>
            <div className="orbit-cards">
              {CARDS.map((card) => (
                <button key={card.id} type="button" className="orbit-card" data-active={moment === card.moment || undefined} aria-pressed={moment === card.moment} onClick={() => go(card.moment)}>
                  <OrbitCardIcon name={card.id} />
                  <span className="orbit-card__label">
                    {card.labels.map((label, i) => (
                      <React.Fragment key={label}>
                        {i > 0 && <span className="orbit-card__sep"> / </span>}
                        <span className="orbit-card__part">
                          {/* Words never split inside, so narrow cards break at a space, never at the hyphen */}
                          {label.split(" ").map((w, k) => (
                            <React.Fragment key={w + k}>
                              {k > 0 && " "}
                              <span className="orbit-card__word">{w}</span>
                            </React.Fragment>
                          ))}
                        </span>
                      </React.Fragment>
                    ))}
                  </span>
                  <OrbitCardArt name={card.id} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
