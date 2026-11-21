import React, { useRef } from "react"
import { why } from "../../data/automationContent"
import { siteConfig } from "../../config/site"
import { SectionShell, CTAButton } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import CountUp from "../visuals/CountUp"
import { useSite } from "../../context/SiteContext"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { Marked } from "../ui/Highlight"

const STORY_ICONS = ["cross", "backOffice", "check"] // problem → build → tested
const PULSE = { scale: 1.08, rise: 0.26, hold: 0.1, fall: 0.5 } // seconds

export default function WhyWebchirpy() {
  const ref = useRef(null)
  const { openModal } = useSite()

  useGSAP(
    () => {
      const story = ref.current.querySelector(".story")
      const track = story.querySelector(".story__line")
      const fill = story.querySelector(".story__line-fill")
      const icons = gsap.utils.toArray(".story__icon", story)
      const glows = gsap.utils.toArray(".story__glow", story)

      // How far along the track each node sits, from 0 to 1. Filled in by measureTrack.
      let arrivals = []
      let storyTrigger = null

      // The track runs from the bottom of the first icon to the top of the last, whatever the text around them does.
      // offsetTop ignores transforms, so entrance reveals and the pulse can't affect the measurement.
      const measureTrack = () => {
        const tops = icons.map((icon) => icon.parentElement.offsetTop + icon.offsetTop)
        const start = tops[0] + icons[0].offsetHeight
        const length = tops[tops.length - 1] - start
        track.style.top = `${start}px`
        track.style.height = `${length}px`
        arrivals = tops.map((top, i) => (i === 0 ? 0 : (top - start) / length))
        storyTrigger?.refresh()
      }
      measureTrack()
      const resize = new ResizeObserver(measureTrack)
      resize.observe(story)

      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const reached = icons.map(() => false)

        const arrive = (i) => {
          icons[i].classList.add("is-active")
          // force3D off keeps the icon's edges sharp at every scale.
          gsap.timeline({ defaults: { overwrite: "auto" } })
            .to(icons[i], { scale: PULSE.scale, duration: PULSE.rise, ease: "power2.out", force3D: false }, 0)
            .to(glows[i], { opacity: 1, duration: PULSE.rise, ease: "power2.out" }, 0)
            .to(icons[i], { scale: 1, duration: PULSE.fall, ease: "power2.inOut", force3D: false }, PULSE.rise + PULSE.hold)
            .to(glows[i], { opacity: 0, duration: PULSE.fall, ease: "power2.inOut" }, PULSE.rise + PULSE.hold)
        }
        const leave = (i) => {
          icons[i].classList.remove("is-active")
          gsap.to(icons[i], { scale: 1, duration: 0.3, ease: "power2.out", force3D: false, overwrite: "auto" })
          gsap.to(glows[i], { opacity: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" })
        }

        // One scrubbed timeline. Nodes respond to how far the drawn line has actually got, not to the scrollbar,
        // so a node never lights ahead of the line, including while the scrub is catching up.
        const line = gsap.timeline({
          scrollTrigger: { trigger: icons[0], start: "center 68%", endTrigger: icons[icons.length - 1], end: "center 56%", scrub: 0.5 },
          onUpdate() {
            const p = this.progress()
            arrivals.forEach((at, i) => {
              if (!reached[i] && p > at - 0.001 && p > 0) {
                reached[i] = true
                arrive(i)
              } else if (reached[i] && (i === 0 ? p <= 0 : p < at - 0.006)) {
                reached[i] = false
                leave(i)
              }
            })
          },
        })
        line.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", duration: 1 })
        storyTrigger = line.scrollTrigger

        gsap.fromTo(
          ".founder__frame",
          { clipPath: "inset(12% 12% 12% 12% round 32px)" },
          { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".founder", start: "top 75%", once: true } }
        )

        return () => {
          storyTrigger = null
          gsap.killTweensOf([...icons, ...glows])
          gsap.set([...icons, ...glows], { clearProps: "transform,opacity" })
          icons.forEach((icon) => icon.classList.remove("is-active"))
        }
      })
      return () => {
        resize.disconnect()
        mm.revert()
      }
    },
    { scope: ref }
  )

  return (
    <SectionShell id="why" theme="light" labelledBy="why-title" className="why">
      <div ref={ref}>
        <header className="section-head section-head--center">
          <h2 id="why-title" className="t-h2 why__title" data-reveal>
            <Marked text={why.headline} phrase="Webchirpy." tone="light" />
          </h2>
          <p className="t-lead" data-reveal>
            {why.sub}
          </p>
        </header>

        <ul className="proof-points" data-stagger>
          {why.proofPoints.map((p) => (
            <li key={p.value}>
              <span className="proof-points__value">
                {/^\d+\+?$/.test(p.value) ? <CountUp value={parseInt(p.value, 10)} suffix={p.value.endsWith("+") ? "+" : ""} /> : p.value}
              </span>
              <span className="proof-points__label">{p.label}</span>
            </li>
          ))}
        </ul>

        <div className="why__split">
          <div className="why__left">
          <div className="story">
            <h3 className="t-mono story__title">{why.storyTitle}</h3>
            <span className="story__line" aria-hidden="true">
              <span className="story__line-fill" />
            </span>
            <ol>
              {why.story.map((s, i) => (
                <li key={s.title} className="story__stop px-host" data-reveal>
                  <span className="story__icon">
                    <span className="story__glow" aria-hidden="true" />
                    <PixelIcon name={STORY_ICONS[i]} size={22} />
                  </span>
                  <div>
                    <h4 className="story__stop-title">{s.title}</h4>
                    <p className="t-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Founder note + the booking CTA, in the left column beside the portrait */}
          <div className="why__founder-copy" data-reveal>
            <h3 className="t-h3">
              You'll work directly with <Marked text="Vasanth Sampathkumar." phrase="Vasanth Sampathkumar." tone="light" />
            </h3>
            <p className="why__founder-intro">{why.founderIntro}</p>
            <CTAButton size="lg" onClick={() => openModal("lead")}>
              {why.button}
            </CTAButton>
          </div>
          </div>

          <div className="founder">
            <div className="founder__frame">
              <div className="founder__portrait">
                <img className="founder__photo" src={`${import.meta.env.BASE_URL}founder-photo.jpg`} alt={why.founderCard.name} width="1536" height="1024" loading="lazy" decoding="async" />
              </div>
              {siteConfig.founderVideoUrl && (
                <button type="button" className="founder__play" onClick={() => openModal("video:founder")}>
                  <PixelIcon name="play" size={16} />
                  {why.founderVideoButton}
                </button>
              )}
            </div>
            <div className="founder__card glass">
              <p className="founder__name">{why.founderCard.name}</p>
              <ul className="founder__roles t-mono">
                {why.founderCard.roles.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </SectionShell>
  )
}
