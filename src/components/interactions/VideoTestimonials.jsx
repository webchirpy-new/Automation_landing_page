import React, { useEffect, useRef, useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { TESTIMONIALS } from "../../data/testimonials"
import { uiCopy } from "../../data/automationContent"
import { Marked } from "../ui/Highlight"

/**
 * VideoTestimonials — four portrait client videos in phone-style frames.
 *
 * Each card rests on a frame of the speaker (a media-fragment poster, so no extra image files).
 * Pressing play starts that video from the beginning with sound; only one plays at a time and
 * the others step back. Videos load metadata only until they are played.
 */
const t = uiCopy.testimonials

const fmt = (sec) => {
  if (!Number.isFinite(sec)) return ""
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

function VideoCard({ item, index, active, onActivate, onEnded }) {
  const video = useRef(null)
  const started = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [duration, setDuration] = useState(NaN)
  const [progress, setProgress] = useState(0)

  // Another card took over: pause this one.
  useEffect(() => {
    if (!active && video.current && !video.current.paused) video.current.pause()
  }, [active])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      if (!started.current) {
        v.currentTime = 0 // the poster fragment left it on the speaker; the story starts at 0
        started.current = true
      }
      onActivate()
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }

  const label = `${playing ? t.pause : t.play}: ${item.name}`

  return (
    <li className="vt-card" data-playing={playing || undefined} data-active={active || undefined} style={{ "--k": index }}>
      <div className="vt-frame">
        <video
          ref={video}
          className="vt-video"
          src={`${item.src}#t=${item.poster}`}
          preload="metadata"
          playsInline
          muted={muted}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            if (started.current) setProgress(v.duration ? v.currentTime / v.duration : 0)
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setProgress(0)
            started.current = false
            onEnded()
          }}
          onClick={toggle}
        />
        <span className="vt-shade" aria-hidden="true" />

        <span className="vt-chip t-mono" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
          {Number.isFinite(duration) && <span> · {fmt(duration)}</span>}
        </span>

        <button type="button" className="vt-play" onClick={toggle} aria-label={label}>
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>

        {started.current && (
          <button type="button" className="vt-mute" onClick={() => setMuted((m) => !m)} aria-label={muted ? t.unmute : t.mute} aria-pressed={muted}>
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </button>
        )}

        <span className="vt-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>

      <div className="vt-meta">
        <p className="vt-name">{item.name}</p>
        <p className="vt-role">
          {item.role}
          {item.place && <span className="vt-place"> · {item.place}</span>}
        </p>
      </div>
    </li>
  )
}

export default function VideoTestimonials({ heading, phrase }) {
  const [active, setActive] = useState(null)

  return (
    <div className="vt">
      <header className="vt-head">
        <h3 className="t-h2 vt-title" data-reveal>
          <Marked text={heading} phrase={phrase} tone="dark" />
        </h3>
        <p className="vt-sub t-mono" data-reveal>
          <span className="vt-sub__dot" aria-hidden="true" />
          {t.count}
        </p>
      </header>

      <ul className="vt-grid" aria-label={t.listLabel}>
        {TESTIMONIALS.map((item, i) => (
          <VideoCard
            key={item.id}
            item={item}
            index={i}
            active={active === item.id}
            onActivate={() => setActive(item.id)}
            onEnded={() => setActive((a) => (a === item.id ? null : a))}
          />
        ))}
      </ul>
    </div>
  )
}
