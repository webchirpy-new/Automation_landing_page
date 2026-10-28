import { useEffect, useState } from "react"

/**
 * Tracks whether `ref` is on screen. `once` latches true after first entry —
 * used to start one-shot animations and pause idle loops when offscreen.
 */
export function useInView(ref, { rootMargin = "0px", threshold = 0, once = false } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { rootMargin, threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, threshold, once])
  return inView
}
