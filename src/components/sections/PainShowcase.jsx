import React, { useCallback, useEffect, useRef, useState } from "react"
import { painPoints, painVideo } from "../../data/painPoints"
import "../../styles/pain-showcase.css"

const COUNT = painPoints.length
/** If a browser refuses autoplay the carousel still moves on by itself */
const FALLBACK_MS = 9000

const Icon = {
  play: <path d="M8 5.5v13l11-6.5z" />,
  pause: <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />,
  muted: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
}
const Svg = ({ name }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    {Icon[name]}
  </svg>
)

/**
 * Three-column proof band: video carousel | matching pain point | the page's stats (children).
 * Performance: no video is fetched until the band is near the viewport, only ONE <video> exists
 * at a time (about 1.8 MB, 540p), it pauses when scrolled away, and the next poster is preloaded.
 * Videos start muted (browsers require it); the viewer can unmute, and that choice carries over
 * to every following clip.
 */
export default function PainShowcase({ children }) {
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false) // the viewer paused it on purpose
  const [playing, setPlaying] = useState(false)
  const reduced = useRef(
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ).current

  const go = useCallback((i) => {
    setProgress(0)
    setBlocked(false)
    setPaused(false)
    setIndex(((i % COUNT) + COUNT) % COUNT)
  }, [])
  const next = useCallback(() => go(index + 1), [go, index])

  useEffect(() => {
    const el = rootRef.current
    if (!el || !("IntersectionObserver" in window)) {
      setNear(true)
      setVisible(true)
      return undefined
    }
    const far = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "400px 0px" })
    const view = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 })
    far.observe(el)
    view.observe(el)
    return () => {
      far.disconnect()
      view.disconnect()
    }
  }, [])

  // Play the current clip while on screen; pause when away, hidden, or paused by the viewer
  useEffect(() => {
    const v = videoRef.current
    if (!v || !near) return
    v.muted = muted
    if (visible && !paused && !reduced && !document.hidden) {
      const p = v.play()
      if (p?.catch)
        p.catch(() => {
          // Sound not allowed yet: fall back to muted playback rather than a frozen frame
          if (!v.muted) {
            v.muted = true
            setMuted(true)
            v.play().catch(() => setBlocked(true))
          } else setBlocked(true)
        })
    } else {
      v.pause()
    }
  }, [index, near, visible, paused, reduced]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  useEffect(() => {
    const onVis = () => {
      const v = videoRef.current
      if (!v) return
      if (document.hidden) v.pause()
      else if (visible && !paused && !reduced) v.play().catch(() => {})
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [visible, paused, reduced])

  useEffect(() => {
    if (!blocked || !visible || reduced) return undefined
    const t = setTimeout(next, FALLBACK_MS)
    return () => clearTimeout(t)
  }, [blocked, visible, reduced, next])

  useEffect(() => {
    const img = new Image()
    img.src = painVideo((index + 1) % COUNT).poster
  }, [index])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      setPaused(false)
      v.play().catch(() => {})
    } else {
      setPaused(true)
      v.pause()
    }
  }

  // Unmute/mute from a click: the click is a user gesture, so play() with sound is allowed here
  const setSound = (on) => {
    const v = videoRef.current
    setMuted(!on)
    if (!v) return
    v.muted = !on
    if (on) {
      setPaused(false)
      setBlocked(false)
      v.play().catch(() => {})
    }
  }

  const { src, poster } = painVideo(index)
  const point = painPoints[index]
  const upNext = painPoints[(index + 1) % COUNT]
  const isPaused = paused || (!playing && (reduced || blocked))

  return (
    <div ref={rootRef} className="pain" role="group" aria-roledescription="carousel" aria-label="Eight common pain points">
      {/* ---------- 1 · Video ---------- */}
      <div className="pain__video">
        <div className="pain__frame">
          {near ? (
            <video
              key={src}
              ref={videoRef}
              className="pain__media"
              src={src}
              poster={poster}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-label={`Video: ${point.title}`}
              onClick={() => (muted ? setSound(true) : togglePlay())}
              onEnded={next}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onPlaying={() => setBlocked(false)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.duration) setProgress(v.currentTime / v.duration)
              }}
            />
          ) : (
            <img className="pain__media" src={poster} alt="" width="360" height="640" loading="lazy" decoding="async" />
          )}

          <span className="pain__badge pain__badge--live">
            <i aria-hidden="true" /> Video {index + 1}/{COUNT}
          </span>

          {muted && (
            <button type="button" className="pain__unmute" onClick={() => setSound(true)}>
              <span className="pain__eq" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              Tap to unmute
            </button>
          )}

          {isPaused && (
            <button type="button" className="pain__bigplay" onClick={togglePlay} aria-label="Play video">
              <Svg name="play" />
            </button>
          )}

          <div className="pain__controls">
            <button type="button" className="pain__ctl" onClick={togglePlay} aria-label={isPaused ? "Play" : "Pause"}>
              <Svg name={isPaused ? "play" : "pause"} />
            </button>
            <span className="pain__bar" aria-hidden="true">
              <i style={{ transform: `scaleX(${progress})` }} />
            </span>
            <button
              type="button"
              className="pain__ctl"
              onClick={() => setSound(muted)}
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={!muted}
            >
              <Svg name={muted ? "muted" : "sound"} />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- 2 · Pain point ---------- */}
      <div className="pain__copy" aria-live="polite">
        <span className="pain__chip">
          <b>{String(index + 1).padStart(2, "0")}</b> Pain point {index + 1} of {COUNT}
        </span>
        <h3 key={index} className="pain__title">
          {point.title}
        </h3>
        <p key={`t${index}`} className="pain__text">
          {point.text}
        </p>

        <button type="button" className="pain__next" onClick={next}>
          <span>Up next</span>
          <strong>{upNext.title}</strong>
          <em aria-hidden="true">→</em>
        </button>

        <div className="pain__nav">
          <button type="button" className="pain__arrow" onClick={() => go(index - 1)} aria-label="Previous pain point">
            ‹
          </button>
          <div className="pain__dots" role="tablist" aria-label="Choose a pain point">
            {painPoints.map((p, i) => (
              <button
                key={p.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Pain point ${i + 1}: ${p.title}`}
                className={i === index ? "is-on" : ""}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button type="button" className="pain__arrow" onClick={() => go(index + 1)} aria-label="Next pain point">
            ›
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
