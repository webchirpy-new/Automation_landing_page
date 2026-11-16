import React, { useCallback, useLayoutEffect, useRef, useState } from "react"
import { engine } from "../../data/automationContent"
import { moduleByName } from "../../data/serviceModules"
import PixelIcon from "../visuals/PixelIcon"
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap"
import { MOTION_OK } from "../../lib/motionTokens"

/**
 * LivingWorkflow — "How all eight run together as one engine".
 * Four stage hubs with their service chips, wired by an SVG layer measured from
 * the real DOM, so connectors follow wrapping text and every breakpoint. Stage 03
 * branches into three routes that recombine before Stage 04 (desktop).
 *
 * The finished graph is the CSS default: it is complete without JS and under
 * reduced motion. GSAP hides it, then builds it back up once on first view
 * (Replay restarts it). After that a stage is previewed on hover/focus and
 * selected on click/tap; a click during construction finishes it immediately.
 */

const HUB_ICONS = ["chat", "operations", "branch", "chart"]
const BRANCH = 2 // Stage 03 splits into three routes
const READY = -1
const FLOW = 4 // every hub lit while one signal runs the whole route
const DONE = 5
const WIDE = "(min-width: 1024px)"
const ANIMATED = ".lw-hub, .lw-chip, .lw-wire, .lw-signal, .lw-status"
const pad = (i) => String(i + 1).padStart(2, "0")
const r1 = (n) => Math.round(n * 10) / 10

// Layout box of `el` relative to `root`, ignoring transforms (nodes may be mid-animation).
function box(el, root) {
  let x = 0
  let y = 0
  for (let n = el; n && n !== root; n = n.offsetParent) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  const w = el.offsetWidth
  const h = el.offsetHeight
  return { l: x, t: y, r: x + w, b: y + h, cx: x + w / 2, cy: y + h / 2 }
}

// Hub → service chip: drop out of the hub, then ease into the chip's left edge.
function drop(h, c) {
  const sx = h.cx
  const sy = h.b + 4
  const ex = c.l - 4
  const ey = c.cy
  return `M${r1(sx)} ${r1(sy)} C${r1(sx)} ${r1(sy + (ey - sy) * 0.75)} ${r1(sx + (ex - sx) * 0.25)} ${r1(ey)} ${r1(ex)} ${r1(ey)}`
}

function measure(graph, hubs, chips, wide) {
  const H = hubs.map((el) => box(el, graph))
  const C = chips.map((row) => row.map((el) => box(el, graph)))
  const k = 8 // corner radius
  const g = { w: graph.offsetWidth, h: graph.offsetHeight, main: [], links: [], merge: [], feedback: "" }

  for (let i = 0; i < H.length - 1; i++) {
    const a = H[i]
    const b = H[i + 1]
    g.main.push(
      wide ? `M${r1(a.r + 6)} ${r1(a.cy)} L${r1(b.l - 6)} ${r1(b.cy)}` : `M${r1(a.cx)} ${r1(a.b + 6)} L${r1(b.cx)} ${r1(b.t - 6)}`
    )
  }
  // Desktop links every chip to its hub; the vertical layout keeps only the Stage 03 branch.
  g.links = C.map((row, i) => row.map((c) => (wide || i === BRANCH ? drop(H[i], c) : "")))

  if (wide) {
    // Branch routes recombine on the axis just before Stage 04.
    const to = H[BRANCH + 1]
    const end = to.l - 6
    const from = Math.max(...C[BRANCH].map((c) => c.r)) + 4
    const mx = from + (end - from) * 0.5
    const q = Math.max(0, Math.min(k, mx - from, end - mx))
    g.merge = C[BRANCH].map(
      (c) =>
        `M${r1(c.r + 4)} ${r1(c.cy)} H${r1(mx - q)} Q${r1(mx)} ${r1(c.cy)} ${r1(mx)} ${r1(c.cy - q)} V${r1(to.cy + q)} Q${r1(mx)} ${r1(to.cy)} ${r1(mx + q)} ${r1(to.cy)} H${r1(end)}`
    )
    // Compact return route under the chips: Stage 04 back to Stage 01.
    const s = H[3]
    const e = H[0]
    const base = Math.max(...C.flat().map((c) => c.b)) + 18
    g.feedback = `M${r1(s.cx)} ${r1(C[3].at(-1).b + 6)} V${r1(base - k)} Q${r1(s.cx)} ${r1(base)} ${r1(s.cx - k)} ${r1(base)} H${r1(e.cx + k)} Q${r1(e.cx)} ${r1(base)} ${r1(e.cx)} ${r1(base - k)} V${r1(C[0].at(-1).b + 6)}`
  } else {
    // Vertical: down from Stage 04, up the left gutter, back into Stage 01.
    const s = H[3]
    const e = H[0]
    const x = 6
    const y = s.b + 24
    g.feedback = `M${r1(s.cx)} ${r1(s.b + 6)} V${r1(y - k)} Q${r1(s.cx)} ${r1(y)} ${r1(s.cx - k)} ${r1(y)} H${x + k} Q${x} ${r1(y)} ${x} ${r1(y - k)} V${r1(e.cy + k)} Q${x} ${r1(e.cy)} ${x + k} ${r1(e.cy)} H${r1(e.l - 6)}`
  }
  return g
}

export default function LivingWorkflow() {
  const { stages } = engine
  const root = useRef(null)
  const graph = useRef(null)
  const hubs = useRef([])
  const chips = useRef(stages.map(() => []))
  const tl = useRef(null)
  const build = useRef(null)
  const played = useRef(false)
  const chosen = useRef(false)
  const stepRef = useRef(DONE)
  const [geo, setGeo] = useState(null)
  const [step, setStepState] = useState(DONE) // no JS / reduced motion: finished graph
  const [selected, setSelected] = useState(0)
  const [preview, setPreview] = useState(null)

  const setStep = useCallback((s) => {
    stepRef.current = s
    setStepState(s)
  }, [])

  // Measure connectors now, and again whenever the graph or a chip changes size.
  useLayoutEffect(() => {
    const g = graph.current
    const mq = window.matchMedia(WIDE)
    let alive = true
    let raf = 0
    const run = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => alive && setGeo(measure(g, hubs.current, chips.current, mq.matches)))
    }
    setGeo(measure(g, hubs.current, chips.current, mq.matches))
    const ro = new ResizeObserver(run)
    ro.observe(g)
    chips.current.flat().forEach((el) => ro.observe(el))
    mq.addEventListener("change", run)
    document.fonts?.ready.then(run)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      mq.removeEventListener("change", run)
    }
  }, [])

  // Finished state is the CSS default, so completing = drop every inline GSAP style.
  const complete = useCallback(() => {
    played.current = true
    tl.current?.kill()
    tl.current = null
    if (root.current) gsap.set(root.current.querySelectorAll(ANIMATED), { clearProps: "all" })
    setStep(DONE)
    if (!chosen.current) setSelected(0)
  }, [setStep])

  const ready = geo !== null
  useGSAP(
    () => {
      if (!ready) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root)
        const live = (els) => els.filter((p) => p.getAttribute("d"))

        build.current = () => {
          const stageEls = q(".lw-stage")
          const pick = (i, sel) => stageEls[i].querySelectorAll(sel)
          const main = q(".lw-wire--main")
          const links = (i) => live(q(`.lw-wire--link[data-stage="${i}"]`))
          const merge = live(q(".lw-wire--merge"))
          const [feedback] = q(".lw-wire--feedback")
          const [dot, ...dots] = q(".lw-signal")

          gsap.set(live(q(".lw-wire")), { drawSVG: "0%" })
          gsap.set([...q(".lw-stages .lw-chip"), ...q(".lw-status")], { autoAlpha: 0, y: 8 })
          gsap.set(q(".lw-signal"), { autoAlpha: 0 })

          const t = gsap.timeline({ paused: true, onComplete: complete, defaults: { force3D: true } }).timeScale(2.6)
          const travel = (el, path, at, d, ease = "sine.inOut") =>
            t
              .set(el, { autoAlpha: 1 }, at)
              .to(el, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: d, ease }, at)
              .set(el, { autoAlpha: 0 }, at + d)
          const node = (i, at) =>
            t
              .call(setStep, [i], at)
              .fromTo(pick(i, ".lw-hub"), { scale: 0.92, y: 4 }, { scale: 1, y: 0, duration: 0.6, ease: "power3.out" }, at)
          const serve = (i, at, gap = 0.12) => {
            links(i).forEach((p, j) => t.to(p, { drawSVG: "100%", duration: 0.45, ease: "power1.out" }, at + j * gap))
            t.to(pick(i, ".lw-chip"), { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: gap }, at + 0.2)
          }
          const connect = (p, at, d = 0.7) => {
            t.to(p, { drawSVG: "100%", duration: d, ease: "power1.inOut" }, at)
            travel(dot, p, at + 0.1, d)
          }

          // 01 answers → 02 runs the day → 03 branches into three routes → they recombine into 04.
          node(0, 0.5)
          serve(0, 0.9)
          connect(main[0], 2)
          node(1, 2.6)
          serve(1, 2.9)
          connect(main[1], 3.5)
          node(2, 4.1)
          serve(2, 4.4, 0.15)
          links(BRANCH).forEach((p, j) => travel(dots[j], p, 4.5 + j * 0.15, 0.6))
          merge.forEach((p, j) => {
            t.to(p, { drawSVG: "100%", duration: 0.5, ease: "power1.inOut" }, 5.4 + j * 0.1)
            travel(dots[j], p, 5.45 + j * 0.1, 0.55)
          })
          connect(main[2], 5.9)
          node(3, 6.5)
          serve(3, 6.8)
          // One signal runs the assembled graph, then the results route back once.
          t.call(setStep, [FLOW], 7.4)
          main.forEach((p, j) => travel(dot, p, 7.4 + j * 0.45, 0.45, j === 0 ? "sine.in" : j === main.length - 1 ? "sine.out" : "none"))
          t.to(feedback, { drawSVG: "100%", duration: 1.1, ease: "power1.inOut" }, 8.65)
          travel(dot, feedback, 8.7, 1.05)
          t.to(feedback, { opacity: 0.4, duration: 0.5 }, 9.8)
          t.to(q(".lw-status"), { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 9.8)
          return t
        }

        if (!played.current) {
          setStep(READY)
          if (!chosen.current) setSelected(null)
          tl.current = build.current()
          ScrollTrigger.create({
            trigger: graph.current,
            start: "top 88%",
            once: true,
            onEnter: () => {
              played.current = true
              tl.current?.play()
            },
          })
        }
        return () => {
          build.current = null
          if (tl.current) complete()
        }
      })
      return () => {
        mm.revert()
        // Reverting can restore the hidden start state (e.g. after a hot reload); the finished
        // graph is the CSS default, so make sure nothing is left invisible.
        if (root.current) gsap.set(root.current.querySelectorAll(ANIMATED), { clearProps: "all" })
      }
    },
    { scope: root, dependencies: [ready] }
  )

  const select = (i) => {
    chosen.current = true
    setSelected(i)
    setPreview(null)
    if (stepRef.current < DONE) complete()
  }
  const peek = (i) => stepRef.current === DONE && setPreview(i)
  const onKey = (i) => (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: stages.length - 1 - i }[e.key]
    if (k === undefined) return
    e.preventDefault()
    hubs.current[(i + k + stages.length) % stages.length].focus()
  }

  const building = step < DONE
  const phase = step === READY ? "ready" : building ? "build" : "done"
  const shown = building ? (step >= 0 ? Math.min(step, 3) : null) : (preview ?? selected ?? 0)
  const dim = (...owners) => (!building && shown !== null && !owners.includes(shown) ? "is-dim" : "")
  const d = shown ?? 0

  return (
    <div ref={root} className="lw" data-phase={phase}>
      <div className="lw-canvas">
        <div className="lw-bar">
          <span className="lw-tag t-mono">
            <i aria-hidden="true" />
            {engine.cycleNote}
          </span>
          {/* The workflow plays once, when it first scrolls into view (no replay control) */}
        </div>

        <div ref={graph} className="lw-graph">
          <svg className="lw-wires" viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined} aria-hidden="true" focusable="false">
            {geo && (
              <>
                {geo.main.map((p, i) => (
                  <path key={`m${i}`} className={`lw-wire lw-wire--main ${dim(i, i + 1)}`} d={p} />
                ))}
                {geo.links.map((row, i) =>
                  row.map(
                    (p, j) =>
                      p && (
                        <path
                          key={`l${i}${j}`}
                          className={`lw-wire lw-wire--link ${i === BRANCH ? "lw-wire--branch" : ""} ${dim(i)}`}
                          data-stage={i}
                          d={p}
                        />
                      )
                  )
                )}
                {geo.merge.map((p, i) => (
                  <path key={`g${i}`} className={`lw-wire lw-wire--merge ${dim(BRANCH, BRANCH + 1)}`} d={p} />
                ))}
                <path className="lw-wire lw-wire--feedback" d={geo.feedback} />
                {geo.main.map((p, i) => (
                  <path key={`p${i}`} className="lw-pulse" d={p} pathLength="100" style={{ "--delay": `${i * 0.9}s` }} />
                ))}
              </>
            )}
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} className="lw-signal" r="4" />
            ))}
          </svg>

          <ol className="lw-stages">
            {stages.map((s, i) => (
              <li
                key={s.title}
                className={[
                  "lw-stage",
                  i === BRANCH && "lw-stage--branch",
                  building && step < i && "is-pending",
                  (step === FLOW || shown === i) && "is-active",
                  !building && shown === i && "is-open",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => select(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && peek(i)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setPreview(null)}
              >
                <h4 id={`lw-t${i}`} className="lw-stage__title">
                  {s.title}
                </h4>
                <button
                  ref={(el) => (hubs.current[i] = el)}
                  type="button"
                  className="lw-hub"
                  aria-pressed={selected === i}
                  aria-labelledby={`lw-n${i} lw-t${i}`}
                  aria-describedby={`lw-b${i}`}
                  onFocus={() => peek(i)}
                  onBlur={() => setPreview(null)}
                  onKeyDown={onKey(i)}
                >
                  <span id={`lw-n${i}`} className="lw-hub__num t-mono">
                    {pad(i)}
                  </span>
                  <span className="lw-hub__ghost t-mono" aria-hidden="true">
                    {pad(i)}
                  </span>
                  <PixelIcon name={HUB_ICONS[i]} size={28} />
                </button>
                <ul className="lw-chips" aria-label={`${s.title}: services`}>
                  {s.parts.map((p, j) => (
                    <li key={p} ref={(el) => (chips.current[i][j] = el)} className="lw-chip">
                      <PixelIcon name={moduleByName[p].icon} size={13} animate={false} />
                      {p}
                    </li>
                  ))}
                </ul>
                <p id={`lw-b${i}`} className="lw-stage__body">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="lw-status t-mono">
          <span aria-hidden="true">↺</span> {engine.loopLine}
        </p>

        {/* Visual mirror of the selected stage (desktop). Screen readers get each
            description beside its hub via aria-describedby, so this stays hidden to them. */}
        <div className={`lw-detail ${shown === null ? "is-idle" : ""}`} aria-hidden="true">
          <div key={d} className="lw-detail__inner">
            <span className="lw-detail__icon">
              <PixelIcon name={HUB_ICONS[d]} size={30} animate={false} />
            </span>
            <div>
              <p className="lw-detail__head">
                <span className="lw-detail__num t-mono">{pad(d)}</span>
                <span className="lw-detail__title">{stages[d].title}</span>
              </p>
              <ul className="lw-detail__chips">
                {stages[d].parts.map((p) => (
                  <li key={p} className="lw-chip">
                    <PixelIcon name={moduleByName[p].icon} size={13} animate={false} />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="lw-detail__body">{stages[d].body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
