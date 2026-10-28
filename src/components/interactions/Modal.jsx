import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible dialog: portal, aria-modal, focus trap, Escape to close,
 * background scroll lock, focus restored to the opener on close.
 */
export default function Modal({ open, onClose, labelledBy, children, className = "", size = "md" }) {
  const panelRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    openerRef.current = document.activeElement
    const panel = panelRef.current
    const first = panel?.querySelector("[data-autofocus]") || panel?.querySelector(FOCUSABLE)
    window.requestAnimationFrame(() => (first || panel)?.focus())

    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== "Tab" || !panel) return
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const a = items[0]
      const z = items[items.length - 1]
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault()
        z.focus()
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault()
        a.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = prevOverflow
      const opener = openerRef.current
      if (opener && typeof opener.focus === "function") opener.focus({ preventScroll: true })
    }
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div className="modal" role="presentation">
      <div className="modal__scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`modal__panel modal__panel--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
