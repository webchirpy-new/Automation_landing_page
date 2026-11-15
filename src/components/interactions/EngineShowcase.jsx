import React, { useCallback, useEffect, useRef, useState } from "react"
import { engine } from "../../data/automationContent"
import { serviceModules, moduleByName } from "../../data/serviceModules"
import PixelIcon from "../visuals/PixelIcon"
import AutomationDemo from "./AutomationDemo"
import { scrollToElement } from "../../lib/smoothScroll"

/**
 * ENGINE SHOWCASE — the eight parts as a "video player".
 * Icon tabs across the top, one large player where the selected part's live demo plays (once),
 * a single caption line underneath. Almost no text: the demo explains the part.
 * Tabs semantics + arrow keys; deep links #engine-<part-id> still open a part.
 */
// Parts in the order the engine runs (engine.stages): capture → reply → run the day → close → insights
const PARTS = engine.stages.flatMap((s) => s.parts.map((name) => moduleByName[name])).filter(Boolean)

export default function EngineShowcase() {
  const [i, setI] = useState(0)
  const tabs = useRef([])
  const barRef = useRef(null)
  const playerRef = useRef(null)
  const m = PARTS[i]

  const go = useCallback((n, { focus = false, scroll = false } = {}) => {
    const next = (n + PARTS.length) % PARTS.length
    setI(next)
    if (focus) tabs.current[next]?.focus({ preventScroll: true })
    if (scroll) window.requestAnimationFrame(() => playerRef.current && scrollToElement(playerRef.current))
  }, [])

  // Keep the active tab visible inside the scrollable pill bar (phones), without moving the page
  useEffect(() => {
    const bar = barRef.current
    const tab = tabs.current[i]
    if (!bar || !tab || bar.scrollWidth <= bar.clientWidth) return
    bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" })
  }, [i])

  // Deep links: #engine-<part-id> (hero tiles and other links)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash
      if (!h.startsWith("#engine-")) return
      const n = PARTS.findIndex((x) => x.id === h.slice("#engine-".length))
      if (n >= 0) go(n, { scroll: true })
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    return () => window.removeEventListener("hashchange", fromHash)
  }, [go])

  const onKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    let n = null
    if (step) n = i + step
    if (e.key === "Home") n = 0
    if (e.key === "End") n = PARTS.length - 1
    if (n === null) return
    e.preventDefault()
    go(n, { focus: true })
  }

  const num = (n) => String(n + 1).padStart(2, "0")

  return (
    <div className="vs">
      {/* Icon tabs */}
      <div ref={barRef} className="vs-tabs" role="tablist" aria-label="The eight parts of the engine" onKeyDown={onKey}>
        {PARTS.map((x, n) => (
          <button
            key={x.id}
            ref={(el) => (tabs.current[n] = el)}
            type="button"
            role="tab"
            id={`vs-tab-${x.id}`}
            aria-selected={n === i}
            aria-controls="engine-panel"
            tabIndex={n === i ? 0 : -1}
            className={`vs-tab ${n === i ? "is-on" : ""}`}
            onClick={() => go(n)}
          >
            <span className="vs-tab__icon">
              <PixelIcon name={x.icon} size={18} animate={n === i} />
            </span>
            {x.part}
          </button>
        ))}
      </div>

      {/* Player */}
      <section ref={playerRef} id="engine-panel" className="vs-player" role="tabpanel" aria-labelledby={`vs-tab-${m.id}`} tabIndex={-1}>
        <div className="vs-player__bar">
          <span className="vs-live">
            <i aria-hidden="true" /> Live demo
          </span>
          <span className="vs-player__title">{m.part}</span>
          <span className="vs-player__count t-mono">
            {num(i)} / {num(PARTS.length - 1)}
          </span>
        </div>
        <div key={m.id} className="vs-player__stage">
          <AutomationDemo id={m.id} showSteps={false} />
        </div>
      </section>

      {/* One caption line + previous / next */}
      <div className="vs-caption">
        <button type="button" className="vs-arrow" onClick={() => go(i - 1, { focus: true })} aria-label={`Previous: ${PARTS[(i - 1 + PARTS.length) % PARTS.length].part}`}>
          ←
        </button>
        <p aria-live="polite">
          <strong>{m.part}</strong>
          <span>{m.promise}</span>
        </p>
        <button type="button" className="vs-arrow" onClick={() => go(i + 1, { focus: true })} aria-label={`Next: ${PARTS[(i + 1) % PARTS.length].part}`}>
          →
        </button>
      </div>
      <p className="vs-note t-mono">Illustrative demos · sample data</p>
    </div>
  )
}
