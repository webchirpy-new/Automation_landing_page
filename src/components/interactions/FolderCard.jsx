import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react"
import { Flip, gsap } from "../../lib/gsap"

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

/**
 * useFlipMorph — call `capture()` immediately BEFORE a state change that
 * reflows `ref`; after React commits, the element morphs from the captured
 * geometry (GSAP Flip). Interruption-safe: an in-flight morph is completed
 * before a new capture. Reduced motion: instant.
 */
export function useFlipMorph(ref, deps) {
  const state = useRef(null)
  const tween = useRef(null)
  const capture = useCallback(() => {
    if (!ref.current) return
    if (tween.current) tween.current.progress(1).kill()
    state.current = Flip.getState(ref.current)
  }, [ref])

  useIsoLayoutEffect(() => {
    const s = state.current
    state.current = null
    if (!s || !ref.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    ref.current.style.overflow = "hidden"
    tween.current = Flip.from(s, {
      targets: ref.current,
      duration: 0.62,
      ease: "power3.inOut",
      scale: false,
      onComplete: () => {
        if (ref.current) ref.current.style.overflow = ""
        tween.current = null
      },
    })
    gsap.from(ref.current.querySelectorAll("[data-folder-item]"), {
      autoAlpha: 0,
      y: 12,
      duration: 0.42,
      ease: "power2.out",
      stagger: 0.04,
      delay: 0.22,
      clearProps: "all",
    })
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return capture
}

/**
 * Accessible folder / book card.
 * - Closed: a folder front (cover) with tab and peeking paper layers.
 * - Open: the cover swings down on a CSS 3D hinge while the sheet morphs open.
 * - The toggle is a real <button aria-expanded aria-controls>; Enter/Space work
 *   natively. Focus moves to the sheet heading on open and back to the toggle on
 *   close. Content is in the DOM, selectable and never clipped at rest.
 *
 * Variants: folder | stack | sleeve | bento (each styled differently).
 */
export default function FolderCard({
  id,
  open,
  onToggle,
  variant = "folder",
  tab,
  cover,
  openLabel = "Open",
  closeLabel = "Close",
  children,
  className = "",
  capture: externalCapture,
  morphKey,
}) {
  const ref = useRef(null)
  const toggleRef = useRef(null)
  const internalCapture = useFlipMorph(ref, [open, morphKey])
  const capture = externalCapture || internalCapture
  const wasOpen = useRef(open)

  useEffect(() => {
    if (open && !wasOpen.current) {
      const h = ref.current?.querySelector(".folder__sheet h3, .folder__sheet h4")
      if (h) {
        h.setAttribute("tabindex", "-1")
        h.focus({ preventScroll: true })
      }
    }
    wasOpen.current = open
  }, [open])

  const handle = () => {
    capture()
    onToggle(!open)
    if (open) window.requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }))
  }

  const sheetId = `${id}-sheet`
  return (
    <div ref={ref} className={`folder folder--${variant} ${open ? "is-open" : "is-closed"} ${className}`}>
      <div className="folder__tab t-mono" aria-hidden="true">
        {tab}
      </div>
      <div className="folder__papers" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      {!open && (
        <div className="folder__front">
          {cover}
          <button ref={toggleRef} type="button" className="folder__toggle btn btn--dark btn--sm" aria-expanded={false} aria-controls={sheetId} onClick={handle}>
            <span className="btn__label">{openLabel}</span>
          </button>
        </div>
      )}

      {open && (
        <>
          <div className="folder__lid" aria-hidden="true" />
          <div id={sheetId} className="folder__sheet">
            <div className="folder__sheet-bar">
              <span className="folder__tab-label t-mono">{tab}</span>
              <button type="button" className="folder__close btn btn--ghost btn--sm" aria-expanded={true} aria-controls={sheetId} onClick={handle}>
                <span className="btn__label">← {closeLabel}</span>
              </button>
            </div>
            {children}
          </div>
        </>
      )}
      {/* Sheet id must exist for aria-controls when closed */}
      {!open && <div id={sheetId} hidden />}
    </div>
  )
}
