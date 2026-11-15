# Webchirpy AI Automation Growth Engine: Launch Kit Audit and Implementation Plan

**Revised:** 15 November 2026 (scope revision 3: functional dummy forms are kept and are current scope)
**Codebase:** this repository (Vite + React, static site on Vercel). Live site: https://automation-sigma-rust.vercel.app/
**References:** Launch Kit 01 (Scorecard Spec), 02 (Lead Form Spec), 03 (Privacy and Consent), 04 (Landing Pages PP5–8)
**Not provided:** the *Business Model* and *Nurture Strategy* PDFs. They are needed only for deferred Phase 6.

**Status:** Plan only. No application code changes until it's approved.

---

## Scope at a glance

| Phase | Name | Scope |
|---|---|---|
| 1 | Landing page frontend, including the existing dummy booking form | **CURRENT** |
| 2 | Scorecard functionality, including a dummy report form | **CURRENT** |
| 3 | Privacy page and landing page SEO | **CURRENT** |
| 4 | Tally forms (Form A report, Form B booking) | DEFERRED |
| 5 | CRM integration | DEFERRED |
| 6 | Marketing automation and tracking | DEFERRED |
| 7 | Testing and deployment | DEFERRED |

### Progress (15 Nov 2026)

| Phase | State | Still open |
|---|---|---|
| 1 | **Built** (not deployed, not committed): 1.1, 1.3, 1.8, 1.9, 1.10–1.14 sections, 1.16, plus vsl-05 kept out of the build | 1.2 (pages 2/4/8 stats, D9), 1.4 (D5), 1.5 (D4), 1.6 (D2), 1.15 Kit 04 hero copy (D8), 1.17 visual check on real phones |
| 2 | **Built**: 2.1–2.13; result screen uses the D10 recommendation | Band messages still say "Your report shows…" (D19) |
| 3 | **Built**: `/privacy` draft page with banner, markers and `noindex`; footer link; `twitter:card` set to `summary` | `canonical` / `og:url` (D12), `og:image` (D13), legal review (D17), business details (D11) |

**Ad page trim (15 Nov 2026):** the site footer (explore links, engine-area links, contact, © line, Privacy / Terms) is removed; the page ends on the closing CTA. The Privacy Notice stays linked beside both forms. The dashboard section stays (it was briefly removed, then restored at the client's request). Both workflow "replay" controls are removed: each workflow animation plays once.

**Dashboard (15 Nov 2026, superseded by the trim above): kept as originally designed.** It was briefly removed and replaced with a WhatsApp morning-summary block, then restored exactly as before at the client's request: the 9-tab `#dashboard` section, its footer link and all original "dashboard / one screen" wording. Open point: the client said Webchirpy delivers a WhatsApp morning summary rather than a dashboard. If that is final, the dashboard section and copy (vsl-03, Engine Insights) describe something that is not sold (D20).

**Client copy change (15 Nov 2026):** the dummy report form says "Fill in the form and our team will reach out to you." instead of Kit 01's "Get your full report on WhatsApp." See D19.

### Ground rules for the current scope

- Stay on Vite + React. No Next.js migration, no redesign; reuse the existing components, tokens and layout.
- No backend, no serverless functions, no webhooks, no tracking scripts, no fake integrations.
- **Dummy forms stay functional.** The existing booking form (`LeadForm.jsx`) keeps its UI, fields, validation and interactions. A dummy report form (Kit 02 Form A fields) sits under the scorecard result. Both validate and then show a clear **demo-only** confirmation. Neither sends, stores or saves anything; neither claims a booking or a saved lead. Tally replaces both in Phase 4.
- No invented copy, client results, testimonials or prices. Unapproved items stay hidden, not filled in.
- No deployment, no push, no Vercel or production environment variable changes.
- Existing working functionality is kept. Anything removed is listed below with the reason.

---

## Part A: Audit findings

### A1. Already implemented

| Item | Where |
|---|---|
| 8 areas × 2 checks, wording matching Kit 01 except "orders" | [automationContent.js:107-196](../src/data/automationContent.js#L107-L196) |
| "Neither applies to us" per area; an area counts as reviewed when a check is ticked or "Neither" is chosen | [SiteContext.jsx:11-26](../src/context/SiteContext.jsx#L11-L26) |
| Score hidden until all 8 areas are reviewed; automation map; answers kept for the session | [Scorecard.jsx](../src/components/interactions/Scorecard.jsx) |
| Areas linked to the matching Engine section | [serviceModules.js](../src/data/serviceModules.js) |
| Multi-page build: `index.html` plus `vsl-02` to `vsl-08`, each with its own hero copy | [vite.config.js](../vite.config.js), [landingPages.js](../src/data/landingPages.js) |
| Per-page `<title>`, meta description and OG title; `noindex` on vsl-05 | root `*.html` |
| Anchors `#top #pattern #compare #scorecard #engine #dashboard #proof #why #trusted #fit #faq #audit #decide #book #final` | section components |
| Accessibility basics: skip link, aria-live status, focus moved after scroll, labelled fields | various |

### A2. Broken or incorrect

| # | Finding | Where |
|---|---|---|
| 1 | **The live booking form sends nothing.** No endpoint is configured, so it falls back to "Demo mode… Nothing has been booked." This is now the intended dummy behaviour until Tally (Phase 4) | [LeadForm.jsx:71](../src/components/interactions/LeadForm.jsx#L71) |
| 2 | The score is `100 − round(100×gaps/16)`, which is wrong at 2, 6, 10 and 14 gaps (2 gaps gives 87; the spec gives 88) | [SiteContext.jsx:22](../src/context/SiteContext.jsx#L22) |
| 3 | The priority list breaks ties by page order and shows every area with gaps. The spec wants the top 3, ties broken in quick-win order | [SiteContext.jsx:24](../src/context/SiteContext.jsx#L24) |
| 4 | The Operations check is missing "orders" | [automationContent.js:163](../src/data/automationContent.js#L163) |
| 5 | The scorecard CTA jumps straight to the call booking. The spec flow is result, then report, then call | [Scorecard.jsx:143](../src/components/interactions/Scorecard.jsx#L143) |
| 6 | Page 1 stats 7x / 60x / 23% show "citation pending confirmation" (and read "0x / 0x / 0%" until the count-up runs) | [automationContent.js:34-38](../src/data/automationContent.js#L34-L38), [landingPages.js:27](../src/data/landingPages.js#L27) |
| 7 | "Asset pending" shows on the hero video card, the founder portrait, the project cards and the client-story pill | [Hero.jsx](../src/components/sections/Hero.jsx), [WhyWebchirpy.jsx:157](../src/components/sections/WhyWebchirpy.jsx#L157), [ClientStoryScatter.jsx](../src/components/interactions/ClientStoryScatter.jsx) |
| 8 | "Limited slots / Book fast" appears 5 times without a confirmed number | `audit.underButton`, `walk.form.tag`, `walk.form.heading`, `walk.pps`, `persistent.stickyBar` in [automationContent.js](../src/data/automationContent.js) |
| 9 | "What our clients say" heading with no testimonials under it; 13 logos with no confirmed permission | [TrustedIndustries.jsx](../src/components/sections/TrustedIndustries.jsx) |
| 10 | The privacy line "Your details are only used to book your call." is false once follow-ups start | [automationContent.js:646](../src/data/automationContent.js#L646) |
| 11 | "No price talk" and "₹0 · No price pitch" contradict Kit 04's plan to show the price | `audit.promises[1]`, `audit.total`, `walk.in.items[3]`, FAQ cost answer |
| 12 | vsl-05 has `[X]` placeholders in its title and hero; vsl-08 names ChatGPT (Kit 04 says not to) | [landingPages.js](../src/data/landingPages.js), `vsl-05-*.html`, `vsl-08-*.html` |
| 13 | Deep links like `…#test` probably don't land, because nothing scrolls to the hash after React renders | [smoothScroll.js](../src/lib/smoothScroll.js) |
| 14 | `/privacy` returns 404; the footer's "Privacy Policy" is unlinked text | [FinalCTA.jsx:138](../src/components/sections/FinalCTA.jsx#L138) |
| 15 | No `og:image`, `og:description`, `canonical` or Twitter tags on any page | root `*.html` |

### A3. Missing

- **Scorecard:** the 2 context questions, score bands and result copy, Leaking / Partly manual / Running statuses, the "biggest gap" line, lane A–D assignment.
- **Kit 04 sections:** `#story` `#connects` `#repeats` `#test` `#summary` `#steps` `#at-work` `#fits`.
- **Privacy:** the `/privacy` page, the consent wording (C1, M1, N1, N2) and links beside the forms.
- **Tracking, forms and backend:** none exist. All deferred (Phases 4–6).

---

## Part B: Implementation plan

### Phase 1: Landing page frontend (CURRENT)

**Requirements (Kit 04 §01, §02–05)**
- Hide unverified statistics and every "Asset pending" slot until the asset exists.
- Remove or reword unconfirmed claims: limited slots, logo label, testimonials heading.
- Replace the false privacy line with Kit 03's N2. Keep the dummy booking form working.
- Add the page-specific sections for vsl-05 to vsl-08, with the anchors the ads link to.
- Make deep links land on the right section, and every CTA point at an anchor that exists.
- Change price and FAQ copy only if the price is approved.
- Keep vsl-05 unpublished.

**Existing implementation:** shared body for all 8 pages; hero copy per page; placeholders hidden behind `null` config values but still visible as "pending" labels; one booking form in demo mode.

**Required changes**

| # | Change | Approval needed? |
|---|---|---|
| 1.1 | **Hide placeholders.** Render nothing (not an "Asset pending" label) for the hero video card, founder portrait, project screenshots and client-story pill until the URL or asset is configured. Same switches as today (`siteConfig.*`) | No |
| 1.2 | **Unverified stats.** Hide page 1's results strip (7x / 60x / 23%). Pages 2, 4 and 8 have cited third-party stats: keep or remove, per decision D9 | D9 |
| 1.3 | **Testimonials.** Hide the "What our clients say" heading and its empty block until approved quotes exist | No |
| 1.4 | **Logos.** Relabel the carousel (for example "Brands and organisations we have done design and technology work for") and show only permitted logos | D5 |
| 1.5 | **Limited slots.** Replace the 5 lines with "We take on {N} new blueprints a month", or remove them | D4 |
| 1.6 | **Price.** Promise 02 becomes "Price upfront. No pressure. …", update the FAQ cost answer, and reword "₹0 · No price pitch" and "No price pitch" in Walk-in. Kit 04 wording only | D2 (blocked until approved) |
| 1.7 | **Privacy line.** Replace "Your details are only used to book your call." with N2: "Your details are used only for your report and your call, unless you tick "tips and updates". Privacy Notice", linked to `/privacy` | Legal review (Kit 03) |
| 1.8 | **Dummy booking form kept as is.** `LeadForm.jsx` keeps its UI, fields, validation and responsiveness at `#book` and in the lead modal. On submit it shows the demo-mode confirmation ("…your details were not sent anywhere. Nothing has been booked."). Only change: the N2 privacy line with a link to `/privacy` | No |
| 1.9 | **Deep links on load.** After the app mounts, scroll to `location.hash` once (respecting reduced motion) so `vsl-07…#test` and similar links land on the right section | No |
| 1.10 | **Kit 04 section slot.** Add a `PageSection` slot under the hero in [App.jsx](../src/App.jsx) that renders the current page's own section. Page 1 to vsl-04 render nothing | No |
| 1.11 | **vsl-05 `#story`.** Build the section (before, 3 steps, after, what did not change, honest note). The page stays out of the build until the client result is confirmed | D7 |
| 1.12 | **vsl-06.** Build `#connects` (the "when this happens" table, examples note, "our promise" line) and `#repeats` (tap-to-count with the "Typed {N} times" result, button to `#scorecard`) | D8; the "our promise" line also needs D15 |
| 1.13 | **vsl-07.** Build `#test` in the hero (3 questions, two buttons each, results by 3 / 1–2 / 0 known, button to `#scorecard`; each "I'd have to ask someone" pre-ticks Insights check 1) and `#summary` (list plus the illustrative 8 am sample) | D8 |
| 1.14 | **vsl-08.** Build `#steps` (3-step table), `#at-work` (5-step illustrative timeline) and `#fits` (tap-to-count with the "{N} of these are a fit" result) | D8 |
| 1.15 | **Kit 04 hero copy** for vsl-05 to vsl-08: eyebrow, headline, punch line, body, list, video caption, results strip, button. This also removes "ChatGPT" from vsl-08 | D8 |
| 1.16 | **CTA audit.** Every Kit 04 ad anchor must exist on its page (§02 table): `#story #scorecard #connects #repeats #test #summary #book #at-work #steps #fits`. Booking CTAs go to `#book`, which holds the dummy booking form | No |
| 1.17 | **Mobile.** Check the new sections at 360, 390 and 768 px with a 16 px gutter and no horizontal scroll; check the vsl-07 test sits above the fold on a phone | No |

**Files affected**
- `src/data/automationContent.js`, `src/data/landingPages.js`
- New: `src/data/pageSections.js` (Kit 04 section copy)
- `src/App.jsx`
- New: `src/components/sections/PageSection.jsx`, plus one component per Kit 04 section in `src/components/page-sections/`
- `src/components/interactions/LeadForm.jsx` (privacy line only)
- `src/components/sections/Hero.jsx`, `src/components/sections/WhyWebchirpy.jsx`, `src/components/sections/TrustedIndustries.jsx`
- `src/components/interactions/ClientStoryScatter.jsx`, `src/components/sections/AuditOffer.jsx`, `src/components/layout/StickyCTA.jsx`
- `src/lib/smoothScroll.js` or `src/lib/scroll.js`
- `vite.config.js` (exclude vsl-05 from the build)
- `vsl-05` to `vsl-08` HTML files (meta only)
- New styles in `src/styles/sections-2.css` (or a new `page-sections.css`) using the existing tokens

**Dependencies:** D2, D4, D5, D7, D8, D9, D15. Items 1.1, 1.3, 1.8, 1.9, 1.10, 1.16 and 1.17 have no dependencies.

**Status:** Not started. Waiting for approval.

---

### Phase 2: Scorecard functionality (CURRENT)

**Requirements (Kit 01 §02–05)**
- 16 checks with Kit 01 wording, and "Neither applies" per area.
- 2 context questions after the 8 areas. They don't change the score.
- Score: `Math.floor(((16 − gaps) / 16) × 100 + 0.5)`.
- Area status: 2 ticks = Leaking, 1 tick = Partly manual, 0 ticks or Neither = Running.
- Top 3: areas with 2 ticks, then areas with 1 tick. Ties broken in quick-win order: Instant Reply, Follow-up, Retention, Lead Capture, Back Office, Sales Pipeline, Operations, Insights.
- Bands:

| Gaps | Score | Band |
|---|---|---|
| 0–3 | 81–100 | Running on systems |
| 4–8 | 50–75 | Leaking in places |
| 9–12 | 25–44 | Running on effort |
| 13–16 | 0–19 | Running on memory |

- Lanes:
  - Default: the area group with the most ticks. A = Lead Capture, Instant Reply, Follow-up, Sales Pipeline. B = Insights. C = Operations, Back Office, Retention. Tie order: A, then C, then B.
  - AI override: lane D if `utm_content` starts with `PP8` and the AI answer is "chat tools for writing" or "tried, did not stick".
  - Ad override: if there are 2 or fewer gaps and `utm_content` names a pain point, use that pain point's lane. PP1/2/5 = A, PP3/7 = B, PP4/6 = C, PP8 = D.
- Result screen shown free, before any form.

**Existing implementation:** checks and "Neither" work; the map shows gap counts; the score uses the wrong rounding; priorities are unordered and uncapped; no context questions, bands or lanes; the CTA goes to booking.

**Required changes**

| # | Change | Approval needed? |
|---|---|---|
| 2.1 | Move all scoring into pure functions in a new `src/lib/scoring.js`: `gaps`, `score`, `areaStatus`, `band`, `top3`, `lane`. `SiteContext` calls these | No |
| 2.2 | Fix the rounding to the spec formula | No |
| 2.3 | Top 3 with quick-win tie order (replaces the uncapped priority list) | No |
| 2.4 | Rename statuses to Leaking / Partly manual / Running on the map, badges and summary (same colours as today) | No |
| 2.5 | Operations check 1 becomes "Bookings, orders and schedules live in chats, calls and notebooks." | No (Kit 01 edit) |
| 2.6 | Intro copy: "Score your business. Find your gaps." / "Tick what sounds like your week. Be honest; nobody sees this but you. At the end you get your score, your 3 biggest gaps and what to fix first." | No (Kit 01 copy) |
| 2.7 | Add the 2 context questions as one-tap chip groups after the 8 areas. Answers kept in the same session state. Enquiry volume "Not sure" is flagged as a Lead Capture signal for the future report text | No |
| 2.8 | Result screen once all 8 areas are reviewed. The context questions are optional: the result doesn't wait for them, but they're shown first. Content: "{score} / 100 · {band}", the band message, "You ticked {gaps} of 16 gaps. Your biggest gap is {area}: {one-line meaning}", the automation map, and the top 3 area names | D10 |
| 2.9 | **Dummy report form** under the result: "Get your full report on WhatsApp", with Kit 02 Form A fields (name, WhatsApp number, business name, years, team size, required consent C1, optional M1) and Kit 02 validation (+91, 10 digits starting 6–9). On submit it shows a demo-only confirmation. Nothing is sent or stored; the values live only in component state. A secondary "Book a free call" link to `#book` stays | No |
| 2.10 | Lanes A–D calculated (including the AI and ad overrides from `utm_content` in the page URL) and exposed through context for Phase 4 hidden fields. **Not shown to the visitor.** No storage beyond the current session state, no sending | No |
| 2.11 | `scorecardPayload(summary)` helper that builds the future `scorecard_*` hidden-field object (Part C). Built now so Phase 4 is only wiring; nothing is sent | No |
| 2.12 | vsl-07 hook: an `insightsPretick()` action used by the 3-question test (Phase 1.13) | No |
| 2.13 | Bump the session storage key (`wc-scorecard-v1` to `v2`) so old saved state can't produce an invalid shape | No |

**Files affected**
- New: `src/lib/scoring.js`
- `src/context/SiteContext.jsx`
- `src/components/interactions/Scorecard.jsx`
- `src/components/sections/ScorecardSection.jsx`
- `src/data/automationContent.js` (intro, Operations wording, bands, context questions, one-line meanings)
- New: `src/components/interactions/ScoreResult.jsx`
- New: `src/components/interactions/ReportForm.jsx` (dummy Form A)
- Scorecard styles in `src/styles/components.css` / `sections.css`

**Dependencies:** D10 (how much of the result to show for free). Everything else is fully specified in Kit 01 and Kit 02.

**Status:** Not started. Waiting for approval.

**Manual check after building** (automated tests are Phase 7): 0, 1, 2, 3, 4, 7, 8, 9, 12, 13 and 16 gaps against the band table; tie cases for the top 3; each lane rule with and without `?utm_content=PP8-…`.

---

### Phase 3: Privacy page and landing page SEO (CURRENT)

**Requirements:** `/privacy` built from Kit 03 §02. Every missing business detail and legal item visibly flagged; nothing published as final. Privacy links in the footer and beside each form slot. Page-specific SEO metadata.

**Existing implementation:** no privacy page; the footer link is unlinked text; pages have a title, description and OG title only.

**Required changes**

| # | Change | Approval needed? |
|---|---|---|
| 3.1 | Add `privacy/index.html` as a new Vite entry. It's served at `/privacy` with no Vercel config change. It's a plain static page using the site's typography and tokens, not the React app | No |
| 3.2 | Content: Kit 03 §02 sections 1–11 as written | Legal review |
| 3.3 | Every `{placeholder}` rendered as a visible highlighted marker ("To be confirmed: registered business name"), never guessed | D11 |
| 3.4 | Banner on the page: **"Draft — pending legal review. Not yet in effect."** It's removed only after sign-off | Legal sign-off |
| 3.5 | `noindex` on `/privacy` while it's a draft | No |
| 3.6 | Footer "Privacy Policy" linked to `/privacy`, and "Privacy Notice" linked beside both dummy forms (N1/N2 text) | No |
| 3.7 | SEO per page: `og:description`, `twitter:card` and title/description, all from the existing approved meta text. `canonical` and `og:url` once the production domain is confirmed. `og:image` once an approved image exists | D12, D13 |
| 3.8 | Kit 04 meta for vsl-05 to vsl-08 (title, description, OG title) | D8 |
| 3.9 | vsl-05 keeps `noindex` and is excluded from the build until D7 | D7 |

**Files affected:**
- New: `privacy/index.html` and its stylesheet
- `vite.config.js` (add the `privacy` entry)
- `src/components/sections/FinalCTA.jsx`
- `src/config/site.js` (default `privacyUrl` to `/privacy`)
- `index.html` and the `vsl-*.html` files

**Dependencies:** D11 (business details), D12 (domain), D13 (OG image), legal review.

**Status:** Not started. Waiting for approval.

---

### Phase 4: Tally forms (DEFERRED)

**Requirements:** Form A (report, after the scorecard) and Form B (two-step booking with qualification), Kit 02 §02–03. Field lists are in Part C.

**Prepared in the current scope:** the two dummy forms sit exactly where the Tally forms will go, and the `scorecardPayload` helper (2.11) already builds the scorecard hidden fields.

**Integration points (dummy form → Tally form)**

| Slot | Location | Today (current scope) | Phase 4 |
|---|---|---|---|
| Report | Under the scorecard result (`ReportForm.jsx`, Phase 2.9) | Dummy Form A | Tally Form A |
| Booking | `#book` in [WalkIn.jsx:97](../src/components/sections/WalkIn.jsx#L97) | Dummy `LeadForm.jsx` | Tally Form B, then Brevo Meetings |
| Booking (modal) | Lead modal in [SiteModals.jsx:78](../src/components/layout/SiteModals.jsx#L78), opened from Why Webchirpy and the Final CTA | Dummy `LeadForm.jsx` | Tally Form B |

All other booking CTAs (Pattern, Fit, Audit, sticky bar, Header) already go to `#book` through `goToBooking`. CTA navigation and the page design stay unchanged when the forms are swapped.

**Work when this phase starts:**
- Build both forms in Tally, including conditional logic for qualification and hidden fields.
- Swap each dummy form for its Tally embed in the same slot, passing scorecard results and attribution data as URL parameters.
- Point Tally's completion step at the Brevo Meetings link.
- **Decision needed:** whether step 1 of Form B saves a partial lead when step 2 is abandoned (Tally supports partial submissions).

**Files:**
- `src/components/interactions/ReportForm.jsx`, `src/components/interactions/LeadForm.jsx` (replaced by embeds)
- `src/config/site.js` (`tallyReportFormUrl`, `tallyBookingFormUrl`, `brevoMeetingsUrl`)
- `.env.example`

**Status:** Deferred.

### Phase 5: CRM integration (DEFERRED)

**Requirements:** one lead record per submission with every field in Part C. Duplicate prevention, internal alert within 10 seconds, consent proof stored (Kit 02 §04).

**Integration point:** Tally webhook → CRM or Google Sheet (configured in Tally and the CRM, not in this repo).

**Status:** Deferred. No repo changes are expected unless a CRM needs a server endpoint.

### Phase 6: Marketing automation and tracking (DEFERRED)

**Requirements:**
- Meta Pixel and GA4 events: PageView, ScorecardStart, ScorecardComplete, Lead, QualifiedLead, Schedule, TestComplete (vsl-07), each with an `event_id` so browser and server events aren't counted twice.
- Meta Conversions API.
- UTM, fbclid, fbp and fbc kept for the browser session.
- WhatsApp report delivery in under 60 seconds.
- Booking confirmation and reminders, nurture lanes A–D, STOP handling.
- No-show recovery and retargeting.

**Integration points:**
- `src/lib/track.js` and `src/lib/attribution.js` (new; the Phase 2 scoring functions already expose the events' data).
- Event triggers: first tick or Neither (ScorecardStart), result shown (ScorecardComplete), vsl-07 result (TestComplete).
- Everything else runs in Tally, Brevo and n8n/Make plus the WhatsApp provider.

**Needs:** the Nurture Strategy PDF, Pixel ID, GA4 ID, CAPI token, a WhatsApp Business API provider and approved templates.

**Status:** Deferred.

### Phase 7: Testing and deployment (DEFERRED)

**Scope:**
- Vitest unit tests for `src/lib/scoring.js`.
- Kit 01 §05.5 and Kit 02 §04.5 launch tests (timed on a mid-range Android phone on 4G, 5 or 10 test leads, 11 pm WhatsApp check, STOP check).
- Meta Events Manager and GA4 DebugView checks.
- Vercel environment variables, deployment, push and release.

**Status:** Deferred. During Phases 1–3 the only checks are `npm run build`, `npm run lint` and manual browser checks.

---

## Part C: Data specifications (for the deferred phases)

### C1. Form A: report form (Kit 02 §02)

| # | Field | Type | Validation | Required |
|---|---|---|---|---|
| 1 | Your name | Text | 2–60 characters, autofill on | Yes |
| 2 | WhatsApp number | Phone | +91 fixed, 10 digits starting 6–9; remove spaces and a leading 0. Error: "Please enter a 10-digit mobile number. Your report is sent here." | Yes |
| 3 | Business name | Text | 2–80 characters | Yes |
| 4 | Years in business | Dropdown | Less than 2 · 2 to 5 · 5 to 10 · 10 to 20 · More than 20 | Yes |
| 5 | Team size | Dropdown | Just me · 2 to 4 · 5 to 15 · 16 to 50 · 51 to 200 · More than 200 | Yes |
| 6 | Contact consent (C1 v1.0) | Checkbox | Unticked by default | Yes |
| 7 | Tips and updates (M1 v1.0) | Checkbox | Unticked, never pre-ticked | No |

Button: **SEND MY REPORT →**. Under it: "Arrives on WhatsApp in under a minute. Reply STOP anytime."

### C2. Form B: booking form, two steps (Kit 02 §03)

**Step 1** (submitting it creates the lead): name, WhatsApp number, business name (as in Form A), contact consent C1. Button: **NEXT: PICK A TIME →**.

**Step 2:**
- Years in business, team size (as in Form A).
- Industry: Distribution or trading · Manufacturing · Clinic, hospital or diagnostics · Education or coaching · Professional services (CA, legal, consulting) · Real estate or construction · Retail or e-commerce · Travel or hospitality · Other (opens a short text box).
- Website or Google listing (optional).
- What takes most of your team's time (multi-select, pre-ticked from the scorecard's top gaps): Replying to enquiries · Following up · Data entry and copy-paste · Reports · Chasing payments · Scheduling and orders · Something else.
- Email (optional).
- Tips and updates M1 (optional).

**Then:** the Brevo Meetings calendar, prefilled, showing slots in the next 3 working days.

**Routing:**
- Under 5 years: no calendar, "not a fit" message and tag.
- 5+ years and Just me: calendar, tagged "solo" (D3).
- 5+ years and team at or above the threshold: calendar, QualifiedLead event.

### C3. Hidden fields on both forms (Kit 02 §04.1)

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (pattern `PP5-P02-4x5`), `utm_term`
- `fbclid`, `fbp`, `fbc`
- `page_variant` (for example `vsl-05`)
- `scorecard_answers` (16 true/false values), `scorecard_area_status` (8), `scorecard_gaps`, `scorecard_score`, `scorecard_band`, `scorecard_top3`, `scorecard_lane`, `scorecard_ai_use`, `scorecard_enquiry_volume`
- `consent_version`, `consent_time`
- `submitted_at` (server time, IST)

### C4. Lead record for the CRM (Kit 01 §05.4, Kit 02 §04)

- Everything in C3, plus all form fields.
- Qualification tag: qualified / solo / not a fit.
- Lead score.
- Timestamps for scorecard start, scorecard complete, report sent and call booked.
- Lead owner.

Store nothing you wouldn't be comfortable showing the owner.

### C5. First 60 seconds after a submit (Phase 5–6 target)

| When | What happens |
|---|---|
| 0 s | Record written |
| < 10 s | Internal WhatsApp alert |
| < 60 s | WhatsApp report or confirmation sent to the lead (approved template, W1 footer) |
| < 60 s | Lead, QualifiedLead and Schedule events sent |
| Business hours | Website reviewed, 3 notes added, voice note sent for leads scoring 50+ |

---

## Part D: Decisions and approvals needed

| ID | Decision | Blocks |
|---|---|---|
| D2 | Price: confirm ₹14,999 and the 30-day credit to the first retainer | 1.6 |
| D3 | Team-size threshold (proposed 5), and whether solo owners can book | Phase 4 |
| D4 | Monthly blueprint capacity N, or remove the "Limited slots" lines | 1.5 |
| D5 | Which logos have permission, and the new carousel label | 1.4 |
| D6 | Brand name: "AI Automation Engine" or "Automation as a Service" | 1.15 wording |
| D7 | vsl-05: the client's written confirmation of "about 6 hours to about 2 minutes", plus the month and year for the source line | 1.11, 3.9 |
| D8 | Use Kit 04 copy for vsl-05 to vsl-08 (heroes, sections, meta)? Kit 04 also renames the files. Keeping the current file names avoids needing redirects (a Vercel config change). **Recommendation: Kit 04 copy, current file names** | 1.12–1.15, 3.8 |
| D9 | Stats on pages 2, 4 and 8 (cited: MIT/HBR, McKinsey): keep or remove? Page 1's uncited stats are hidden either way | 1.2 |
| D10 | How much of the result is free on the site. Kit 01 shows score, band, biggest gap and map for free, and gates the top-3 detail (what we'd automate, effort, timing) behind the WhatsApp report. Your brief says "display the complete scorecard results". **Recommendation: Kit 01's result screen plus the top 3 area names; keep the effort and timing estimates for the report, since they aren't confirmed yet** | 2.8 |
| D11 | Privacy details: registered name, address, GSTIN, privacy email, WhatsApp number, responsible person, provider list (Vercel, Tally, Brevo, WhatsApp provider, CRM, automation tool, analytics) | 3.3 |
| D12 | Production domain, for canonical and `og:url` (the site is on `*.vercel.app` today) | 3.7 |
| D13 | Approved share image (1200×630) for `og:image` | 3.7 |
| ~~D14~~ | **Resolved (scope revision 3):** keep `LeadForm.jsx` as a functional dummy form; add a dummy report form. Both are replaced by Tally in Phase 4 | |
| D15 | Confirm the vsl-06 promise: "We will not ask you to replace a tool that works…" | 1.12 |
| D16 | Opportunity-library effort and timing estimates confirmed by the delivery team (needed for the report, Phase 4) | Phase 4 |
| D17 | Lawyer review of the privacy notice, consent split (T1–T5 vs T7) and retention periods | Publishing `/privacy` |
| D18 | Whether "13+ years" and "500+ businesses served" can be backed up (Engine proof points; untouched until confirmed) | none (flag only) |
| D20 | **Dashboard vs morning summary.** The dashboard section and copy are back as designed. Confirm clients can get a dashboard; if they only get the WhatsApp morning summary, the section and the vsl-03 / Engine Insights wording need to change before launch | Dashboard section, vsl-03 |
| D19 | **"Our team will reach out" instead of a WhatsApp report.** Kit 01's four band messages ("Your report shows…"), the C1 consent line ("…to send my report…") and the privacy notice rows about "the scorecard report you asked for" still describe a report. Confirm whether a report is still sent; if not, approve new wording for all three | Band messages, C1, `/privacy` §2 |

**Can start with no decisions:**
- Phase 1: 1.1, 1.3, 1.8, 1.9, 1.10, 1.16, 1.17
- Phase 2: everything except 2.8's exact content (D10)
- Phase 3: 3.1–3.6 (with placeholders flagged)

---

## Part E: Other findings

- `src/components/layout/Header.jsx` exists but isn't rendered anywhere. Leave as is.
- The hero logo strip is commented out in [Hero.jsx](../src/components/sections/Hero.jsx); logos appear only in the Trusted section.
- The exit popup (on by default) promises an "automation checklist", which doesn't exist yet as a deliverable. Flag for D4/D10 copy review.
- Uncommitted change in the working tree: the hero intro animation was removed earlier this session.
