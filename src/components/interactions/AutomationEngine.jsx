import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { engine, uiCopy } from "../../data/automationContent"
import { serviceModules, moduleByName } from "../../data/serviceModules"
import PixelIcon from "../visuals/PixelIcon"
import AppTile from "../visuals/AppTile"
import FolderCard, { useFlipMorph } from "./FolderCard"
import AutomationDemo from "./AutomationDemo"
import IntegrationShelf from "./IntegrationShelf"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK, REDUCED } from "../../lib/motionTokens"
import { scrollToElement } from "../../lib/smoothScroll"

const R = 38.4 // node radius, % of wheel
const pos = (i) => {
  const a = (-90 + i * 45) * (Math.PI / 180)
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) }
}

// Orbit timing, in seconds. Each stage rests on a node, then travels to the next one, and ends
// the instant the ball arrives. Keep STAGE whole so stage boundaries are exact.
const NODES = 8
const STAGE = 4
const HOLD = 1.4
const TRAVEL = STAGE - HOLD
const LOOP = NODES * STAGE
const PING = 0.9
const GLIDE = 0.7 // ball moving to a node the visitor picked
const placeBall = (ball, deg) => ball.setAttribute("transform", `rotate(${deg} 300 300)`)

// Card depth transition, from the approved storyboard. It finishes inside HOLD, so the card has
// settled before the ball leaves the node.
const CARD = { duration: 0.7, ease: "power2.inOut", outScale: 0.96, outX: -12, outOpacity: 0.6, inScale: 1.04, inX: 12 }
const OLD_TEXT_OUT = 0.22 // the old text has gone…
const NEW_TEXT_IN = 0.26 // …before the new text starts, so they never overlap
const NEW_BODY_IN = 0.5
const GHOST_FADE = 0.15
const FRONT = ":scope > .folder__front:not(.folder__ghost)"

/** A stand-in for the outgoing card, behind the real one, which React is about to re-render. */
function makeGhost(front) {
  const ghost = front.cloneNode(true)
  const cs = getComputedStyle(front)
  ghost.classList.add("folder__ghost")
  ghost.setAttribute("aria-hidden", "true")
  ghost.inert = true
  // Fixed now, because the incoming card may change the folder's variant.
  Object.assign(ghost.style, {
    left: `${front.offsetLeft}px`,
    top: `${front.offsetTop}px`,
    width: `${front.offsetWidth}px`,
    height: `${front.offsetHeight}px`,
    background: cs.background,
    borderRadius: cs.borderRadius,
    boxShadow: cs.boxShadow,
  })
  front.before(ghost)
  return ghost
}

/** Old card retreats into the stack; new card comes forward and settles. */
function playCardDepth(folder, front, ghost) {
  const { duration, ease, outScale, outX, outOpacity, inScale, inX } = CARD
  const parts = [...front.children]
  const behind = folder.querySelectorAll(".folder__tab, .folder__papers")
  gsap.set(front, { transition: "none" })
  ghost.getBoundingClientRect() // commit the starting shadow, so the CSS transition has a start
  ghost.style.boxShadow = "none"
  return gsap
    .timeline({
      onComplete: () => {
        ghost.remove()
        gsap.set([front, ...parts, ...behind], { clearProps: "transform,opacity,transition" })
      },
    })
    .to(ghost.children, { opacity: 0, duration: OLD_TEXT_OUT, ease: "power1.out" }, 0)
    .to(ghost, { scale: outScale, x: outX, duration, ease }, 0)
    // The old card only thins once the new one has built up over it, so the page and paper
    // layers never show through the pair and the card stays solid throughout.
    .to(ghost, { opacity: outOpacity, duration: duration - GHOST_FADE, ease: "power2.in" }, 0)
    .to(ghost, { opacity: 0, duration: GHOST_FADE, ease: "none" }, duration - GHOST_FADE)
    .fromTo(front, { scale: inScale, x: inX }, { scale: 1, x: 0, duration, ease }, 0)
    .fromTo(front, { opacity: 0 }, { opacity: 1, duration: NEW_BODY_IN, ease: "sine.inOut" }, 0)
    .fromTo(parts, { opacity: 0 }, { opacity: 1, duration: duration - NEW_TEXT_IN, ease: "power2.out", stagger: 0.04 }, NEW_TEXT_IN)
    .fromTo(behind, { opacity: 0.35 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0.12)
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
  // A realistic demo of this automation working (plays once). key=id: each part plays its own.
  const flow = (
    <div className="detail__flow" data-folder-item>
      <AutomationDemo key={m.id} id={m.id} />
    </div>
  )
  const shelf = (
    <div data-folder-item>
      <IntegrationShelf ids={m.tools} />
    </div>
  )

  // One layout for every part: the live demo is the centrepiece, the details sit beside it
  // (stacked under it on phones).
  return (
    <div className="detail detail--demo">
      {head}
      <div className="detail__demo-grid">
        {flow}
        <div className="detail__facts">
          {cover}
          {produces}
          {works}
        </div>
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
      <p className="folder-cover__promise">
        <span>{m.promise}</span>
        {/* Reserves the longest promise, so autoplay never changes the card's height */}
        {serviceModules.map((x) => (
          <span key={x.id} className="folder-cover__promise-sizer" aria-hidden="true">
            {x.promise}
          </span>
        ))}
      </p>
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
  const [cardIdx, setCardIdx] = useState(0) // what the closed card shows; follows hover ?? sel
  const [pinged, setPinged] = useState(null)
  const [panelHover, setPanelHover] = useState(false)
  const [panelFocus, setPanelFocus] = useState(false)
  const orbit = useRef(null)
  const capture = useFlipMorph(panelRef, [open, sel])
  const shown = serviceModules[cardIdx]
  const m = serviceModules[sel]
  const active = hover ?? sel
  const held = open || hover !== null || panelHover || panelFocus
  const live = useRef({ sel, held })
  live.current = { sel, held }

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

  /**
   * The orbit controller. One looping timeline is the only clock: the current node is derived
   * from its playhead, and each rotation tween ends exactly on a stage boundary, so the card can
   * never change before the ball has arrived, even across dropped frames. Below 1024px the wheel
   * is hidden and the same timeline drives the node list.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const sig = root.current.querySelector(".wheel__signal")

      mm.add(REDUCED, () => {
        const place = (i) => placeBall(sig, i * 45)
        place(live.current.sel)
        orbit.current = { goTo: place, sync: () => {} }
        return () => {
          orbit.current = null
        }
      })

      mm.add(MOTION_OK, () => {
        const ball = { deg: 0 }
        let current = live.current.sel
        let anchor = current // node to resume from after the visitor moved the ball
        let pingOn = false
        let inView = false
        let glide = null

        const tl = gsap.timeline({
          repeat: -1,
          paused: true,
          onUpdate: () => {
            placeBall(sig, ball.deg)
            if (tl.paused()) return
            const t = tl.time()
            const node = Math.floor(t / STAGE) % NODES
            if (node !== current) {
              current = node
              pingOn = true
              setSel(node)
              setPinged(node)
            } else if (pingOn && t - node * STAGE >= PING) {
              pingOn = false
              setPinged(null)
            }
          },
        })
        for (let i = 0; i < NODES; i++) {
          tl.to(ball, { deg: (i + 1) * 45, duration: TRAVEL, ease: "sine.inOut" }, i * STAGE + HOLD)
        }
        // Start many loops in, so a backwards glide never runs into time zero.
        tl.totalTime(LOOP * 100 + current * STAGE + 0.001)

        const sync = () => {
          if (!inView || live.current.held) {
            tl.pause()
            return
          }
          if (anchor !== null) {
            glide?.kill()
            glide = null
            tl.time(anchor * STAGE + 0.001)
            anchor = null
          }
          tl.play()
        }

        // Scrubs the timeline itself by the shortest way round; paused, so it can't change the card.
        const goTo = (i) => {
          glide?.kill()
          glide = null
          anchor = i
          current = i
          pingOn = false
          setPinged(null)
          tl.pause()
          let delta = (((i * STAGE - tl.time()) % LOOP) + LOOP) % LOOP
          if (delta > LOOP / 2) delta -= LOOP
          if (delta) glide = gsap.to(tl, { totalTime: tl.totalTime() + delta + 0.001, duration: GLIDE, ease: "power2.inOut" })
        }

        orbit.current = { goTo, sync }
        const io = new IntersectionObserver(([e]) => {
          inView = e.isIntersecting
          sync()
        })
        io.observe(root.current)
        return () => {
          io.disconnect()
          glide?.kill()
          tl.kill()
          orbit.current = null
          setPinged(null)
        }
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  // A picked node takes over from autoplay: the ball goes there and waits.
  useEffect(() => {
    if (open) orbit.current?.goTo(sel)
  }, [open, sel])
  useEffect(() => {
    orbit.current?.sync()
  }, [held])

  // Card change. Runs in layout effects, so the clone, the swap and the first frame of the
  // transition all land in the same paint as the ball's arrival, with no flash between them.
  const cardMotion = useRef(null)
  const pendingGhost = useRef(null)
  useLayoutEffect(() => {
    const folder = panelRef.current.querySelector(".folder")
    const front = folder.querySelector(FRONT)
    if (open || active !== cardIdx) cardMotion.current?.progress(1) // a new change finishes the last one
    if (open) {
      pendingGhost.current?.remove()
      pendingGhost.current = null
      setCardIdx(sel)
      return
    }
    if (active !== cardIdx) {
      if (front && !window.matchMedia(REDUCED).matches) pendingGhost.current = makeGhost(front)
      setCardIdx(active)
      return
    }
    if (pendingGhost.current && front) {
      cardMotion.current = playCardDepth(folder, front, pendingGhost.current)
      pendingGhost.current = null
    }
  }, [active, cardIdx, open, sel])
  useEffect(
    () => () => {
      cardMotion.current?.progress(1)
      pendingGhost.current?.remove()
    },
    []
  )

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
            <defs>
              <radialGradient id="wheel-ball-halo">
                <stop offset="0.4" stopColor="#b79aee" stopOpacity=".42" />
                <stop offset="1" stopColor="#f0bedf" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="wheel-ball-fill" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#1d6f96" />
                <stop offset=".5" stopColor="#6440c8" />
                <stop offset="1" stopColor="#a3387f" />
              </linearGradient>
            </defs>
            <g className="wheel__signal">
              <circle cx="300" cy="70" r="17" fill="url(#wheel-ball-halo)" />
              <circle cx="300" cy="70" r="7" className="wheel__ball" />
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
                className={`wheel__node px-host ${sel === i && open ? "is-selected" : ""} ${active === i ? "is-active" : ""} ${pinged === i && !open ? "is-pinged" : ""}`}
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
              className={`engine__list-btn px-host ${sel === i && open ? "is-selected" : ""} ${sel === i && !open ? "is-active" : ""}`}
              aria-pressed={sel === i && open}
              aria-controls="engine-panel"
              onClick={() => pick(i)}
            >
              <PixelIcon name={x.icon} size={22} />
              <span>{x.part}</span>
            </button>
          ))}
        </div>

        {/* Autoplay stays silent for screen readers, and rests while the card is being read or used */}
        <div
          id="engine-panel"
          ref={panelRef}
          className="engine__panel"
          aria-live={open ? "polite" : "off"}
          onPointerEnter={(e) => e.pointerType === "mouse" && setPanelHover(true)}
          onPointerLeave={() => setPanelHover(false)}
          onFocus={(e) => setPanelFocus(e.target.matches(":focus-visible"))}
          onBlur={() => setPanelFocus(false)}
        >
          <p className="engine__helper t-mono">
            <span className="hint-dot" aria-hidden="true" />
            {engine.helper}
          </p>
          <FolderCard
            id="engine-folder"
            open={open}
            onToggle={(v) => {
              if (v) setSel(cardIdx) // open the card that was actually on screen
              setOpen(v)
            }}
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
