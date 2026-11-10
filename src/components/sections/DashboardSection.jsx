import React, { useRef } from "react"
import { dashboard } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import DashboardDemo from "../interactions/DashboardDemo"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { Marked } from "../ui/Highlight"

const CAPSULE_W = 26 // matches .ddd__capsule
const CAPSULE_H = 10
const MOVE = { speed: 280, min: 0.45, max: 1.6, stacked: 0.8, reset: 0.35 } // px per second; seconds
const PULSE = { scale: 1.1, rise: 0.28, hold: 0.12, fall: 0.5 } // seconds

export default function DashboardSection() {
  const flowRef = useRef(null)

  /*
   * One timeline runs the whole signal: enter the track, reach 01, pulse, reach 02, pulse, reach 03,
   * pulse, leave the track. Each step starts where the previous one ends, so a box can't fire before
   * the signal arrives and the signal can't leave before the box has settled.
   * Positions are measured from the DOM and re-measured when the width changes.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const root = flowRef.current
        const capsule = root.querySelector(".ddd__capsule")
        const route = root.querySelector(".ddd__route")
        const nodes = gsap.utils.toArray(".ddd__node", root)
        const glows = gsap.utils.toArray(".ddd__glow", root)
        const styles = getComputedStyle(nodes[0])
        const rest = { backgroundColor: styles.backgroundColor, color: styles.color }
        const active = { backgroundColor: styles.getPropertyValue("--accent").trim(), color: styles.getPropertyValue("--on-accent").trim() }

        let tl = null
        let onScreen = false
        let measuredWidth = 0

        const build = () => {
          tl?.kill()
          gsap.set(nodes, { clearProps: "transform,backgroundColor,color" })
          gsap.set(glows, { clearProps: "opacity" })

          const box = root.getBoundingClientRect()
          const track = route.getBoundingClientRect() // zero-sized on phones, where the track is hidden
          const hasTrack = track.width > 0
          const centres = nodes.map((n) => {
            const r = n.getBoundingClientRect()
            return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
          })
          const start = track.left - box.left
          const end = track.right - box.left
          const travel = (from, to) => (hasTrack ? gsap.utils.clamp(MOVE.min, MOVE.max, Math.abs(to - from) / MOVE.speed) : MOVE.stacked)

          tl = gsap.timeline({ repeat: -1, paused: true })

          // The capsule's jump back to the start happens here, while it's fully transparent.
          gsap.set(capsule, { x: start - CAPSULE_W / 2, y: centres[0].y - CAPSULE_H / 2, autoAlpha: 0 })
          const enter = travel(start, centres[0].x)
          tl.to(capsule, { x: centres[0].x - CAPSULE_W / 2, duration: enter, ease: "sine.inOut" }, 0)
          tl.to(capsule, { autoAlpha: 1, duration: Math.min(0.3, enter), ease: "none" }, 0)

          nodes.forEach((node, i) => {
            if (i > 0) tl.to(capsule, { x: centres[i].x - CAPSULE_W / 2, duration: travel(centres[i - 1].x, centres[i].x), ease: "sine.inOut" })
            const hit = tl.duration()
            // force3D off keeps the digits re-rendered sharply at every scale, rather than as a stretched layer.
            tl.to(node, { ...active, scale: PULSE.scale, duration: PULSE.rise, ease: "power2.out", force3D: false }, hit)
            tl.to(glows[i], { opacity: 1, duration: PULSE.rise, ease: "power2.out" }, hit)
            tl.to(node, { ...rest, scale: 1, duration: PULSE.fall, ease: "power2.inOut", force3D: false }, hit + PULSE.rise + PULSE.hold)
            tl.to(glows[i], { opacity: 0, duration: PULSE.fall, ease: "power2.inOut" }, hit + PULSE.rise + PULSE.hold)
          })

          const leave = travel(centres[nodes.length - 1].x, end)
          const leaveAt = tl.duration()
          tl.to(capsule, { x: end - CAPSULE_W / 2, duration: leave, ease: "sine.in" }, leaveAt)
          tl.to(capsule, { autoAlpha: 0, duration: Math.min(0.28, leave), ease: "none" }, leaveAt + leave - Math.min(0.28, leave))
          tl.to({}, { duration: MOVE.reset }) // a short beat with nothing on the track before the next pass

          if (onScreen) tl.play()
        }

        build()
        measuredWidth = root.offsetWidth

        const visibility = new IntersectionObserver(([e]) => {
          onScreen = e.isIntersecting
          tl.paused(!onScreen)
        })
        visibility.observe(root)

        let settle = null
        const resize = new ResizeObserver(() => {
          if (root.offsetWidth === measuredWidth) return
          measuredWidth = root.offsetWidth
          settle?.kill()
          settle = gsap.delayedCall(0.15, build)
        })
        resize.observe(root)

        return () => {
          settle?.kill()
          resize.disconnect()
          visibility.disconnect()
          tl?.kill()
          gsap.set([capsule, ...nodes, ...glows], { clearProps: "all" })
        }
      })
      return () => mm.revert()
    },
    { scope: flowRef }
  )

  return (
    <SectionShell id="dashboard" theme="night" labelledBy="dashboard-title" className="dashboard-section">
      <header className="section-head section-head--center">
        <h2 id="dashboard-title" className="t-h2" data-reveal>
          <Marked text={dashboard.headline} phrase="One screen." tone="dark" />
        </h2>
        <p className="t-lead" data-reveal>
          {dashboard.sub}
        </p>
      </header>

      <div ref={flowRef} className="ddd" data-reveal>
        <svg className="ddd__svg" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path className="ddd__route" d="M60 20 L940 20" />
        </svg>
        <span className="ddd__capsule" aria-hidden="true" />
        <ol className="ddd__steps">
          {dashboard.flow.map((f, i) => (
            <li key={f.title} className="ddd__step">
              <span className="ddd__node t-mono">
                <span className="ddd__glow" aria-hidden="true" />
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="ddd__title">{f.title}</h3>
              <p className="ddd__body">{f.body}</p>
              <ul className="ddd__items">
                {f.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <p className="dashboard-section__try t-mono">{dashboard.tryIt}</p>
      <DashboardDemo />
    </SectionShell>
  )
}
