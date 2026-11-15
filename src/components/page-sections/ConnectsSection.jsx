import React from "react"
import { SectionShell } from "../ui/primitives"
import PixelIcon from "../visuals/PixelIcon"

/** vsl-06 #connects: "when this happens → this happens on its own" (Kit 04 §03). */
export default function ConnectsSection({ section: s }) {
  const titleId = `${s.id}-title`
  return (
    <SectionShell id={s.id} theme="light" labelledBy={titleId} className="psec psec--connects">
      <header className="section-head section-head--center">
        <h2 id={titleId} className="t-h2" data-reveal>
          {s.title}
        </h2>
      </header>

      {/* A real table for assistive tech; laid out as stacked cards on phones */}
      <table className="psec-table" data-reveal>
        <thead>
          <tr>
            {s.columns.map((c) => (
              <th key={c} scope="col" className="t-mono">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.rows.map(([when, then]) => (
            <tr key={when}>
              <th scope="row" data-label={s.columns[0]}>
                {when}
              </th>
              <td data-label={s.columns[1]}>
                <span className="psec-table__arrow" aria-hidden="true">
                  <PixelIcon name="branch" size={16} animate={false} />
                </span>
                {then}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="t-muted psec__note psec__note--center" data-reveal>
        {s.note}
      </p>

      {s.promise && !s.promise.pending && (
        <p className="psec-card psec-card--accent psec__promise" data-reveal>
          <strong>{s.promise.label}:</strong> {s.promise.body}
        </p>
      )}
    </SectionShell>
  )
}
