import React, { useRef, useState } from "react"
import { uiCopy } from "../../data/automationContent"
import { siteConfig } from "../../config/site"
import { useSite } from "../../context/SiteContext"
import { MOTION_OK } from "../../lib/motionTokens"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { Marked } from "../ui/Highlight"

/**
 * ClientStoryScatter — five black project cards tremble in a stack, burst wide, return and shrink
 * into place; only then does the heading appear, and only after that the client-story pill.
 *
 * CSS owns every final position, at every breakpoint. On entering view the entrance measures that
 * layout and plays back to transforms of zero, so it can't misplace a card at any size.
 *
 * Each concern has its own element, so none of them compete for a transform:
 *   .sc-card        entrance timeline, then pointer parallax
 *   .sc-card__float pre-burst shake, then idle float
 *   .sc-card__tilt  the resting tilt, CSS only (GSAP would absorb and overwrite it on an element it animates)
 *   .sc-card__face  hover and selection (CSS)
 *   .sc-card__aura  the slow green glow in one corner
 *
 * Under reduced motion none of this runs: the finished layout simply shows.
 */

// Entrance beats, in seconds. Every step starts only once the step it depends on has finished.
const BEAT = {
  stack: 0.35, // the stack fades in
  shake: 0.9, // slow-motion tremble, growing slightly
  anticipate: 0.22, // held breath, drawing in a little
  burst: 0.85,
  hold: 0.12, // hang at full spread
  ret: 1.1, // gradual return, shrinking into place
  stagger: 0.09,
  rest: 0.1, // a beat of stillness once every card has landed
  heading: 0.75,
  pill: 0.6,
}
const BURST_SCALE = 1.1

const STACK_TILT = [-9, -5, -1, 3, 7]
// Five distinct burst directions (degrees, 0 = right, 90 = down) and how far past its final spot each card goes, as a share of the card's width.
const BURST = [
  { angle: -142, past: 0.42 },
  { angle: -38, past: 0.34 },
  { angle: 168, past: 0.3 },
  { angle: 12, past: 0.38 },
  { angle: 96, past: 0.3 },
]
const FLOAT = [
  { x: 2, y: -6, rotation: 0.5, duration: 4.4 },
  { x: -2, y: 5, rotation: -0.4, duration: 5.6 },
  { x: 2, y: 4, rotation: -0.5, duration: 4.9 },
  { x: -2, y: -5, rotation: 0.4, duration: 6.2 },
  { x: 1, y: -4, rotation: 0.3, duration: 5.2 },
]
const PARALLAX = [9, 12, 7, 10, 5] // px of travel at the stage edge; differing depths give the sense of space
const AURA = [
  { x: "9%", y: "7%", duration: 11 },
  { x: "-8%", y: "9%", duration: 13.5 },
  { x: "8%", y: "-9%", duration: 12 },
  { x: "-9%", y: "-7%", duration: 14.5 },
  { x: "7%", y: "-8%", duration: 10.5 },
]

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

export default function ClientStoryScatter({ heading, phrase, pendingNote, galleryHeading, projects }) {
  const root = useRef(null)
  const [selected, setSelected] = useState(0)
  const project = projects[selected]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const stage = root.current.querySelector(".sc__stage")
        const cards = gsap.utils.toArray(".sc-card", stage)
        const floats = gsap.utils.toArray(".sc-card__float", stage)
        const tilts = gsap.utils.toArray(".sc-card__tilt", stage)
        const auras = gsap.utils.toArray(".sc-card__aura", stage)
        const line = stage.querySelector(".sc__line")
        const pill = stage.querySelector(".sc-pill")
        const note = stage.querySelector(".sc__note")

        gsap.set(cards, { autoAlpha: 0 })
        gsap.set(line, { yPercent: 112 })
        gsap.set([pill, note], { autoAlpha: 0 })

        let entrance = null
        let idle = []
        let visibility = null
        let onPointerMove = null
        let onPointerLeave = null

        const startLiving = () => {
          idle = [
            ...floats.map((el, i) => gsap.to(el, { ...FLOAT[i], ease: "sine.inOut", yoyo: true, repeat: -1 })),
            // Drifts a little and fades, then strengthens again on the way back.
            ...auras.map((el, i) => gsap.to(el, { ...AURA[i], opacity: 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 })),
          ]
          visibility = new IntersectionObserver(([e]) => idle.forEach((t) => t.paused(!e.isIntersecting)))
          visibility.observe(stage)

          if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
          const movers = cards.map((c) => ({ x: gsap.quickTo(c, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(c, "y", { duration: 0.9, ease: "power3" }) }))
          onPointerMove = (e) => {
            const r = stage.getBoundingClientRect()
            const nx = (e.clientX - r.left) / r.width - 0.5
            const ny = (e.clientY - r.top) / r.height - 0.5
            movers.forEach((m, i) => {
              m.x(nx * PARALLAX[i])
              m.y(ny * PARALLAX[i])
            })
          }
          onPointerLeave = () => movers.forEach((m) => (m.x(0), m.y(0)))
          stage.addEventListener("pointermove", onPointerMove)
          stage.addEventListener("pointerleave", onPointerLeave)
        }

        const play = () => {
          // Measured now, not at load, so a resize before the section is reached is already accounted for.
          const box = stage.getBoundingClientRect()
          const cx = box.left + box.width / 2
          const cy = box.top + box.height / 2
          const section = root.current.closest("section").getBoundingClientRect()
          const docEl = document.documentElement
          // The hard limits for a bursting card: inside both the section and the visible window.
          const MARGIN = 10
          const safe = {
            left: Math.max(section.left, 0) + MARGIN,
            right: Math.min(section.right, docEl.clientWidth) - MARGIN,
            top: Math.max(section.top, 0) + MARGIN,
            bottom: Math.min(section.bottom, window.innerHeight) - MARGIN,
          }

          const tBurst = BEAT.stack + BEAT.shake + BEAT.anticipate
          const tReturn = tBurst + BEAT.burst + BEAT.hold
          const tHeading = tReturn + BEAT.ret + BEAT.stagger * (cards.length - 1) + BEAT.rest
          const tPill = tHeading + BEAT.heading

          const tl = gsap.timeline({ onComplete: startLiving })
          entrance = tl

          cards.forEach((card, i) => {
            const r = card.getBoundingClientRect()
            const fan = i - (cards.length - 1) / 2
            const homeX = r.left + r.width / 2
            const homeY = r.top + r.height / 2
            const restTilt = parseFloat(getComputedStyle(tilts[i]).rotate) || 0

            // Burst point: past the final spot in this card's own direction, held inside the safe area.
            // A final spot beyond the window's edge (short screens) stays reachable, so the card still lands.
            const a = (BURST[i].angle * Math.PI) / 180
            const halfW = (r.width / 2) * BURST_SCALE * 1.08
            const halfH = (r.height / 2) * BURST_SCALE * 1.08
            const bx = clamp(homeX + Math.cos(a) * r.width * BURST[i].past, Math.min(safe.left + halfW, homeX), Math.max(safe.right - halfW, homeX))
            const by = clamp(homeY + Math.sin(a) * r.width * BURST[i].past, Math.min(safe.top + halfH, homeY), Math.max(safe.bottom - halfH, homeY))

            const seed = i % 2 ? -1 : 1
            const shakeBeat = BEAT.shake / 6
            const amp = window.innerWidth < 768 ? 0.7 : 1

            gsap.set(card, { x: cx - homeX + fan * 7, y: cy - homeY + fan * 5, rotation: STACK_TILT[i] - restTilt, scale: 0.8 })

            // 01 compact stack
            tl.to(card, { autoAlpha: 1, duration: BEAT.stack, ease: "power1.out" }, i * 0.015)
            // 02 slow-motion tremble that grows slightly, each card out of step with the next
            tl.to(
              floats[i],
              {
                keyframes: [
                  { x: seed * 1 * amp, y: -seed * 0.8 * amp, rotation: seed * 0.3 },
                  { x: -seed * 1.5 * amp, y: seed * 1 * amp, rotation: -seed * 0.5 },
                  { x: seed * 2 * amp, y: seed * 1.2 * amp, rotation: seed * 0.7 },
                  { x: -seed * 2.6 * amp, y: -seed * 1.6 * amp, rotation: -seed * 0.9 },
                  { x: seed * 3 * amp, y: -seed * 1.8 * amp, rotation: seed * 1.1 },
                  { x: 0, y: 0, rotation: 0 },
                ].map((k) => ({ ...k, duration: shakeBeat, ease: "sine.inOut" })),
              },
              BEAT.stack
            )
            // 03 held breath: the stack draws in a touch
            tl.to(card, { scale: 0.76, duration: BEAT.anticipate, ease: "sine.inOut" }, BEAT.stack + BEAT.shake)
            // 04 wide burst in this card's own direction, larger than its resting size
            tl.to(card, { x: bx - homeX, y: by - homeY, rotation: -STACK_TILT[i] * 0.7, scale: BURST_SCALE, duration: BEAT.burst, ease: "power3.out" }, tBurst + i * 0.03)
            // 05 gradual return, shrinking into its resting place
            tl.to(card, { x: 0, y: 0, rotation: 0, scale: 1, duration: BEAT.ret, ease: "power2.inOut" }, tReturn + i * BEAT.stagger)
          })

          // 06 heading, only after the last card has settled
          tl.to(line, { yPercent: 0, duration: BEAT.heading, ease: "power3.out" }, tHeading)
          // 07 client-story pill, only after the heading has finished
          tl.fromTo(pill, { autoAlpha: 0, scale: 0.94, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: BEAT.pill, ease: "power3.out", clearProps: "transform" }, tPill)
          tl.fromTo(note, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: BEAT.pill, ease: "power2.out" }, tPill + 0.12)
        }

        // Starts once the stage is well into view: the burst needs the room to be seen.
        const trigger = ScrollTrigger.create({ trigger: stage, start: "center 62%", once: true, onEnter: play })

        return () => {
          trigger.kill()
          entrance?.kill()
          idle.forEach((t) => t.kill())
          visibility?.disconnect()
          if (onPointerMove) {
            stage.removeEventListener("pointermove", onPointerMove)
            stage.removeEventListener("pointerleave", onPointerLeave)
          }
          // Anything created after the entrance began sits outside gsap's context, so its inline styles go here.
          gsap.set([...cards, ...floats, ...auras, line, pill, note], { clearProps: "all" })
        }
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <div ref={root} className="sc">
      <div className="sc__stage">
        <div className="sc__centre">
          <h3 className="t-h2 sc__title">
            <span className="sc__mask">
              <span className="sc__line">
                <Marked text={heading} phrase={phrase} tone="light" />
              </span>
            </span>
          </h3>
          <ClientStoryTrigger />
          <p className="sc__note">{pendingNote}</p>
        </div>

        <ul className="sc__assets" aria-labelledby="sc-systems-title">
          {projects.map((p, i) => (
            <FloatingAssetCard key={p.title} project={p} index={i} selected={i === selected} onSelect={() => setSelected(i)} />
          ))}
        </ul>
      </div>

      <div className="sc__details" data-reveal>
        <h3 id="sc-systems-title" className="t-h3 sc__details-title">
          {galleryHeading}
        </h3>
        <div key={project.title} className="sc__detail" aria-live="polite">
          <h4>{project.title}</h4>
          {project.meta && <p className="t-mono sc__detail-meta">{project.meta}</p>}
          {project.body && <p className="t-muted">{project.body}</p>}
          <p className="sc__detail-status">Screenshot · {uiCopy.assetPending}</p>
        </div>
      </div>
    </div>
  )
}

/** One landscape project asset. Only a placeholder: the screenshot itself is still pending. */
function FloatingAssetCard({ project, index, selected, onSelect }) {
  return (
    <li className={`sc-card sc-card--${index + 1}`}>
      <div className="sc-card__float">
        <div className="sc-card__tilt">
          <button type="button" className="sc-card__face" aria-pressed={selected} onClick={onSelect}>
            <span className="sc-card__aura" aria-hidden="true" />
            <ImageGlyph />
            <span className="sc-card__copy">
              <span className="sc-card__title">{project.title}</span>
              <span className="sc-card__status">
                <span className="sc-card__kind">Screenshot · </span>
                {uiCopy.assetPending}
              </span>
            </span>
          </button>
        </div>
      </div>
    </li>
  )
}

/** Compact story control. Opens the shared modal, which plays real media if it exists and otherwise says it's pending. */
function ClientStoryTrigger() {
  const { openModal } = useSite()
  return (
    <button type="button" className="sc-pill" onClick={() => openModal("video:testimonial")}>
      <span className="sc-pill__play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M8 5.2v13.6L19 12z" />
        </svg>
      </span>
      <span className="sc-pill__label">Client story {siteConfig.testimonialVideoUrl ? "" : `· ${uiCopy.assetPending}`}</span>
    </button>
  )
}

function ImageGlyph() {
  return (
    <svg className="sc-card__glyph" viewBox="0 0 32 26" fill="none" aria-hidden="true">
      <rect x="1.25" y="1.25" width="29.5" height="23.5" rx="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="10.5" cy="8.8" r="2.4" fill="currentColor" />
      <path d="M4.5 21.5l7.4-7.2 4.8 4.4 5-5.6 6.3 8.4z" fill="currentColor" />
    </svg>
  )
}
