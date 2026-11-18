import React, { useEffect, useRef } from "react"
import Modal from "../interactions/Modal"
import TallyEmbed from "../interactions/TallyEmbed"
import { scorecardPayload } from "../../lib/scoring"
import PixelIcon from "../visuals/PixelIcon"
import { persistent, uiCopy, reportForm } from "../../data/automationContent"
import { pageHero as hero, pageId } from "../../data/landingPages"
import { siteConfig } from "../../config/site"
import { useSite } from "../../context/SiteContext"
import { goToBooking } from "../../lib/scroll"

function VideoBody({ url, title, label, caption }) {
  return (
    <div className="video-modal">
      <p className="t-mono video-modal__label">{label}</p>
      <h2 id="video-title" className="t-h3">
        {title}
      </h2>
      <div className="video-modal__frame">
        {url ? (
          // Mounted only while open, so closing the dialog stops playback.
          <iframe src={url} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <div className="video-modal__pending">
            <PixelIcon name="play" size={40} />
            <p>{uiCopy.videoPending}</p>
          </div>
        )}
      </div>
      {caption && <p className="t-muted video-modal__caption">{caption}</p>}
    </div>
  )
}

export default function SiteModals() {
  const { modal, openModal, closeModal, formSubmitted, summary } = useSite()

  // Exit popup, in two layers. Desktop + fine pointer only, once per tab session, never over
  // another modal or after a form was sent.
  // 1. As the cursor heads for the tab bar (leaves the top of the page moving upward), the
  //    checklist popup opens, so it's on screen before they reach the tab's ✕. Slow slips
  //    over the top edge, and a cursor crossing an unfocused window, are ignored.
  // 2. If they click ✕ (or reload / back / type a new URL) without having seen it, the
  //    browser's own "Leave site?" box is the last check. Browsers allow nothing else at that
  //    moment and its wording can't be changed. Cancel → the page stays and the popup opens.
  //    Browsers only show that box after the visitor has clicked or typed on the page.
  const stateRef = useRef({ modal, formSubmitted })
  stateRef.current = { modal, formSubmitted }
  useEffect(() => {
    if (!siteConfig.enableExitPopup) return undefined
    const mq = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)")
    if (!mq.matches) return undefined

    // Once per tab session. In development it's only remembered until the next reload,
    // so the popup can be re-tested without opening a new tab.
    const SEEN_KEY = "wc-exit-seen"
    let seenThisLoad = false
    const hasSeen = () => {
      if (seenThisLoad) return true
      if (import.meta.env.DEV) return false
      try {
        return sessionStorage.getItem(SEEN_KEY) === "1"
      } catch {
        return false
      }
    }
    const markSeen = () => {
      seenThisLoad = true
      if (import.meta.env.DEV) return
      try {
        sessionStorage.setItem(SEEN_KEY, "1")
      } catch {
        /* ignore */
      }
    }
    const canShow = () => !hasSeen() && !stateRef.current.modal && !stateRef.current.formSubmitted

    // Layer 1: cursor heading up to the tab bar. Fires the instant it leaves the page.
    const TRAIL_MS = 250 // look at the last ~250ms of movement before the exit
    const MIN_UP_SPEED = 0.08 // px/ms: any real upward move counts; only a resting cursor nudged over the edge doesn't
    const trail = [] // recent { t, y } pointer samples

    const onMove = (e) => {
      const t = performance.now()
      trail.push({ t, y: e.clientY })
      while (trail.length && t - trail[0].t > TRAIL_MS) trail.shift()
    }
    const headingUp = (exitY) => {
      const now = performance.now()
      const from = trail.find((p) => now - p.t <= TRAIL_MS)
      if (!from) return false
      const dt = Math.max(now - from.t, 16)
      return (from.y - exitY) / dt >= MIN_UP_SPEED
    }
    const onOut = (e) => {
      if (e.relatedTarget || e.clientY > 0) return
      if (!document.hasFocus() || !headingUp(e.clientY)) return
      if (!canShow()) return
      markSeen()
      openModal("exit")
    }

    // Layer 2: the browser's "Leave site?" box, if they click ✕ without having seen the popup.
    // Following one of the page's own links (Privacy, Terms) is not an exit attempt.
    // New-tab links and #section links don't unload the page, so they don't count.
    let linkClickAt = 0
    const onClick = (e) => {
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null
      if (!a || a.target === "_blank" || a.getAttribute("href").startsWith("#")) return
      linkClickAt = Date.now()
    }

    const onBeforeUnload = (e) => {
      if (!canShow()) return
      if (Date.now() - linkClickAt < 1500) return
      // No click or keypress on the page yet: the browser won't show the box, so don't ask.
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
      markSeen()
      e.preventDefault()
      e.returnValue = "" // older Chrome / Safari
      // The box freezes the page until answered. Leave → the page is gone and this never runs.
      // Cancel → it runs straight after and the popup appears.
      window.setTimeout(() => openModal("exit"), 0)
    }

    document.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseout", onOut)
    document.addEventListener("click", onClick, true)
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseout", onOut)
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("beforeunload", onBeforeUnload)
    }
  }, [openModal])

  const ex = persistent.exitPopup

  return (
    <>
      <Modal open={modal === "lead"} onClose={closeModal} labelledBy="lead-modal-title" size="md">
        <p className="t-mono modal__tag">{persistent.leadModal.tag}</p>
        <h2 id="lead-modal-title" className="t-h3 modal__title">
          {persistent.leadModal.title}
        </h2>
        <TallyEmbed url={siteConfig.tallyBookingUrl} title={persistent.leadModal.title} fields={{ page: pageId, ...scorecardPayload(summary) }} minHeight={520} thankYou="call" />
      </Modal>

      {/* Scorecard report request (Tally), opened from the scorecard result's CTA */}
      <Modal open={modal === "report"} onClose={closeModal} labelledBy="report-modal-title" size="md">
        <h2 id="report-modal-title" className="t-h3 modal__title">
          {reportForm.heading}
        </h2>
        <p className="t-muted report-modal__body">{reportForm.body}</p>
        <TallyEmbed url={siteConfig.tallyReportUrl} title={reportForm.heading} fields={{ page: pageId, ...scorecardPayload(summary) }} minHeight={520} thankYou="report" />
      </Modal>

      <Modal open={modal === "video:founder"} onClose={closeModal} labelledBy="video-title" size="lg">
        <VideoBody url={siteConfig.founderVideoUrl} title="Vasanth Sampathkumar" label="Watch first" caption={hero.videoCaption} />
      </Modal>

      <Modal open={modal === "video:testimonial"} onClose={closeModal} labelledBy="video-title" size="lg">
        <VideoBody url={siteConfig.testimonialVideoUrl} title={persistent.testimonialModal.title} label={persistent.testimonialModal.label} />
      </Modal>

      <Modal open={modal === "exit"} onClose={closeModal} labelledBy="exit-title" size="md" className="exit-modal">
        <p className="t-mono modal__tag">{ex.label}</p>
        <h2 id="exit-title" className="t-h3 modal__title">
          {ex.headline}
        </h2>
        <p className="exit-modal__included">
          <strong>{ex.includedLabel}</strong> · {ex.included}
        </p>
        <p className="t-muted">{ex.body}</p>
        <ul className="exit-modal__list">
          {ex.list.map((l) => (
            <li key={l}>
              <PixelIcon name="check" size={12} /> {l}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          data-autofocus
          onClick={() => {
            closeModal()
            window.setTimeout(goToBooking, 50)
          }}
        >
          <span className="btn__label">{ex.button}</span>
        </button>
        <p className="lead-form__privacy">{ex.micro}</p>
      </Modal>
    </>
  )
}
