import React, { useEffect, useRef } from "react"
import Modal from "../interactions/Modal"
import LeadForm from "../interactions/LeadForm"
import PixelIcon from "../visuals/PixelIcon"
import { persistent, hero, uiCopy } from "../../data/automationContent"
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
  const { modal, openModal, closeModal, formSubmitted } = useSite()

  // Exit-intent popup: desktop + fine pointer only, after 20s, once per session,
  // never when another modal is open or after the form was sent.
  const stateRef = useRef({ modal, formSubmitted })
  stateRef.current = { modal, formSubmitted }
  useEffect(() => {
    if (!siteConfig.enableExitPopup) return undefined
    const mq = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)")
    if (!mq.matches) return undefined
    let seen = false
    try {
      seen = sessionStorage.getItem("wc-exit-seen") === "1"
    } catch (e) {
      /* ignore */
    }
    if (seen) return undefined
    const armedAt = Date.now() + 20000
    const onOut = (e) => {
      if (e.relatedTarget || e.clientY > 0) return
      if (Date.now() < armedAt) return
      if (stateRef.current.modal || stateRef.current.formSubmitted) return
      try {
        sessionStorage.setItem("wc-exit-seen", "1")
      } catch (err) {
        /* ignore */
      }
      document.removeEventListener("mouseout", onOut)
      openModal("exit")
    }
    document.addEventListener("mouseout", onOut)
    return () => document.removeEventListener("mouseout", onOut)
  }, [openModal])

  const ex = persistent.exitPopup

  return (
    <>
      <Modal open={modal === "lead"} onClose={closeModal} labelledBy="lead-modal-title" size="md">
        <p className="t-mono modal__tag">{persistent.leadModal.tag}</p>
        <h2 id="lead-modal-title" className="t-h3 modal__title">
          {persistent.leadModal.title}
        </h2>
        <LeadForm idPrefix="modal" compact />
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
