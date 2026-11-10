import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { gsap } from "../../lib/gsap"
import { cameraDistance, computeCorners, hash01, sceneCentre } from "./introConfig"

const FACES = ["front", "back", "top", "bottom", "left", "right"]

/**
 * The Hero's lasting corner cubes, in CSS 3D. Same grid and camera distance as the intro's WebGL
 * wall, so the surviving cubes hand off in place and WebGL can be released. At rest a single
 * cube occasionally turns over, white to charcoal and back, and only while the fold is visible.
 */
export default function HeroVoxels({ foldRef, active }) {
  const [layout, setLayout] = useState(null)
  const layerRef = useRef(null)

  useLayoutEffect(() => {
    const fold = foldRef.current
    if (!fold) return undefined
    let lastW = 0
    let lastH = 0
    const measure = (force) => {
      const w = fold.clientWidth
      const h = fold.clientHeight
      if (!force && w === lastW && h === lastH) return
      lastW = w
      lastH = h
      const c = sceneCentre(w, h)
      setLayout({ ...computeCorners(fold), origin: c, distance: cameraDistance(w, Math.max(h, window.innerHeight)) })
    }
    measure(true)
    const ro = new ResizeObserver(() => measure(false))
    ro.observe(fold)
    document.fonts?.ready.then(() => measure(true))
    return () => ro.disconnect()
  }, [foldRef])

  const cellCount = layout?.cells.length ?? 0

  useEffect(() => {
    const layer = layerRef.current
    if (!layer || !active || !cellCount) return undefined
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined
    const spins = [...layer.querySelectorAll(".hv__spin")]
    const flipped = new Set()
    let visible = true
    let step = 0
    let timer = null
    const next = () => {
      step++
      if (visible && !document.hidden) {
        const i = Math.floor(hash01(step, 3) * spins.length)
        const horizontal = hash01(step, 4) > 0.5
        const on = flipped.has(i)
        if (on) flipped.delete(i)
        else flipped.add(i)
        gsap.to(spins[i], {
          [horizontal ? "rotationY" : "rotationX"]: on ? 0 : 180,
          [horizontal ? "rotationX" : "rotationY"]: 0,
          duration: 0.95,
          ease: "power2.inOut",
          overwrite: true,
        })
      }
      timer = gsap.delayedCall(1.3 + hash01(step, 5) * 2.1, next)
    }
    timer = gsap.delayedCall(1.2, next)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(layer)
    return () => {
      timer?.kill()
      io.disconnect()
      gsap.killTweensOf(spins)
      gsap.set(spins, { clearProps: "transform" })
    }
  }, [active, cellCount])

  if (!layout) return null
  const { cells, pitchX, pitchY, origin, distance } = layout

  return (
    <div
      ref={layerRef}
      className={`hv ${active ? "is-on" : ""}`}
      aria-hidden="true"
      style={{
        perspective: `${distance}px`,
        perspectiveOrigin: `${origin.x}px ${origin.y}px`,
        "--vw": `${pitchX}px`,
        "--vh": `${pitchY}px`,
      }}
    >
      {cells.map((c) => (
        <span key={c.key} className="hv__cube" style={{ left: `${c.col * pitchX}px`, top: `${c.row * pitchY}px` }}>
          <span className="hv__spin">
            {FACES.map((f) => (
              <i key={f} className={`hv__f hv__f--${f}`} />
            ))}
          </span>
        </span>
      ))}
    </div>
  )
}
