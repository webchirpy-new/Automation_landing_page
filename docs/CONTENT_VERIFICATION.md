# Content verification

Source: `3-1_AI Automation Engine – Landing Page 1 Content.docx` (Oct 23, 2026). Every string sits verbatim in `src/data/automationContent.js` / `dashboardData.js`. New UI microcopy is kept separately in `uiCopy` so it can be approved on its own.

## Section checklist (DOCX order = page order)

| # | DOCX section | Page id | Coverage |
|---|---|---|---|
| — | Page meta (title, description, OG title) | `index.html` | ✅ (the DOCX file name is not used) |
| 01 | Hero | `#top` | ✅ eyebrow, headline, punch line, body, 4 leaks, logo strip heading, video caption, results heading + 3 stats, button, under-button. ⚠️ Source line kept in data, hidden by flag (see approvals) |
| 02 | The pattern | `#pattern` | ✅ headline, 3 chips, label, 3 lines, "Same team…", chart title + 5 labels (no invented %), closing line, sub-line |
| 03 | Two types of businesses | `#compare` | ✅ headline, sub, both room names + taglines, all 5 rows × 2, closing question, link |
| 04 | Automation scorecard | `#scorecard` | ✅ label, headline, sub, counter parts, helper, 8 areas × promise × 2 checks = 16 original statements, button, under-button |
| 05 | The AI Automation Engine | `#engine` | ✅ label, headline, sub, wheel centre, helper, all 8 parts × Promise / We cover (4 each) / Produces / Works with, cycle heading + sub, 4 stages, loop line, closing |
| 06 | Dashboard | `#dashboard` | ✅ label, headline, sub, Data/Dashboard/Decisions with all items, try-it line, header, **9 tabs with every tile, panel and decision**, footer label |
| 07 | Proof | `#proof` | ✅ label, headline, sub, 3 cards (outcome, outcome label, doubt, what changes), card button, line under |
| 08 | Why Webchirpy | `#why` | ✅ label, headline, sub, 4 proof points, story title + 3 stops, founder video button, founder card (4 roles), founder headline + intro, 3 difference cards, closing line, button |
| 09 | Trusted across industries | `#trusted` | ✅ label, headline, sub, client voices heading, 13 client names, work gallery heading |
| 10 | Is this for you? | `#fit` | ✅ label, headline, sub, good fit (5) + button, not fit (4), line under |
| 11 | FAQ | `#faq` | ✅ label, headline, sub, **9 Q&As complete** |
| 12 | Everything you get | `#audit` | ✅ label, headline, sub, ticket tag, heading + 15–30 min, 4 deliverables, total line ₹0, 3 promises, button, under-button |
| 13 | Walk in, or walk away | `#decide` / `#book` | ✅ label, headline, sub, walk-away card + 4 items + line, walk-in card + line + 4 items, 3 steps, form tag/heading/sub/5 fields/button/privacy, P.S., P.P.S. |
| 14 | Final CTA + footer | `#final` | ✅ label, headline, sub, button, tagline, 6 explore links, 8 area links, contact labels, legal line, Privacy / Terms |
| — | Sticky bar, floating button, testimonial modal, lead modal, exit popup | global | ✅ all copy |

## Deliberate presentation decisions (please approve)

1. **Scorecard score:** the DOCX sample "100/100 · 0 of 16 gaps" would wrongly imply a perfect score before anything is answered. The page shows **"Not assessed yet"** until all 8 areas are reviewed (an area counts as reviewed when a check is ticked or "Neither applies to us" is pressed). After that the score is `100 − round(100 × gaps / 16)`. **Client to confirm the formula.**
2. **Dashboard "Do it" buttons** keep their source label, but pressing one only opens an *"Illustrative recommendation… nothing runs from this demo page"* note.
3. **Overview chart months (Mar · May · Jul · Aug)** have no values in the DOCX. The trend line is labelled "Illustrative trend · values not shown".
4. **Pattern orbit** ("Workload Orbit") has categories but no figures, so it renders as a labelled illustration ("not measured data"). The chart title heads the four supporting cards; "Data entry" and "Chasing follow-ups" share the fourth card and the fourth stage. The stages run Customer work → Manual work → Repeat replies → Data entry, so the story lines show in the order report → enquiry → follow-up, each beside its own workload (the wording is unchanged; the DOCX lists enquiry first). Stage 1's story slot repeats the approved chip "Customers who want to buy" on desktop; stacked layouts show all three chips there. Orbit annotations reuse approved words ("Website", "WhatsApp", "sheets", "Customers who want to buy") plus the earlier microcopy "waits overnight", "manual all day" and "depends on memory" (`uiCopy.orbit`). The closing CTA reuses the approved sticky-bar label "Book fast →". The storyboard's placeholder ring labels (Product, Innovations, User Experience, Insights, Growth, Visual Design & Development) are not in the approved copy and are not used.
5. **Proof 3-step lists** are new microcopy that restates each card's "What changes". Cards are labelled "Capability scenario".
6. **Hero source line** describes the YRE portal, not the 7x / 60x / 23% figures. It is hidden (`VITE_SHOW_HERO_SOURCE_LINE=false`) and replaced by "citation pending confirmation". The YRE project text appears in the work gallery, where it describes built work.
7. **Consent checkbox** ("I agree to be contacted about my free audit call.") is new and required.
8. The **Engine and dashboard mini-workflows** use example strings such as "Is the 6pm slot free tomorrow?" inside panels labelled "Example workflow".
9. **Section labels (02–14)** such as "The pattern" or "Common questions" are kept in `automationContent.js` (`label` fields) but are no longer rendered, so each section opens on its approved headline. Only the hero eyebrow ("AI Automation for lead conversion") is shown.

10. **Motion stories (03 Two rooms, 05 Engine, 06 Dashboard).** All approved copy is unchanged and still rendered: on screen it appears one moment / stage / part at a time, and each section also carries the complete text in screen-reader markup. New microcopy lives in `uiCopy.stories` for approval:
    - **03:** room labels "Room 01 / Room 02"; the final beat "More work. More manual effort." / "More work. Same team." (from the redesign brief, restating the "Next month" row); scene chips "Waiting", "Till morning", "Follow up?", "Call back?", "Hiring", "Replied", "Qualified", "Booked", "24/7", "Day 1/3/7", "With customers", "Same team".
    - **06:** the panel shows only Overview figures (112 hrs, 1,240, 142, ↑ 18%) under the existing "Illustrative view" badge, "Illustrative trend · values not shown" and the footer "Illustrative dashboard. Your real numbers will differ."; the three approved decisions appear one at a time. For "Fix what leaks" the Follow-up indicator turns red, an illustrative choice that matches the Overview decision "Add a third follow-up…". The full nine-tab dashboard (every tile, panel and decision) is unchanged behind "Explore the full dashboard".
    - **05:** each part shows its approved promise and "Produces" line; "What it covers" opens the four "We cover" items and "Works with". Micro-demos reuse the existing illustrative strings from `automationDemos.js` and the step labels in `serviceModules.js` (e.g. "Hi, what's the price for 200 units?", "#1042 · Assigned to Priya", "Yes, let's go ahead!"). The core label "AI Automation" comes from the headline; the approved wheel centre line "8 parts, running together" is kept for screen readers.

## Approvals / verification required before launch

- [ ] Sources for **7x, 60x, 23%** and the wording under them
- [ ] **13+ years**, **500+ businesses**, "Worked with top brands"
- [ ] Permission to show each of the 13 **client names/logos**, plus the logo files
- [ ] **"Limited slots"** claims (sticky bar, audit under-button, form tag/heading, P.P.S.): the copy is shown as supplied, with no counters or countdowns invented
- [ ] Founder portrait, founder video, client-story video
- [ ] Testimonials (none shown until supplied)
- [ ] Booking endpoint, phone, WhatsApp, Privacy and Terms URLs
- [ ] Which third-party integrations are genuinely supported (icons are labelled as examples)
- [ ] All `uiCopy` microcopy in `automationContent.js`
