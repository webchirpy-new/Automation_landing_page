import React from "react"
import PixelIcon from "./PixelIcon"
import { tools } from "../../data/serviceModules"

/**
 * Neutral tile holding an unmodified brand mark (Simple Icons path, brand hex)
 * or one of our own pixel glyphs. Only the CONTAINER is animated — never the logo.
 */
export default function AppTile({ id, size = 48, showLabel = false, className = "", as: Tag = "span", ...rest }) {
  const tool = tools[id]
  if (!tool) return null
  const glyph = Math.round(size * 0.5)
  return (
    <Tag className={`app-tile ${className}`} style={{ "--tile": `${size}px` }} {...rest}>
      <span className="app-tile__face" aria-hidden="true">
        {tool.icon ? (
          <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill={`#${tool.icon.hex}`} focusable="false">
            <path d={tool.icon.path} />
          </svg>
        ) : (
          <PixelIcon name={tool.pixel} size={glyph} />
        )}
      </span>
      {showLabel ? <span className="app-tile__label">{tool.name}</span> : <span className="sr-only">{tool.name}</span>}
    </Tag>
  )
}
