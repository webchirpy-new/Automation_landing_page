import React, { useRef, useState } from "react"
import { finalCta, footer } from "../../data/automationContent"
import { serviceModules } from "../../data/serviceModules"
import { siteConfig, phoneHref, whatsappHref } from "../../config/site"
import { CTAButton } from "../ui/primitives"
import { useSite } from "../../context/SiteContext"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import SectionAmbient from "../visuals/SectionAmbient"
import { ambient } from "../../config/ambient"
import { Marked } from "../ui/Highlight"
import SpaceAtmosphere from "../atmosphere/SpaceAtmosphere"

const C = 180 // centre of 360 viewBox

export default function FinalCTA() {
  const ref = useRef(null)
  const [resolved, setResolved] = useState(true) // final state by default (SSR / reduced motion)
  const { openModal } = useSite()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        setResolved(false)
        gsap.set(".final__loop, .final__check", { drawSVG: "0%" })
        const tl = gsap.timeline({ paused: true, onComplete: () => setResolved(true) })
        tl.to(".final__loop", { drawSVG: "100%", duration: 1.2, ease: "power2.inOut" }).to(".final__check", { drawSVG: "100%", duration: 0.7, ease: "power2.out" }, "-=0.35")
        const io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              tl.play()
              io.disconnect()
            }
          },
          { threshold: 0.35 }
        )
        io.observe(ref.current.querySelector(".final__art"))
        return () => {
          io.disconnect()
          tl.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  const tel = phoneHref()
  const wa = whatsappHref()

  return (
    <footer id="final" ref={ref} className={`final ${resolved ? "is-resolved" : ""}`} aria-labelledby="final-title">
      <SectionAmbient blooms={ambient.final} tone="dark" fadeTop="0%" fadeBottom="48%" />
      <SpaceAtmosphere preset="cta" seed="final" />
      <div className="container final__hero">
        <div className="final__copy">
          <h2 id="final-title" className="t-h2">
            <Marked text={finalCta.headline} phrase="take the load?" tone="dark" />
          </h2>
          <p className="t-lead">{finalCta.sub}</p>
          <CTAButton size="lg" className="final__cta" onClick={() => openModal("lead")}>
            {finalCta.button}
          </CTAButton>
        </div>
        <div className="final__art" aria-hidden="true">
          <svg viewBox="0 0 360 360">
            <defs>
              <linearGradient id="final-spectral" x1="40" y1="40" x2="320" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8ce6f0" />
                <stop offset=".35" stopColor="#87baff" />
                <stop offset=".68" stopColor="#b79aee" />
                <stop offset="1" stopColor="#f0bedf" />
              </linearGradient>
            </defs>
            <circle className="final__loop" cx={C} cy={C} r="150" />
            <path className="final__check" d="M120 184 L160 224 L240 144" />
          </svg>
        </div>
      </div>

      <div className="container site-footer">
        <div className="site-footer__brand">
          <img className="site-footer__logo" src="/logo-footer.svg" alt="Webchirpy" width="220" height="57" />
          <p className="site-footer__tag">
            <strong>{footer.brand}</strong> {footer.tagline}
          </p>
        </div>
        <nav className="site-footer__col" aria-labelledby="ft-explore">
          <h3 id="ft-explore" className="t-mono">
            {footer.exploreTitle}
          </h3>
          <ul>
            {footer.explore.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="site-footer__col" aria-labelledby="ft-covers">
          <h3 id="ft-covers" className="t-mono">
            {footer.coversTitle}
          </h3>
          <ul>
            {serviceModules
              .slice()
              .sort((a, b) => footer.covers.indexOf(a.part) - footer.covers.indexOf(b.part))
              .map((m) => (
                <li key={m.id}>
                  <a href={`#engine-${m.id}`}>{m.part}</a>
                </li>
              ))}
          </ul>
        </nav>
        <div className="site-footer__col">
          <h3 className="t-mono">Contact</h3>
          <ul>
            <li>
              {footer.contact.phoneLabel}:{" "}
              {tel ? <a href={tel}>{siteConfig.phone}</a> : <span className="pending">to be confirmed</span>}
            </li>
            <li>
              {footer.contact.whatsappLabel}:{" "}
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              ) : (
                <span className="pending">to be confirmed</span>
              )}
            </li>
          </ul>
        </div>
        <div className="site-footer__legal">
          <p>{footer.legal}</p>
          <p className="site-footer__links">
            {siteConfig.privacyUrl ? <a href={siteConfig.privacyUrl}>{footer.privacy}</a> : <span className="pending" title="Policy URL pending">{footer.privacy}</span>}
            <span aria-hidden="true"> · </span>
            {siteConfig.termsUrl ? <a href={siteConfig.termsUrl}>{footer.terms}</a> : <span className="pending" title="Terms URL pending">{footer.terms}</span>}
          </p>
        </div>
      </div>
    </footer>
  )
}
