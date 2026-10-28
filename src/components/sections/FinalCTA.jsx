import React, { useMemo, useRef, useState } from "react"
import { finalCta, footer } from "../../data/automationContent"
import { serviceModules } from "../../data/serviceModules"
import { siteConfig, phoneHref, whatsappHref } from "../../config/site"
import { Eyebrow, CTAButton } from "../ui/primitives"
import { Wordmark } from "../layout/Header"
import { useSite } from "../../context/SiteContext"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

const CELL = 10
const C = 180 // centre of 360 viewBox

/** Target composition: a closed pixel ring with a check — the hero's route, resolved. */
function buildMark() {
  const cells = new Map()
  const add = (x, y) => cells.set(`${x},${y}`, { x, y })
  for (let a = 0; a < 360; a += 4) {
    const r = (a * Math.PI) / 180
    add(Math.round((C + 120 * Math.cos(r)) / CELL), Math.round((C + 120 * Math.sin(r)) / CELL))
  }
  const check = [
    [12, 18], [13, 19], [14, 20], [15, 21], [16, 22], [17, 21], [18, 20], [19, 19], [20, 18], [21, 17], [22, 16], [23, 15], [24, 14],
  ]
  check.forEach(([x, y]) => {
    add(x, y)
    add(x, y + 1)
  })
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return Array.from(cells.values()).map((c) => {
    const ang = Math.atan2(c.y * CELL - C, c.x * CELL - C)
    const cluster = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 8) % 8
    return { ...c, cluster, dx: (rnd() - 0.5) * 520, dy: (rnd() - 0.5) * 420 }
  })
}

export default function FinalCTA() {
  const ref = useRef(null)
  const [resolved, setResolved] = useState(true) // final state by default (SSR / reduced motion)
  const { openModal } = useSite()
  const pixels = useMemo(buildMark, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        setResolved(false)
        const px = gsap.utils.toArray(".final__px", ref.current)
        gsap.set(px, { x: (i) => pixels[i].dx, y: (i) => pixels[i].dy, opacity: 0.35 })
        gsap.set(".final__loop", { drawSVG: "0%" })
        const tl = gsap.timeline({ paused: true, onComplete: () => setResolved(true) })
        tl.to(px, {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: "power3.inOut",
          stagger: (i) => pixels[i].cluster * 0.09 + (i % 7) * 0.012,
        }).to(".final__loop", { drawSVG: "100%", duration: 1.2, ease: "power2.inOut" }, "-=0.3")
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
      <div className="container final__hero">
        <div className="final__copy">
          <Eyebrow>{finalCta.label}</Eyebrow>
          <h2 id="final-title" className="t-h2">
            {finalCta.headline}
          </h2>
          <p className="t-lead">{finalCta.sub}</p>
          <CTAButton size="lg" className="final__cta" onClick={() => openModal("lead")}>
            {finalCta.button}
          </CTAButton>
        </div>
        <div className="final__art" aria-hidden="true">
          <svg viewBox="0 0 360 360">
            <circle className="final__loop" cx={C} cy={C} r="150" />
            {pixels.map((p, i) => (
              <rect key={i} className={`final__px final__px--c${p.cluster}`} x={p.x * CELL - 3.5} y={p.y * CELL - 3.5} width="7" height="7" />
            ))}
          </svg>
        </div>
      </div>

      <div className="container site-footer">
        <div className="site-footer__brand">
          <Wordmark />
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
