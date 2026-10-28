import React, { useState } from "react"
import PixelIcon from "../visuals/PixelIcon"

/**
 * Multi-open accordion (deliberate: owners compare answers side by side).
 * Native buttons, aria-expanded/controls, region panels; answers stay in the DOM.
 */
export default function FAQAccordion({ items }) {
  const [open, setOpen] = useState(() => new Set([0]))
  const toggle = (i) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  return (
    <div className="faq-list">
      {items.map((it, i) => {
        const isOpen = open.has(i)
        return (
          <div key={it.q} className={`faq-item ${isOpen ? "is-open" : ""}`}>
            <h3 className="faq-item__h">
              <button type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => toggle(i)}>
                <span className="faq-item__q">{it.q}</span>
                <span className="faq-item__icon" aria-hidden="true">
                  <PixelIcon name="help" size={14} animate={false} />
                </span>
              </button>
            </h3>
            <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-item__a" hidden={!isOpen}>
              <p>{it.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
