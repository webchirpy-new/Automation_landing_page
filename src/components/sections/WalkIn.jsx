import React from "react"
import { walk } from "../../data/automationContent"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import LeadForm from "../interactions/LeadForm"

export default function WalkIn() {
  return (
    <SectionShell id="decide" theme="light" labelledBy="walk-title" className="walk">
      <header className="section-head section-head--center">
        <h2 id="walk-title" className="t-h2" data-reveal>
          {walk.headline}
        </h2>
        <p className="t-lead" data-reveal>
          {walk.sub}
        </p>
      </header>

      <div className="choices">
        <article className="choice choice--away" data-reveal aria-labelledby="away-title">
          <svg className="choice__path" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="6" x2="120" y2="6" />
            <line x1="150" y1="6" x2="300" y2="6" className="is-broken" />
          </svg>
          <h3 id="away-title" className="choice__title">
            {walk.away.title}
          </h3>
          <p className="choice__tag">{walk.away.tagline}</p>
          <ul className="choice__list">
            {walk.away.items.map((it) => (
              <li key={it}>
                <span className="mark mark--x" aria-hidden="true">
                  ✗
                </span>
                {it}
              </li>
            ))}
          </ul>
          <p className="choice__line">{walk.away.line}</p>
        </article>

        <article className="choice choice--in" data-reveal aria-labelledby="in-title">
          <svg className="choice__path" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="6" x2="300" y2="6" />
          </svg>
          <span className="choice__pixels" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <h3 id="in-title" className="choice__title">
            {walk.in.title}
          </h3>
          <p className="choice__tag">{walk.in.tagline}</p>
          <p className="choice__line choice__line--top">{walk.in.line}</p>
          <ul className="choice__list choice__list--in">
            {walk.in.items.map((it) => (
              <li key={it.title}>
                <PixelIcon name="check" size={14} animate={false} />
                <span>
                  <strong>{it.title}</strong> · {it.body}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="booking">
        <div className="booking__side">
          <h3 className="t-mono booking__steps-title">{walk.stepsTitle}</h3>
          <ol className="steps">
            {walk.steps.map((s, i) => (
              <li key={s.title} data-reveal>
                <span className="steps__n">{i + 1}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p className="t-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="ps" data-reveal>
            <p>{walk.ps}</p>
            <p>{walk.pps}</p>
          </div>
        </div>

        <div id="book" className="booking__form" aria-labelledby="book-title">
          <p className="booking__tag t-mono">{walk.form.tag}</p>
          <h3 id="book-title" className="t-h3">
            {walk.form.heading}
          </h3>
          <p className="t-muted booking__sub">{walk.form.sub}</p>
          <LeadForm idPrefix="book" />
        </div>
      </div>
    </SectionShell>
  )
}
