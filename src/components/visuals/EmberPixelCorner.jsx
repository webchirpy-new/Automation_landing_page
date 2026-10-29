import React, { useLayoutEffect, useMemo, useRef } from "react"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

/**
 * EmberPixelCorner — "Digital Ember Fragmentation". A small cluster of micro-pixels
 * at one corner of a section that assembles, fragments and settles:
 *
 *   dissolve    — pixels surface along the corner edge, separate, drift 8–24px, fade.
 *   materialise — fragments move inward into formation, the corner warms, they fade.
 *   scan        — a short warm glint runs along the corner's edge, lighting pixels it passes.
 *
 * Lives in the section's empty padding band at a corner (never over content), behind
 * everything, aria-hidden. On dark rounded panels the panel's own clip shapes it to the
 * radius; pixels also hug that curve. Plays once when the corner comes into view, then
 * an occasional idle replay (12–24s, per-section phase) only while it stays in view.
 * Positions are seeded per section, so they never change between renders. Reduced
 * motion: nothing animates and the corner simply stays clean.
 */

const MAX = 24 // desktop ceiling; CSS shows 16 on tablet, 9 on phones (nearest the corner first)
const PALETTE = {
  dark: ["#fdc003", "#f45e00", "#f04402", "#ff7a1a", "#d90d04", "#ffb54a"],
  light: ["#e9c46a", "#f3d27a", "#c9bfb4", "#f6a86b", "#dccfc0", "#f4b26b"],
}

// Deterministic PRNG (mulberry32) seeded from the section id.
function rng(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0

export default function EmberPixelCorner({
  sectionId,
  theme = "light",
  variant = "dissolve",
  corner = "top-right",
  density = 1,
  intensity = 1,
  animationDuration = 1.4,
  idleEnabled = true,
}) {
  const root = useRef(null)
  const [vert, side] = corner.split("-")
  const palette = PALETTE[theme]

  const seeds = useMemo(() => {
    const r = rng(hash(sectionId))
    return Array.from({ length: Math.round(MAX * density) }, () => ({
      u: r(),
      v: r(),
      size: 2 + Math.round(r() * 3),
      color: palette[Math.floor(r() * palette.length)],
      o: 0.55 + r() * 0.45,
      drift: 8 + r() * 16,
      jitter: r() * 2 - 1,
    })).sort((p, q) => p.u + p.v - (q.u + q.v)) // nearest the corner first
  }, [sectionId, density, palette])
  const idleEvery = 12 + (hash(sectionId) % 13) // 12–24s, differs per section

  // Lay pixels out in px from the corner, hugging a rounded panel's curve when there is one.
  useLayoutEffect(() => {
    const el = root.current
    const layout = () => {
      const W = el.offsetWidth
      const H = el.offsetHeight
      const host = el.parentElement
      const R = theme === "dark" ? parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0 : 0
      const sx = side === "right" ? -1 : 1 // direction into the section
      const sy = vert === "bottom" ? -1 : 1
      const len = W * 0.6
      el.querySelectorAll(".epc__px").forEach((px, i) => {
        const p = seeds[i]
        let a // distance from the corner along the horizontal edge
        let b // … and along the vertical edge
        if (variant === "scan") {
          a = R * 0.75 + len * p.u
          const arc = a < R ? R - Math.sqrt(Math.max(0, R * R - (R - a) ** 2)) : 0
          b = arc + 1 + p.v * 7
        } else {
          a = W * p.u ** 2.2
          b = H * p.v ** 2.2
          const d = Math.hypot(a - R, b - R)
          if (a < R && b < R && d > R - 4) {
            // outside the rounded corner: pull back just inside the curve
            const k = (R - 4 - p.v * 6) / d
            a = R + (a - R) * k
            b = R + (b - R) * k
          }
        }
        // Everything — rest position and every motion offset — stays inside the corner box,
        // which is itself confined to the section's empty padding band.
        const h = p.size / 2
        const clampX = (v) => Math.min(W - h, Math.max(h, v))
        const clampY = (v) => Math.min(H - h, Math.max(h, v))
        const x = clampX(side === "right" ? W - a : a)
        const y = clampY(vert === "bottom" ? H - b : b)
        px.style.left = `${x - h}px`
        px.style.top = `${y - h}px`
        // motion vectors (into the section, with a little sideways scatter)
        const ang = Math.atan2(1, 1) + p.jitter * 0.6
        px.dataset.dx = String(clampX(x + sx * Math.cos(ang) * p.drift) - x)
        px.dataset.dy = String(clampY(y + sy * Math.sin(ang) * p.drift) - y)
        px.dataset.mx = String(clampX(x + sx * (14 + p.drift * 0.6) + p.jitter * 6) - x)
        px.dataset.my = String(clampY(y + sy * (10 + p.drift * 0.5) - p.jitter * 6) - y)
        px.dataset.at = String(variant === "scan" ? (a - R * 0.75) / len : 0)
      })
      const glint = el.querySelector(".epc__glint")
      if (glint) {
        glint.dataset.from = String(side === "right" ? W - R * 0.75 : R * 0.75)
        glint.dataset.to = String(side === "right" ? W - R * 0.75 - len : R * 0.75 + len)
      }
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(el)
    return () => ro.disconnect()
  }, [seeds, variant, side, vert, theme])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const el = root.current
        const glow = el.querySelector(".epc__glow")
        const glint = el.querySelector(".epc__glint")
        const D = animationDuration
        const num = (attr) => (i, t) => +t.dataset[attr]
        let tl
        let idle

        const build = () => {
          const px = [...el.querySelectorAll(".epc__px")].filter((p) => p.offsetParent !== null)
          const n = Math.max(px.length, 1)
          const t = gsap.timeline()
          gsap.set(px, { x: 0, y: 0, scale: 1, opacity: 0 })
          if (variant === "dissolve") {
            t.to(glow, { opacity: 0.85 * intensity, duration: D * 0.3, ease: "power2.out" }, 0)
              .fromTo(px, { opacity: 0, scale: 0.4 }, { opacity: (i, p) => +p.dataset.o * intensity, scale: 1, duration: 0.26, ease: "power2.out", stagger: (D * 0.25) / n }, 0.05)
              .to(px, { x: num("dx"), y: num("dy"), opacity: 0, duration: D * 0.5, ease: "power1.out", stagger: (D * 0.2) / n }, D * 0.38)
              .to(glow, { opacity: 0, duration: D * 0.45, ease: "power2.inOut" }, D * 0.5)
          } else if (variant === "materialise") {
            t.fromTo(
              px,
              { opacity: 0, scale: 0.6, x: num("mx"), y: num("my") },
              { opacity: (i, p) => +p.dataset.o * intensity, scale: 1, x: 0, y: 0, duration: D * 0.45, ease: "power3.out", stagger: { each: (D * 0.25) / n, from: "random" } },
              0
            )
              .to(glow, { opacity: intensity, duration: D * 0.25, ease: "power2.out" }, D * 0.35)
              .to(px, { opacity: 0, duration: D * 0.3, ease: "power2.in", stagger: (D * 0.15) / n }, D * 0.75)
              .to(glow, { opacity: 0, duration: D * 0.35, ease: "power2.inOut" }, D * 0.8)
          } else {
            const from = +glint.dataset.from
            const to = +glint.dataset.to
            t.fromTo(glint, { x: from, opacity: 0 }, { x: to, duration: D * 0.75, ease: "power1.inOut" }, 0)
              .to(glint, { opacity: intensity, duration: D * 0.12 }, 0)
              .to(glint, { opacity: 0, duration: D * 0.2 }, D * 0.6)
              .to(glow, { opacity: 0.5 * intensity, duration: D * 0.25 }, 0)
              .to(glow, { opacity: 0, duration: D * 0.4 }, D * 0.55)
            px.forEach((p) => {
              const at = 0.05 + +p.dataset.at * D * 0.75
              t.fromTo(p, { opacity: 0, scale: 0.5 }, { opacity: +p.dataset.o * intensity, scale: 1, duration: 0.12, ease: "power2.out" }, at).to(
                p,
                { opacity: 0, duration: 0.5, ease: "power1.out" },
                at + 0.16
              )
            })
          }
          return t
        }
        const run = () => {
          tl?.kill()
          tl = build()
        }
        const schedule = () => {
          idle?.kill()
          if (idleEnabled) idle = gsap.delayedCall(idleEvery, () => (run(), schedule()))
        }
        let seen = false
        const st = ScrollTrigger.create({
          trigger: el, // the corner itself: plays when it is actually on screen
          start: "top 92%",
          end: "bottom 8%",
          onToggle: (s) => {
            if (!s.isActive) return idle?.kill()
            if (!seen) {
              seen = true
              run()
            }
            schedule()
          },
        })
        return () => {
          st.kill()
          tl?.kill()
          idle?.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <div ref={root} className={`epc epc--${theme} epc--${vert} epc--${side} epc--${variant}`} aria-hidden="true">
      <span className="epc__glow" />
      {variant === "scan" && <span className="epc__glint" />}
      {seeds.map((p, i) => (
        <i
          key={i}
          className="epc__px"
          data-tier={i < 9 ? 1 : i < 16 ? 2 : 3}
          data-o={p.o.toFixed(2)}
          style={{ width: p.size, height: p.size, background: p.color }}
        />
      ))}
    </div>
  )
}
