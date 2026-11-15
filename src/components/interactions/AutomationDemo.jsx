import React, { useEffect, useRef, useState } from "react"
import { automationDemos } from "../../data/automationDemos"
import AppTile from "../visuals/AppTile"
import PixelIcon from "../visuals/PixelIcon"

/**
 * A realistic, illustrative demo of one automation working (data/automationDemos.js).
 * Plays once, the first time it scrolls into view; opening another part plays that part's demo.
 * Every item's REST state is its final state, so with reduced motion (or no JS) the finished
 * scene simply shows. The step list underneath is the text equivalent for screen readers.
 */
const at = (d) => ({ "--d": `${d}s` })

function Chat({ s }) {
  return (
    <div className="demo-phone">
      <div className="demo-phone__bar">
        <span className="demo-phone__avatar" aria-hidden="true">
          {s.name.charAt(0)}
        </span>
        <span>
          <strong>{s.name}</strong>
          <span className="demo-phone__status">{s.status}</span>
        </span>
      </div>
      <div className="demo-phone__body">
        {s.items.map((it, i) => {
          if (it.type === "typing")
            return (
              <p key={i} className="demo-typing demo-blink" style={at(it.d)}>
                <i />
                <i />
                <i />
              </p>
            )
          if (it.type === "day" || it.type === "sys")
            return (
              <p key={i} className={`demo-note demo-note--${it.type} demo-in`} style={at(it.d)}>
                {it.type === "sys" && <PixelIcon name="check" size={10} animate={false} />}
                {it.text}
              </p>
            )
          return (
            <div key={i} className={`demo-msg demo-msg--${it.type} demo-in`} style={at(it.d)}>
              {it.lines ? (
                <p className="demo-msg__lines">
                  {it.lines.map(([k, v]) => (
                    <span key={k}>
                      <strong>{k}</strong> {v}
                    </span>
                  ))}
                </p>
              ) : (
                <p>{it.text}</p>
              )}
              {it.attach && (
                <span className="demo-msg__attach">
                  <PixelIcon name="invoice" size={12} animate={false} /> {it.attach}
                </span>
              )}
              <span className="demo-msg__time">
                {it.time}
                {it.type === "out" && " ✓✓"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Window({ title, children }) {
  return (
    <div className="demo-app">
      <div className="demo-app__bar">
        <span className="demo-app__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <strong>{title}</strong>
      </div>
      <div className="demo-app__body">{children}</div>
    </div>
  )
}

function List({ s }) {
  return (
    <Window title={s.title}>
      <ul className="demo-list">
        {s.rows.map((r) => (
          <li key={r.who} className="demo-in" style={at(r.d)}>
            <AppTile id={r.tool} size={30} />
            <span className="demo-list__main">
              <strong>{r.who}</strong>
              <span>{r.text}</span>
            </span>
            <span className="demo-list__meta">
              <span className="demo-tag">{r.source}</span>
              <span>{r.time}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="demo-foot demo-in" style={at(s.footerD)}>
        <PixelIcon name="check" size={12} animate={false} /> {s.footer}
      </p>
    </Window>
  )
}

function Board({ s }) {
  const last = s.moves.length - 1
  return (
    <Window title={s.title}>
      <div className="demo-board">
        {s.columns.map((c, ci) => (
          <div key={c} className="demo-board__col">
            <p className="demo-board__head">{c}</p>
            {s.others
              .filter((o) => o.col === ci)
              .map((o) => (
                <p key={o.text} className="demo-card demo-card--muted">
                  {o.text}
                </p>
              ))}
            {s.moves.map((m, mi) =>
              m.col === ci ? (
                // Each stop shows the deal, then hands it on: earlier stops fade out as it moves
                <p
                  key={mi}
                  className={`demo-card demo-card--deal ${mi < last ? "demo-pass" : "demo-in"}`}
                  style={{ ...at(m.d), "--d2": `${s.moves[mi + 1]?.d ?? 0}s` }}
                >
                  <strong>{s.deal.name}</strong>
                  <span>{s.deal.value}</span>
                  {mi === last && <span className="demo-tag demo-tag--won">Won</span>}
                </p>
              ) : null
            )}
          </div>
        ))}
      </div>
      <p className="demo-toast demo-in" style={at(s.toast.d)}>
        <PixelIcon name="clock" size={12} animate={false} /> {s.toast.text}
      </p>
    </Window>
  )
}

function Orders({ s }) {
  return (
    <Window title={s.title}>
      <div className="demo-order demo-in" style={at(s.order.d)}>
        <p>
          <strong>New order {s.order.id}</strong> · {s.order.text}
        </p>
        <span className="demo-tag demo-in" style={at(s.assign.d)}>
          {s.assign.text}
        </span>
      </div>
      <ol className="demo-stages">
        {s.stages.map((st) => (
          <li key={st.label} className="demo-in" style={at(st.d)}>
            <span className="demo-stages__dot" aria-hidden="true">
              <PixelIcon name="check" size={10} animate={false} />
            </span>
            {st.label}
          </li>
        ))}
      </ol>
      <div className="demo-msg demo-msg--out demo-msg--wide demo-in" style={at(s.notify.d)}>
        <p>{s.notify.text}</p>
        <span className="demo-msg__time">{s.notify.note}</span>
      </div>
    </Window>
  )
}

function Sync({ s }) {
  return (
    <div className="demo-sync">
      <div className="demo-app demo-sync__source demo-in" style={at(s.source.d)}>
        <div className="demo-app__bar">
          <strong>{s.source.title}</strong>
        </div>
        <dl className="demo-fields">
          {s.source.fields.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <span className="demo-sync__arrow" aria-hidden="true">
        ↓
      </span>
      <ul className="demo-sync__targets">
        {s.targets.map((t) => (
          <li key={t.title} className="demo-in" style={at(t.d)}>
            <AppTile id={t.tool} size={28} />
            <span>
              <strong>{t.title}</strong>
              <span>{t.text}</span>
            </span>
            <PixelIcon name="check" size={12} animate={false} />
          </li>
        ))}
      </ul>
      <p className="demo-foot demo-in" style={at(s.footerD)}>
        <PixelIcon name="clock" size={12} animate={false} /> {s.footer}
      </p>
    </div>
  )
}

const KINDS = { chat: Chat, list: List, board: Board, orders: Orders, sync: Sync }

/** Longest item delay in a scene (+ the entrance), so the progress bar ends with the scene. */
function sceneLength(scene) {
  let max = 0
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => (k === "d" || k === "footerD" ? (max = Math.max(max, x)) : walk(x)))
  }
  walk(scene)
  return max + 0.6
}

export default function AutomationDemo({ id, showSteps = true }) {
  const ref = useRef(null)
  // No IntersectionObserver (very old browsers): just show the finished scene
  const [playing, setPlaying] = useState(() => typeof IntersectionObserver === "undefined")
  const scene = automationDemos[id]

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setPlaying(true)
        io.disconnect()
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!scene) return null
  const Scene = KINDS[scene.kind]
  // The scene's own steps: the text version of what the demo shows
  const steps = scene.steps || []
  return (
    <figure ref={ref} className={`demo ${playing ? "is-playing" : "is-waiting"}`} style={{ "--demo-len": `${sceneLength(scene)}s` }}>
      <figcaption className="demo__label t-mono">
        <i aria-hidden="true" /> Illustrative demo · sample data
      </figcaption>
      <div className="demo__stage" aria-hidden="true">
        <Scene s={scene} />
      </div>
      {/* Video-style progress: fills once while the scene plays */}
      <div className="demo__progress" aria-hidden="true">
        <span />
      </div>
      {showSteps && steps.length > 0 && (
        <ol className="demo__steps">
          {steps.map((st, i) => (
            <li key={st}>
              <span className="t-mono">{String(i + 1).padStart(2, "0")}</span> {st}
            </li>
          ))}
        </ol>
      )}
    </figure>
  )
}
