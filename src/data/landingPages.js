/**
 * LANDING PAGES 1–8 — hero copy per page.
 *
 * Page 1 reuses `hero` from automationContent.js. Pages 2–8 are extracted verbatim from
 * "3-2_AI Automation Engine – Landing Pages 2–8 Hero Content.docx" (Oct 23, 2026 · @Webchirpy):
 * "All sections below the hero are the same as Landing Page 1", so only the hero changes.
 * Page title / meta / OG tags for each page live in its own HTML file at the project root.
 *
 * Shape (every page):
 *   eyebrow, headline, punchLine, body, button, underButton, videoCaption, resultsHeading
 *   list        { title?, ordered, items[], icons[] } | null — the card row under the fold
 *   results     [{ value, label }] — values that are not a plain number render as text
 *   footnote    { text, mono } — the line under the results panel
 *
 * Do not edit these strings without client approval.
 */
import { hero as heroPage1, uiCopy } from "./automationContent"
import { siteConfig } from "../config/site"

const UNDER_BUTTON = "Free automation audit · 15–30 minutes · No obligation"

const page1 = {
  ...heroPage1,
  list: { title: heroPage1.listTitle, ordered: false, items: heroPage1.leaks, icons: ["form", "chat", "clock", "chart"] },
  // The DOCX source line for page 1 does not cite the figures, so it stays behind a flag
  footnote: siteConfig.showHeroSourceLine ? { text: heroPage1.sourceLine, mono: false } : { text: uiCopy.statsNote, mono: true },
}

export const landingPages = {
  "vsl-01": page1,

  "vsl-02": {
    eyebrow: "AI Automation for faster lead response",
    headline: "The 5-minute lead test.",
    punchLine: "Time your own reply.",
    body:
      "The business that replies first usually wins the customer. If your reply takes hours, a competitor has already called them. The AI Automation Engine replies in seconds, day or night, and passes the lead to the right person with the details already filled in.",
    list: {
      ordered: true,
      items: [
        "Send a test enquiry to your own business",
        "Check who sees it and where it is recorded",
        "Compare the reply time with 5 minutes",
      ],
      icons: ["form", "people", "clock"],
    },
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on why the first reply wins the customer",
    resultsHeading: "Why 5 minutes decides who wins the customer",
    results: [
      { value: "21x", label: "More likely to qualify a lead when you reply within 5 minutes, not 30" },
      { value: "7x", label: "More likely to qualify a lead when you reply within the hour" },
      { value: "42 hrs", label: "Average time businesses take to reply to an online lead" },
    ],
    footnote: {
      text: "Sources: Lead Response Management Study (Dr. James Oldroyd, MIT and InsideSales); Harvard Business Review, \"The Short Life of Online Sales Leads\".",
      mono: false,
    },
    button: "TEST MY REPLY SPEED →",
    underButton: UNDER_BUTTON,
  },

  "vsl-03": {
    eyebrow: "AI Automation for data-driven decisions",
    headline: "Can you tell how your business did yesterday, without calling anyone?",
    punchLine: "One screen. Every morning.",
    body:
      "Your numbers sit in Excel, Tally, the CRM and WhatsApp, so every report means chasing people. The AI Automation Engine pulls them into one live dashboard on your phone, so your decisions come from data, not guesswork.",
    list: {
      ordered: false,
      items: [
        "Leads: how many came in, and from where",
        "Follow-ups: what got a reply, what is overdue",
        "Payments: received, pending and due this week",
      ],
      icons: ["form", "chat", "invoice"],
    },
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on running a business from one screen",
    resultsHeading: "What one live dashboard gives you",
    results: [
      { value: "1", label: "Screen for sales, follow-ups and payments" },
      { value: "0", label: "Calls to find out how yesterday went" },
      { value: "Daily", label: "Business summary on your phone every morning" },
    ],
    footnote: { text: "How the AI Automation Engine works for every business.", mono: false },
    button: "SHOW ME MY BUSINESS ON ONE SCREEN →",
    underButton: UNDER_BUTTON,
  },

  "vsl-04": {
    eyebrow: "Automate your workflows, cut the manual work",
    headline: "Your best people are doing data entry.",
    punchLine: "Give them their day back.",
    body:
      "The same customer details get typed into a sheet, then the CRM, then the invoice, twenty times a day. The AI Automation Engine moves data between your tools and sends the routine reminders, so your team spends its time on customers, not copy-paste.",
    list: {
      title: "Still done by hand today",
      ordered: false,
      items: [
        "Copying details between apps",
        "Sending payment reminders",
        "Updating status sheets",
        "Chasing approvals on WhatsApp",
        "Building reports every week",
      ],
      icons: ["branch", "invoice", "crm", "chat", "chart"],
    },
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on the hours your team loses to copy-paste",
    resultsHeading: "How much of the day could run itself",
    results: [
      { value: "Up to 30%", label: "Of hours worked could be automated by 2030" },
      { value: "60–70%", label: "Of employees' time goes to tasks today's AI could automate" },
      { value: "0", label: "Details typed twice once your tools are connected" },
    ],
    footnote: { text: "Source: McKinsey Global Institute research on generative AI and the future of work.", mono: false },
    button: "GIVE MY TEAM ITS DAY BACK →",
    underButton: UNDER_BUTTON,
  },

  // TEAM NOTE (DOCX): every [X] and [channels] must be replaced with the client's real figures
  // before publishing. Do not go live with the placeholders. The page ships with noindex until then.
  "vsl-05": {
    eyebrow: "A real AI Automation story",
    headline: "Leads lost in email alerts. Now answered in [X] minutes.",
    punchLine: "Here is how.",
    body:
      "One growing business was getting enquiries from [channels], but email alerts got buried and some leads were never followed up. Webchirpy built an AI-powered lead dashboard that brings every enquiry into one place and triggers the follow-up automatically. First reply time went from [X hours] to [X minutes].",
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: the story behind [X hours] to [X minutes]",
    resultsHeading: "What changed for this business",
    results: [
      { value: "[X hrs] → [X min]", label: "First reply time" },
      { value: "[X]", label: "Lost leads recovered every month" },
      { value: "[X]", label: "Channels brought into one dashboard" },
    ],
    footnote: { text: "Figures and context from the business itself.", mono: false },
    button: "READ THE FULL CASE STUDY →",
    underButton: "Figures and context from the business itself",
  },

  "vsl-06": {
    eyebrow: "Automate your workflows across every tool you use",
    headline: "Ten apps. Zero connection.",
    punchLine: "Make them work as one.",
    body:
      "You pay for a CRM, accounting software, WhatsApp Business and Google Sheets, yet your team still copies data between them by hand. The AI Automation Engine connects the tools you already use, so information moves on its own and nothing gets typed twice.",
    list: {
      ordered: true,
      items: ["Website and forms", "WhatsApp and email", "CRM", "Accounts", "One connected, automated workflow"],
      icons: ["form", "mail", "crm", "invoice", "operations"],
    },
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on making your tools work as one",
    resultsHeading: "What connected tools give you",
    results: [
      { value: "1", label: "Automated workflow across every app" },
      { value: "0", label: "Details typed twice" },
      { value: "Every", label: "Tool you already pay for, kept and connected" },
    ],
    footnote: { text: "How the AI Automation Engine works for every business.", mono: false },
    button: "CONNECT MY TOOLS →",
    underButton: UNDER_BUTTON,
  },

  "vsl-07": {
    eyebrow: "Three uncomfortable questions before you automate your workflows",
    headline: "Are you really running your business?",
    punchLine: "Answer these three.",
    body:
      "If you cannot answer without making calls or scrolling through chats, your business is running on memory. The AI Automation Engine tracks every lead, follow-up and payment, and shows you what needs attention before it becomes a problem.",
    list: {
      ordered: true,
      items: [
        "How many leads got a reply within an hour yesterday?",
        "Which follow-ups are overdue today?",
        "Which payments are still pending this week?",
      ],
      icons: ["clock", "help", "invoice"],
    },
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on running a business on systems, not memory",
    resultsHeading: "What running on systems looks like",
    results: [
      { value: "24/7", label: "Tracking of every lead, follow-up and payment" },
      { value: "0", label: "Follow-ups left to memory" },
      { value: "1", label: "Screen that flags what needs attention today" },
    ],
    footnote: { text: "How the AI Automation Engine works for every business.", mono: false },
    button: "SHOW ME WHAT NEEDS ATTENTION →",
    underButton: UNDER_BUTTON,
  },

  "vsl-08": {
    eyebrow: "AI Automation for everyday operations",
    headline: "Using AI, or just talking about it?",
    punchLine: "Put AI to work.",
    body:
      "Asking ChatGPT for a caption now and then is not AI adoption. The AI Automation Engine works inside your inbox, CRM and WhatsApp every day: reading enquiries, drafting replies, updating records and flagging what needs a person.",
    list: {
      title: "Still done by hand?",
      ordered: false,
      items: [
        "Replying to the same questions",
        "Sorting new enquiries",
        "Updating records",
        "Writing follow-up messages",
        "Summarising weekly reports",
      ],
      icons: ["chat", "form", "crm", "mail", "chart"],
    },
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on putting AI to real work every day",
    resultsHeading: "Everyone is using AI. Few are putting it to work.",
    results: [
      { value: "88%", label: "Of organisations now use AI in at least one part of the business" },
      { value: "1 in 3", label: "Have scaled AI beyond small pilots" },
      { value: "39%", label: "See any real impact on their earnings from AI" },
    ],
    footnote: { text: "Source: McKinsey, \"The State of AI in 2025\".", mono: false },
    button: "PUT AI TO WORK IN MY BUSINESS →",
    underButton: UNDER_BUTTON,
  },
}

/** The page this HTML entry renders: `<div id="root" data-page="vsl-02">`. Falls back to page 1. */
export function resolvePageId() {
  const id = typeof document !== "undefined" ? document.getElementById("root")?.dataset.page : null
  return id && landingPages[id] ? id : "vsl-01"
}

/** Resolved once per load: each HTML entry is its own page, so this never changes at runtime. */
export const pageId = resolvePageId()
export const pageHero = landingPages[pageId]
