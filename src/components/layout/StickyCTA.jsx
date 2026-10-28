import React, { useEffect, useState } from "react"
import { persistent } from "../../data/automationContent"
import { useSite } from "../../context/SiteContext"
import { goToBooking } from "../../lib/scroll"
import PixelIcon from "../visuals/PixelIcon"

/**
 * Desktop/tablet: slim glass sticky bar. Phones: compact floating button.
 * Appears only after the hero CTA leaves view; hides while the booking form,
 * the final CTA or a modal is on screen — so there is never a duplicate CTA
 * covering the form's submit button.
 */
export default function StickyCTA() {
  const { modal } = useSite()
  const [pastHero, setPastHero] = useState(false)
  const [nearForm, setNearForm] = useState(false)

  useEffect(() => {
    const heroCta = document.getElementById("hero-cta")
    const blockers = ["book", "final"].map((id) => document.getElementById(id)).filter(Boolean)
    const visibleBlockers = new Set()

    const io1 = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0))
    if (heroCta) io1.observe(heroCta)

    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visibleBlockers.add(e.target) : visibleBlockers.delete(e.target)))
      setNearForm(visibleBlockers.size > 0)
    })
    blockers.forEach((b) => io2.observe(b))
    return () => {
      io1.disconnect()
      io2.disconnect()
    }
  }, [])

  const show = pastHero && !nearForm && !modal

  return (
    <>
      <div className={`sticky-bar ${show ? "is-visible" : ""}`} aria-hidden={!show}>
        <p>
          <span className="sticky-bar__dot" aria-hidden="true" />
          {persistent.stickyBar.text}
        </p>
        <button type="button" className="btn btn--primary btn--sm" onClick={goToBooking} tabIndex={show ? 0 : -1}>
          <span className="btn__label">{persistent.stickyBar.button}</span>
        </button>
      </div>
      <button
        type="button"
        className={`floating-cta ${show ? "is-visible" : ""}`}
        onClick={goToBooking}
        aria-hidden={!show}
        tabIndex={show ? 0 : -1}
      >
        <PixelIcon name="seal" size={18} />
        <span>{persistent.floatingButton}</span>
      </button>
    </>
  )
}
