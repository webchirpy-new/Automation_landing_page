import React, { useId, useState } from "react"
import { walk, uiCopy } from "../../data/automationContent"
import { siteConfig, whatsappHref } from "../../config/site"
import { useSite } from "../../context/SiteContext"
import PixelIcon from "../visuals/PixelIcon"
import { pageId } from "../../data/landingPages"

const INDUSTRIES = [
  "Clinic / healthcare",
  "Education / coaching",
  "Real estate",
  "Retail / e-commerce",
  "Restaurant / food",
  "Services / agency",
  "Manufacturing / distribution",
  "Travel / hospitality",
  "Other",
]

const validators = {
  name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
  business: (v) => (v.trim().length >= 2 ? "" : "Please enter your business name."),
  phone: (v) => {
    const digits = v.replace(/\D/g, "")
    return digits.length >= 10 && digits.length <= 15 ? "" : "Please enter a valid phone / WhatsApp number (10–15 digits)."
  },
  industry: (v) => (v.trim() ? "" : "Please choose or type your industry."),
  time: () => "",
  consent: (v) => (v ? "" : "Please confirm we may contact you about the call."),
}

/**
 * Booking form shared by the Walk-in section and the lead modal.
 * Success is ONLY shown after a configured endpoint returns 2xx. Without an
 * endpoint the form validates, then reports labelled demo mode — never "Booked!".
 */
export default function LeadForm({ idPrefix, compact = false }) {
  const uid = useId().replace(/:/g, "")
  const pid = `${idPrefix || "lf"}-${uid}`
  const { summary, setFormSubmitted } = useSite()
  const f = walk.form.fields

  const [values, setValues] = useState({ name: "", business: "", phone: "", industry: "", time: "", consent: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState("idle") // idle | sending | success | demo | error

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setValues((s) => ({ ...s, [k]: v }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: validators[k](v) }))
  }
  const blur = (k) => () => setErrors((er) => ({ ...er, [k]: validators[k](values[k]) }))

  const scoreLine =
    summary.gapCount > 0 || summary.reviewedCount > 0
      ? `Scorecard: ${summary.gapCount} of 16 gaps · ${summary.reviewedCount} of 8 areas reviewed${
          summary.top3.length ? ` · priorities: ${summary.top3.map((a) => a.area).join(", ")}` : ""
        }`
      : null

  async function onSubmit(e) {
    e.preventDefault()
    const next = Object.fromEntries(Object.keys(validators).map((k) => [k, validators[k](values[k])]))
    setErrors(next)
    const firstBad = Object.keys(next).find((k) => next[k])
    if (firstBad) {
      const el = document.getElementById(`${pid}-${firstBad}`)
      if (el) el.focus()
      return
    }
    if (!siteConfig.formEndpoint) {
      setStatus("demo")
      return
    }
    setStatus("sending")
    try {
      const res = await fetch(siteConfig.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...values,
          scorecard: {
            gaps: summary.gapCount,
            reviewedAreas: summary.reviewedCount,
            complete: summary.complete,
            score: summary.score,
            priorities: summary.top3.map((a) => ({ area: a.area, gaps: a.gaps })),
          },
          // Page 1 keeps its original value; pages 2–8 append their id so leads can be traced to the page
          source: pageId === "vsl-01" ? "webchirpy-automation-landing" : `webchirpy-automation-landing:${pageId}`,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus("success")
      setFormSubmitted(true)
    } catch (err) {
      setStatus("error")
    }
  }

  const field = (k, label, input) => (
    <div className={`field ${errors[k] ? "field--error" : ""}`}>
      <label htmlFor={`${pid}-${k}`} className="field__label">
        {label}
      </label>
      {input}
      {errors[k] && (
        <p id={`${pid}-${k}-err`} className="field__error" role="alert">
          {errors[k]}
        </p>
      )}
    </div>
  )
  const aria = (k) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `${pid}-${k}-err` : undefined })

  if (status === "success") {
    return (
      <div className="lead-form__result lead-form__result--ok" role="status" tabIndex={-1}>
        <PixelIcon name="check" size={28} />
        <p>{uiCopy.formSuccess}</p>
      </div>
    )
  }

  const wa = whatsappHref("Hi Webchirpy, I'd like to book the free automation audit.")

  return (
    <form className={`lead-form ${compact ? "lead-form--compact" : ""}`} onSubmit={onSubmit} noValidate>
      {field("name", f.name, <input id={`${pid}-name`} name="name" autoComplete="name" value={values.name} onChange={set("name")} onBlur={blur("name")} required {...aria("name")} />)}
      {field("business", f.business, <input id={`${pid}-business`} name="business" autoComplete="organization" value={values.business} onChange={set("business")} onBlur={blur("business")} required {...aria("business")} />)}
      {field(
        "phone",
        f.phone,
        <input id={`${pid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={values.phone} onChange={set("phone")} onBlur={blur("phone")} required {...aria("phone")} />
      )}
      {field(
        "industry",
        f.industry,
        <>
          <input id={`${pid}-industry`} name="industry" list={`${pid}-industries`} value={values.industry} onChange={set("industry")} onBlur={blur("industry")} required {...aria("industry")} />
          <datalist id={`${pid}-industries`}>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
        </>
      )}
      {field("time", f.time, <textarea id={`${pid}-time`} name="time" rows={compact ? 2 : 3} value={values.time} onChange={set("time")} />)}

      {scoreLine && (
        <p className="lead-form__score t-mono">
          <PixelIcon name="check" size={14} /> {scoreLine}
        </p>
      )}

      <div className={`field field--check ${errors.consent ? "field--error" : ""}`}>
        <input id={`${pid}-consent`} type="checkbox" checked={values.consent} onChange={set("consent")} {...aria("consent")} />
        <label htmlFor={`${pid}-consent`}>{uiCopy.consent}</label>
        {errors.consent && (
          <p id={`${pid}-consent-err`} className="field__error" role="alert">
            {errors.consent}
          </p>
        )}
      </div>

      <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={status === "sending"}>
        <span className="btn__label">{status === "sending" ? "Sending…" : walk.form.button}</span>
      </button>
      {/* Replaces "Your details are only used to book your call." (Launch Kit 03): while this is a
          dummy form, nothing is used at all. Kit 03 line N2 lands with Tally Form B. */}
      <p className="lead-form__privacy">
        {uiCopy.demoFormNote}{" "}
        <a className="inline-link" href={siteConfig.privacyUrl}>
          {uiCopy.privacyNotice}
        </a>
      </p>

      <div aria-live="polite">
        {status === "demo" && (
          <div className="lead-form__result lead-form__result--demo">
            <p>{uiCopy.formDemoMode}</p>
            {wa && (
              <a className="text-link" href={wa} target="_blank" rel="noopener noreferrer">
                Message us on WhatsApp instead →
              </a>
            )}
          </div>
        )}
        {status === "error" && (
          <div className="lead-form__result lead-form__result--error">
            <p>{uiCopy.formError}</p>
          </div>
        )}
      </div>
    </form>
  )
}
