/**
 * APPROVED SOURCE COPY — extracted verbatim from
 * "3-1_AI Automation Engine – Landing Page 1 Content.docx" (Oct 23, 2026 · @Webchirpy).
 *
 * Do not edit these strings without client approval. New UI microcopy (hints,
 * tooltips, honesty labels) lives in `uiCopy` at the bottom, clearly separated.
 */

export const meta = {
  fileName: "vsl-01-paying-for-leads-where-are-they-going.html",
  pageTitle: "You're Paying for Leads. Where Are They Going? | AI Automation Engine",
  metaDescription:
    "Your problem may not be a lack of leads. See where enquiries leak, from late replies to forgotten follow-ups, and how AI automation captures and follows up every lead.",
  ogTitle: "You're Paying for Leads. Where Are They Going?",
}

/* 01 — HERO */
export const hero = {
  eyebrow: "AI Automation for lead conversion",
  headline: "You're paying for leads. Where are they going?",
  punchLine: "Find the leaks.",
  body:
    "More leads will not fix a leaking process. Enquiries slip through late replies, forgotten follow-ups and inboxes nobody checks. The AI Automation Engine captures every lead from every channel, replies instantly and follows up until the customer responds.",
  listTitle: "Where leads leak",
  leaks: [
    "Website forms checked once a day",
    "WhatsApp chats on one person's phone",
    "Follow-ups that depend on memory",
    "No record of which leads became customers",
  ],
  logoStripHeading: "Businesses that trust Webchirpy",
  videoCaption: "Watch first: Vasanth Sampathkumar on why leads leak, and how AI catches every one",
  resultsHeading: "Why every minute decides who wins the lead",
  results: [
    { value: "7x", label: "More likely to qualify a lead when you reply within an hour" },
    { value: "60x", label: "More likely than businesses that wait a day to reply" },
    { value: "23%", label: "Of companies never reply to an online lead at all" },
  ],
  // REQUIRES STAT SOURCE CONFIRMATION — this line describes a Webchirpy project,
  // not the origin of the figures above. Rendered only when siteConfig.showHeroSourceLine.
  sourceLine:
    "Source: Built by Webchirpy: The Young Reporters for the Environment 2026 portal for Taylor’s University, GGAF and RTM. One automated platform runs registration, team invites, blind judging and verified certificates, with zero spreadsheets.",
  button: "SHOW ME WHERE MY LEADS LEAK →",
  underButton: "Free automation audit · 15–30 minutes · No obligation",
}

/* 02 — THE PATTERN */
export const pattern = {
  headline: "You work hard every day. So why does work keep slipping through?",
  chips: [
    "A team that works long hours",
    "Customers who want to buy",
    "Website, WhatsApp, sheets and software already in place",
  ],
  label: "The pattern",
  lines: [
    "The enquiry waits till morning.",
    "The report takes all of Friday.",
    "The follow-up waits for someone to remember.",
  ],
  sameTeam: "Same team. Same effort. And hours still disappear.",
  chartTitle: "Where your team's week goes",
  chartLabels: ["Customer work", "Manual work", "Repeat replies", "Data entry", "Chasing follow-ups"],
  closingLine:
    "It is not your team's effort, and not the number of leads. It is the work nobody should be doing by hand.",
  subLine: "Same hardworking team. Hours back every week.",
}

/* 03 — TWO TYPES OF BUSINESSES */
export const comparison = {
  headline: "Two types of businesses. Which one are you?",
  sub: "The difference is not how hard your team works. It is how much of the work runs on its own.",
  room1: { name: "Room 1: The Manual Grind", title: "The Manual Grind", tagline: "Hard work and memory" },
  room2: { name: "Room 2: The Automated Business", title: "The Automated Business", tagline: "Systems that run themselves" },
  rows: [
    {
      row: "When a customer reaches out",
      manual: "It lands in one of five inboxes and waits",
      automated: "Captured in one place, answered in seconds",
    },
    {
      row: "After hours",
      manual: "The enquiry waits till morning, and buys elsewhere",
      automated: "The AI assistant replies, qualifies and books, 24/7",
    },
    {
      row: 'After "I\'ll think about it"',
      manual: "The follow-up depends on someone remembering",
      automated: "Follow-ups go out on time until they respond",
    },
    {
      row: "Daily admin",
      manual: "Hours of copy-paste, data entry, invoices and reports",
      automated: "Routine work runs itself, and the team focuses on customers",
    },
    {
      row: "Next month",
      manual: "More work means hiring more people",
      automated: "More work, same team, clear numbers on one screen",
    },
  ],
  closingQuestion: "Which room are you in today?",
  link: "Find out in 60 seconds with the free scorecard ↓",
}

/* 04 — AUTOMATION SCORECARD */
export const scorecard = {
  label: "Free 60-second automation scorecard",
  headline: "Score your business. Find your gaps.",
  // Launch Kit 01 §02.1 intro copy
  sub:
    "Tick what sounds like your week. Be honest; nobody sees this but you. At the end you get your score, your 3 biggest gaps and what to fix first.",
  counter: {
    title: "Automation scorecard",
    areas: "8 areas",
    checks: "16 quick checks",
    sampleScore: "100/100", // DOCX sample — only shown once all areas are assessed
    sampleGaps: "0 of 16 gaps",
  },
  helper: "Tick what is true for your business. Your map updates as you go.",
  areas: [
    {
      id: "lead-capture",
      area: "Lead Capture",
      promise: "Every enquiry in one place",
      checks: [
        "Enquiries arrive on WhatsApp, email, calls and forms, and nobody sees them all together.",
        "I cannot say how many enquiries we got last month.",
      ],
    },
    {
      id: "instant-reply",
      area: "Instant Reply",
      promise: "Answer in seconds, day or night",
      checks: [
        "After hours and on weekends, enquiries wait until someone is free.",
        "My team types the same answers to the same questions every day.",
      ],
    },
    {
      id: "follow-up",
      area: "Follow-up",
      promise: "Never let a lead go cold",
      checks: [
        'When a customer says "I\'ll think about it", we rarely follow up.',
        "Follow-ups depend on someone remembering.",
      ],
    },
    {
      id: "sales-pipeline",
      area: "Sales Pipeline",
      promise: "See every lead become a sale",
      checks: [
        "I do not know how many leads became paying customers.",
        "Quotes go out and nobody tracks what happened next.",
      ],
    },
    {
      id: "operations",
      area: "Operations",
      promise: "Run bookings and tasks smoothly",
      checks: [
        "Bookings, orders and schedules live in chats, calls and notebooks.", // Kit 01: "+ orders"
        "Tasks get lost when they pass from one person to another.",
      ],
    },
    {
      id: "back-office",
      area: "Back Office",
      promise: "Stop copy-paste work",
      checks: [
        "My team spends hours copying data between sheets, apps and invoices.",
        "Reports are made by hand at the end of the month.",
      ],
    },
    {
      id: "retention",
      area: "Retention",
      promise: "Bring customers back",
      checks: [
        "Renewals, repeat orders and payment reminders depend on someone remembering.",
        "We rarely ask happy customers for reviews or referrals.",
      ],
    },
    {
      id: "insights",
      area: "Insights",
      promise: "Decide on numbers, not guesswork",
      checks: [
        "I cannot see how the business is doing without asking someone.",
        "I cannot see which part of the business wastes the most time.",
      ],
    },
  ],
  button: "GET MY FREE AUTOMATION PLAN",
  underButton: "Free 15–30 minute call. We walk you through your scorecard.",

  /* Launch Kit 01 §02.3 — one tap each, after the 8 areas. They never change the score. */
  context: [
    {
      id: "aiUse",
      question: "How does your business use AI today?",
      options: [
        { id: "none", label: "Not at all" },
        { id: "writing", label: "Staff use AI chat tools for writing, like posts or emails" },
        { id: "tried", label: "We tried a chatbot or AI tool, it did not stick" },
        { id: "real", label: "AI already does some real daily work for us" },
      ],
    },
    {
      id: "enquiries",
      question: "Roughly how many enquiries do you get in a month?",
      options: [
        { id: "under-50", label: "Under 50" },
        { id: "50-200", label: "50 to 200" },
        { id: "200-1000", label: "200 to 1,000" },
        { id: "over-1000", label: "Over 1,000" },
        { id: "not-sure", label: "Not sure" }, // Kit 01: itself a Lead Capture gap (report text)
      ],
    },
  ],

  /* Launch Kit 01 §03.2 — bands and on-screen message */
  bands: [
    {
      minGaps: 0,
      maxGaps: 3,
      name: "Running on systems",
      message:
        "Most of your business already runs without someone having to remember. The gains left are smaller and specific. Your report shows the one or two worth fixing.",
    },
    {
      minGaps: 4,
      maxGaps: 8,
      name: "Leaking in places",
      message:
        "Your team covers the gaps with effort. That works until the busiest week of the month. Your report shows the 3 leaks to fix first, and which one usually pays back fastest.",
    },
    {
      minGaps: 9,
      maxGaps: 12,
      name: "Running on effort",
      message:
        "A large share of your week depends on people typing, chasing and remembering. That is not a team problem. It is a system problem, and it can be fixed one step at a time.",
    },
    {
      minGaps: 13,
      maxGaps: 16,
      name: "Running on memory",
      message:
        "Almost everything depends on someone remembering. Do not start with a big project. Start with one quick win. Your report shows which one.",
    },
  ],

  /* Launch Kit 01 §03.3 — result screen (shown free, before any form) */
  result: {
    label: "Your automation score",
    gapsLine: (gaps, total) => `You ticked ${gaps} of ${total} gaps.`,
    biggestLine: "Your biggest gap is",
    topTitle: "Your 3 biggest gaps",
    contextTitle: "Two quick questions",
    contextNote: "One tap each. They do not change your score.",
    seeResult: "See my result",
    seeResultLeft: (n) => `See my result · ${n} ${n === 1 ? "area" : "areas"} left`,
  },
}

/*
 * Launch Kit 01 §04.2 — opportunity library, one block per area. Only `meaning` is shown on the
 * page today. `automateFirst`, `effort` and `firstResult` are for the WhatsApp report (Phase 4)
 * and must be confirmed by the delivery team before they are shown anywhere (D16).
 */
export const opportunityLibrary = {
  "lead-capture": {
    meaning: "Some enquiries are never seen, and nobody knows the real number.",
    automateFirst: "One lead list: WhatsApp Business, website forms, email and missed calls logged automatically, with the source of each.",
    effort: "Medium",
    firstResult: "2 to 3 wks",
  },
  "instant-reply": {
    meaning: "Enquiries that arrive after hours wait, and some buy elsewhere first.",
    automateFirst:
      "An instant first reply on WhatsApp and the website that answers common questions, captures the requirement and hands over to the team.",
    effort: "Low to Medium",
    firstResult: "1 to 2 wks",
  },
  "follow-up": {
    meaning: "Interested customers go quiet and nobody notices.",
    automateFirst: "Automatic follow-ups on day 1, 3 and 7 that stop the moment the customer replies.",
    effort: "Low",
    firstResult: "1 to 2 wks",
  },
  "sales-pipeline": {
    meaning: "You cannot see which leads became sales, or which quotes went cold.",
    automateFirst: "Simple pipeline stages, quote tracking, and a reminder when a quote gets no reply in 3 days.",
    effort: "Medium",
    firstResult: "3 to 4 wks",
  },
  operations: {
    meaning: "Orders and tasks get lost between people.",
    automateFirst: "Orders and bookings captured in one place, assigned automatically, with status updates sent to the customer.",
    effort: "Medium",
    firstResult: "3 to 4 wks",
  },
  "back-office": {
    meaning: "Skilled people spend hours retyping and building reports.",
    automateFirst: "Enter details once and they flow to the sheet, CRM and invoice. Month-end report built on a schedule.",
    effort: "Medium",
    firstResult: "2 to 4 wks",
  },
  retention: {
    meaning: "Payments, renewals and repeat orders slip, and happy customers are never asked for a review.",
    automateFirst: "Payment and renewal reminders on schedule, and a review request after delivery.",
    effort: "Low",
    firstResult: "1 to 2 wks",
  },
  insights: {
    meaning: "You find out how the business is doing by calling people.",
    automateFirst: "A short WhatsApp summary every morning, and one dashboard for leads, follow-ups and payments.",
    effort: "Medium to High",
    firstResult: "3 to 6 wks",
  },
}

/*
 * Dummy report form (Kit 01 §03.3, Kit 02 Form A). DEMO ONLY until Tally Form A replaces it
 * (Phase 4): it validates, then confirms that nothing was sent or stored.
 */
export const reportForm = {
  // Client change (15 Nov 2026): the team reaches out instead of a WhatsApp report (was Kit 01:
  // "Get your full report on WhatsApp." / "…Free. No call needed.")
  heading: "Fill in the form and our team will reach out to you.",
  body: "We will walk you through your top 3 gaps and what we would automate first in each. Free. No obligation.",
  demoBadge: "Demo form",
  demoNote: "This is a demo form. Nothing you enter is sent or stored.",
  fields: {
    name: "Your name",
    phone: "WhatsApp number",
    business: "Business name",
    years: "Years in business",
    team: "Team size",
  },
  yearsOptions: ["Less than 2", "2 to 5", "5 to 10", "10 to 20", "More than 20"],
  teamOptions: ["Just me", "2 to 4", "5 to 15", "16 to 50", "51 to 200", "More than 200"],
  selectPlaceholder: "Choose one",
  // Launch Kit 03 §03 — C1 v1.0 (required) and M1 v1.0 (optional). Draft wording pending legal review.
  consent: {
    version: "C1 v1.0",
    before: "I agree to Webchirpy using these details to send my report, book my call and contact me about it on WhatsApp, phone and email, as described in the ",
    link: "Privacy Notice",
    after: ".",
  },
  marketing: { version: "M1 v1.0", text: "Also send me occasional tips and updates on WhatsApp and email. I can stop anytime by replying STOP." },
  button: "ASK OUR TEAM TO REACH OUT →",
  errors: {
    name: "Please enter your name (2 to 60 characters).",
    phone: "Please enter a 10-digit mobile number. Our team will reach you here.", // Kit 02 wording, adapted
    business: "Please enter your business name (2 to 80 characters).",
    years: "Please choose how long you have been in business.",
    team: "Please choose your team size.",
    consent: "Please tick the box so our team can contact you.",
  },
  demoResult: {
    title: "Demo only: your request was not sent.",
    body: "Your details were checked but not sent or stored anywhere. Once this form is connected, our team will reach out to you.",
    callLine: "Want someone to walk you through it? Book 15 minutes with Vasanth.",
    callButton: "BOOK MY 15-MINUTE CALL →",
  },
  bookLink: "Or book a free call →",
  bookButton: "BOOK A FREE CALL →",
}

/* 05 — THE AI AUTOMATION ENGINE */
export const engine = {
  label: "The system that takes the load off your team",
  headline: "The AI Automation Engine.",
  sub:
    "Eight parts. One engine. From the first customer message to the last invoice, each part takes a load off your team, and all eight run together as one system.",
  wheelCentre: { title: "One Engine", sub: "8 parts, running together" },
  helper: "Tap a part to see what it covers",
  // Order follows the DOCX engine table.
  parts: [
    {
      id: "lead-capture",
      part: "Lead Capture",
      promise: "Every enquiry and form in one place",
      cover: [
        "One inbox for WhatsApp, website, email and calls",
        "Online forms and documents collected automatically",
        "Customer records created without typing",
        "Auto-tagging by source",
      ],
      produces: "No enquiry or form lost between channels",
      worksWith: ["Instant Reply", "Back Office", "Insights"],
    },
    {
      id: "instant-reply",
      part: "Instant Reply",
      promise: "Answer in seconds, day or night",
      cover: ["AI website chatbot", "AI WhatsApp assistant", "AI voice and call agents", "Order, booking and FAQ answers"],
      produces: "Every customer answered, even at 2am",
      worksWith: ["Lead Capture", "Operations", "Follow-up"],
    },
    {
      id: "operations",
      part: "Operations",
      promise: "Run the day without chasing",
      cover: [
        "Booking and scheduling",
        "Task assignment and approvals",
        "Stock and inventory alerts",
        "Team hand-offs and status updates",
      ],
      produces: "Work moves without anyone chasing it",
      worksWith: ["Instant Reply", "Back Office"],
    },
    {
      id: "back-office",
      part: "Back Office",
      promise: "Stop copy-paste work",
      cover: [
        "Data entry automation",
        "Invoice, billing and document processing",
        "Attendance and expense sheets",
        "Auto-built reports",
      ],
      produces: "Hours of admin back every week",
      worksWith: ["Operations", "Lead Capture", "Insights"],
    },
    {
      id: "follow-up",
      part: "Follow-up",
      promise: "Never let a customer go cold",
      cover: [
        "Automatic follow-up sequences",
        "Quote and proposal reminders",
        '"I\'ll think about it" nurturing',
        "Smart hand-off to your team",
      ],
      produces: "More enquiries turning into customers",
      worksWith: ["Instant Reply", "Sales Pipeline"],
    },
    {
      id: "sales-pipeline",
      part: "Sales Pipeline",
      promise: "See every deal from start to finish",
      cover: ["CRM and pipeline stages", "Lead scoring", "Deal tracking", "Team task alerts"],
      produces: "You know where every deal stands",
      worksWith: ["Follow-up", "Retention", "Insights"],
    },
    {
      id: "retention",
      part: "Retention",
      promise: "Bring customers back",
      cover: [
        "Renewal and repeat-order reminders",
        "Payment reminders",
        "Review and referral requests",
        "Win-back messages",
      ],
      produces: "Customers return and pay on time",
      worksWith: ["Follow-up", "Sales Pipeline", "Back Office"],
    },
    {
      id: "insights",
      part: "Insights",
      promise: "Decide on numbers, not guesswork",
      cover: [
        "One live dashboard across sales, operations and admin",
        "Weekly AI summaries",
        "Time-saved tracking",
        "Monthly decisions list",
      ],
      produces: "Clear next steps every month",
      worksWith: ["All seven parts"],
    },
  ],
  cycleHeading: "How all eight run together as one engine",
  cycleSub: "Each stage hands over to the next, and the results flow back to make next month stronger.",
  stages: [
    {
      title: "Answer every customer",
      parts: ["Lead Capture", "Instant Reply"],
      body: "Every message, call and form is captured and answered in seconds, day or night.",
    },
    {
      title: "Run the day on autopilot",
      parts: ["Operations", "Back Office"],
      body: "Bookings, tasks, data entry, invoices and reports run themselves.",
    },
    {
      title: "Close and keep customers",
      parts: ["Follow-up", "Sales Pipeline", "Retention"],
      body: "Every deal is followed through, and customers come back and pay on time.",
    },
    {
      title: "See everything on one screen",
      parts: ["Insights"],
      body: "Sales, operations and admin in one dashboard, with clear next steps.",
    },
  ],
  loopLine: "Results feed back into every stage, every month.",
  cycleNote: "Workflow illustration",
  cycleReplay: "Replay workflow",
  closing: "One team. One system. One dashboard. Nothing runs alone.",
}

/* 06 — DASHBOARD */
export const dashboard = {
  label: "Your automation control room",
  headline: "One screen. Eight parts. Data, Dashboard, Decisions.",
  sub:
    "Every part of the engine reports to one screen. You see what is running, how much time it saved, and exactly what to do next.",
  flow: [
    {
      title: "Data",
      body: "Every enquiry, reply, follow-up and task is captured automatically.",
      items: ["WhatsApp", "Website", "Email", "Calls", "Ads", "Sheets"],
    },
    {
      title: "Dashboard",
      body: "One screen shows all eight parts together, with a tab for each.",
      items: ["Lead Capture", "Instant Reply", "Follow-up", "Sales Pipeline", "Operations", "Back Office", "Retention", "Insights"],
    },
    {
      title: "Decisions",
      body: "Clear next actions every month, so you never guess where to spend or what to fix.",
      items: ["Move budget to what converts", "Fix what leaks", "Set next month's target"],
    },
  ],
  tryIt: "↓ Try it: click each tab to see the data behind every part",
  header: { title: "AI Automation Dashboard", period: "This month", note: "Illustrative view" },
  footerLabel: "Illustrative dashboard. Your real numbers will differ.",
  doItLabel: "See what this switches on",
  doItHint: "Tap the arrow on any decision to see what it switches on and what changes for you.",
}

/* 07 — PROOF */
export const proof = {
  label: "Proof, not promises",
  headline: "Same doubts. Different outcome.",
  sub:
    "Every business we build automation for starts with a doubt. Here is the doubt, what the engine changes, and what happens next.",
  cards: [
    {
      n: "01",
      outcome: "Hours → seconds",
      outcomeLabel: "Time to answer a customer",
      doubt: "\"We can't reply to every customer fast enough.\"",
      change:
        "The AI assistant answers every message on WhatsApp and the website the moment it arrives, day or night.",
    },
    {
      n: "02",
      outcome: "Hours → minutes",
      outcomeLabel: "Daily data entry",
      doubt: "\"Our team spends half the day copying data between sheets and apps.\"",
      change: "Data moves between your forms, sheets, invoices and apps automatically, with no copy-paste.",
    },
    {
      n: "03",
      outcome: "Calls → automatic",
      outcomeLabel: "Bookings and updates",
      doubt: "\"Half our day goes into scheduling and chasing updates.\"",
      change: "Bookings are scheduled, reminders sent and customers updated automatically.",
    },
  ],
  cardButton: "See how it works →",
  lineUnder: "Built and tested by Webchirpy on real business workflows.",
}

/* 08 — WHY WEBCHIRPY */
export const why = {
  label: "Why businesses work with us",
  headline: "Why Webchirpy.",
  sub:
    "We did not start as an AI company. We are a design and technology agency that kept watching clients lose leads and hours to manual work, so we built automation to fix it. It worked. Now we build it for every business that needs it.",
  proofPoints: [
    { value: "13+", label: "Years of agency experience in strategy, design and technology" },
    { value: "500+", label: "Businesses served across different markets" },
    { value: "Tested", label: "Every automation proven on real workflows before it reaches you" },
    { value: "Direct", label: "Founder involvement in your audit and plan" },
  ],
  storyTitle: "How we got here",
  story: [
    {
      title: "We saw the problem",
      body:
        "For years we built websites and systems for clients, and watched their teams lose hours to data entry, repeat replies, reports and forgotten follow-ups.",
    },
    {
      title: "We built the fix",
      body: "When AI arrived, we built automation for our own clients to take that load off their teams.",
    },
    {
      title: "We saw it work",
      body:
        "Replies went from hours to seconds, admin that took a day took minutes, and follow-ups stopped depending on memory. So we made it a service.",
    },
  ],
  founderVideoButton: "Watch Vasanth explain",
  founderCard: {
    name: "Vasanth Sampathkumar",
    roles: ["Founder, Webchirpy", "Co-founder, Design Head", "13+ years agency experience", "Worked with top brands"],
  },
  founderHeadline: "You'll work directly with Vasanth Sampathkumar.",
  founderIntro:
    "Not a salesperson reading from a script. The person who has spent 13+ years building digital systems for businesses, and now builds the automation behind them.",
  differences: [
    {
      kicker: "Business first, tech second",
      title: "Starts with your leaks",
      body: "We start with where your leads and hours go, not with which AI tool is trending.",
    },
    {
      kicker: "Built and tested",
      title: "Proven before it's yours",
      body: "Every automation we offer is built and tested on real workflows before it reaches your business.",
    },
    {
      kicker: "Systems thinking",
      title: "Builds engines, not gadgets",
      body:
        "We do not add a chatbot and leave. Capture, reply, follow-up and reporting run as one AI Automation Engine.",
    },
  ],
  closingLine: "When you book the audit call, this is who picks up.",
  button: "BOOK A CALL WITH VASANTH →",
}

/* 09 — TRUSTED ACROSS INDUSTRIES */
export const trusted = {
  label: "Trusted across industries",
  headline: "The businesses and work behind the engine.",
  sub:
    "For 13+ years, businesses across every industry have trusted us with their design, technology and growth. Now we bring the same care to automation.",
  clientVoicesHeading: "What our clients say",
  clients: [
    "Reliance",
    "WazirX",
    "Confederation of Indian Industry",
    "StartupTN",
    "PyCon India Bengaluru",
    "Green Growth Asia Foundation",
    "Eco-Schools Malaysia",
    "BeNIR",
    "BSides Delhi",
    "Madhampatty Pakashala",
    "Young Indians",
    "DecaFit",
    "Python Software Foundation",
  ],
  galleryHeading: "Systems and products we have built",
}

/* 10 — IS THIS FOR YOU? */
export const fit = {
  label: "Is this for you?",
  headline: "Built for owners who are ready to work smarter, not longer.",
  sub:
    "We work best with a certain kind of owner. Here is an honest look at who gets the most from this, and who does not.",
  good: {
    title: "A good fit",
    lead: "This is for you if you:",
    items: [
      "Run a business where your team handles customers every day",
      "Want every customer handled on time, day or night",
      "Get enquiries from more than one channel",
      "Feel your team spends too long on repetitive work",
      "Want to grow without hiring for every new task",
    ],
    button: "If this is you, book your free automation audit →",
  },
  notFit: {
    title: "Not a fit",
    lead: "This is not for you if you:",
    items: [
      'Want a chatbot just to say you "have AI"',
      "Expect AI to replace your whole team overnight",
      "Do not want to change any process",
      "Want the cheapest tool, not a system that works",
    ],
  },
  lineUnder: "Better to know now. We would rather tell you straight than waste your time.",
}

/* 11 — FAQ */
export const faq = {
  label: "Common questions",
  headline: "Questions before you book the call.",
  sub: "Straight answers, no tech talk.",
  items: [
    {
      q: "We're managing fine manually. Why change?",
      a: "Manual work holds until the business grows. Every hour your team spends on repeat replies, data entry and reminders is an hour not spent on customers. On the call, we show you how many hours that adds up to.",
    },
    {
      q: "We're a small business. Is AI automation really for us?",
      a: "Often, small teams gain the most, because every lead and every hour matters more. On the audit call, we look at your actual workload and tell you honestly whether automation is worth it for you right now.",
    },
    {
      q: "We don't even know what to automate.",
      a: "That is exactly what the free audit is for. Most owners come in with no plan. We map where your leads and hours go, and show you what AI can take over first.",
    },
    {
      q: "Will AI replace my team?",
      a: "No. It takes over the repetitive work, like the same replies, data entry and reminders, so your team spends more time closing customers and less time chasing them.",
    },
    {
      q: "Will it work with the tools we already use?",
      a: "Wherever possible, we connect automation to what you already use, such as WhatsApp, your website, email, Google Sheets and your CRM. We confirm what fits your setup on the call.",
    },
    {
      q: "Is our customer data safe?",
      a: "Your data stays in accounts your business controls. Before any work begins, we explain exactly what each automation can access and how it is protected.",
    },
    {
      q: "How much does it cost?",
      a: "There is no useful one-size-fits-all number. It depends on how many workflows you automate and how complex they are. We share the scope and investment before you decide anything.",
    },
    {
      q: "How quickly will we see results?",
      a: "It depends on what we automate and your starting point. We do not promise an artificial timeline before we understand your business.",
    },
    {
      q: "Who owns the automations and the data?",
      a: "Your business should own its important accounts and data. The exact ownership is clearly agreed in writing before work begins.",
    },
  ],
}

/* 12 — EVERYTHING YOU GET / FREE AUDIT OFFER */
export const audit = {
  sectionTitle: "Everything you get. Everything we promise.",
  label: "Your free automation audit",
  headline: "Everything you get. Everything we promise.",
  sub: "One free call. An audit you keep. And three promises in plain words.",
  ticketTag: "Free",
  ticketHeading: "What you get on the call",
  ticketDuration: "15–30 min",
  deliverables: [
    {
      title: "Your automation audit",
      body: "We map where your team's hours go and where customers slip away, from first message to final invoice.",
    },
    {
      title: "Your automate-first list",
      body: "Know which one task to automate first for the biggest win in time and customers.",
    },
    {
      title: 'A clear plan, or an honest "not yet"',
      body: "Whether you have a plan or no idea at all, you leave knowing if automation fits your business today.",
    },
    {
      title: "An automation checklist to keep",
      body: "A checklist across all 8 areas, so you can track your own progress anytime.",
    },
  ],
  total: { label: "Total cost to you", value: "₹0", note: "No price pitch. No obligation." },
  promisesTitle: "Our promises:",
  promises: [
    { title: "You keep the audit", body: "The audit and checklist are yours, even if you never work with us." },
    {
      title: "No pressure",
      body: "No price talk on the first call. No obligation after it. If automation won't pay off for you, we say so.",
    },
    {
      title: "Clear targets",
      body: "If we work together, we first agree what we automate, what a good result looks like, and how we measure it. Clear target. Clear tracking. Clear responsibility.",
    },
  ],
  button: "BOOK MY FREE AUTOMATION AUDIT →",
  underButton: "Limited slots each month. Book fast.", // VERIFY: scarcity claim needs client confirmation
}

/* 13 — WALK IN, OR WALK AWAY */
export const walk = {
  label: "Your decision",
  headline: "Walk in, or walk away.",
  sub:
    "You can close this page, and next month your team will do the same manual work and lose the same customers. Or you can book one free call, see exactly where your hours and leads are leaking, and then decide.",
  away: {
    title: "Walk away",
    tagline: "Next month looks like last month",
    items: [
      "Hours lost to copy-paste, data entry and reminders",
      "Enquiries that wait till morning, and buy elsewhere",
      "Follow-ups that depend on memory",
      "Growth that needs another hire",
    ],
    line: "The only thing it costs you is another month of work a machine could do.",
  },
  in: {
    title: "Walk in",
    tagline: "Book one free call",
    line: "Fifteen to thirty minutes. You leave knowing where your hours go and what to automate first.",
    items: [
      { title: "Free automation audit", body: "15–30 minutes, on your schedule" },
      { title: "Automation checklist", body: "All 8 areas, yours to keep" },
      { title: "See where you leak", body: "Slow replies, manual admin, missed follow-ups" },
      { title: "No price pitch", body: "No obligation, ever" },
    ],
  },
  stepsTitle: "Steps:",
  steps: [
    { title: "Book", body: "Two minutes, form on the right" },
    { title: "Talk", body: "We walk through your scorecard" },
    { title: "Decide", body: "Do it yourself, or with us" },
  ],
  form: {
    tag: "Free · no obligation · Limited slots",
    heading: "Limited slots this month. Book fast.",
    sub: "15–30 minute call. Automation checklist included.",
    fields: {
      name: "Full name",
      business: "Business name",
      phone: "Phone / WhatsApp",
      industry: "Industry",
      time: "What takes most of your team's time?",
    },
    button: "BOOK MY FREE AUDIT →",
    privacy: "Your details are only used to book your call.",
  },
  ps: "P.S. The call is free and the audit is yours. The only thing you can lose is another month of work a machine could do.",
  pps: "P.P.S. We take on only a limited number of automation projects each month, so each one gets proper attention. Slots fill fast. If you are serious, book today.",
}

/* 14 — FINAL CTA + FOOTER */
export const finalCta = {
  label: "Ready when you are",
  headline: "Ready to let AI take the load?",
  sub: "Book your free automation audit. Leave knowing exactly where your hours go, and what to automate first.",
  button: "BOOK MY FREE AUTOMATION AUDIT →",
}

/* Ad landing page footer: brand + legal only. No nav links that pull visitors off the CTA. */
export const footer = {
  legal: "Webchirpy. All rights reserved.",
  terms: "Terms",
}

/* PERSISTENT ELEMENTS */
export const persistent = {
  stickyBar: { text: "Limited slots available this month.", button: "Book fast →" },
  floatingButton: "Book a free automation audit",
  testimonialModal: { label: "Client story", title: "Watch how automation changed their week" },
  leadModal: { tag: "Free · 15–30 minutes", title: "Book your free automation audit." },
  exitPopup: {
    label: "Wait, before you go",
    headline: "Your free automation checklist is waiting.",
    includedLabel: "Included free",
    included: "An automation checklist for every area of your business",
    body: "Book your free audit call and get a checklist you can tick off yourself, to see exactly where your leads and hours are leaking.",
    list: ["Lead Capture", "Instant Reply", "Follow-up", "Sales Pipeline", "Operations", "Back Office", "Retention", "Insights"],
    button: "YES, BOOK MY FREE AUDIT →",
    micro: "Free 15–30 minute call. No obligation.",
  },
}

/* ------------------------------------------------------------------ */
/* NEW UI MICROCOPY (Q17 allows hints/tooltips/honesty labels).        */
/* Not from the DOCX — kept separate so reviewers can approve it.      */
/* ------------------------------------------------------------------ */
export const uiCopy = {
  heroHintPointer: "Move / drag to activate the workflow",
  heroHintTouch: "Tap or swipe sideways to activate",
  toolsDisclaimer: "Example tools & channels — compatibility confirmed during your audit",
  logosPending: "Shown as names until approved logo files are supplied",
  videoPending: "Video pending — the approved video will play here once supplied.",
  statsNote: "Industry response-time figures · citation pending confirmation",
  illustrative: "Illustrative",
  scenario: "Capability scenario",
  scoreNotAssessed: "Not assessed yet",
  scoreAreasReviewed: "areas reviewed",
  noneApply: "Neither applies to us",
  resetScore: "Reset",
  compareAgain: "Compare again",
  back: "Back to all eight",
  demoAction:
    "Illustrative recommendation. In a real dashboard this would open the matching automation for review — nothing runs from this demo page.",
  formDemoMode:
    "Demo mode: no booking endpoint is configured yet, so your details were not sent anywhere. Nothing has been booked.",
  formSuccess: "Request received. We'll contact you on the number you gave to schedule your call.",
  formError: "We couldn't send your request. Please try again in a moment.",
  consent: "I agree to be contacted about my free audit call.",
  demoFormNote: "Demo form: nothing you enter is sent or stored.",
  privacyNotice: "Privacy Notice",
  assetPending: "Asset pending",
  // 09 — Client video testimonials
  testimonials: {
    count: "4 client stories · in their own words",
    listLabel: "Client video testimonials",
    play: "Play testimonial",
    pause: "Pause testimonial",
    mute: "Mute",
    unmute: "Unmute",
  },
  // 02 — The pattern: three illustrated scenes and the week bar. Sample data only.
  scenes: {
    disclaimer: "Illustration · sample data, not measured",
    note:
      "Illustration, not measured data: the team stays the same size while manual work, repeat replies, data entry and chasing follow-ups take a growing share of the week away from customer work.",
    pointsLabel: "What you already have",
    waitsOvernight: "waits overnight",
    manualAllDay: "manual all day",
    dependsOnMemory: "depends on memory",
    chat: {
      app: "WhatsApp",
      contact: "Anand Traders",
      incoming: "Hi, what is the price for 200 units? Need them this week.",
      inTime: "9:47 pm",
      seen: "Seen · no reply",
      gap: "11 h 25 m",
      reply: "Good morning! Sharing the price list now.",
      outTime: "9:12 am",
    },
    sheet: {
      file: "Weekly report.xlsx",
      day: "Friday",
      start: "9 am",
      end: "5 pm",
      task: "Copying numbers from sheets",
    },
    todo: {
      title: "Follow-ups",
      source: "notes on someone's phone",
      items: [
        { who: "Kavya Interiors", what: "Send the office fit-out quote", late: "3 days late" },
        { who: "Sri Ganesh Stores", what: "Call back about the March order", late: "2 days late" },
        { who: "+91 98xxx xx210", what: "Missed call: who was this?", late: "Not logged" },
      ],
    },
  },
}
