/**
 * PAGE-SPECIFIC SECTIONS — landing pages vsl-05 to vsl-08.
 *
 * Copy is taken verbatim from "Webchirpy Launch Kit 04 – Landing Page Copy, Pain Points 5 to 8"
 * (15 Nov 2026). Each section renders directly under the hero, and its `id` is the anchor the
 * matching ads link to (Kit 04 §01.2). Pages 1–4 have no page-specific section.
 *
 * Internal guidance notes from the kit (CONFIRM items, "do not turn into numbers", data notes)
 * are deliberately not rendered. Lines that still need sign-off carry `pending: "<reason>"` and
 * are skipped by the components until the flag is removed.
 *
 * Do not edit these strings without client approval.
 */

const SCORE_BUTTON = "SCORE THE REST OF MY BUSINESS →"

/**
 * What clients actually get for Insights: a WhatsApp summary every morning (Kit 04 §04, vsl-07).
 * Shown under the hero on vsl-07.
 */
export const MORNING_SUMMARY = {
  type: "summary",
  id: "summary",
  title: "What arrives every morning",
  items: [
    "Yesterday's enquiries, and how fast each got a reply",
    "Follow-ups overdue today, by person",
    "Payments pending this week, with the total",
    "Anything unusual, flagged",
  ],
  sample: {
    label: "Illustrative example · 8:00 am",
    body: "Good morning. Yesterday: 14 new enquiries, 11 replied within an hour. Follow-ups overdue today: 6 (Ravi 4, Priya 2). Payments pending this week: Rs. 3,42,000 across 9 invoices. One flag: website enquiries are down by half on last week.",
  },
  button: { label: "BOOK A FREE CALL WITH VASANTH →", href: "#book" },
}

export const pageSections = {
  // Kit 04 §02 — client-confirmed result: about 3 hours → about 3 minutes.
  "vsl-05": [
    {
      type: "story",
      id: "story",
      title: "3 hours to 3 minutes. Here's what changed.",
      before: {
        label: "Before",
        body: "Enquiries came in on WhatsApp, the website form and email. Whoever was free replied, when they were free. Evenings and weekends waited for the next working day. First reply: about 3 hours on average.",
      },
      steps: [
        { label: "Step 1", title: "One inbox.", body: "WhatsApp, form and email enquiries land in one list, with the source of each." },
        {
          label: "Step 2",
          title: "Instant first reply.",
          body: "Every enquiry gets an answer within minutes: common questions answered, the requirement captured, and a person assigned.",
        },
        {
          label: "Step 3",
          title: "Follow-ups on their own.",
          body: "If the customer goes quiet, reminders go out on schedule until they reply or say no.",
        },
      ],
      after: {
        label: "After",
        body: "First reply: about 3 minutes. The team now starts each conversation with the customer's requirement already in hand.",
      },
      unchanged: { label: "What did not change", body: "The team. The WhatsApp number. The website. The tools they already used." },
      honestNote:
        "This is one business. Your result depends on how many enquiries you get and where they arrive. We show you what is realistic for yours on the free call.",
    },
  ],

  "vsl-06": [
    {
      type: "connects",
      id: "connects",
      title: "When one tool changes, the others follow.",
      columns: ["When this happens", "This happens on its own"],
      rows: [
        [
          "A new enquiry arrives on the website form",
          "A CRM record is created, sales gets a WhatsApp alert, and the lead sheet gets a new row",
        ],
        ["A customer messages on WhatsApp Business", "The enquiry is captured in the CRM with its source, and a first reply is sent"],
        [
          "A quote is marked accepted in the CRM",
          "An invoice draft is prepared in the accounts software, and the customer is told what happens next",
        ],
        ["A payment is recorded in the accounts software", "The sheet status updates and the customer gets a receipt on WhatsApp"],
        ["An order status changes in the sheet", "The customer gets a WhatsApp update, and nobody has to call"],
      ],
      note:
        "Examples, not a promise for your tools. Which of your tools can connect, and how, is confirmed on the audit call. Some tools allow only limited connections: WhatsApp needs the WhatsApp Business API, and Tally needs its integration interface.",
      promise: {
        label: "Our promise",
        body: "We will not ask you to replace a tool that works. If one truly cannot connect, we tell you why.",
        pending: "CONFIRM THE AUDIT CALL NEVER PITCHES NEW SOFTWARE (Kit 04)",
      },
    },
    {
      type: "counter",
      id: "repeats",
      eyebrow: "Count it",
      title: "Where does one enquiry get typed in your business?",
      prompt: "Tap every place:",
      options: ["WhatsApp", "Lead sheet", "CRM", "Quote", "Invoice", "Delivery note", "Accounts software"],
      result: (n) => `Typed ${n} ${n === 1 ? "time" : "times"}. ${n - 1} of them could happen on their own.`,
      button: { label: SCORE_BUTTON, href: "#scorecard" },
    },
  ],

  "vsl-07": [
    {
      type: "test",
      id: "test",
      title: "The 3-question test",
      eyebrow: "Answer without calling anyone",
      questions: [
        { lead: "Yesterday:", text: "how many enquiries got a reply within an hour?" },
        { lead: "Today:", text: "which follow-ups are overdue?" },
        { lead: "This week:", text: "what is the total of pending payments?" },
      ],
      answers: { known: "I know, right now", ask: "I'd have to ask someone" },
      results: [
        { min: 3, max: 3, label: "3 of 3", body: "You run on a system. That is rare. Check the other areas in the full scorecard: there may still be hours to win back." },
        {
          min: 1,
          max: 2,
          label: "{n} of 3",
          body: "Partly in control. The answers you would have to ask about are where your business runs on memory.",
        },
        {
          min: 0,
          max: 0,
          label: "0 of 3",
          body: "Your business runs on memory. That is exactly what a morning summary fixes: all three answers on your phone before 9 am.",
        },
      ],
      button: { label: SCORE_BUTTON, href: "#scorecard" },
    },
    MORNING_SUMMARY,
  ],

  "vsl-08": [
    {
      type: "steps",
      id: "steps",
      title: "Give AI a real job.",
      columns: ["Step", "What AI does", "Typical saving"],
      rows: [
        { step: "Step 1 · Writing", note: "Where most stop", does: "Captions, posts, emails.", saving: "Minutes" },
        {
          step: "Step 2 · Answering",
          does: "Replies to enquiries on WhatsApp and the website from your own FAQs and price list, asks what the customer needs, and hands over to your team.",
          saving: "Hours a week",
        },
        {
          step: "Step 3 · Working",
          does: "Reads each enquiry, adds it to your CRM or sheet, assigns it, follows up if the customer goes quiet, and sends you a summary every morning.",
          saving: "Hours a day, as it grows",
        },
      ],
    },
    {
      type: "timeline",
      id: "at-work",
      title: "One enquiry, start to finish.",
      label: "Illustrative example",
      steps: [
        { time: "9:40 pm.", body: 'A customer messages on WhatsApp: "Price for 200 units?"' },
        { time: "9:41 pm.", body: "AI replies with the price list and asks for delivery city and date." },
        { time: "9:42 pm.", body: "The enquiry is added to the lead sheet with the requirement and source." },
        { time: "9:00 am.", body: "It appears in the morning summary, assigned to a salesperson." },
        { time: "Next day.", body: "No reply from the customer, so a follow-up goes out automatically. They reply, and the salesperson takes over." },
      ],
      note: "Where AI is genuinely needed: understanding the message and writing the reply and summary. Moving data between tools is plain automation.",
    },
    {
      type: "counter",
      id: "fits",
      eyebrow: "Count them",
      title: "Which of these does your team do by hand every day?",
      options: [
        "Replying to the same questions",
        "Sending price lists",
        "Logging enquiries",
        "Following up",
        "Payment reminders",
        "Writing daily or weekly updates",
      ],
      result: (n) => `${n} of these are a fit for AI automation. The audit shows which to start with.`,
      button: { label: "BOOK A FREE CALL →", href: "#book" },
    },
  ],
}
