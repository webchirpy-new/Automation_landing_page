import React from "react"
import { CTAButton } from "../ui/primitives"
import { goTo, goToBooking } from "../../lib/scroll"

/** A page-section CTA that scrolls to an in-page anchor (#scorecard or #book). */
export default function SectionButton({ button, className = "" }) {
  if (!button) return null
  const onClick = () =>
    button.href === "#book" ? goToBooking() : goTo(button.href, { focusSelector: ".score-area__toggle, input" })
  return (
    <CTAButton href={button.href} onClick={onClick} size="lg" className={`psec__cta ${className}`}>
      {button.label}
    </CTAButton>
  )
}
