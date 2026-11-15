import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { engine } from "../../data/automationContent"
import { serviceModules, moduleByName } from "../../data/serviceModules"
import PixelIcon from "../visuals/PixelIcon"
import AutomationDemo from "./AutomationDemo"
import { automationDemos } from "../../data/automationDemos"
import { scrollToElement } from "../../lib/smoothScroll"

/**
 * ENGINE EXPLORER — the eight parts of the AI Automation Engine.
 *
 * Left (desktop) / above (tablet, phone): every part, grouped by the four stages of the engine
 * (engine.stages), always visible — no auto-rotation. Right / below: one showcase panel for the
 * selected part: its live demo (plays once), what it covers, what it produces, the parts it works
 * with (tap to jump) and example tools. Tabs semantics with arrow keys; deep links #engine-<id>.
 */
const stageOf = Object.fromEntries(engine.stages.flatMap((s, si) => s.parts.map((name) => [name, si])))

// Parts in stage order, so the navigator reads like the engine runs
const ORDERED = engine.stages.flatMap((s) => s.parts.map((name) => moduleByName[name])).filter(Boolean)

export default function EngineExplorer() {
  const [selId, setSelId] = useState(ORDERED[0].id)
  const panelRef = useRef(null)
  const tabRefs = useRef({})
  const m = serviceModules.find((x) => x.id === selId)
  const pos = ORDERED.findIndex((x) => x.id === selId)
  const stage = engine.stages[stageOf[m.part]]

  const select = useCallback((id, { scroll = false, focus = false } = {}) => {
    setSelId(id)
    // Focus follows the selection without jumping the page back up to the navigator
    if (focus) tabRefs.current[id]?.focus({ preventScroll: true })
    // On stacked layouts the panel sits below the tiles: bring it into view
    if (scroll || window.matchMedia("(max-width: 1023px)").matches) {
      window.requestAnimationFrame(() => panelRef.current && scrollToElement(panelRef.current))
    }
  }, [])

  // Deep links: #engine-<part-id> (hero tiles, scorecard links)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash
      if (!h.startsWith("#engine-")) return
      const id = h.slice("#engine-".length)
      if (serviceModules.some((x) => x.id === id)) select(id, { scroll: true })
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    return () => window.removeEventListener("hashchange", fromHash)
  }, [select])

  const onKey = (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    let next = null
    if (step) next = (pos + step + ORDERED.length) % ORDERED.length
    if (e.key === "Home") next = 0
    if (e.key === "End") next = ORDERED.length - 1
    if (next === null) return
    e.preventDefault()
    const id = ORDERED[next].id
    setSelId(id)
    tabRefs.current[id]?.focus()
  }

  const prev = ORDERED[(pos - 1 + ORDERED.length) % ORDERED.length]
  const next = ORDERED[(pos + 1) % ORDERED.length]
  const groups = useMemo(() => engine.stages.map((s, si) => ({ ...s, si, mods: s.parts.map((n) => moduleByName[n]).filter(Boolean) })), [])

  return (
    <div className="ex">
      <p className="ex__hint t-mono">
        <i aria-hidden="true" /> {engine.helper}
      </p>

      <div className="ex__grid">
        {/* Navigator: the eight parts, grouped by stage */}
        <div className="ex-nav" role="tablist" aria-label="The eight parts of the engine" aria-orientation="vertical" onKeyDown={onKey}>
          {groups.map((g) => (
            <div key={g.title} className="ex-nav__group" role="presentation">
              <p className="ex-nav__stage t-mono" role="presentation">
                <span>{String(g.si + 1).padStart(2, "0")}</span> {g.title}
              </p>
              <div className="ex-nav__items" role="presentation">
                {g.mods.map((x) => {
                  const on = x.id === selId
                  return (
                    <button
                      key={x.id}
                      ref={(el) => (tabRefs.current[x.id] = el)}
                      type="button"
                      role="tab"
                      id={`ex-tab-${x.id}`}
                      aria-selected={on}
                      aria-controls="engine-panel"
                      tabIndex={on ? 0 : -1}
                      className={`ex-tab ${on ? "is-on" : ""}`}
                      onClick={() => select(x.id)}
                    >
                      <span className="ex-tab__icon">
                        <PixelIcon name={x.icon} size={22} animate={on} />
                      </span>
                      <span className="ex-tab__text">
                        <span className="ex-tab__name">{x.part}</span>
                        <span className="ex-tab__promise">{x.promise}</span>
                      </span>
                      <span className="ex-tab__arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Showcase: the selected part */}
        <section
          ref={panelRef}
          id="engine-panel"
          className="ex-panel"
          role="tabpanel"
          aria-labelledby={`ex-tab-${m.id}`}
          tabIndex={-1}
        >
          <div key={m.id} className="ex-panel__inner">
            <header className="ex-head">
              <span className="ex-head__icon" aria-hidden="true">
                <PixelIcon name={m.icon} size={30} />
              </span>
              <div>
                <p className="ex-head__meta t-mono">
                  Part {String(pos + 1).padStart(2, "0")} / 08 <span aria-hidden="true">·</span> {stage?.title}
                </p>
                <h3 className="ex-head__title">{m.part}</h3>
                <p className="ex-head__promise">{m.promise}</p>
              </div>
            </header>

            {/* Short and visual: the demo plays like a clip, three steps explain it, one result line */}
            <div className="ex-body">
              <AutomationDemo key={m.id} id={m.id} showSteps={false} />

              <div className="ex-explain">
                <p className="ex-explain__label t-mono">How it works</p>
                <ol className="ex-steps">
                  {(automationDemos[m.id]?.steps || []).map((st, i) => (
                    <li key={st}>
                      <span className="ex-steps__n" aria-hidden="true">
                        {i + 1}
                      </span>
                      {st}
                    </li>
                  ))}
                </ol>
                <div className="ex-produces">
                  <p className="ex-explain__label t-mono">Result</p>
                  <p>{m.produces}</p>
                </div>
              </div>
            </div>

            <nav className="ex-pager" aria-label="Browse the parts">
              <button type="button" className="ex-pager__btn" onClick={() => select(prev.id, { focus: true })}>
                <span aria-hidden="true">←</span>
                <span>
                  <span className="ex-pager__label">Previous</span>
                  {prev.part}
                </span>
              </button>
              <button type="button" className="ex-pager__btn ex-pager__btn--next" onClick={() => select(next.id, { focus: true })}>
                <span>
                  <span className="ex-pager__label">Next</span>
                  {next.part}
                </span>
                <span aria-hidden="true">→</span>
              </button>
            </nav>
          </div>
        </section>
      </div>
    </div>
  )
}
