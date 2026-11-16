import React, { useRef } from "react"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK, dur, ease } from "../../lib/motionTokens"
import { ambient } from "../../config/ambient"
import SectionAmbient from "../visuals/SectionAmbient"
import SpaceAtmosphere from "../atmosphere/SpaceAtmosphere"
import { SECTION_PRESET } from "../atmosphere/starfieldPresets"

/**
 * SectionShell — every landing section. Handles theme band, anchor, heading
 * association, a once-only staggered reveal of `[data-reveal]` children and a
 * cascading reveal of the items inside `[data-stagger]` lists.
 * theme="night" renders a full-bleed dark panel with rounded corners on the light canvas,
 * Ambient green blooms come from config/ambient.js by section id (see SectionAmbient).
 * Content is fully visible without JS; it is only hidden once GSAP takes over.
 */
export function SectionShell({ id, theme = "light", className = "", labelledBy, children, as: Tag = "section", wide = false }) {
  const ref = useRef(null)
  const inset = theme === "night"
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Calm panel entrance: opacity plus a short rise. No scale, so the full-bleed
        // panel never shows side gutters mid-animation.
        if (inset) {
          gsap.from(ref.current.querySelector(".section__panel"), {
            y: 16,
            autoAlpha: 0,
            duration: 0.5,
            ease: ease.out,
            scrollTrigger: { trigger: ref.current, start: "top 98%", once: true },
          })
        }
        // [data-stagger] lists: items cascade in once, and their marks (checks, icons,
        // numbers) pop as each item lands — a small "task done" beat.
        gsap.utils.toArray("[data-stagger]", ref.current).forEach((list) => {
          const items = [...list.children]
          const marks = list.querySelectorAll(":scope > * :is(.px-icon, .mark, .fit__dash, .promises__n)")
          gsap.set(items, { autoAlpha: 0, y: 10 })
          ScrollTrigger.create({
            trigger: list,
            start: "top 95%",
            once: true,
            onEnter: () => {
              gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.35, ease: ease.out, stagger: 0.04 })
              if (marks.length)
                gsap.from(marks, { scale: 0, transformOrigin: "50% 50%", duration: 0.3, ease: "back.out(2.2)", stagger: 0.04, delay: 0.08 })
            },
          })
        })
        const els = gsap.utils.toArray("[data-reveal]", ref.current)
        if (!els.length) return
        gsap.set(els, { autoAlpha: 0, y: 14 })
        ScrollTrigger.batch(els, {
          start: "top 97%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: dur.reveal, ease: ease.out, stagger: 0.04, overwrite: true }),
        })
      })
      return () => mm.revert()
    },
    { scope: ref }
  )
  const glowEl = (
    <SectionAmbient blooms={ambient[id]} tone={inset ? "dark" : "light"} />
  )
  const content = <div className={`container ${wide ? "container--wide" : ""}`}>{children}</div>
  return (
    <Tag
      ref={ref}
      id={id}
      className={`section section--${theme} ${inset ? "section--inset" : ""} ${className}`}
      aria-labelledby={labelledBy}
      data-theme={theme}
    >
      {inset ? (
        <div className="section__panel">
          {glowEl}
          <SpaceAtmosphere preset={SECTION_PRESET[id] || "narrative"} seed={id} />
          {content}
        </div>
      ) : (
        <>
          {glowEl}
          {content}
        </>
      )}
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
  const inner = <span className="btn__label">{children}</span>
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

/** Brand wordmark — lives in the footer now that the page has no top navigation. */
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
