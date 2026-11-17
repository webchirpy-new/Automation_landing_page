import React, { useEffect, useState } from "react"
import { whatsappHref } from "../../config/site"
import { useSite } from "../../context/SiteContext"
import { useIsMobile } from "../../hooks/useMediaQuery"

// Pre-filled message the visitor sends. n8n (WhatsApp Trigger) matches on "free automation audit"
// and replies with the approved template message.
const MESSAGE = "Hi Webchirpy, I'd like to book my free automation audit."
const LABEL = "Chat with us on WhatsApp"
// Catchy card beside the button. Phones show only the title and the first sentence.
const BUBBLE_TITLE = "Free automation audit 👋"
const BUBBLE_TEXT = "Chat with us on WhatsApp."
const BUBBLE_EXTRA = " We reply fast."
const BUBBLE_CTA = "Tap to get details"
// Phones: the card shows while the visitor is on section 03 or 04
const PEEK_SECTIONS = ["#compare", "#scorecard"]

function WaIcon({ size = 30 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.04 3C9.4 3 4 8.33 4 14.9c0 2.27.65 4.4 1.79 6.2L4 29l8.12-2.08a12.2 12.2 0 0 0 3.92.64C22.68 27.56 28 22.23 28 15.66 28 9.1 22.68 3 16.04 3Zm0 22.37c-1.24 0-2.45-.22-3.6-.65l-.52-.2-4.82 1.23 1.27-4.62-.33-.5a9.66 9.66 0 0 1-1.6-5.33c0-5.4 4.4-9.77 9.6-9.770 5.3 0 9.71 4.6 9.71 10.13 0 5.4-4.41 9.71-9.71 9.71Zm5.33-7.27c-.29-.15-1.730-.85-2-.95-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.24-.45-2.36-1.45-.87-.78-1.46-1.73-1.63-2.02-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.58-.9-2.17-.24-.57-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.2 3.01.15.2 2.06 3.14 5 4.4.7.3 1.24.48 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.73-.7 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34Z"
      />
    </svg>
  )
}

/**
 * Floating WhatsApp chat, bottom-right on every screen size. A card (icon, short pitch,
 * "Tap to get details") and the round button both open a chat with the business number and a
 * ready-to-send message. The card can be closed; the button stays. Hidden while a modal is open
 * and while the footer is on screen, so it never covers the legal line.
 *
 * Phones: the round button is always there. While section 03 (#compare) or 04 (#scorecard) is
 * in the middle of the screen, a compact card (title + one line) shows beside it; scrolling away
 * from those sections fades it out again. No timers.
 */
export default function WhatsAppButton() {
  const { modal } = useSite()
  const phone = useIsMobile()
  const [ready, setReady] = useState(false)
  const [atFooter, setAtFooter] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [peek, setPeek] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const href = whatsappHref(MESSAGE)

  useEffect(() => {
    const t1 = window.setTimeout(() => setReady(true), 1200)
    // Desktop and tablet: the card opens shortly after load (phones use the peek below instead)
    const t2 = window.setTimeout(() => setCardOpen(true), 2200)
    const footer = document.querySelector(".site-footer")
    let io
    if (footer && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting))
      io.observe(footer)
    }
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      io?.disconnect()
    }
  }, [])

  // Phones: the card follows whether section 03 or 04 is the one being viewed
  useEffect(() => {
    if (!phone || typeof IntersectionObserver === "undefined") return undefined
    const targets = PEEK_SECTIONS.map((s) => document.querySelector(s)).filter(Boolean)
    if (!targets.length) return undefined
    const inView = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inView.add(e.target) : inView.delete(e.target)))
        setPeek(inView.size > 0)
      },
      { rootMargin: "-40% 0px -40% 0px" } // the section is in the middle band of the screen
    )
    targets.forEach((t) => io.observe(t))
    return () => {
      io.disconnect()
      setPeek(false)
    }
  }, [phone])

  if (!href) return null
  const show = ready && !modal && !atFooter
  const showCard = show && !dismissed && (phone ? peek : cardOpen)

  return (
    <div className={`wa-fab ${show ? "is-visible" : ""} ${showCard ? "has-card" : ""}`} aria-hidden={!show}>
      <div className="wa-fab__card">
        <a className="wa-fab__card-link" href={href} target="_blank" rel="noopener noreferrer" tabIndex={showCard ? 0 : -1}>
          <span className="wa-fab__card-icon">
            <WaIcon size={20} />
          </span>
          <span className="wa-fab__card-body">
            <strong>{BUBBLE_TITLE}</strong>
            <span>
              {BUBBLE_TEXT}
              <span className="wa-fab__card-extra">{BUBBLE_EXTRA}</span>
            </span>
            <span className="wa-fab__card-cta">{BUBBLE_CTA} →</span>
          </span>
        </a>
        <button type="button" className="wa-fab__close" aria-label="Close" tabIndex={showCard ? 0 : -1} onClick={() => setDismissed(true)}>
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <a className="wa-fab__link" href={href} target="_blank" rel="noopener noreferrer" aria-label={LABEL} title={LABEL} tabIndex={show ? 0 : -1}>
        <span className="wa-fab__ring" aria-hidden="true" />
        <span className="wa-fab__ring" aria-hidden="true" />
        <span className="wa-fab__btn">
          <WaIcon />
        </span>
      </a>
    </div>
  )
}
