import React from "react"
import { Pause, Play } from "lucide-react"

/**
 * Small, quiet playback control for the motion stories (used by the dashboard).
 * Icon buttons with text labels for assistive tech; 40px hit targets.
 */
export function PlayToggle({ playing, onToggle, label = "animation", className = "" }) {
  const Icon = playing ? Pause : Play
  return (
    <button
      type="button"
      className={`story-btn ${className}`}
      onClick={onToggle}
      aria-label={playing ? `Pause ${label}` : `Play ${label}`}
      title={playing ? "Pause" : "Play"}
    >
      <Icon size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  )
}
