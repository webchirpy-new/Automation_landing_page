import React, { useEffect, useRef } from "react"

/**
 * SectionAmbient — green, slowly drifting light blooms anchored inside one section.
 *
 * Each bloom is two offset radial layers (mint/green core, deep green halo), so
 * a slow drift-and-turn shifts the hues like an aurora while only transform and opacity
 * animate. The wrapper's mask dissolves every bloom before the section's top and bottom
 * edge, so chapters always meet on their native white or charcoal. Motion runs only
 * while the section is near the viewport and is frozen under reduced motion.
 *
 * bloom: { x, y } anchor (CSS length/%), size, opacity, dx/dy drift (px), dur (s),
 *        delay (s, phase offset), rot (deg, starting turn)
 */
export default function SectionAmbient({ blooms, tone = "light", fadeTop = "14%", fadeBottom = "24%", className = "" }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-on", e.isIntersecting), { rootMargin: "160px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!blooms?.length) return null
  return (
    <div
      ref={ref}
      className={`ambient ambient--${tone} ${className}`}
      style={{ "--fade-top": fadeTop, "--fade-bottom": fadeBottom }}
      aria-hidden="true"
    >
      {blooms.map((b, i) => (
        <span
          key={i}
          className="ambient__bloom"
          style={{
            "--x": b.x,
            "--y": b.y,
            "--size": b.size,
            "--o": b.opacity,
            "--dx": `${b.dx}px`,
            "--dy": `${b.dy}px`,
            "--dur": `${b.dur}s`,
            "--delay": `${-(b.delay || 0)}s`,
            "--rot": `${b.rot || 0}deg`,
          }}
        />
      ))}
    </div>
  )
}
