import React, { useEffect, useRef } from "react"
import { hero, uiCopy, trusted } from "../../data/automationContent"
import { tools, toolRoutes, moduleByName } from "../../data/serviceModules"
import { siteConfig } from "../../config/site"
import PixelField from "../visuals/PixelField"
import SectionAmbient from "../visuals/SectionAmbient"
import { ambient } from "../../config/ambient"
import PixelIcon from "../visuals/PixelIcon"
import AppTile from "../visuals/AppTile"
import CountUp from "../visuals/CountUp"
import { CTAButton, Eyebrow } from "../ui/primitives"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { goTo } from "../../lib/scroll"
import { useSite } from "../../context/SiteContext"
import { useCoarsePointer } from "../../hooks/useMediaQuery"
import { Marked } from "../ui/Highlight"

/**
 * Floating tile field around the centred copy (storyboard frames 02–06).
 * x/y: % of the first-fold box (desktop). pri 3 tiles hide ≤1024px.
 * mx/my: phone position — only tiles with one are shown ≤768px, all in the band
 * above the eyebrow so nothing ever sits near the copy or CTA.
 * from: entrance offset in px. faded: depth tile (smaller, lower opacity).
 */
const TILES = [
  { id: "whatsapp", x: 15, y: 17, s: 60, from: [-70, -40], pri: 1, mx: 10, my: 7 },
  { id: "gmail", x: 84, y: 15, s: 56, from: [70, -50], pri: 1, mx: 90, my: 7 },
  { id: "hubspot", x: 8, y: 45, s: 56, from: [-80, 0], pri: 2 },
  { id: "calendar", x: 91, y: 43, s: 56, from: [80, 10], pri: 1, mx: 70, my: 10 },
  { id: "report", x: 13, y: 76, s: 54, from: [-60, 60], pri: 2 },
  { id: "chat", x: 50, y: 89, s: 56, from: [0, 70], pri: 1, mx: 50, my: 6 },
  { id: "leadcap", x: 86, y: 77, s: 56, from: [70, 60], pri: 1 },
  { id: "sheets", x: 29, y: 7, s: 46, from: [-30, -60], pri: 3, faded: true, mx: 30, my: 10 },
  { id: "phone", x: 4, y: 24, s: 44, from: [-60, -20], pri: 3, faded: true },
  { id: "instagram", x: 70, y: 6, s: 44, from: [30, -60], pri: 3, faded: true },
  { id: "invoice", x: 96, y: 62, s: 44, from: [60, 30], pri: 3, faded: true },
  { id: "followup", x: 27, y: 89, s: 46, from: [-30, 70], pri: 2, faded: true },
  { id: "meta", x: 72, y: 89, s: 44, from: [30, 70], pri: 3, faded: true },
]

const LEAK_ICONS = ["form", "chat", "clock", "chart"]

export default function Hero() {
  const root = useRef(null)
  const foldRef = useRef(null)
  const { openModal } = useSite()
  const coarse = useCoarsePointer()

  // Collision guard: any tile whose box would touch the copy column, CTA or the
  // footnote row is hidden — at every viewport, before and after font load.
  useEffect(() => {
    const fold = foldRef.current
    if (!fold) return undefined
    const check = () => {
      const fr = fold.getBoundingClientRect()
      const keep = [...fold.querySelectorAll(".hero__center > *, .hero__meta > *")].map((el) => el.getBoundingClientRect())
      fold.querySelectorAll(".htile").forEach((t) => {
        const s = t.offsetWidth
        const left = fr.left + t.offsetLeft
        const top = fr.top + t.offsetTop
        const r = { left: left - 12, top: top - 12, right: left + s + 12, bottom: top + s + 12 }
        const outside = r.left < fr.left || r.right > fr.right || r.top < fr.top || r.bottom > fr.bottom
        const hit = keep.some((k) => r.left < k.right && r.right > k.left && r.top < k.bottom && r.bottom > k.top)
        t.classList.toggle("is-blocked", outside || hit)
      })
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(fold)
    document.fonts?.ready.then(check)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // 01 Initial load + 02 icons enter
      mm.add(MOTION_OK, () => {
        gsap.from(".hero__center > *", { y: 18, autoAlpha: 0, duration: 0.7, ease: "power2.out", stagger: 0.09 })
        const tiles = gsap.utils.shuffle(gsap.utils.toArray(".htile", root.current))
        tiles.forEach((t, i) => {
          const [fx, fy] = (t.dataset.from || "0,0").split(",").map(Number)
          gsap.fromTo(
            t,
            { x: fx, y: fy, autoAlpha: 0, scale: 0.86 },
            { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: "power3.out", delay: 0.3 + i * 0.1 }
          )
        })
      })

      // 03 Soft float loop — independent paths, phases and durations
      mm.add({ motion: MOTION_OK, small: "(max-width: 1024px)" }, (ctx) => {
        if (!ctx.conditions.motion) return undefined
        const amp = ctx.conditions.small ? 0.55 : 1
        const r = gsap.utils.random
        const loops = gsap.utils.toArray(".htile__float", root.current).map((el) =>
          gsap.to(el, {
            x: r(-8, 8) * amp,
            y: r(-10, -4) * amp,
            rotation: r(-1.6, 1.6),
            duration: r(3.4, 6.2),
            delay: r(0, 2),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
        )
        const io = new IntersectionObserver(([e]) => loops.forEach((l) => (e.isIntersecting ? l.resume() : l.pause())))
        io.observe(foldRef.current)
        return () => io.disconnect()
      })

      // Gentle magnet toward a fine pointer
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const movers = gsap.utils.toArray(".htile__mag", root.current).map((el) => ({
          el,
          x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
        }))
        const fold = foldRef.current
        const onMove = (e) => {
          movers.forEach((m) => {
            const b = m.el.getBoundingClientRect()
            const dx = e.clientX - (b.left + b.width / 2)
            const dy = e.clientY - (b.top + b.height / 2)
            const d = Math.hypot(dx, dy)
            const k = d < 160 ? (1 - d / 160) * 0.22 : 0
            m.x(dx * k)
            m.y(dy * k)
          })
        }
        const onLeave = () =>
          movers.forEach((m) => {
            m.x(0)
            m.y(0)
          })
        fold.addEventListener("pointermove", onMove)
        fold.addEventListener("pointerleave", onLeave)
        return () => {
          fold.removeEventListener("pointermove", onMove)
          fold.removeEventListener("pointerleave", onLeave)
        }
      })

      return () => mm.revert()
    },
    { scope: root }
  )

  const openPart = (id) => {
    const part = toolRoutes[id]?.[0]
    const m = part && moduleByName[part]
    if (m) window.location.hash = `engine-${m.id}`
  }

  return (
    <section ref={root} id="top" className="hero" aria-labelledby="hero-title">
      {/* First fold: centred copy, floating tiles, reactive pixel grid */}
      <div ref={foldRef} className="hero__fold">
        <PixelField intensity={0.7} />
        <SectionAmbient blooms={ambient.top} fadeTop="0%" fadeBottom="20%" className="ambient--hero" />

        <div className="hero__tiles" role="group" aria-label={uiCopy.toolsDisclaimer}>
          {TILES.map((t) => {
            const tool = tools[t.id]
            const routes = toolRoutes[t.id] || []
            const tipId = `tip-${t.id}`
            return (
              <div
                key={t.id}
                className={[
                  "htile",
                  `htile--p${t.pri}`,
                  t.faded && "htile--faded",
                  t.mx != null && "htile--m",
                  // Tooltips open inward so they are never clipped at the fold edges
                  t.y < 30 && "htile--tip-below",
                  t.x < 20 && "htile--tip-l",
                  t.x > 80 && "htile--tip-r",
                  (t.my ?? t.y) < 50 ? "htile--mtip-below" : "htile--mtip-above",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-from={t.from.join(",")}
                style={{
                  "--x": `${t.x}%`,
                  "--y": `${t.y}%`,
                  "--mx": `${t.mx ?? t.x}%`,
                  "--my": `${t.my ?? t.y}%`,
                  "--s": `${t.s}px`,
                }}
              >
                <div className="htile__mag">
                  <div className="htile__float">
                    <button type="button" className="htile__btn" aria-describedby={tipId} onClick={() => openPart(t.id)}>
                      <AppTile id={t.id} size={t.s} />
                      <span id={tipId} role="tooltip" className="htile__tip">
                        <strong>{tool.name}</strong>
                        {routes.length > 0 && <span>Example · feeds {routes.join(" · ")}</span>}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hero__center">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 id="hero-title" className="hero__title">
            {hero.headline}
          </h1>
          <p className="hero__punch"><Marked text={hero.punchLine} phrase="Find the leaks." tone="light" /></p>
          <p className="hero__body">{hero.body}</p>
          <div className="hero__cta">
            <CTAButton id="hero-cta" href="#scorecard" size="lg" onClick={() => goTo("#scorecard", { focusSelector: ".score-area__toggle, input" })}>
              {hero.button}
            </CTAButton>
            <p className="hero__micro">{hero.underButton}</p>
          </div>
        </div>

        <div className="hero__meta">
          <p className="hero__hint t-mono" aria-hidden="true">
            <span className="hint-cursor" />
            {coarse ? uiCopy.heroHintTouch : uiCopy.heroHintPointer}
          </p>
          <p className="hero__disclaimer">{uiCopy.toolsDisclaimer}</p>
        </div>
      </div>

      {/* Remaining hero content: leaks → video + results, then the trust band */}
      <div className="container hero__below">
        <aside className="hero__leaks" aria-labelledby="leaks-title">
          <p id="leaks-title" className="t-mono hero__leaks-title">
            <span className="leak-dot" aria-hidden="true" />
            {hero.listTitle}
          </p>
          <ul>
            {hero.leaks.map((l, i) => (
              <li key={l} className="px-host" style={{ "--i": i }}>
                <span className="hero__leak-icon">
                  <PixelIcon name={LEAK_ICONS[i]} size={20} />
                </span>
                <span>{l}</span>
                <span className="hero__leak-drip" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </aside>

        <div className="hero__proof-grid">
          <button type="button" className="video-card" onClick={() => openModal("video:founder")}>
            <span className="video-card__screen" aria-hidden="true">
              <span className="video-card__mono">VS</span>
              <span className="video-card__play">
                <PixelIcon name="play" size={22} />
              </span>
              {!siteConfig.founderVideoUrl && <span className="video-card__pending t-mono">{uiCopy.assetPending}</span>}
            </span>
            <span className="video-card__caption">{hero.videoCaption}</span>
          </button>

          <div className="results" aria-labelledby="results-title">
            <h2 id="results-title" className="results__title t-h3">
              {hero.resultsHeading}
            </h2>
            <ul className="results__list">
              {hero.results.map((r) => {
                const n = parseInt(r.value, 10)
                const suffix = r.value.replace(/^\d+/, "")
                return (
                  <li key={r.value}>
                    <CountUp value={n} suffix={suffix} className="results__value" />
                    <span className="results__label">{r.label}</span>
                  </li>
                )
              })}
            </ul>
            {siteConfig.showHeroSourceLine ? (
              <p className="results__source">{hero.sourceLine}</p>
            ) : (
              <p className="results__source t-mono">{uiCopy.statsNote}</p>
            )}
          </div>
        </div>
      </div>

      {/* Businesses that trust Webchirpy — its own light band, the bridge into the first dark chapter */}
      {/* <div className="logo-strip">
        <SectionAmbient blooms={ambient.trust} fadeTop="10%" fadeBottom="34%" />
        <h2 id="logo-strip-title" className="logo-strip__title">
          <Marked text={hero.logoStripHeading} phrase="trust Webchirpy" tone="light" />
        </h2>
       
        <div className="logo-strip__viewport" tabIndex={0} role="region" aria-labelledby="logo-strip-title">
          <div className="logo-strip__track">
            {[false, true].map((dup) => (
              <ul key={String(dup)} className="logo-strip__list" aria-hidden={dup || undefined}>
                {trusted.clients.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <p className="logo-strip__note">{uiCopy.logosPending}</p>
      </div> */}
    </section>
  )
}
