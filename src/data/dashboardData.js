/**
 * Illustrative dashboard data — verbatim from the DOCX "Dashboard" section.
 * These are demo numbers, never presented as live or client results.
 * `n` is the numeric value used for count-up/bars; `display` is the source text.
 */

export const dashboardTabs = [
  {
    id: "overview",
    tab: "Overview",
    main: { label: "Hours saved this month", value: 112, suffix: " hrs", delta: "↑ 18% vs last month" },
    stats: [
      { value: 1240, label: "customer messages answered" },
      { value: 142, label: "tasks automated" },
      { value: 218, label: "invoices processed" },
    ],
    trend: { months: ["Mar", "May", "Jul", "Aug"] },
    areaSplit: {
      title: "Work automated by area",
      unit: "%",
      rows: [
        { label: "Customer replies", n: 38 },
        { label: "Back office", n: 30 },
        { label: "Operations", n: 20 },
        { label: "Follow-ups", n: 12 },
      ],
    },
    journey: {
      title: "The customer journey",
      parts: "Instant Reply + Follow-up + Sales Pipeline",
      steps: [
        { label: "Enquiries", n: 214 },
        { label: "Replied in under a minute", n: 209 },
        { label: "Followed up", n: 168 },
        { label: "Became customers", n: 51 },
      ],
    },
    cards: [
      { part: "Retention", value: "32", label: "renewals due", body: "27 reminded automatically, 5 to go" },
      { part: "Back Office", value: "46 hrs", label: "Data entry automated this month" },
      { part: "Insights", kicker: "Biggest time saver", value: "Invoice processing", label: "28 hrs saved this month" },
    ],
    decisionsTitle: "This month's decisions:",
    decisions: [
      { part: "Instant Reply", text: "Turn on the AI assistant for weekend enquiries." },
      { part: "Follow-up", text: "Add a third follow-up for quotes not answered in 3 days." },
      { part: "Operations", text: "Send reminders 2 hours before each booking." },
      { part: "Back Office", text: "Automate the month-end stock and sales report." },
      { part: "Retention", text: "Send payment reminders to the 5 pending invoices." },
    ],
  },
  {
    id: "lead-capture",
    tab: "Lead Capture",
    main: { label: "Leads captured this month", value: 214, delta: "↑ 22% vs last month" },
    stats: [
      { value: 5, label: "channels in one inbox" },
      { value: 0, label: "duplicate leads" },
      { value: 100, suffix: "%", label: "leads tagged by source" },
    ],
    panel: {
      kind: "bars",
      title: "Leads by channel",
      rows: [
        { label: "WhatsApp", n: 78 },
        { label: "Website", n: 54 },
        { label: "Google and Meta Ads", n: 41 },
        { label: "Email", n: 23 },
        { label: "Calls", n: 18 },
      ],
    },
    decision: "Connect Instagram messages to the shared inbox.",
  },
  {
    id: "instant-reply",
    tab: "Instant Reply",
    main: { label: "Average first reply", value: 12, suffix: " sec", delta: "Down from 4 hrs" },
    stats: [
      { value: 1240, label: "messages answered by AI" },
      { value: 63, label: "after-hours enquiries answered" },
      { value: 91, suffix: "%", label: "questions resolved without a person" },
    ],
    panel: {
      kind: "bars",
      title: "Top questions answered",
      rows: [
        { label: "Pricing", n: 312 },
        { label: "Availability", n: 248 },
        { label: "Location and timings", n: 186 },
        { label: "Booking", n: 154 },
      ],
    },
    decision: "Turn on the AI assistant for weekend enquiries.",
  },
  {
    id: "follow-up",
    tab: "Follow-up",
    main: { label: "Follow-ups sent automatically", value: 386, delta: "0 missed" },
    stats: [
      { value: 168, label: "leads followed up" },
      { value: 47, label: "replied after a follow-up" },
      { value: 3, label: "follow-ups per lead on average" },
    ],
    panel: {
      kind: "timeline",
      title: "Replies by follow-up",
      rows: [
        { label: "Day 1 message", n: 82 },
        { label: "Day 3 reminder", n: 54 },
        { label: "Day 7 final nudge", n: 32 },
      ],
    },
    decision: "Add a third follow-up for quotes not answered in 3 days.",
  },
  {
    id: "sales-pipeline",
    tab: "Sales Pipeline",
    main: { label: "New customers this month", value: 51, delta: "24% of leads converted" },
    stats: [
      { value: 84, label: "quotes sent" },
      { value: 19, label: "deals in negotiation" },
      { value: 12, label: "hot leads scored above 80" },
    ],
    panel: {
      kind: "funnel",
      title: "Pipeline",
      rows: [
        { label: "New", n: 214 },
        { label: "Qualified", n: 126 },
        { label: "Quote sent", n: 84 },
        { label: "Won", n: 51 },
      ],
    },
    decision: "Call the 12 hot leads today.",
  },
  {
    id: "operations",
    tab: "Operations",
    main: { label: "Bookings scheduled automatically", value: 63, delta: "0 double bookings" },
    stats: [
      { value: 142, label: "tasks assigned automatically" },
      { value: 96, suffix: "%", label: "status updates sent on time" },
      { value: 0, label: "missed hand-offs" },
    ],
    panel: {
      kind: "columns",
      title: "Bookings this week",
      rows: [
        { label: "Mon", n: 11 },
        { label: "Tue", n: 14 },
        { label: "Wed", n: 9 },
        { label: "Thu", n: 16 },
        { label: "Fri", n: 13 },
      ],
    },
    decision: "Send reminders 2 hours before each booking.",
  },
  {
    id: "back-office",
    tab: "Back Office",
    main: { label: "Hours of admin saved", value: 112, suffix: " hrs", delta: "↑ 18% vs last month" },
    stats: [
      { value: 218, label: "invoices processed" },
      { value: 3, label: "reports built automatically" },
      { value: 0, label: "copy-paste errors" },
    ],
    panel: {
      kind: "bars",
      title: "Hours saved by task",
      rows: [
        { label: "Data entry", n: 46 },
        { label: "Invoices", n: 28 },
        { label: "Reports", n: 22 },
        { label: "Sheet updates", n: 16 },
      ],
    },
    decision: "Automate the weekly sales report.",
  },
  {
    id: "retention",
    tab: "Retention",
    main: { label: "Renewals due", value: 32, delta: "27 reminded automatically, 5 to go" },
    stats: [
      { value: 18, label: "repeat orders" },
      { value: 41, label: "review requests sent" },
      { value: 23, label: "new reviews" },
    ],
    panel: {
      kind: "payments",
      title: "Payment reminders",
      rows: [
        { label: "sent", n: 26 },
        { label: "paid on time", n: 21 },
        { label: "pending", n: 5 },
      ],
    },
    decision: "Send review requests to customers served this week.",
  },
  {
    id: "insights",
    tab: "Insights",
    main: { label: "Business health this month", text: "On track", delta: "4 of 5 targets met" },
    stats: [
      { value: 112, suffix: " hrs", label: "saved" },
      { value: 96, suffix: "%", label: "tasks done on time" },
      { value: 51, label: "new customers" },
    ],
    panel: {
      kind: "summary",
      title: "This week's AI summary",
      text:
        "Hours saved rose 18%, mostly from invoice processing. Weekend replies brought in 9 new customers. Month-end reports are the biggest manual task left.",
    },
    decision: "Automate the month-end stock and sales report.",
  },
]
