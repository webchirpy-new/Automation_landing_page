/**
 * LIVE DEMOS — one realistic scene per part of the AI Automation Engine, shown in the Engine
 * section's part panel. Each scene plays once when it scrolls into view.
 *
 * ILLUSTRATIVE ONLY: every business, person, number and message below is sample data, labelled
 * "Illustrative demo" on the page. They show how each automation behaves (what Launch Kit 01's
 * opportunity library says we automate first), not a client result. Sample names follow the
 * Kit 04 morning-summary example (Ravi, Priya).
 *
 * Scene kinds: chat (a phone conversation), list (an app list filling up), board (a deal moving
 * through a pipeline), orders (an order moving through its stages), sync (one entry flowing to
 * several tools). `d` = seconds before an item appears.
 */
export const automationDemos = {
  "lead-capture": {
    kind: "list",
    steps: ["Enquiries arrive on WhatsApp, the website, email and calls", "Each one lands in one list, tagged with its source", "Nothing is missed and nobody retypes it"],
    title: "Leads · Today",
    rows: [
      { tool: "whatsapp", source: "WhatsApp", who: "Anand Traders", text: "Price for 200 units?", time: "9:40 am", d: 0.3 },
      { tool: "webform", source: "Website form", who: "Kavya Interiors", text: "Need a quote for an office fit-out", time: "10:12 am", d: 1.0 },
      { tool: "email", source: "Email", who: "Sri Ganesh Stores", text: "Bulk order enquiry for March", time: "11:05 am", d: 1.7 },
      { tool: "phone", source: "Missed call", who: "+91 98xxx xx210", text: "Call-back task created", time: "11:30 am", d: 2.4 },
    ],
    footer: "4 new enquiries · every one logged with its source",
    footerD: 3.1,
  },

  "instant-reply": {
    kind: "chat",
    steps: ["A customer asks at 9:40 pm", "AI replies in seconds and asks what they need", "The lead goes to a person with the details filled in"],
    name: "Your business",
    status: "WhatsApp Business · replies automatically",
    items: [
      { type: "in", text: "Hi, what's the price for 200 units?", time: "9:40 pm", d: 0.3 },
      { type: "typing", d: 0.9 },
      { type: "out", text: "Hi! Here's our price list. Which city should we deliver to, and by when?", attach: "Price-list.pdf", time: "9:40 pm", d: 1.9 },
      { type: "in", text: "Chennai, by Friday.", time: "9:41 pm", d: 3.0 },
      { type: "out", text: "Thanks! Ravi from our sales team will confirm by 10 am tomorrow.", time: "9:41 pm", d: 3.8 },
      { type: "sys", text: "Requirement captured · lead assigned to Ravi", d: 4.6 },
    ],
  },

  "follow-up": {
    kind: "chat",
    steps: ["The customer says \"let me think about it\"", "Follow-ups go out on day 1, 3 and 7", "They stop the moment the customer replies"],
    name: "Meena · Kavya Interiors",
    status: "Quote Q-218 sent on Monday",
    items: [
      { type: "in", text: "Let me think about it.", time: "Mon", d: 0.3 },
      { type: "day", text: "Day 1 · no reply", d: 1.0 },
      { type: "out", text: "Hi Meena, any questions on the quote? Happy to adjust the quantities.", time: "Tue", d: 1.4 },
      { type: "day", text: "Day 3 · no reply", d: 2.2 },
      { type: "out", text: "Quick reminder: the quoted price holds until Monday.", time: "Thu", d: 2.6 },
      { type: "in", text: "Yes, let's go ahead!", time: "Thu", d: 3.5 },
      { type: "sys", text: "Customer replied · follow-ups stopped · handed to sales", d: 4.3 },
    ],
  },

  "sales-pipeline": {
    kind: "board",
    steps: ["A new deal enters the pipeline", "No reply to the quote in 3 days triggers a reminder", "The deal moves to Won"],
    title: "Pipeline · This month",
    columns: ["New", "Quoted", "Won"],
    others: [
      { col: 0, text: "Sri Ganesh Stores" },
      { col: 1, text: "Kavya Interiors" },
      { col: 2, text: "Lakshmi Textiles" },
    ],
    deal: { name: "Anand Traders", value: "200 units" },
    // the deal's journey: New → Quoted → (reminder) → Won
    moves: [
      { col: 0, d: 0.3 },
      { col: 1, d: 1.3 },
      { col: 2, d: 3.4 },
    ],
    toast: { text: "Quote had no reply for 3 days · reminder sent", d: 2.3 },
  },

  operations: {
    kind: "orders",
    steps: ["The order is captured in one place", "It is assigned to a person automatically", "The customer gets status updates on WhatsApp"],
    title: "Orders",
    order: { id: "#1042", text: "200 units · Chennai", d: 0.3 },
    assign: { text: "Assigned to Priya", d: 1.0 },
    stages: [
      { label: "Received", d: 1.4 },
      { label: "Packed", d: 2.0 },
      { label: "Dispatched", d: 2.6 },
    ],
    notify: { text: "Your order #1042 has been dispatched. It reaches you on Thursday.", note: "Sent to the customer on WhatsApp", d: 3.3 },
  },

  "back-office": {
    kind: "sync",
    steps: ["Details are entered once", "They flow to the sheet, the CRM and the invoice", "The month-end report builds itself on schedule"],
    source: {
      title: "Entered once",
      fields: [
        ["Customer", "Anand Traders"],
        ["Order", "200 units"],
        ["Amount", "₹1,84,000"],
      ],
      d: 0.3,
    },
    targets: [
      { tool: "sheets", title: "Sheet", text: "Row added to Orders", d: 1.2 },
      { tool: "crm", title: "CRM", text: "Deal updated to Won", d: 1.7 },
      { tool: "invoice", title: "Invoice", text: "INV-0218 draft ready", d: 2.2 },
    ],
    footer: "Month-end report builds itself on the 1st",
    footerD: 2.9,
  },

  retention: {
    kind: "chat",
    steps: ["A payment reminder goes out before the due date", "Reminders stop as soon as it is paid", "A review request follows the delivery"],
    name: "Meena · Kavya Interiors",
    status: "Reminders run on schedule",
    items: [
      { type: "day", text: "Invoice INV-0218 · due Friday", d: 0.3 },
      { type: "out", text: "Hi Meena, a gentle reminder that invoice INV-0218 is due on Friday.", attach: "Pay now", time: "Tue", d: 0.8 },
      { type: "sys", text: "Paid on Thursday · reminders stopped", d: 1.8 },
      { type: "day", text: "Delivered · 3 days later", d: 2.5 },
      { type: "out", text: "Glad your order arrived! Could you rate us? It takes 10 seconds.", time: "Mon", d: 2.9 },
      { type: "in", text: "★★★★★ Great service, thank you!", time: "Mon", d: 3.8 },
    ],
  },

  insights: {
    kind: "chat",
    steps: ["Numbers from every part are collected overnight", "One summary arrives on WhatsApp at 8 am", "You see what needs attention without calling anyone"],
    name: "Morning summary",
    status: "Every day at 8:00 am",
    items: [
      {
        type: "out",
        time: "8:00 am",
        d: 0.3,
        // Kit 04 sample summary, split into its parts
        lines: [
          ["Good morning.", ""],
          ["Yesterday:", "14 new enquiries, 11 replied within an hour."],
          ["Overdue today:", "6 follow-ups (Ravi 4, Priya 2)."],
          ["Pending this week:", "Rs. 3,42,000 across 9 invoices."],
          ["One flag:", "website enquiries are down by half on last week."],
        ],
      },
      { type: "sys", text: "No calls needed · one message, every morning", d: 1.6 },
    ],
  },
}
