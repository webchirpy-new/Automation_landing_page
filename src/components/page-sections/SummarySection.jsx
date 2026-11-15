import React from "react"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import SectionButton from "./SectionButton"

/** vsl-07 #summary: what arrives every morning, with an illustrative sample (Kit 04 §04). */
export default function SummarySection({ section: s }) {
  const titleId = `${s.id}-title`
  return (
    <SectionShell id={s.id} theme="light" labelledBy={titleId} className="psec psec--summary">
      <div className="psec-split">
        <div data-reveal>
          <h2 id={titleId} className="t-h2">
            {s.title}
          </h2>
          <ul className="psec-list" data-stagger>
            {s.items.map((it) => (
              <li key={it}>
                <PixelIcon name="check" size={14} animate={false} />
                {it}
              </li>
            ))}
          </ul>
        </div>

        <figure className="psec-card psec-sample" data-reveal>
          <figcaption className="t-mono psec__label">{s.sample.label}</figcaption>
          <p>{s.sample.body}</p>
        </figure>
      </div>

      <div className="psec__actions" data-reveal>
        <SectionButton button={s.button} />
      </div>
    </SectionShell>
  )
}
