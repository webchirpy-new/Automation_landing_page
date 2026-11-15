import React from "react"
import {
  BadgeCheck,
  ChartColumn,
  ChartColumnIncreasing,
  Check,
  CircleHelp,
  ClipboardList,
  Clock,
  FileText,
  HeartHandshake,
  Headset,
  Inbox,
  Mail,
  MessageSquareText,
  MessagesSquare,
  CalendarCheck,
  Play,
  Receipt,
  Repeat,
  TrendingUp,
  Users,
  Workflow,
  X,
  Contact,
} from "lucide-react"

/**
 * Site icon set — Lucide (lucide-react). The component keeps its original name and props
 * (name, size, title, className, animate) so every caller works unchanged; the old pixel-art
 * glyphs are replaced by the matching Lucide icon. Icons draw in `currentColor`.
 * Brand logos (WhatsApp, Gmail, HubSpot…) are not here: they stay in AppTile (simple-icons).
 */
const ICONS = {
  // The eight parts of the engine
  leadCapture: Inbox,
  instantReply: MessageSquareText,
  operations: CalendarCheck,
  backOffice: ClipboardList,
  followUp: Repeat,
  salesPipeline: ChartColumnIncreasing,
  retention: HeartHandshake,
  insights: TrendingUp,
  // Channels, tools and UI glyphs
  branch: Workflow,
  form: FileText,
  mail: Mail,
  headset: Headset,
  chat: MessagesSquare,
  crm: Contact,
  invoice: Receipt,
  chart: ChartColumn,
  check: Check,
  cross: X,
  help: CircleHelp,
  clock: Clock,
  play: Play,
  people: Users,
  seal: BadgeCheck,
}

export default function PixelIcon({ name, size = 24, title, className = "", animate: _animate }) {
  const Icon = ICONS[name]
  if (!Icon) return null
  // Small icons get a slightly heavier stroke so they stay crisp at 10–14px
  const strokeWidth = size <= 14 ? 2.5 : 2
  return (
    <Icon
      className={`px-icon px-icon--${name} ${className}`}
      size={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={false}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    />
  )
}
