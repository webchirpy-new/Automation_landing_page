import React, { useEffect, useRef } from "react"
import { gsap } from "../../lib/gsap"

const fmt = (n, decimals) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

/**
 * Animates a number once when it scrolls into view. SSR / no-JS / reduced
 * motion render the final value, so the figure is always readable.
 */
export default function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1.2, className = "", play = true }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !play) return undefined
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined
    const obj = { v: 0 }
    let tween
    el.textContent = `${prefix}${fmt(0, decimals)}${suffix}`
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        tween = gsap.to(obj, {
          v: value,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${prefix}${fmt(obj.v, decimals)}${suffix}`
          },
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (tween) tween.kill()
      el.textContent = `${prefix}${fmt(value, decimals)}${suffix}`
    }
  }, [value, prefix, suffix, decimals, duration, play])

  return (
    <span ref={ref} className={`count ${className}`}>
      {`${prefix}${fmt(value, decimals)}${suffix}`}
    </span>
  )
}
