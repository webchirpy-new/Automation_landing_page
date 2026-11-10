import React, { useEffect, useRef, useState } from "react"
import { createStarfield, starfieldStats } from "./starfieldEngine"

const TEXT = "h1, h2, h3, h4, p, li, blockquote, a.btn, button.btn, .eyebrow"
const NEAR = "25% 0px" // sized just before it scrolls into view, so it is never seen blank

/**
 * The moving space background of one dark section. It is a decorative, absolutely positioned
 * layer behind the section's content: never interactive, clipped by the section's own radius.
 *
 * The canvas is one viewport tall and pinned while its section scrolls past (sections run to
 * 2,600 px, far too large for a backing store each). So stars hold still behind scrolling content,
 * which is also what makes them read as far away. Its section must allow position: sticky.
 *
 * @param preset  a key of PRESETS
 * @param seed    keeps this section's star layout its own
 * @param pinned  false for a section no taller than the screen (the Hero fold)
 * @param visible false keeps it hidden and idle (the Hero, during the intro)
 * @param fadeMs  opacity hand-off when it becomes visible
 */
export default function SpaceAtmosphere({ preset, seed, pinned = true, visible = true, fadeMs = 700, className = "" }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const fieldRef = useRef(null)
  const inViewRef = useRef(false)
  const nearRef = useRef(false)
  const visibleRef = useRef(visible)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return undefined
    const host = wrap.parentElement
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let field
    try {
      field = createStarfield(canvas, { preset, seed: seed || preset, still })
    } catch {
      field = null
    }
    if (!field) return undefined // no Canvas 2D: the section keeps its plain dark surface
    fieldRef.current = field

    let lastW = 0
    let lastH = 0
    let scrollDirty = true

    const measureClearZones = () => {
      const base = wrap.getBoundingClientRect()
      const hostArea = base.width * base.height
      const rects = []
      host.querySelectorAll(TEXT).forEach((el) => {
        if (wrap.contains(el)) return
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height || r.width * r.height > hostArea * 0.7) return
        rects.push({ l: r.left - base.left - 18, r: r.right - base.left + 18, t: r.top - base.top - 14, b: r.bottom - base.top + 14 })
      })
      field.setClearZones(rects, base.width, base.height)
    }

    const layout = () => {
      const width = wrap.clientWidth
      const full = wrap.clientHeight
      if (!width || !full) return
      const height = pinned ? Math.min(full, window.innerHeight) : full
      // Phone address bars change innerHeight while scrolling; only a real change rebuilds
      if (width !== lastW || Math.abs(height - lastH) > 120) {
        lastW = width
        lastH = height
        canvas.style.height = `${height}px`
        field.resize(width, height)
      }
      measureClearZones()
    }

    const updateOffset = () => {
      if (!scrollDirty) return
      scrollDirty = false
      const top = wrap.getBoundingClientRect().top
      field.setViewOffset(Math.max(0, Math.min(wrap.clientHeight - lastH, -top)))
    }
    const onScroll = () => {
      scrollDirty = true
      if (pinned) updateOffset()
    }

    const run = () => {
      if (inViewRef.current && visibleRef.current) field.start()
      else field.stop()
    }
    field.apply = run

    // Near the screen: sized and measured. The backing store is then kept: resizing canvases to
    // nothing and back during fast scrolling is churn that is not worth the memory it returns.
    const nearIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          layout()
          updateOffset()
          window.addEventListener("scroll", onScroll, { passive: true })
          setEntered(true)
        } else {
          window.removeEventListener("scroll", onScroll)
        }
        nearRef.current = e.isIntersecting
      },
      { rootMargin: NEAR }
    )
    nearIO.observe(wrap)
    // Actually on screen: only then does it animate
    const viewIO = new IntersectionObserver(([e]) => {
      inViewRef.current = e.isIntersecting
      run()
    })
    viewIO.observe(wrap)

    let pending = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(() => {
        if (nearRef.current) layout()
        else lastW = 0
      })
    })
    ro.observe(wrap)
    document.fonts?.ready.then(() => nearRef.current && measureClearZones())

    if (import.meta.env.DEV) window.__stars = starfieldStats

    return () => {
      cancelAnimationFrame(pending)
      nearIO.disconnect()
      viewIO.disconnect()
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
      field.destroy()
      fieldRef.current = null
    }
  }, [preset, seed, pinned])

  // The Hero's hand-off: stays idle through the intro, then starts when revealed
  useEffect(() => {
    visibleRef.current = visible
    fieldRef.current?.apply?.()
  }, [visible])

  return (
    <div
      ref={wrapRef}
      className={`space-atmo ${pinned ? "space-atmo--pinned" : ""} ${visible && entered ? "is-on" : ""} ${className}`}
      style={{ "--atmo-fade": `${fadeMs}ms` }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="space-atmo__canvas" />
    </div>
  )
}
