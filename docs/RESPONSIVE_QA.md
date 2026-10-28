# Responsive & functional QA: what was actually tested

**Environment:** Windows 11, Node 24.20, production build (`npm run build` → `vite preview`), headless Google Chrome via `puppeteer-core`, 28 Oct 2026. The test scripts lived in a temporary scratch folder and are not part of the repo.

## Automated checks that ran and passed

**Layout scan at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920 px** (phones with mobile + touch emulation), after scrolling the whole page:
- `documentElement.scrollWidth === viewport` at every width (no horizontal page scroll)
- 0 unclipped elements beyond the viewport
- 0 console errors / page errors
- Single `<h1>`, 14 section `<h2>`s, all anchors present

**State overflow scan at 320 / 375 / 768:** every one of the 8 engine parts opened, all 9 dashboard tabs, all proof books open → no overflow.

**Functional suite: 77/77 pass** (re-run after the move from Gatsby to Vite: same result) across desktop 1440, phone 375 (touch) and reduced motion 1280:
- Hero CTA scrolls to the scorecard. A hero tile opens the channel-route card.
- Comparison row radio works, including arrow keys (desktop).
- Scorecard starts "Not assessed yet" (never 100/100). Completing it gives 94/100 with 1 of 16 gaps, the priority list appears, and the plan CTA reaches the form with the scorecard summary attached.
- Engine: opening Back Office shows its full copy, a works-with chip switches part, and Back closes the folder. The footer deep link `#engine-retention` opens Retention.
- Dashboard: tabs change content, ArrowRight moves tabs, all 9 tabs render, and "Do it" shows the illustrative note.
- Proof book opens. FAQ expands.
- Lead modal opens, Escape closes it, and focus returns to the opener.
- The video modal shows "Video pending" with no iframe.
- An empty submit shows 5 errors. A valid submit reports **demo mode**, never "booked".
- No reveal content is left hidden. No console errors.

## Visual review
Section-by-section screenshots at 1440 and 375 were reviewed by eye. Defects found that way and fixed: hero top-right emptiness, dashboard bento holes, proof cover clipping, founder button overlap, gallery gap, crowded phone motif glyphs, and the engine sheet overflowing on phones.

## Bugs found by testing and fixed
- Engine panel overflowed to 443–540 px on phones (implicit grid column at min-content) → `minmax(0,1fr)` + `overflow-x: clip`.
- Hero canvas threw in `requestAnimationFrame` when the phone route was shorter than the signal head (negative modulo) → safe modulo.

## NOT tested (do before launch)
- Real iOS Safari / Android Chrome devices: touch feel of the hero field, Draggable shelf, safe-area insets. Only Chrome emulation was used.
- Firefox, Safari, Edge.
- 200% browser zoom, and landscape phones.
- Screen readers (NVDA / VoiceOver). ARIA roles and labels were implemented but not heard.
- Formal contrast audit. Token pairs were chosen for AA, but there was no automated axe/Lighthouse run.
- Lighthouse performance on a throttled mid-range phone.
- Exit-intent popup (needs a real mouse leaving the window; covered by code review only).
- A real form endpoint (none configured).

## Known limitations
- The consent checkbox is 24×24 px. Its label extends the hit area, but the box itself is under 44 px.
