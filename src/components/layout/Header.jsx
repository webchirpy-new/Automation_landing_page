import React, { useEffect, useState } from "react"
import { ScrollProgress } from "../ui/primitives"
import { goToBooking } from "../../lib/scroll"

const NAV = [
  { label: "Scorecard", href: "#scorecard" },
  { label: "Engine", href: "#engine" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Proof", href: "#proof" },
  { label: "Why us", href: "#why" },
  { label: "FAQ", href: "#faq" },
]

export function Wordmark({ className = "" }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark__mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      WEBCHIRPY
    </span>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-header__bar">
        <a href="#top" className="site-header__brand" aria-label="Webchirpy — back to top">
          <Wordmark />
        </a>
        <nav className="site-header__nav" aria-label="Primary">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__actions">
          <button type="button" className="btn btn--primary btn--sm site-header__cta" onClick={goToBooking}>
            <span className="btn__label">Book free audit</span>
          </button>
          <button
            type="button"
            className="site-header__menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="burger" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>
      <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile" hidden={!open}>
        <ul>
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} onClick={() => setOpen(false)}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <ScrollProgress />
    </header>
  )
}
