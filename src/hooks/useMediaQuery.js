import { useEffect, useState } from "react"

/**
 * SSR-safe media query. Returns `initial` on the server and first client render
 * (so hydration matches), then the real value.
 */
export function useMediaQuery(query, initial = false) {
  const [matches, setMatches] = useState(initial)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [query])
  return matches
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)")
export const useIsMobile = () => useMediaQuery("(max-width: 767px)")
export const useBreakpoint = () => {
  const mobile = useMediaQuery("(max-width: 767px)")
  const tablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
  return mobile ? "mobile" : tablet ? "tablet" : "desktop"
}
export const useCoarsePointer = () => useMediaQuery("(hover: none), (pointer: coarse)")
