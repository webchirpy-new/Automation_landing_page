import React, { useEffect, useRef, useState } from "react"
import { engine, uiCopy } from "../../data/automationContent"
import { serviceModules, moduleByName } from "../../data/serviceModules"
import PixelIcon from "../visuals/PixelIcon"
import AppTile from "../visuals/AppTile"
import FolderCard, { useFlipMorph } from "./FolderCard"
import ServiceWorkflow from "./ServiceWorkflow"
import IntegrationShelf from "./IntegrationShelf"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { scrollToElement } from "../../lib/smoothScroll"

const R = 38.4 // node radius, % of wheel
const pos = (i) => {
  const a = (-90 + i * 45) * (Math.PI / 180)
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) }
}

function WorksWith({ list, onPick }) {
  return (
    <ul className="works-with">
      {list.map((w) => {
        const m = moduleByName[w]
        return (
          <li key={w}>
            {m ? (
              <button type="button" className="chip chip--btn chip--dark" onClick={() => onPick(m.index)}>
                <PixelIcon name={m.icon} size={12} animate={false} /> {w}
              </button>
            ) : (
              <span className="chip chip--dark">{w}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Detail sheet content — four different compositions by treatment. */
function Detail({ m, onPick }) {
  const head = (
    <header className="detail__head" data-folder-item>
      <span className="detail__icon">
        <PixelIcon name={m.icon} size={32} />
      </span>
      <div>
        <p className="t-mono detail__num">Part {String(m.index + 1).padStart(2, "0")} / 08</p>
        <h3 className="t-h3">{m.part}</h3>
        <p className="detail__promise">{m.promise}</p>
      </div>
    </header>
  )
  const cover = (
    <div className="detail__block" data-folder-item>
      <h4 className="t-mono">We cover</h4>
      <ul className="detail__list">
        {m.cover.map((c) => (
          <li key={c}>
            <PixelIcon name="check" size={12} animate={false} /> {c}
          </li>
        ))}
      </ul>
    </div>
  )
  const produces = (
    <div className="detail__block detail__produces" data-folder-item>
      <h4 className="t-mono">Produces</h4>
      <p>{m.produces}</p>
    </div>
  )
  const works = (
    <div className="detail__block" data-folder-item>
      <h4 className="t-mono">Works with</h4>
      <WorksWith list={m.worksWith} onPick={onPick} />
    </div>
  )
  const flow = (
    <div className="detail__flow" data-folder-item>
      <ServiceWorkflow flow={m.flow} steps={m.steps} />
    </div>
  )
  const shelf = (
    <div data-folder-item>
      <IntegrationShelf ids={m.tools} />
    </div>
  )

  if (m.treatment === "bento") {
    return (
      <div className="detail detail--bento">
        {head}
        <div className="bento">
          <div className="bento__flow">{flow}</div>
          <div className="bento__cover">{cover}</div>
          <div className="bento__produces">{produces}</div>
          <div className="bento__works">{works}</div>
          <div className="bento__shelf">{shelf}</div>
        </div>
      </div>
    )
  }
  if (m.treatment === "sleeve") {
    return (
      <div className="detail detail--sleeve">
        {head}
        {flow}
        <div className="detail__cols">
          {cover}
          <div>
            {produces}
            {works}
          </div>
        </div>
        {shelf}
      </div>
    )
  }
  if (m.treatment === "stack") {
    return (
      <div className="detail detail--stack">
        {head}
        <div className="detail__cols">
          <div className="detail__papers">{flow}</div>
          <div>
            {cover}
            {produces}
            {works}
          </div>
        </div>
        {shelf}
      </div>
    )
  }
  return (
    <div className="detail detail--folder">
      {head}
      <div className="detail__cols">
        <div>
          {cover}
          {produces}
          {works}
        </div>
        {flow}
      </div>
      {shelf}
    </div>
  )
}

function Cover({ m }) {
  return (
    <div className="folder-cover px-host is-active">
      <span className="folder-cover__icon">
        <PixelIcon name={m.icon} size={40} />
      </span>
      <p className="t-mono folder-cover__num">Part {String(m.index + 1).padStart(2, "0")}</p>
      <h3 className="folder-cover__title">{m.part}</h3>
      <p className="folder-cover__promise">{m.promise}</p>
      <div className="folder-cover__tiles" aria-hidden="true">
        {m.tools.slice(0, 3).map((t) => (
          <AppTile key={t} id={t} size={34} />
        ))}
      </div>
    </div>
  )
}

export default function AutomationEngine() {
  const root = useRef(null)
  const panelRef = useRef(null)
  const [sel, setSel] = useState(0)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(null)
  const capture = useFlipMorph(panelRef, [open, sel])
  const shown = serviceModules[hover ?? sel]
  const m = serviceModules[sel]

  const pick = (i, { scroll = false } = {}) => {
    capture()
    setSel(i)
    setOpen(true)
    setHover(null)
    if (scroll || window.matchMedia("(max-width: 1023px)").matches) {
      window.requestAnimationFrame(() => panelRef.current && scrollToElement(panelRef.current))
    }
  }

  // Deep links: #engine-<part-id> (footer, hero constellation).
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#engine-", "")
      if (h === window.location.hash) return
      const i = serviceModules.findIndex((x) => x.id === h)
      if (i >= 0) pick(i, { scroll: true })
    }
    fromHash()
    window.addEventListener("hashchange", fromHash)
    return () => window.removeEventListener("hashchange", fromHash)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Idle signal: a warm pulse steps from node to node while visible.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const sig = root.current.querySelector(".wheel__signal")
        if (!sig) return
        const nodes = root.current.querySelectorAll(".wheel__node")
        const tl = gsap.timeline({ repeat: -1, paused: true })
        for (let i = 0; i < 8; i++) {
          tl.to(sig, { rotation: (i + 1) * 45, svgOrigin: "300 300", duration: 0.9, ease: "power2.inOut" }).add(() => {
            const n = nodes[(i + 1) % 8]
            n?.classList.add("is-pinged")
            gsap.delayedCall(0.9, () => n?.classList.remove("is-pinged"))
          }).to({}, { duration: 1.6 })
        }
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()))
        io.observe(root.current.querySelector(".wheel") || root.current)
        return () => {
          io.disconnect()
          tl.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  const active = hover ?? sel

  return (
    <div ref={root} className="engine">
      <div className="engine__grid">
        {/* Desktop wheel */}
        <div className="wheel" data-reveal>
          <svg className="wheel__svg" viewBox="0 0 600 600" aria-hidden="true">
            <circle cx="300" cy="300" r="230" className="wheel__ring" />
            <circle cx="300" cy="300" r="270" className="wheel__ring wheel__ring--outer" />
            {serviceModules.map((x, i) => {
              const p = pos(i)
              return <line key={x.id} x1="300" y1="300" x2={p.x * 6} y2={p.y * 6} className={`wheel__spoke ${active === i ? "is-active" : ""}`} />
            })}
            <g className="wheel__signal">
              <rect x="294" y="64" width="12" height="12" />
            </g>
            <circle cx="300" cy="300" r="108" className="wheel__core" />
          </svg>
          <div className="wheel__center">
            <p className="wheel__center-title">{engine.wheelCentre.title}</p>
            <p className="t-mono">{engine.wheelCentre.sub}</p>
          </div>
          {serviceModules.map((x, i) => {
            const p = pos(i)
            return (
              <button
                key={x.id}
                type="button"
                className={`wheel__node px-host ${sel === i && open ? "is-selected" : ""} ${active === i ? "is-active" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                aria-pressed={sel === i && open}
                aria-controls="engine-panel"
                onClick={() => pick(i)}
                onMouseEnter={() => !open && setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => !open && setHover(i)}
                onBlur={() => setHover(null)}
              >
                <span className="wheel__node-icon">
                  <PixelIcon name={x.icon} size={26} />
                </span>
                <span className="wheel__node-label">{x.part}</span>
              </button>
            )
          })}
        </div>

        {/* Phones/tablets: readable node list instead of a squeezed wheel */}
        <div className="engine__list" role="group" aria-label="The eight parts">
          <div className="engine__list-core">
            <strong>{engine.wheelCentre.title}</strong>
            <span className="t-mono">{engine.wheelCentre.sub}</span>
          </div>
          {serviceModules.map((x, i) => (
            <button
              key={x.id}
              type="button"
              className={`engine__list-btn px-host ${sel === i && open ? "is-selected" : ""}`}
              aria-pressed={sel === i && open}
              aria-controls="engine-panel"
              onClick={() => pick(i)}
            >
              <PixelIcon name={x.icon} size={22} />
              <span>{x.part}</span>
            </button>
          ))}
        </div>

        <div id="engine-panel" ref={panelRef} className="engine__panel" aria-live="polite">
          <p className="engine__helper t-mono">
            <span className="hint-dot" aria-hidden="true" />
            {engine.helper}
          </p>
          <FolderCard
            id="engine-folder"
            open={open}
            onToggle={(v) => setOpen(v)}
            capture={capture}
            variant={(open ? m : shown).treatment}
            tab={(open ? m : shown).part}
            openLabel={`Open ${shown.part}`}
            closeLabel={uiCopy.back}
            cover={<Cover m={shown} />}
          >
            <Detail m={m} onPick={(i) => pick(i)} />
          </FolderCard>
        </div>
      </div>
    </div>
  )
}
