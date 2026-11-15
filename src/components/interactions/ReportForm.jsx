import React, { useId, useState } from "react"
import { reportForm as rf } from "../../data/automationContent"
import { siteConfig } from "../../config/site"
import { goToBooking } from "../../lib/scroll"
import { normaliseIndianMobile } from "../../lib/phone"

const len = (v, min, max) => {
  const n = v.trim().length
  return n >= min && n <= max
}

const validators = {
  name: (v) => (len(v, 2, 60) ? "" : rf.errors.name),
  phone: (v) => (normaliseIndianMobile(v) ? "" : rf.errors.phone),
  business: (v) => (len(v, 2, 80) ? "" : rf.errors.business),
  years: (v) => (v ? "" : rf.errors.years),
  team: (v) => (v ? "" : rf.errors.team),
  consent: (v) => (v ? "" : rf.errors.consent),
}

const EMPTY = { name: "", phone: "", business: "", years: "", team: "", consent: false, marketing: false }

/**
 * DUMMY report form (Kit 02 Form A fields and validation). Demo only: on a valid submit it shows
 * that nothing was sent or stored. Values live only in this component's state — never in
 * storage, never on the network. Tally Form A replaces it in Phase 4.
 */
export default function ReportForm({ onBook = goToBooking }) {
  const pid = `rf-${useId().replace(/:/g, "")}`
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState("idle") // idle | demo

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setValues((s) => ({ ...s, [k]: v }))
    if (errors[k] && validators[k]) setErrors((er) => ({ ...er, [k]: validators[k](v) }))
  }
  const blur = (k) => () => setErrors((er) => ({ ...er, [k]: validators[k](values[k]) }))
  const aria = (k) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `${pid}-${k}-err` : undefined })

  function onSubmit(e) {
    e.preventDefault()
    const next = Object.fromEntries(Object.keys(validators).map((k) => [k, validators[k](values[k])]))
    setErrors(next)
    const firstBad = Object.keys(next).find((k) => next[k])
    if (firstBad) {
      document.getElementById(`${pid}-${firstBad}`)?.focus()
      return
    }
    // Demo only: nothing is sent or stored. The entered values are discarded.
    setValues(EMPTY)
    setStatus("demo")
  }

  const err = (k) =>
    errors[k] ? (
      <p id={`${pid}-${k}-err`} className="field__error" role="alert">
        {errors[k]}
      </p>
    ) : null

  const field = (k, label, input) => (
    <div className={`field ${errors[k] ? "field--error" : ""}`}>
      <label htmlFor={`${pid}-${k}`} className="field__label">
        {label}
      </label>
      {input}
      {err(k)}
    </div>
  )

  const select = (k, label, options) =>
    field(
      k,
      label,
      <select id={`${pid}-${k}`} name={k} value={values[k]} onChange={set(k)} onBlur={blur(k)} required {...aria(k)}>
        <option value="" disabled>
          {rf.selectPlaceholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    )

  if (status === "demo") {
    return (
      <div className="report-form__done" role="status" tabIndex={-1}>
        <p className="report-form__badge t-mono">{rf.demoBadge}</p>
        <p className="report-form__done-title">{rf.demoResult.title}</p>
        <p className="t-muted">{rf.demoResult.body}</p>
        <p>{rf.demoResult.callLine}</p>
        <button type="button" className="btn btn--primary btn--lg" onClick={onBook}>
          <span className="btn__label">{rf.demoResult.callButton}</span>
        </button>
      </div>
    )
  }

  return (
    <form className="lead-form report-form" onSubmit={onSubmit} noValidate aria-describedby={`${pid}-demo`}>
      <p id={`${pid}-demo`} className="report-form__demo">
        <span className="report-form__badge t-mono">{rf.demoBadge}</span> {rf.demoNote}
      </p>

      <div className="report-form__grid">
        {field("name", rf.fields.name, <input id={`${pid}-name`} name="name" autoComplete="name" maxLength={60} value={values.name} onChange={set("name")} onBlur={blur("name")} required {...aria("name")} />)}
        {field(
          "phone",
          rf.fields.phone,
          <div className="report-form__phone">
            <span className="report-form__prefix" aria-hidden="true">
              +91
            </span>
            <input
              id={`${pid}-phone`}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98xxxxxxxx"
              value={values.phone}
              onChange={set("phone")}
              onBlur={blur("phone")}
              required
              {...aria("phone")}
            />
          </div>
        )}
        {field("business", rf.fields.business, <input id={`${pid}-business`} name="business" autoComplete="organization" maxLength={80} value={values.business} onChange={set("business")} onBlur={blur("business")} required {...aria("business")} />)}
        {select("years", rf.fields.years, rf.yearsOptions)}
        {select("team", rf.fields.team, rf.teamOptions)}
      </div>

      {/* Kit 03 C1 (required) and M1 (optional) — separate, never pre-ticked */}
      <div className={`field field--check ${errors.consent ? "field--error" : ""}`}>
        <input id={`${pid}-consent`} type="checkbox" checked={values.consent} onChange={set("consent")} {...aria("consent")} />
        <label htmlFor={`${pid}-consent`}>
          {rf.consent.before}
          <a className="inline-link" href={siteConfig.privacyUrl}>
            {rf.consent.link}
          </a>
          {rf.consent.after}
        </label>
        {err("consent")}
      </div>
      <div className="field field--check">
        <input id={`${pid}-marketing`} type="checkbox" checked={values.marketing} onChange={set("marketing")} />
        <label htmlFor={`${pid}-marketing`}>{rf.marketing.text}</label>
      </div>

      <button type="submit" className="btn btn--primary btn--lg btn--block">
        <span className="btn__label">{rf.button}</span>
      </button>
    </form>
  )
}
