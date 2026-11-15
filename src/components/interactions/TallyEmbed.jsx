import React, { useEffect, useMemo, useRef, useState } from "react"
import { useSite } from "../../context/SiteContext"
import { siteConfig } from "../../config/site"

/**
 * TallyEmbed — one of the site's Tally forms, embedded inline.
 *
 * `fields` become URL parameters, which Tally uses to fill hidden fields of the same name
 * (only fields that exist in the form are stored; the rest are ignored). Objects are sent as JSON.
 *
 * Tally's embed script sizes the frame to the form (dynamicHeight). If the script can't load,
 * the frame still gets its src and a fixed height, so the form always works. A submitted form
 * marks the visitor as converted, which keeps the exit popup away, and (with `thankYou`) sends
 * them to the thank-you page, which forwards to the Brevo meeting page.
 */
const SCRIPT = "https://tally.so/widgets/embed.js"
let scriptPromise = null

function loadTally() {
  if (typeof window === "undefined") return Promise.reject()
  if (window.Tally) return Promise.resolve(window.Tally)
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script")
      s.src = SCRIPT
      s.async = true
      s.onload = () => (window.Tally ? resolve(window.Tally) : reject())
      s.onerror = () => {
        scriptPromise = null
        reject()
      }
      document.body.appendChild(s)
    })
  }
  return scriptPromise
}

function tallyFormId(url) {
  const m = /tally\.so\/(?:r|embed)\/([A-Za-z0-9]+)/.exec(url || "")
  return m ? m[1] : null
}

export default function TallyEmbed({ url, title, fields = {}, minHeight = 420, className = "", thankYou = null }) {
  const frame = useRef(null)
  const { setFormSubmitted } = useSite()
  const [ready, setReady] = useState(false)
  const id = tallyFormId(url)

  const src = useMemo(() => {
    if (!id) return null
    const params = new URLSearchParams({ alignLeft: "1", hideTitle: "1", transparentBackground: "1", dynamicHeight: "1" })
    Object.entries(fields).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") return
      params.set(k, typeof v === "object" ? JSON.stringify(v) : String(v))
    })
    return `https://tally.so/embed/${id}?${params}`
  }, [id, fields])

  useEffect(() => {
    const el = frame.current
    if (!el || !src) return
    let cancelled = false
    const fallback = () => {
      if (!cancelled && el.getAttribute("src") !== src) el.setAttribute("src", src)
    }
    loadTally()
      .then((Tally) => {
        if (cancelled) return
        el.removeAttribute("src")
        Tally.loadEmbeds()
        // loadEmbeds only picks up frames without a src; make sure this one ends up loaded.
        window.setTimeout(fallback, 400)
      })
      .catch(fallback)
    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    const onMessage = (e) => {
      if (typeof e.origin !== "string" || !e.origin.endsWith("tally.so")) return
      let data = e.data
      if (typeof data === "string") {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }
      if (data?.event !== "Tally.FormSubmitted" || (data.payload?.formId && data.payload.formId !== id)) return
      setFormSubmitted(true)
      // A short beat so Tally finishes its own confirmation, then on to the thank-you page.
      if (thankYou) window.setTimeout(() => window.location.assign(`${siteConfig.thankYouPath}?form=${encodeURIComponent(thankYou)}`), 600)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [id, setFormSubmitted, thankYou])

  if (!src) return null

  return (
    <div className={`tally ${ready ? "is-ready" : ""} ${className}`} style={{ "--tally-min": `${minHeight}px` }}>
      <iframe
        ref={frame}
        data-tally-src={src}
        title={title}
        width="100%"
        height={minHeight}
        loading="lazy"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        onLoad={() => setReady(true)}
      />
      <a className="tally__open" href={url} target="_blank" rel="noopener noreferrer">
        Form not loading? Open it in a new tab ↗
      </a>
    </div>
  )
}
