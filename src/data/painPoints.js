/**
 * The eight pain points shown beside the video carousel (Hero → PainShowcase).
 * Order matches the videos: /pain/pain-1.mp4 … pain-8.mp4 (compressed from "Ai-automation vdo N.mp4").
 * Titles come from the client's pain-point list; explanations are short summaries of each landing page's copy.
 */
export const painPoints = [
  {
    title: "Paid leads that leak",
    text: "You pay for every enquiry, then reply hours later. By then the lead has already called someone faster.",
  },
  {
    title: "The 5-minute lead test",
    text: "Send your own business a test enquiry and time the reply. Miss 5 minutes and the sale tends to go to a competitor.",
  },
  {
    title: "Yesterday's numbers",
    text: "Leads, follow-ups and payments sit in sheets and chats, so you learn how yesterday went by calling around.",
  },
  {
    title: "Your best people, doing data entry",
    text: "The same details get typed into a sheet, the CRM and the invoice, all day. Your strongest team is copying, not selling.",
  },
  {
    title: "From 6 hours to 2 minutes",
    text: "A report that eats a morning by hand can be ready in minutes once the data moves on its own.",
  },
  {
    title: "Ten apps. Zero connection.",
    text: "You pay for a CRM, accounts, WhatsApp and Sheets, yet your team still copies data between them.",
  },
  {
    title: "Are you really running your business?",
    text: "If you can't say who replied, what's overdue and what's unpaid without calls, you're running on memory.",
  },
  {
    title: "Using AI, or just talking about it?",
    text: "A ChatGPT caption now and then isn't adoption. Real automation reads enquiries and updates records daily.",
  },
]

export const painVideo = (i) => ({
  src: `/pain/pain-${i + 1}.mp4`,
  poster: `/pain/pain-${i + 1}.jpg`,
})
