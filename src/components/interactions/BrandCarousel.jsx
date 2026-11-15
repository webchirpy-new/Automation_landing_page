import React, { useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import { brands } from "../../data/brands"
import { REDUCED } from "../../lib/motionTokens"
import { gsap, useGSAP } from "../../lib/gsap"

/**
 * BrandCarousel — cinematic 3D focus carousel of the 13 approved logos.
 *
 * One GSAP tween moves a single playhead (`pos`, a float: 3 means brand 3 is centred, 3.5 is
 * half way to brand 4). Every card's pose is a pure function of its wrapped distance from the
 * playhead, so the loop has no seam, a transition can be interrupted from anywhere, and a swipe
 * scrubs the same motion the autoplay uses.
 *
 * Autoplay is one delayed call, re-armed after each move, that runs only while nothing blocks
 * it: pointer on a card, keyboard focus, a drag, the section offscreen, the tab hidden, or
 * reduced motion (where manual transitions also become instant). The playhead only ever counts
 * up; `mod` turns it into a brand index, so brand 13 moves forward into brand 1 like any other step.
 */

const COUNT = brands.length
const HOLD = 2 // seconds a brand rests in the centre
const SWAP = { near: 0.55, step: 0.62, far: 0.7 } // seconds: finishing a drag, one step, a longer jump
const DRAG_START = 8 // px of sideways travel before a press counts as a drag

// Pose at |distance| 0, 1, 2 and 3 from the centre. Values between are interpolated.
const POSE = {
  z: [0, -70, -170, -260],
  rotate: [0, 12, 22, 28],
  scale: [1, 0.86, 0.72, 0.6],
}
// Spacing (in card widths) and fade per layout: five cards on desktop, three on tablet, one plus peeks on phones.
const LAYOUTS = {
  desktop: { x: [0, 1.05, 1.94, 2.5], opacity: [1, 1, 0.72, 0] },
  tablet: { x: [0, 1.05, 1.7, 2.2], opacity: [1, 1, 0, 0] },
  phone: { x: [0, 1.02, 1.6, 2.1], opacity: [1, 1, 0, 0] },
}

const mod = (v) => ((v % COUNT) + COUNT) % COUNT
const wrapped = (v) => mod(v + COUNT / 2) - COUNT / 2 // signed distance on the ring, in [-6.5, 6.5)
const lerpAt = (values, a) => {
  const i = Math.min(Math.floor(a), values.length - 2)
  return values[i] + (values[i + 1] - values[i]) * (a - i)
}
const pickLayout = () =>
  window.innerWidth >= 1024 ? LAYOUTS.desktop : window.innerWidth >= 768 ? LAYOUTS.tablet : LAYOUTS.phone

export default function BrandCarousel() {
  const root = useRef(null)
  const scene = useRef(null)
  const stage = useRef(null)
  const engine = useRef(null)
  const [active, setActive] = useState(0)
  const [motionOff, setMotionOff] = useState(() => window.matchMedia(REDUCED).matches)
  const [keyboardIn, setKeyboardIn] = useState(false)

  useGSAP(
    () => {
      const reduced = window.matchMedia(REDUCED)
      const cards = gsap.utils.toArray(".bc-card", stage.current)
      const glows = cards.map((c) => c.querySelector(".bc-card__glow"))
      const blocks = { hover: false, focus: false, drag: false, offscreen: false, hidden: document.hidden, reduced: reduced.matches }

      let pos = 0
      let target = 0
      let swap = null
      let timer = null
      let width = 210
      let layout = pickLayout()

      const render = () => {
        cards.forEach((card, i) => {
          const off = wrapped(i - pos)
          const a = Math.min(Math.abs(off), 3)
          const opacity = lerpAt(layout.opacity, a)
          if (opacity <= 0) {
            card.style.visibility = "hidden"
            return
          }
          const side = off < 0 ? -1 : 1
          const x = side * lerpAt(layout.x, a) * width
          // Left cards turn clockwise and right cards the other way, so both face the centre.
          const ry = -side * lerpAt(POSE.rotate, a)
          card.style.visibility = "visible"
          card.style.opacity = opacity
          card.style.zIndex = Math.round(100 - a * 10)
          card.style.transform = `translate3d(${x.toFixed(2)}px,0,${lerpAt(POSE.z, a).toFixed(2)}px) rotateY(${ry.toFixed(3)}deg) scale(${lerpAt(POSE.scale, a).toFixed(4)})`
          glows[i].style.opacity = Math.max(0, 1 - a / 0.35) // the glow arrives only as the card settles
        })
      }

      const blocked = () => Object.values(blocks).some(Boolean)
      const stopTimer = () => {
        timer?.kill()
        timer = null // a killed call must not be resumed by a later block change
      }
      const schedule = () => {
        stopTimer()
        timer = gsap.delayedCall(HOLD, () => go(target + 1))
        timer.paused(blocked())
      }
      const block = (name, on) => {
        blocks[name] = on
        timer?.paused(blocked())
      }

      function go(next) {
        stopTimer()
        swap?.kill()
        const distance = Math.abs(next - pos)
        target = next
        setActive(mod(next))
        if (reduced.matches || distance < 0.001) {
          pos = next
          render()
          schedule()
          return
        }
        swap = gsap.to(
          { p: pos },
          {
            p: next,
            duration: distance < 0.98 ? SWAP.near : distance <= 1.02 ? SWAP.step : SWAP.far,
            ease: "power2.inOut",
            onUpdate() {
              pos = this.targets()[0].p
              render()
            },
            onComplete: schedule,
          }
        )
      }

      const measure = () => {
        width = cards[0].offsetWidth || width
        layout = pickLayout()
        render()
      }
      const resize = new ResizeObserver(measure)
      resize.observe(stage.current)
      measure()

      const visibility = new IntersectionObserver(([e]) => block("offscreen", !e.isIntersecting), { threshold: 0.15 })
      visibility.observe(root.current)

      const onMotionPref = () => {
        setMotionOff(reduced.matches)
        block("reduced", reduced.matches)
      }
      reduced.addEventListener("change", onMotionPref)

      // A hidden tab freezes the remaining hold; it carries on from the same brand on return.
      const onPageVisibility = () => block("hidden", document.hidden)
      document.addEventListener("visibilitychange", onPageVisibility)

      /* Swipe / drag. Capture starts only once the press has moved, so a plain click still reaches its card. */
      const el = scene.current
      let press = null
      let swallowClick = false

      const onDown = (e) => {
        if (e.button !== 0) return
        press = { id: e.pointerId, x: e.clientX, from: target, dragging: false }
      }
      const onMove = (e) => {
        // Only a pointer that really moved onto a card holds the rotation. The band is full width,
        // and scrolling slides it under a parked pointer, which must not count as hovering.
        if (e.pointerType === "mouse" && (e.movementX || e.movementY)) block("hover", !!e.target.closest(".bc-card"))
        if (!press || e.pointerId !== press.id) return
        if (e.buttons === 0) return onEnd(e) // released outside the scene: never start a drag from a stale press
        const dx = e.clientX - press.x
        if (!press.dragging) {
          if (Math.abs(dx) < DRAG_START) return
          press.dragging = true
          el.setPointerCapture(e.pointerId)
          el.classList.add("is-dragging")
          block("drag", true)
          swap?.kill()
          stopTimer()
        }
        pos = press.from - dx / (width * layout.x[1])
        render()
      }
      const onEnd = (e) => {
        if (!press || e.pointerId !== press.id) return
        const { dragging, from } = press
        press = null
        if (!dragging) return
        el.classList.remove("is-dragging")
        block("drag", false)
        swallowClick = true
        setTimeout(() => (swallowClick = false), 60)
        // Commit at 15% of a step, at least one brand and as many as were dragged past.
        const moved = pos - from
        const steps = e.type === "pointercancel" || Math.abs(moved) < 0.15 ? 0 : Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved)))
        go(from + steps)
      }
      const onLeave = (e) => {
        if (e.pointerType === "mouse") block("hover", false)
      }
      const onClickCapture = (e) => {
        if (!swallowClick) return
        swallowClick = false
        e.stopPropagation()
        e.preventDefault()
      }
      el.addEventListener("pointerdown", onDown)
      el.addEventListener("pointermove", onMove)
      el.addEventListener("pointerup", onEnd)
      el.addEventListener("pointercancel", onEnd)
      el.addEventListener("pointerleave", onLeave)
      el.addEventListener("click", onClickCapture, true)

      engine.current = {
        block,
        step: (by) => go(target + by),
        centre: (i) => go(target + wrapped(i - mod(target))),
      }
      schedule()

      return () => {
        swap?.kill()
        stopTimer()
        resize.disconnect()
        visibility.disconnect()
        reduced.removeEventListener("change", onMotionPref)
        document.removeEventListener("visibilitychange", onPageVisibility)
        el.removeEventListener("pointerdown", onDown)
        el.removeEventListener("pointermove", onMove)
        el.removeEventListener("pointerup", onEnd)
        el.removeEventListener("pointercancel", onEnd)
        el.removeEventListener("pointerleave", onLeave)
        el.removeEventListener("click", onClickCapture, true)
        engine.current = null
      }
    },
    { scope: root }
  )

  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    const by = e.key === "ArrowLeft" ? -1 : 1
    engine.current?.step(by)
    // The next brand is always a near card, so it is visible and can take focus straight away.
    stage.current.querySelectorAll(".bc-card")[mod(active + by)]?.focus({ preventScroll: true })
  }

  const onFocus = (e) => {
    const holds = e.target.matches(":focus-visible")
    engine.current?.block("focus", holds)
    setKeyboardIn(holds)
  }
  const onBlur = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    engine.current?.block("focus", false)
    setKeyboardIn(false)
  }

  return (
    <div
      ref={root}
      className="bc"
      role="region"
      aria-roledescription="carousel"
      aria-labelledby="trusted-title"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div ref={scene} className="bc__scene">
        <div className="bc__floor" aria-hidden="true" />
        <div ref={stage} className="bc__stage" onKeyDown={onKeyDown}>
          {brands.map((b, i) => {
            const centred = i === active
            return (
              <button
                key={b.name}
                type="button"
                className="bc-card"
                tabIndex={centred ? 0 : -1}
                aria-current={centred ? "true" : undefined}
                aria-label={centred ? `${b.name}, brand ${i + 1} of ${COUNT}` : `Bring ${b.name} to the centre`}
                onClick={() => engine.current?.centre(i)}
              >
                <span className="bc-card__glow" />
                <span className="bc-card__face">
                  <img src={b.logo} alt="" width="150" height="100" decoding="async" draggable="false" />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bc__controls">
        <button type="button" className="bc__arrow" aria-label="Previous brand" onClick={() => engine.current?.step(-1)}>
          <Chevron flip />
        </button>
        <div className="bc__pill">
          <ol className="bc__dots" aria-hidden="true">
            {brands.map((b, i) => (
              <li key={b.name} className={i === active ? "is-active" : undefined} />
            ))}
          </ol>
        </div>
        <button type="button" className="bc__arrow" aria-label="Next brand" onClick={() => engine.current?.step(1)}>
          <Chevron />
        </button>
      </div>

      <p className="sr-only" aria-live={motionOff || keyboardIn ? "polite" : "off"} aria-atomic="true">
        {brands[active].name}, brand {active + 1} of {COUNT}
      </p>
      <ul className="sr-only">
        {brands.map((b) => (
          <li key={b.name}>{b.name}</li>
        ))}
      </ul>
    </div>
  )
}

function Chevron({ flip }) {
  return (
    <ChevronRight size={16} strokeWidth={2.25} aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined} />
  )
}
