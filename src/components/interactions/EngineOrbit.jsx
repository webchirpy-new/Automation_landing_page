import React, { useCallback, useEffect, useRef } from "react"
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react"
import { Check, Sparkles } from "lucide-react"
import { engine, uiCopy } from "../../data/automationContent"
import { serviceModules, moduleByName } from "../../data/serviceModules"
import PixelIcon from "../visuals/PixelIcon"
import EngineMicroDemo from "./EngineMicroDemos"
import { useStoryClock } from "../../hooks/useStoryClock"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import { scrollToElement } from "../../lib/smoothScroll"

/**
 * THE LIVING EIGHT-PART ENGINE
 *
 * Wide screens: the eight parts sit on a tilted orbit around one glass core. One part is active at a
 * time: its pathway lights and carries a pulse into the core, its node lifts, and the core plays that
 * part's micro-demo, then its promise and its result. Then the next part: 5 s per part, looping.
 * Narrow screens: the core becomes a card on top, and the eight parts form a closed 4 × 2 circuit below.
 *
 * No playback buttons. Picking a part (click, tap, arrow keys, Home/End) holds it. The hold ends, and
 * the tour carries on from that part after a fresh 5 s, when the visitor is done with the engine:
 *   - mouse: the pointer leaves the whole engine (moving between parts or into the core doesn't count)
 *   - touch / pen: a tap anywhere outside the engine
 *   - keyboard: focus moves to something outside the engine
 *   - any device: the engine scrolls out of view
 * The tour only runs while the engine is on screen, and not at all under reduced motion.
 * Deep links #engine-<part-id> (hero tiles) still open a part.
 *
 * Layout: the progress count (03 / 08) sits top right, and the active part's "What it covers" card
 * is always open. From 1200px the engine sits left with both in a rail on its right; below that
 * the count sits above the engine on the right and the card sits under it. All eight cards are
 * stacked in one cell, so the card keeps one size as the tour moves and nothing below it jumps.
 */
const S = uiCopy.stories.engine
const PARTS = serviceModules
const N = PARTS.length
const PART_MS = 5000
const DURATIONS = PARTS.map(() => PART_MS)
const EASE = [0.22, 1, 0.36, 1]
const WIDE_Q = "(min-width: 960px)"

// Orbit geometry in a 1000 × 700 box (the container keeps this aspect ratio)
const BOX = { w: 1000, h: 700, cx: 500, cy: 350, rx: 392, ry: 278 }
const angle = (i) => ((-90 + i * (360 / N)) * Math.PI) / 180
const nodePoint = (i) => [BOX.cx + BOX.rx * Math.cos(angle(i)), BOX.cy + BOX.ry * Math.sin(angle(i))]
// Pathways bend slightly, like a slow vortex into the core
function pathway(i) {
  const [x, y] = nodePoint(i)
  const mx = (x + BOX.cx) / 2 - BOX.cx
  const my = (y + BOX.cy) / 2 - BOX.cy
  const t = (16 * Math.PI) / 180
  const qx = BOX.cx + mx * Math.cos(t) - my * Math.sin(t)
  const qy = BOX.cy + mx * Math.sin(t) + my * Math.cos(t)
  return `M${x} ${y}Q${qx} ${qy} ${BOX.cx} ${BOX.cy}`
}

/** One part's "What it covers" card. Only the active part's card is shown (the rest are stacked
 *  under it, hidden), and only its chips can take focus. */
function Details({ part, n, active, onPick }) {
  // The workflow stage this part belongs to (e.g. Lead Capture + Instant Reply → "Answer every customer")
  const stage = engine.stages.find((s) => s.parts.includes(part.part))
  const stageNo = stage ? engine.stages.indexOf(stage) + 1 : 0
  return (
    <div className={`eg-details ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <p className="eg-details__stage">
        {stageNo > 0 && <span className="eg-details__num">{String(stageNo).padStart(2, "0")}</span>}
        {stage?.title ?? S.detailsShow}
      </p>
      <p className="eg-details__title">{part.part}</p>
      <ul className="eg-details__list">
        {part.cover.map((c) => (
          <li key={c}>
            <Check size={14} strokeWidth={2.6} aria-hidden="true" />
            {c}
          </li>
        ))}
      </ul>
      <p className="eg-details__with">
        <span className="eg-details__label t-mono">{S.worksWith}</span>
        {part.worksWith.map((name) => {
          const target = moduleByName[name]
          return target ? (
            <button key={name} type="button" className="eg-chip" tabIndex={active ? 0 : -1} onClick={() => onPick(target.index)}>
              {name}
            </button>
          ) : (
            <span key={name} className="eg-chip eg-chip--static">
              {name}
            </span>
          )
        })}
      </p>
    </div>
  )
}

export default function EngineOrbit() {
  const rootRef = useRef(null)
  const progressRef = useRef(null)
  const tabRefs = useRef([])
  const wide = useMediaQuery(WIDE_Q)

  const onProgress = useCallback((p) => progressRef.current?.style.setProperty("--p", p.toFixed(4)), [])
  const story = useStoryClock({ durations: DURATIONS, rootRef, onProgress, threshold: 0.3 })
  const { go, release, inView } = story
  const mouseInside = useRef(false)

  const active = story.index
  const part = PARTS[active]
  const num = String(active + 1).padStart(2, "0")

  const pick = (i, { focus = false } = {}) => {
    go(i)
    if (focus) tabRefs.current[(i + N) % N]?.focus()
  }

  // Scrolled away (any device): end the hold, so the tour runs normally the next time it is seen.
  // Only on the visible → hidden change, so a deep link's hold set before first sight survives.
  const wasInView = useRef(false)
  useEffect(() => {
    if (wasInView.current && !inView) release()
    wasInView.current = inView
  }, [inView, release])

  // Touch and pen have no "leave": a tap anywhere outside the engine ends the hold.
  useEffect(() => {
    const onDown = (e) => {
      if (e.pointerType === "mouse" || rootRef.current?.contains(e.target)) return
      release()
    }
    document.addEventListener("pointerdown", onDown, true)
    return () => document.removeEventListener("pointerdown", onDown, true)
  }, [release])

  // Mouse: inside while over any part of the engine; leaving the whole engine ends the hold.
  const onPointerOver = (e) => {
    if (e.pointerType === "mouse") mouseInside.current = true
  }
  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse") return // touch fires leave on every lift
    mouseInside.current = false
    release()
  }
  // Keyboard: focus moving to something outside the engine ends the hold (not while the mouse is in it).
  const onBlur = (e) => {
    const to = e.relatedTarget
    if (!to || rootRef.current?.contains(to) || mouseInside.current) return
    release()
  }

  // Deep links from the hero tiles and elsewhere: #engine-<part-id>
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash
      if (!h.startsWith("#engine-")) return
      const i = PARTS.findIndex((p) => p.id === h.slice("#engine-".length))
      if (i < 0) return
      go(i)
      window.requestAnimationFrame(() => rootRef.current && scrollToElement(rootRef.current))
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    return () => window.removeEventListener("hashchange", fromHash)
  }, [go])

  const onKey = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    let next = null
    if (step) next = (active + step + N) % N
    if (e.key === "Home") next = 0
    if (e.key === "End") next = N - 1
    if (next === null) return
    e.preventDefault()
    pick(next, { focus: true })
  }

  // One-shot visuals start the first time the engine is actually seen (or used)
  const live = story.epoch > 0 || story.reduced

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div
          ref={rootRef}
          className={`eg ${story.running ? "is-running" : ""}`}
          data-layout={wide ? "wide" : "narrow"}
          data-reveal
          onPointerOver={onPointerOver}
          onPointerLeave={onPointerLeave}
          onBlur={onBlur}
        >
          <div className="eg-main">
            {/* Which part is showing (updates on its own): top right */}
            <span ref={progressRef} className="eg-progress" aria-hidden="true">
              <span className="eg-progress__count t-mono">
                {num} / {String(N).padStart(2, "0")}
              </span>
              <span className="eg-progress__bar">
                <span className="eg-progress__fill" />
              </span>
            </span>

            <div className="eg-stage">
              {/* Orbit, pathways and the active pulse (wide only) */}
              {wide && (
                <svg className="eg-orbit" viewBox={`0 0 ${BOX.w} ${BOX.h}`} aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="eg-spec" gradientUnits="userSpaceOnUse" x1="120" y1="60" x2="880" y2="640">
                      <stop offset="0" stopColor="#1d6f96" />
                      <stop offset="0.35" stopColor="#2f55c8" />
                      <stop offset="0.7" stopColor="#6440c8" />
                      <stop offset="1" stopColor="#a3387f" />
                    </linearGradient>
                    <radialGradient id="eg-floor">
                      <stop offset="0" stopColor="#8f7cf0" stopOpacity="0.16" />
                      <stop offset="1" stopColor="#87baff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx={BOX.cx} cy={BOX.cy + 20} rx="330" ry="210" fill="url(#eg-floor)" />
                  <ellipse className="eg-ring" cx={BOX.cx} cy={BOX.cy} rx={BOX.rx} ry={BOX.ry} />
                  <ellipse className="eg-ring eg-ring--flow" cx={BOX.cx} cy={BOX.cy} rx={BOX.rx} ry={BOX.ry} pathLength="1" stroke="url(#eg-spec)" />
                  <ellipse className="eg-ring eg-ring--inner" cx={BOX.cx} cy={BOX.cy} rx="250" ry="236" />
                  {PARTS.map((p, i) => (
                    <path key={p.id} d={pathway(i)} className={`eg-path ${i === active ? "is-active" : ""}`} />
                  ))}
                  {live && (
                    <g key={active}>
                      <m.path
                        d={pathway(active)}
                        className="eg-path__lit"
                        stroke="url(#eg-spec)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                      />
                      <path d={pathway(active)} pathLength="1" className="eg-pulse" stroke="url(#eg-spec)" />
                    </g>
                  )}
                </svg>
              )}

              {/* The core: plays the active part */}
              <section id="engine-panel" className="eg-core" role="tabpanel" aria-labelledby={`eg-tab-${part.id}`} tabIndex={-1}>
                <span className="eg-core__halo" aria-hidden="true" />
                <p className="eg-core__label">
                  <Sparkles size={13} strokeWidth={2} aria-hidden="true" />
                  {S.core}
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={part.id}
                    className="eg-core__body"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.22 } }}
                    transition={{ duration: 0.38, ease: EASE }}
                  >
                    <h3 className="eg-core__name">
                      <span className="eg-core__num">{num}</span>
                      {part.part}
                    </h3>
                    <div className="eg-demo" aria-hidden="true">
                      {live ? <EngineMicroDemo id={part.id} /> : null}
                    </div>
                    <p className="eg-core__promise">{part.promise}</p>
                    <m.p className="eg-core__result" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: live ? 1.9 : 0, duration: 0.4, ease: EASE }}>
                      <span className="eg-core__tick" aria-hidden="true">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span className="sr-only">{S.resultLabel}: </span>
                      {part.produces}
                    </m.p>
                  </m.div>
                </AnimatePresence>
              </section>

              {/* The eight parts */}
              <div className="eg-nodes" role="tablist" aria-label={S.partsLabel} onKeyDown={onKey}>
                {!wide && <span className="eg-circuit" aria-hidden="true" />}
                {PARTS.map((p, i) => {
                  const [x, y] = nodePoint(i)
                  const on = i === active
                  return (
                    <button
                      key={p.id}
                      ref={(el) => (tabRefs.current[i] = el)}
                      type="button"
                      role="tab"
                      id={`eg-tab-${p.id}`}
                      aria-selected={on}
                      aria-controls="engine-panel"
                      tabIndex={on ? 0 : -1}
                      className={`eg-node ${on ? "is-active" : ""}`}
                      style={
                        wide
                          ? { left: `${(x / BOX.w) * 100}%`, top: `${(y / BOX.h) * 100}%` }
                          : { "--row": i < 4 ? 1 : 2, "--col": i < 4 ? i + 1 : N - i }
                      }
                      onClick={() => pick(i)}
                    >
                      <span className="eg-node__icon">
                        <PixelIcon name={p.icon} size={wide ? 18 : 20} />
                      </span>
                      <span className="eg-node__text">
                        <span className="eg-node__num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="eg-node__name">{p.part}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* The active part's details, always open */}
            <div className="eg-info">
              {PARTS.map((p, i) => (
                <Details key={p.id} part={p} n={i + 1} active={i === active} onPick={(j) => pick(j)} />
              ))}
            </div>
          </div>

          {/* The full approved part list, for assistive tech */}
          <ol className="sr-only">
            {PARTS.map((p) => (
              <li key={p.id}>
                {p.part}: {p.promise}. {p.cover.join(", ")}. {p.produces}.
              </li>
            ))}
          </ol>
          <p className="sr-only">{engine.wheelCentre.sub}</p>
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}
