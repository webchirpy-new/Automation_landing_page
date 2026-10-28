import React, { useRef, useState } from "react"
import { proof, uiCopy } from "../../data/automationContent"
import { SectionShell, Eyebrow } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"

// UI microcopy: the 3-step process each book reveals, restating the source "What changes".
const SCENES = [
  { from: "clock", to: "instantReply", steps: ["Message arrives on WhatsApp or the website", "The AI assistant answers the moment it arrives", "Every customer answered, day or night"] },
  { from: "backOffice", to: "invoice", steps: ["A form or sheet is updated", "Data moves into invoices and apps", "No copy-paste"] },
  { from: "headset", to: "operations", steps: ["A booking request comes in", "Scheduled, with reminders sent", "Customer updated automatically"] },
]

function Book({ c, i }) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const innerRef = useRef(null)
  const s = SCENES[i]
  const toggle = () => {
    const next = !open
    setOpen(next)
    window.requestAnimationFrame(() => (next ? innerRef.current : toggleRef.current)?.focus({ preventScroll: true }))
  }
  return (
    <article className={`book book--${i + 1} ${open ? "is-open" : ""}`} data-reveal aria-labelledby={`book-${i}-t`}>
      <div className="book__inner" ref={innerRef} tabIndex={-1} aria-hidden={!open} id={`book-${i}-inner`}>
        <div className="book__page book__page--left">
          <p className="t-mono book__k">The doubt</p>
          <p className="book__doubt">{c.doubt}</p>
          <span className="book__scene px-host is-active" aria-hidden="true">
            <PixelIcon name={s.from} size={28} />
            <span className="book__path" />
            <PixelIcon name={s.to} size={28} />
          </span>
        </div>
        <div className="book__page book__page--right">
          <p className="t-mono book__k">What changes</p>
          <p className="book__change">{c.change}</p>
          <ol className="book__steps">
            {s.steps.map((st, k) => (
              <li key={st} style={{ "--k": k }}>
                <span className="t-mono">{k + 1}</span>
                {st}
              </li>
            ))}
          </ol>
          <button type="button" className="text-link book__close" onClick={toggle} tabIndex={open ? 0 : -1}>
            ← Close
          </button>
        </div>
      </div>

      <div className="book__cover" aria-hidden={open}>
        <div className="book__spine" aria-hidden="true" />
        <p className="t-mono book__n">
          {c.n} · {uiCopy.scenario}
        </p>
        <h3 id={`book-${i}-t`} className="book__outcome">
          {c.outcome}
        </h3>
        <p className="book__outcome-label">{c.outcomeLabel}</p>
        <p className="book__cover-doubt">{c.doubt}</p>
        <button
          ref={toggleRef}
          type="button"
          className="btn btn--dark btn--sm book__btn"
          aria-expanded={open}
          aria-controls={`book-${i}-inner`}
          onClick={toggle}
          tabIndex={open ? -1 : 0}
        >
          <span className="btn__label">{proof.cardButton}</span>
        </button>
      </div>
    </article>
  )
}

export default function Proof() {
  return (
    <SectionShell id="proof" theme="light" labelledBy="proof-title" className="proof">
      <header className="section-head section-head--split">
        <div>
          <Eyebrow>{proof.label}</Eyebrow>
          <h2 id="proof-title" className="t-h2" data-reveal>
            {proof.headline}
          </h2>
        </div>
        <p className="t-lead" data-reveal>
          {proof.sub}
        </p>
      </header>
      <div className="books">
        {proof.cards.map((c, i) => (
          <Book key={c.n} c={c} i={i} />
        ))}
      </div>
      <p className="proof__line t-mono" data-reveal>
        <PixelIcon name="check" size={12} /> {proof.lineUnder}
      </p>
    </SectionShell>
  )
}
