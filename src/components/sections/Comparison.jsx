import React, { useRef, useState } from "react"
import { comparison, uiCopy } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"
import { goTo } from "../../lib/scroll"
import { Marked } from "../ui/Highlight"

const AUTO_STEPS = ["leadCapture", "instantReply", "followUp", "backOffice", "insights"]

export default function Comparison() {
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  const [run, setRun] = useState(0) // bump to replay
  const rows = comparison.rows

  // Packet animation: manual packet crawls and stalls; automated packet glides
  // through each row to the selected one, then completes.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const manual = ref.current.querySelector(".room--manual .room__packet")
        const auto = ref.current.querySelector(".room--auto .room__packet")
        const target = ref.current.querySelector(`.room--auto .room__row[data-i="${active}"]`)
        const mTarget = ref.current.querySelector(`.room--manual .room__row[data-i="${active}"]`)
        if (!manual || !auto || !target || !mTarget) return
        const y = target.offsetTop + target.offsetHeight / 2 - 6
        const my = mTarget.offsetTop + mTarget.offsetHeight / 2 - 6
        const tl = gsap.timeline()
        tl.set([manual, auto], { y: 0, opacity: 1 })
          .to(manual, { y: my * 0.6, duration: 1.2, ease: "steps(5)" }, 0)
          .to(manual, { y: my, duration: 1.4, ease: "power1.inOut" }, 1.2)
          .to(manual, { opacity: 0.35, repeat: 3, yoyo: true, duration: 0.35 }, 2.6)
          .to(auto, { y, duration: 0.9, ease: "power3.inOut" }, 0.1)
          .to(auto, { scale: 1.6, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 1)
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [active, run], revertOnUpdate: true }
  )

  const select = (i) => {
    setActive(i)
    setRun((r) => r + 1)
  }

  const onKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault()
      const n = (active + 1) % rows.length
      select(n)
      ref.current.querySelector(`[data-sel="${n}"]`)?.focus()
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault()
      const n = (active - 1 + rows.length) % rows.length
      select(n)
      ref.current.querySelector(`[data-sel="${n}"]`)?.focus()
    }
  }

  return (
    <SectionShell id="compare" theme="light" labelledBy="compare-title" className="compare">
      <div ref={ref}>
        <header className="section-head section-head--center">
          <h2 id="compare-title" className="t-h2" data-reveal>
            <Marked text={comparison.headline} phrase="Which one are you?" tone="light" />
          </h2>
          <p className="t-lead" data-reveal>
            {comparison.sub}
          </p>
        </header>

        <div className="compare__controls" data-reveal>
          <div className="row-select" role="radiogroup" aria-label="Compare a moment" onKeyDown={onKey}>
            {rows.map((r, i) => (
              <button
                key={r.row}
                type="button"
                role="radio"
                aria-checked={active === i}
                tabIndex={active === i ? 0 : -1}
                data-sel={i}
                className={`row-select__btn ${active === i ? "is-active" : ""}`}
                onClick={() => select(i)}
              >
                {r.row}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRun((r) => r + 1)}>
            <span className="btn__label">↻ {uiCopy.compareAgain}</span>
          </button>
        </div>

        {/* Desktop/tablet: two rooms */}
        <div className="rooms" data-reveal>
          <article className="room room--manual" aria-labelledby="room1-title">
            <div className="room__chrome" aria-hidden="true">
              <i />
              <i />
              <i />
              <span className="t-mono">room_1 · manual</span>
            </div>
            <header className="room__head">
              <p className="t-mono">Room 1</p>
              <h3 id="room1-title" className="t-h3">
                {comparison.room1.title}
              </h3>
              <p className="room__tag">{comparison.room1.tagline}</p>
            </header>
            <div className="room__body">
              <span className="room__rail" aria-hidden="true" />
              <span className="room__packet" aria-hidden="true" />
              <ol className="room__rows">
              {rows.map((r, i) => (
                <li key={r.row} data-i={i} className={`room__row ${active === i ? "is-active" : ""}`}>
                  <span className="room__row-label t-mono">{r.row}</span>
                  <span className="room__row-text">
                    <span className="mark mark--x" aria-hidden="true">
                      ✗
                    </span>
                    <span className="sr-only">Manual: </span>
                    {r.manual}
                  </span>
                </li>
              ))}
              </ol>
            </div>
          </article>

          <article className="room room--auto" aria-labelledby="room2-title">
            <div className="room__chrome" aria-hidden="true">
              <i />
              <i />
              <i />
              <span className="t-mono">room_2 · automated</span>
            </div>
            <header className="room__head">
              <p className="t-mono">Room 2</p>
              <h3 id="room2-title" className="t-h3">
                {comparison.room2.title}
              </h3>
              <p className="room__tag">{comparison.room2.tagline}</p>
            </header>
            <div className="room__body">
              <span className="room__rail" aria-hidden="true" />
              <span className="room__packet" aria-hidden="true" />
              <ol className="room__rows">
              {rows.map((r, i) => (
                <li key={r.row} data-i={i} className={`room__row px-host ${active === i ? "is-active" : ""}`}>
                  <span className="room__row-label t-mono">{r.row}</span>
                  <span className="room__row-text">
                    <span className="mark mark--ok" aria-hidden="true">
                      ✓
                    </span>
                    <span className="sr-only">Automated: </span>
                    {r.automated}
                  </span>
                  <span className="room__row-icon" aria-hidden="true">
                    <PixelIcon name={AUTO_STEPS[i]} size={18} />
                  </span>
                </li>
              ))}
              </ol>
            </div>
          </article>
        </div>

        {/* Phones: alternating per-row comparison, no tiny two-column text */}
        <ol className="compare-stack">
          {rows.map((r) => (
            <li key={r.row} className="compare-stack__item">
              <p className="t-mono compare-stack__label">{r.row}</p>
              <p className="compare-stack__manual">
                <span className="mark mark--x" aria-hidden="true">
                  ✗
                </span>
                <span className="sr-only">{comparison.room1.title}: </span>
                {r.manual}
              </p>
              <p className="compare-stack__auto">
                <span className="mark mark--ok" aria-hidden="true">
                  ✓
                </span>
                <span className="sr-only">{comparison.room2.title}: </span>
                {r.automated}
              </p>
            </li>
          ))}
        </ol>

        <div className="compare__close" data-reveal>
          <p className="t-h3">{comparison.closingQuestion}</p>
          <a
            className="text-link text-link--lg"
            href="#scorecard"
            onClick={(e) => {
              e.preventDefault()
              goTo("#scorecard")
            }}
          >
            {comparison.link}
          </a>
        </div>
      </div>
    </SectionShell>
  )
}
