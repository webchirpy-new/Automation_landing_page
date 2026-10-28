import React, { useRef } from "react"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK, dur, ease } from "../../lib/motionTokens"

/**
 * SectionShell — every landing section. Handles theme band, anchor, heading
 * association and a once-only staggered reveal of `[data-reveal]` children.
 * Content is fully visible without JS; it is only hidden once GSAP takes over.
 */
export function SectionShell({ id, theme = "light", className = "", labelledBy, children, as: Tag = "section", wide = false }) {
  const ref = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const els = gsap.utils.toArray("[data-reveal]", ref.current)
        if (!els.length) return
        gsap.set(els, { autoAlpha: 0, y: 24 })
        ScrollTrigger.batch(els, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: dur.reveal, ease: ease.out, stagger: 0.08, overwrite: true }),
        })
      })
      return () => mm.revert()
    },
    { scope: ref }
  )
  return (
    <Tag ref={ref} id={id} className={`section section--${theme} ${className}`} aria-labelledby={labelledBy} data-theme={theme}>
      <div className={`container ${wide ? "container--wide" : ""}`}>{children}</div>
    </Tag>
  )
}

export function Eyebrow({ children, className = "", dot = true }) {
  return (
    <p className={`eyebrow t-mono ${className}`}>
      {dot && <span className="eyebrow__dot" aria-hidden="true" />}
      {children}
    </p>
  )
}

export function DisplayHeading({ id, level = 2, children, className = "", size }) {
  const Tag = `h${level}`
  const cls = size || (level === 1 ? "t-display" : level === 2 ? "t-h2" : "t-h3")
  return (
    <Tag id={id} className={`${cls} ${className}`}>
      {children}
    </Tag>
  )
}

/** Primary/secondary CTA. Renders <a> when `href` is given, else <button>. */
export function CTAButton({ href, onClick, variant = "primary", size = "md", children, className = "", ...rest }) {
  const cls = `btn btn--${variant} btn--${size} ${className}`
  const inner = (
    <>
      <span className="btn__pixels" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="btn__label">{children}</span>
    </>
  )
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={
          onClick
            ? (e) => {
                e.preventDefault()
                onClick(e)
              }
            : undefined
        }
        {...rest}
      >
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick} {...rest}>
      {inner}
    </button>
  )
}

export function GlassCard({ children, className = "", dark = false, as: Tag = "div", ...rest }) {
  return (
    <Tag className={`glass ${dark ? "glass--dark" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

/**
 * FlowSignal — the violet thread between selected sections. A short vertical
 * route that draws as you scroll past. Variants carry the story:
 *   broken → repaired → ring → dash → loop
 */
export function FlowSignal({ variant = "repaired", label }) {
  const ref = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const paths = ref.current.querySelectorAll(".thread__draw")
        gsap.fromTo(
          paths,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 45%", scrub: 0.6 },
          }
        )
        const pkt = ref.current.querySelector(".thread__packet")
        if (pkt) {
          gsap.fromTo(
            pkt,
            { y: 0, opacity: 0 },
            {
              y: variant === "broken" ? 52 : 112,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: ref.current, start: "top 85%", end: "bottom 45%", scrub: 0.6 },
            }
          )
        }
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={`thread thread--${variant}`} aria-hidden="true">
      <svg width="40" height="140" viewBox="0 0 40 140" fill="none">
        {variant === "broken" ? (
          <>
            <path className="thread__draw" d="M20 0 V58" stroke="var(--violet)" strokeWidth="1.5" />
            <path d="M20 70 V140" stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="3 5" opacity=".7" />
            <rect x="14" y="60" width="12" height="2" fill="var(--danger)" opacity=".7" />
          </>
        ) : variant === "dash" ? (
          <path className="thread__draw" d="M20 0 V140" stroke="var(--lavender)" strokeWidth="1.5" strokeDasharray="6 6" />
        ) : (
          <path className="thread__draw" d="M20 0 C20 40 34 50 34 70 C34 90 20 100 20 140" stroke="var(--violet)" strokeWidth="1.5" />
        )}
      </svg>
      <span className="thread__packet" />
      {label && <span className="thread__label t-mono">{label}</span>}
    </div>
  )
}

export function ScrollProgress() {
  const ref = useRef(null)
  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } }
    )
  })
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
