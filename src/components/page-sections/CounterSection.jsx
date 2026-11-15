import React, { useState } from "react"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"
import SectionButton from "./SectionButton"

/**
 * Tap-to-count block: vsl-06 #repeats and vsl-08 #fits (Kit 04).
 * Purely on the page: nothing is stored or sent.
 */
export default function CounterSection({ section: s }) {
  const [picked, setPicked] = useState(() => new Set())
  const titleId = `${s.id}-title`
  const n = picked.size
  const toggle = (opt) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(opt)) next.delete(opt)
      else next.add(opt)
      return next
    })

  return (
    <SectionShell id={s.id} theme="light" labelledBy={titleId} className="psec psec--counter">
      <div className="psec-card psec-counter" data-reveal>
        <p className="t-mono psec__eyebrow">{s.eyebrow}</p>
        <h2 id={titleId} className="t-h3">
          {s.title}
        </h2>
        {s.prompt && <p className="t-muted">{s.prompt}</p>}

        <div className="psec-chips" role="group" aria-labelledby={titleId}>
          {s.options.map((opt) => {
            const on = picked.has(opt)
            return (
              <button key={opt} type="button" className={`chip-btn psec-chip ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => toggle(opt)}>
                {on && <PixelIcon name="check" size={12} animate={false} />}
                {opt}
              </button>
            )
          })}
        </div>

        <p className="psec-counter__result" aria-live="polite">
          {n > 0 ? <strong>{s.result(n)}</strong> : null}
        </p>

        <SectionButton button={s.button} />
      </div>
    </SectionShell>
  )
}
