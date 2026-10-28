import React, { useRef } from "react"
import AppTile from "../visuals/AppTile"
import { gsap, Draggable, useGSAP } from "../../lib/gsap"
import { uiCopy } from "../../data/automationContent"

/**
 * Clay-inspired 2.5D shelf: example tool tiles stand in shallow perspective.
 * Hover lifts a tile; dragging the shelf sideways fans the tiles (bounded,
 * elastic) and releases back. Pure CSS 3D — no canvas. Vertical page scroll is
 * never blocked (Draggable type "x" keeps native vertical touch scrolling).
 */
export default function IntegrationShelf({ ids, dark = true }) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      const track = ref.current.querySelector(".shelf__track")
      const setFan = gsap.quickSetter(ref.current, "--fan")
      const d = Draggable.create(track, {
        type: "x",
        bounds: { minX: -36, maxX: 36 },
        edgeResistance: 0.85,
        allowNativeTouchScrolling: true,
        onDrag() {
          setFan(this.x / 36)
        },
        onRelease() {
          gsap.to(track, { x: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" })
          gsap.to(ref.current, { "--fan": 0, duration: 0.7, ease: "elastic.out(1, 0.5)" })
        },
      })
      return () => d.forEach((x) => x.kill())
    },
    { scope: ref }
  )
  return (
    <div ref={ref} className={`shelf ${dark ? "shelf--dark" : ""}`} style={{ "--fan": 0 }}>
      <ul className="shelf__track" aria-label="Example tools and channels">
        {ids.map((id, i) => (
          <li key={id} className="shelf__item" style={{ "--k": i - (ids.length - 1) / 2 }}>
            <AppTile id={id} size={46} showLabel />
          </li>
        ))}
      </ul>
      <p className="shelf__note t-mono">{uiCopy.toolsDisclaimer}</p>
    </div>
  )
}
