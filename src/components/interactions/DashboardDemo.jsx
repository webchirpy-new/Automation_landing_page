import React, { useRef, useState } from "react"
import { dashboard, uiCopy } from "../../data/automationContent"
import { dashboardTabs } from "../../data/dashboardData"
import { moduleByName } from "../../data/serviceModules"
import CountUp from "../visuals/CountUp"
import PixelIcon from "../visuals/PixelIcon"
import { gsap, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

const fmt = (n) => n.toLocaleString("en-IN")

function Bars({ rows, unit = "" }) {
  const max = Math.max(...rows.map((r) => r.n))
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="hbars__label">{r.label}</span>
          <span className="hbars__track" aria-hidden="true">
            <span className="hbars__fill" style={{ "--w": `${(r.n / max) * 100}%` }} />
          </span>
          <span className="hbars__value">
            {fmt(r.n)}
            {unit}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Funnel({ rows }) {
  const max = rows[0].n
  return (
    <ol className="funnel">
      {rows.map((r, i) => (
        <li key={r.label} style={{ "--w": `${Math.max(18, (r.n / max) * 100)}%`, "--i": i }}>
          <span className="funnel__bar" aria-hidden="true" />
          <span className="funnel__value">{fmt(r.n)}</span>
          <span className="funnel__label">{r.label}</span>
        </li>
      ))}
    </ol>
  )
}

function Columns({ rows }) {
  const max = Math.max(...rows.map((r) => r.n))
  return (
    <ul className="vcols">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="vcols__value">{r.n}</span>
          <span className="vcols__track" aria-hidden="true">
            <span className="vcols__fill" style={{ "--h": `${(r.n / max) * 100}%` }} />
          </span>
          <span className="vcols__label t-mono">{r.label}</span>
        </li>
      ))}
    </ul>
  )
}

function Timeline({ rows }) {
  return (
    <ol className="dtimeline">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="dtimeline__dot" aria-hidden="true" />
          <span className="dtimeline__value">{r.n}</span>
          <span className="dtimeline__label">{r.label}</span>
        </li>
      ))}
    </ol>
  )
}

function Payments({ rows }) {
  const [sent, paid, pending] = rows
  return (
    <div className="payments">
      <p className="payments__line">
        <strong>{sent.n}</strong> {sent.label} · <strong>{paid.n}</strong> {paid.label} · <strong>{pending.n}</strong> {pending.label}
      </p>
      <div className="payments__bar" aria-hidden="true">
        <span className="payments__paid" style={{ flexGrow: paid.n }} />
        <span className="payments__pending" style={{ flexGrow: pending.n }} />
      </div>
      <ul className="payments__legend t-mono" aria-hidden="true">
        <li>
          <i className="payments__paid" /> {paid.label}
        </li>
        <li>
          <i className="payments__pending" /> {pending.label}
        </li>
      </ul>
    </div>
  )
}

/** Overview trend: DOCX gives month labels only, no values → shape is illustrative. */
function Trend({ months }) {
  return (
    <figure className="trend">
      <svg viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true">
        <path className="trend__area" d="M0 78 C50 72 80 64 110 58 C150 50 180 40 210 34 C240 28 270 18 300 12 L300 90 L0 90Z" />
        <path className="trend__line" d="M0 78 C50 72 80 64 110 58 C150 50 180 40 210 34 C240 28 270 18 300 12" />
      </svg>
      <ul className="trend__months t-mono">
        {months.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <figcaption className="t-mono trend__note">Illustrative trend · values not shown</figcaption>
    </figure>
  )
}

function Decision({ part, text, onDo, openId, id }) {
  const m = moduleByName[part]
  const isOpen = openId === id
  return (
    <li className="decision">
      {m && (
        <span className="decision__part t-mono">
          <PixelIcon name={m.icon} size={12} animate={false} /> {part}
        </span>
      )}
      <span className="decision__text">{text}</span>
      <button type="button" className="decision__do" aria-expanded={isOpen} aria-controls={`${id}-note`} onClick={() => onDo(isOpen ? null : id)}>
        {dashboard.doIt}
      </button>
      <p id={`${id}-note`} className="decision__note" hidden={!isOpen}>
        <span className="badge badge--dark t-mono">{uiCopy.illustrative}</span> {uiCopy.demoAction}
      </p>
    </li>
  )
}

function Stat({ s }) {
  return (
    <div className="dstat">
      <span className="dstat__value">
        <CountUp value={s.value} suffix={s.suffix || ""} duration={0.8} />
      </span>
      <span className="dstat__label">{s.label}</span>
    </div>
  )
}

function Main({ main }) {
  return (
    <div className="dmain">
      <p className="dmain__label">{main.label}</p>
      <p className="dmain__value">{main.text ? main.text : <CountUp value={main.value} suffix={main.suffix || ""} duration={0.9} />}</p>
      <p className="dmain__delta t-mono">{main.delta}</p>
    </div>
  )
}

function Panel({ t, openNote, setOpenNote }) {
  if (t.id === "overview") {
    return (
      <div className="dgrid dgrid--overview">
        <div className="dcell dcell--main">
          <Main main={t.main} />
          <Trend months={t.trend.months} />
        </div>
        {t.stats.map((s) => (
          <div key={s.label} className="dcell dcell--stat">
            <Stat s={s} />
          </div>
        ))}
        <div className="dcell dcell--split">
          <h4 className="dcell__title t-mono">{t.areaSplit.title}</h4>
          <Bars rows={t.areaSplit.rows} unit="%" />
        </div>
        <div className="dcell dcell--journey">
          <h4 className="dcell__title t-mono">
            {t.journey.title} <span className="dcell__sub">({t.journey.parts})</span>
          </h4>
          <Funnel rows={t.journey.steps} />
        </div>
        {t.cards.map((c) => (
          <div key={c.part} className="dcell dcell--card">
            <p className="t-mono dcell__part">
              <PixelIcon name={moduleByName[c.part].icon} size={12} animate={false} /> {c.kicker ? `${c.kicker} (${c.part})` : `${c.part} card`}
            </p>
            <p className="dcell__big">{c.value}</p>
            <p className="dcell__text">
              {c.label}
              {c.body ? ` · ${c.body}` : ""}
            </p>
          </div>
        ))}
        <div className="dcell dcell--decisions">
          <h4 className="dcell__title t-mono">{t.decisionsTitle}</h4>
          <ul className="decisions">
            {t.decisions.map((d, i) => (
              <Decision key={d.text} id={`ov-dec-${i}`} part={d.part} text={d.text} openId={openNote} onDo={setOpenNote} />
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const p = t.panel
  return (
    <div className="dgrid">
      <div className="dcell dcell--main">
        <Main main={t.main} />
      </div>
      {t.stats.map((s) => (
        <div key={s.label} className="dcell dcell--stat">
          <Stat s={s} />
        </div>
      ))}
      <div className={`dcell dcell--panel dcell--${p.kind}`}>
        <h4 className="dcell__title t-mono">{p.title}</h4>
        {p.kind === "bars" && <Bars rows={p.rows} />}
        {p.kind === "funnel" && <Funnel rows={p.rows} />}
        {p.kind === "columns" && <Columns rows={p.rows} />}
        {p.kind === "timeline" && <Timeline rows={p.rows} />}
        {p.kind === "payments" && <Payments rows={p.rows} />}
        {p.kind === "summary" && (
          <p className="dsummary">
            <PixelIcon name="insights" size={18} /> {p.text}
          </p>
        )}
      </div>
      <div className="dcell dcell--decision">
        <h4 className="dcell__title t-mono">Decision</h4>
        <ul className="decisions">
          <Decision id={`${t.id}-dec`} part={t.tab} text={t.decision} openId={openNote} onDo={setOpenNote} />
        </ul>
      </div>
    </div>
  )
}

export default function DashboardDemo() {
  const root = useRef(null)
  const [tab, setTab] = useState(0)
  const [openNote, setOpenNote] = useState(null)
  const t = dashboardTabs[tab]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(".dash__panel", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" })
        gsap.fromTo(".hbars__fill, .vcols__fill, .funnel__bar", { scale: 0 }, { scale: 1, duration: 0.7, ease: "power2.out", stagger: 0.04, delay: 0.1 })
        gsap.fromTo(".trend__line", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power2.out" })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [tab], revertOnUpdate: true }
  )

  const choose = (i) => {
    setTab(i)
    setOpenNote(null)
  }
  const onKey = (e) => {
    const last = dashboardTabs.length - 1
    let n = null
    if (e.key === "ArrowRight") n = tab === last ? 0 : tab + 1
    if (e.key === "ArrowLeft") n = tab === 0 ? last : tab - 1
    if (e.key === "Home") n = 0
    if (e.key === "End") n = last
    if (n === null) return
    e.preventDefault()
    choose(n)
    const btn = root.current.querySelector(`#dash-tab-${dashboardTabs[n].id}`)
    btn?.focus()
    btn?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }

  return (
    <div ref={root} className="dash">
      <div className="dash__window">
        <div className="dash__bar">
          <span className="dash__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <p className="dash__title">
            <strong>{dashboard.header.title}</strong>
            <span className="t-mono">{dashboard.header.period}</span>
            <span className="badge badge--dark t-mono">{dashboard.header.note}</span>
          </p>
        </div>

        <div className="dash__tabs-wrap">
          <div className="dash__tabs" role="tablist" aria-label="Dashboard tabs" onKeyDown={onKey}>
            {dashboardTabs.map((x, i) => (
              <button
                key={x.id}
                id={`dash-tab-${x.id}`}
                type="button"
                role="tab"
                aria-selected={tab === i}
                aria-controls="dash-panel"
                tabIndex={tab === i ? 0 : -1}
                className={`dash__tab px-host ${tab === i ? "is-active" : ""}`}
                onClick={() => choose(i)}
              >
                {moduleByName[x.tab] && <PixelIcon name={moduleByName[x.tab].icon} size={14} />}
                {x.tab}
              </button>
            ))}
          </div>
        </div>

        <div id="dash-panel" role="tabpanel" aria-labelledby={`dash-tab-${t.id}`} className="dash__panel" tabIndex={0}>
          <Panel t={t} openNote={openNote} setOpenNote={setOpenNote} />
        </div>

        <p className="dash__footer t-mono">
          <span className="badge badge--dark">{uiCopy.illustrative}</span> {dashboard.footerLabel}
        </p>
      </div>
    </div>
  )
}
