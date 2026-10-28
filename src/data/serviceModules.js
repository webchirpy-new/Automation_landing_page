import {
  siWhatsapp,
  siGmail,
  siGooglesheets,
  siGooglecalendar,
  siHubspot,
  siZoho,
  siInstagram,
  siFacebook,
  siGoogleads,
  siSlack,
  siGoogledocs,
  siGoogleforms,
  siMeta,
} from "simple-icons"
import { engine } from "./automationContent"

/**
 * Example tools & channels. Brand marks are the official single-colour paths
 * from Simple Icons (CC0). They are EXAMPLES ONLY — the DOCX describes eight
 * services, not an approved integration roster. Custom tiles (`pixel`) use our
 * own PixelIcon glyphs instead of an invented brand.
 */
export const tools = {
  whatsapp: { name: "WhatsApp", icon: siWhatsapp },
  gmail: { name: "Gmail", icon: siGmail },
  sheets: { name: "Google Sheets", icon: siGooglesheets },
  calendar: { name: "Google Calendar", icon: siGooglecalendar },
  hubspot: { name: "HubSpot", icon: siHubspot },
  zoho: { name: "Zoho CRM", icon: siZoho },
  instagram: { name: "Instagram", icon: siInstagram },
  facebook: { name: "Facebook", icon: siFacebook },
  meta: { name: "Meta Ads", icon: siMeta },
  googleads: { name: "Google Ads", icon: siGoogleads },
  slack: { name: "Slack", icon: siSlack },
  docs: { name: "Google Docs", icon: siGoogledocs },
  forms: { name: "Google Forms", icon: siGoogleforms },
  webform: { name: "Website form", pixel: "form" },
  email: { name: "Email", pixel: "mail" },
  phone: { name: "Calls / voice", pixel: "headset" },
  chat: { name: "AI chat assistant", pixel: "chat" },
  crm: { name: "CRM", pixel: "crm" },
  invoice: { name: "Invoice / PDF", pixel: "invoice" },
  report: { name: "Dashboard", pixel: "chart" },
  leadcap: { name: "Lead Capture", pixel: "leadCapture" },
  followup: { name: "Follow-up", pixel: "followUp" },
}

/** Which of the eight parts a channel feeds — used by the hero constellation. */
export const toolRoutes = {
  whatsapp: ["Lead Capture", "Instant Reply", "Follow-up"],
  webform: ["Lead Capture", "Back Office"],
  gmail: ["Lead Capture", "Follow-up"],
  phone: ["Lead Capture", "Instant Reply"],
  sheets: ["Back Office", "Insights"],
  calendar: ["Operations"],
  hubspot: ["Sales Pipeline"],
  instagram: ["Lead Capture"],
  meta: ["Lead Capture"],
  googleads: ["Lead Capture"],
  docs: ["Back Office"],
  slack: ["Operations"],
  invoice: ["Back Office", "Retention"],
  report: ["Insights"],
  chat: ["Instant Reply"],
  leadcap: ["Lead Capture"],
  followup: ["Follow-up", "Sales Pipeline"],
}

const extras = {
  "lead-capture": {
    icon: "leadCapture",
    treatment: "folder",
    tools: ["whatsapp", "webform", "gmail", "phone", "meta", "googleads"],
    flow: "merge",
    steps: ["5 channels arrive", "One shared inbox", "Record created & tagged"],
  },
  "instant-reply": {
    icon: "instantReply",
    treatment: "folder",
    tools: ["chat", "whatsapp", "phone", "webform"],
    flow: "chat",
    steps: ["Question arrives", "AI drafts the answer", "Reply sent · person looped in if needed"],
  },
  operations: {
    icon: "operations",
    treatment: "stack",
    tools: ["calendar", "slack", "sheets"],
    flow: "schedule",
    steps: ["Booking request", "Slot confirmed", "Task handed to the next owner"],
  },
  "back-office": {
    icon: "backOffice",
    treatment: "stack",
    tools: ["sheets", "invoice", "docs", "report"],
    flow: "docs",
    steps: ["Data from forms & sheets", "Invoice filled", "Report built"],
  },
  "follow-up": {
    icon: "followUp",
    treatment: "sleeve",
    tools: ["whatsapp", "gmail", "invoice"],
    flow: "timeline",
    steps: ["Day 1", "Day 3", "Day 7"],
  },
  "sales-pipeline": {
    icon: "salesPipeline",
    treatment: "bento",
    tools: ["crm", "hubspot", "zoho"],
    flow: "kanban",
    steps: ["New", "Qualified", "Quote", "Won"],
  },
  retention: {
    icon: "retention",
    treatment: "sleeve",
    tools: ["whatsapp", "gmail", "invoice"],
    flow: "loop",
    steps: ["Renewal reminder", "Payment reminder", "Review request"],
  },
  insights: {
    icon: "insights",
    treatment: "bento",
    tools: ["report", "sheets"],
    flow: "insights",
    steps: ["Data from all seven parts", "One dashboard", "Weekly AI summary"],
  },
}

export const serviceModules = engine.parts.map((p, i) => ({ ...p, ...extras[p.id], index: i }))

export const moduleByName = Object.fromEntries(serviceModules.map((m) => [m.part, m]))
export const moduleById = Object.fromEntries(serviceModules.map((m) => [m.id, m]))
