import React from "react"
import { SectionShell } from "../ui/primitives"

/** vsl-08 #steps: step 1 (writing) → step 3 (working) (Kit 04 §05). */
export default function StepsSection({ section: s }) {
  const titleId = `${s.id}-title`
  return (
    <SectionShell id={s.id} theme="light" labelledBy={titleId} className="psec psec--steps">
      <header className="section-head section-head--center">
        <h2 id={titleId} className="t-h2" data-reveal>
          {s.title}
        </h2>
      </header>

      <table className="psec-table psec-table--steps" data-reveal>
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
          {s.rows.map((r) => (
            <tr key={r.step}>
              <th scope="row" data-label={s.columns[0]}>
                {r.step}
                {r.note && <span className="psec-table__sub t-muted">{r.note}</span>}
              </th>
              <td data-label={s.columns[1]}>{r.does}</td>
              <td data-label={s.columns[2]} className="psec-table__saving">
                {r.saving}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  )
}
