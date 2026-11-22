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
 * Copy tightened Nov 2026 for scannability (hero body, lists, stat labels). CTA buttons and
 * under-button lines are unchanged. Do not edit these strings without client approval.
 */
import { hero as heroPage1, uiCopy } from "./automationContent"
import { siteConfig } from "../config/site"

const UNDER_BUTTON = "Free automation audit · 15–30 minutes · No obligation"

const page1 = {
  ...heroPage1,
  // "Where leads leak" list hidden for now. Restore the line below to bring it back.
  // list: { title: heroPage1.listTitle, ordered: false, items: heroPage1.leaks, icons: ["form", "chat", "clock", "chart"] },
  list: null,
  // The 7x / 60x / 23% figures show with a "citation pending confirmation" note until the client
  // confirms a source and turns VITE_SHOW_HERO_SOURCE_LINE on.
  results: heroPage1.results,
  footnote: siteConfig.showHeroSourceLine ? { text: heroPage1.sourceLine, mono: false } : { text: uiCopy.statsNote, mono: true },
}

export const landingPages = {
  "vsl-01": page1,

  "vsl-02": {
    eyebrow: "AI Automation for faster lead response",
    headline: "The 5-minute lead test.",
    punchLine: "Time your own reply.",
    body:
      "Reply in hours and a competitor has already called them. Our AI Automation Engine replies in seconds, day or night, and hands the lead to the right person.",
    // 3-step list hidden. Restore the block below to bring it back.
    // list: {
    //   ordered: true,
    //   items: [
    //     "Send your business a test enquiry",
    //     "See who gets it, and where it's logged",
    //     "Did the reply beat 5 minutes?",
    //   ],
    //   icons: ["form", "people", "clock"],
    // },
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on why the first reply wins",
    resultsHeading: "Why 5 minutes decides the sale",
    results: [
      { value: "21x", label: "More likely to qualify a lead replying in 5 minutes vs 30" },
      { value: "7x", label: "More likely to qualify a lead replying within the hour" },
      { value: "42 hrs", label: "Average reply time to an online lead" },
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
    headline: "How did your business do yesterday?",
    punchLine: "One screen. Every morning.",
    body:
      "Know without calling anyone. Our AI Automation Engine pulls Excel, Tally, CRM and WhatsApp into one live dashboard on your phone.",
    // List hidden. Restore the block below to bring it back.
    // list: {
    //   ordered: false,
    //   items: [
    //     "Leads: how many, from where",
    //     "Follow-ups: replied or overdue",
    //     "Payments: received or pending",
    //   ],
    //   icons: ["form", "chat", "invoice"],
    // },
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on running it from one screen",
    resultsHeading: "What one dashboard gives you",
    results: [
      { value: "1", label: "Screen for sales, follow-ups and payments" },
      { value: "0", label: "Calls to know how yesterday went" },
      { value: "Daily", label: "Summary on your phone each morning" },
    ],
    footnote: { text: "How the AI Automation Engine works for every business.", mono: false },
    button: "SHOW ME MY BUSINESS ON ONE SCREEN →",
    underButton: UNDER_BUTTON,
  },

  "vsl-04": {
    eyebrow: "Automate workflows, cut manual work",
    headline: "Your best people are doing data entry.",
    punchLine: "Give them their day back.",
    body:
      "The same details get typed into a sheet, the CRM and the invoice, twenty times a day. Our AI Automation Engine moves the data and sends the reminders, so your team focuses on customers.",
    // List hidden. Restore the block below to bring it back.
    // list: {
    //   title: "Still done by hand",
    //   ordered: false,
    //   items: [
    //     "Copying data between apps",
    //     "Payment reminders",
    //     "Status sheet updates",
    //     "Chasing approvals",
    //     "Weekly reports",
    //   ],
    //   icons: ["branch", "invoice", "crm", "chat", "chart"],
    // },
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on the hours lost to copy-paste",
    resultsHeading: "How much of the day could run itself",
    results: [
      { value: "Up to 30%", label: "Of work hours automatable by 2030" },
      { value: "60–70%", label: "Of staff time is on tasks AI could automate" },
      { value: "0", label: "Details typed twice once tools connect" },
    ],
    footnote: { text: "Source: McKinsey Global Institute research on generative AI and the future of work.", mono: false },
    button: "GIVE MY TEAM ITS DAY BACK →",
    underButton: UNDER_BUTTON,
  },

  // Client figures: first reply 3 hours → 3 minutes, 10 lost leads recovered a month,
  // 3 channels (WhatsApp, website form, email — as named in the #story section).
  "vsl-05": {
    eyebrow: "A real AI Automation story",
    headline: "Leads lost in email alerts. Now answered in 3 minutes.",
    punchLine: "Here's how.",
    body:
      "Enquiries came in on WhatsApp, web forms and email, and buried alerts meant lost leads. Webchirpy built one AI lead dashboard that follows up automatically.",
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: the story behind 3 hours to 3 minutes",
    resultsHeading: "What changed for this business",
    results: [
      { value: "3 hrs → 3 min", label: "First reply time" },
      { value: "10", label: "Lost leads recovered every month" },
      { value: "3", label: "Channels brought into one dashboard" },
    ],
    footnote: { text: "Figures and context from the business itself.", mono: false },
    button: "READ THE FULL CASE STUDY →",
    underButton: "Figures and context from the business itself",
  },

  "vsl-06": {
    eyebrow: "Automate workflows across every tool",
    headline: "Ten apps. Zero connection.",
    punchLine: "Make them work as one.",
    body:
      "You pay for a CRM, accounts, WhatsApp and Sheets, yet your team still copies data by hand. Our AI Automation Engine connects them, so nothing is typed twice.",
    // List hidden. Restore the block below to bring it back.
    // list: {
    //   ordered: true,
    //   items: ["Website and forms", "WhatsApp and email", "CRM", "Accounts", "One automated workflow"],
    //   icons: ["form", "mail", "crm", "invoice", "operations"],
    // },
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on making your tools work as one",
    resultsHeading: "What connected tools give you",
    results: [
      { value: "1", label: "Workflow across every app" },
      { value: "0", label: "Details typed twice" },
      { value: "Every", label: "Tool you already pay for, connected" },
    ],
    footnote: { text: "How the AI Automation Engine works for every business.", mono: false },
    button: "CONNECT MY TOOLS →",
    underButton: UNDER_BUTTON,
  },

  "vsl-07": {
    eyebrow: "Three uncomfortable questions",
    headline: "Are you really running your business?",
    punchLine: "Answer these three.",
    body:
      "Can't answer without calls or scrolling chats? You're running on memory. Our AI Automation Engine tracks every lead, follow-up and payment, and flags problems early.",
    // List hidden. Restore the block below to bring it back.
    // list: {
    //   ordered: true,
    //   items: [
    //     "Leads replied to within an hour yesterday?",
    //     "Follow-ups overdue today?",
    //     "Payments pending this week?",
    //   ],
    //   icons: ["clock", "help", "invoice"],
    // },
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on systems, not memory",
    resultsHeading: "What running on systems looks like",
    results: [
      { value: "24/7", label: "Tracking of leads, follow-ups, payments" },
      { value: "0", label: "Follow-ups left to memory" },
      { value: "1", label: "Screen that flags what needs you today" },
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
      "A ChatGPT caption now and then isn't AI adoption. Our AI Automation Engine works daily in your inbox, CRM and WhatsApp: reading enquiries, drafting replies, updating records.",
    // List hidden. Restore the block below to bring it back.
    // list: {
    //   title: "Still done by hand?",
    //   ordered: false,
    //   items: [
    //     "Answering repeat questions",
    //     "Sorting enquiries",
    //     "Updating records",
    //     "Writing follow-ups",
    //     "Weekly reports",
    //   ],
    //   icons: ["chat", "form", "crm", "mail", "chart"],
    // },
    list: null,
    logoStripHeading: "Businesses that trust Webchirpy",
    videoCaption: "Watch first: Vasanth Sampathkumar on putting AI to real work",
    resultsHeading: "Everyone uses AI. Few put it to work.",
    results: [
      { value: "88%", label: "Of organisations use AI somewhere in the business" },
      { value: "1 in 3", label: "Have scaled AI beyond pilots" },
      { value: "39%", label: "See real earnings impact from AI" },
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
