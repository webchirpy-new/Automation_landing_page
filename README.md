# Webchirpy — AI Automation Engine landing page

A Vite + React 18 + GSAP 3 landing page for Webchirpy's done-for-you AI automation service. Visitors book a **free 15–30 minute automation audit**; the page itself does not run any automation.

Copy is taken verbatim from `3-1_AI Automation Engine – Landing Page 1 Content.docx` and lives in [src/data/automationContent.js](src/data/automationContent.js).

## Quick start

```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # production build → dist/
npm run preview     # serves the production build at http://localhost:4173
npm run lint        # oxlint
```

Requires Node 20.19+ (Vite 8). Built and tested with Node 24.20 and npm 11.

Page title, meta description, OG tags and Google Fonts live in [index.html](index.html).

### Landing pages 2–8

`vsl-02-*.html` … `vsl-08-*.html` at the project root are the seven sub-pages from `3-2_AI Automation Engine – Landing Pages 2–8 Hero Content.docx`. Each has its own title/meta/OG tags and sets `<div id="root" data-page="vsl-0N">`. Every page renders the same app; only the hero copy changes, taken from [src/data/landingPages.js](src/data/landingPages.js). `vite.config.js` builds every `vsl-NN-*.html` file automatically. Page 5 still contains the DOCX `[X]` / `[channels]` placeholders and ships with `noindex` until the real figures are filled in. The app entry is [src/main.jsx](src/main.jsx), which renders [src/App.jsx](src/App.jsx).

## Configuration

Copy `.env.example` to `.env.local` and fill in what the client has approved. Anything left empty renders an honest "pending" state, never a fake value.

| Variable | Effect when empty |
|---|---|
| `VITE_FORM_ENDPOINT` | The form validates, then shows **demo mode: nothing was sent, nothing booked** |
| `VITE_CONTACT_PHONE` / `VITE_CONTACT_WHATSAPP` | Footer shows "to be confirmed" (no broken `tel:` or `wa.me` links) |
| `VITE_FOUNDER_VIDEO_URL` / `VITE_TESTIMONIAL_VIDEO_URL` | Video modal shows "Video pending"; no video is faked |
| `VITE_PRIVACY_URL` / `VITE_TERMS_URL` | Footer shows the label as plain, non-linked text |
| `VITE_SHOW_HERO_SOURCE_LINE` | `false` by default. The DOCX source line does not cite the 7x / 60x / 23% figures |
| `VITE_ENABLE_EXIT_POPUP` | `true` by default. Desktop only, once per session, after 20 s |

**Form payload** (POST JSON): `name, business, phone, industry, time, consent, scorecard{gaps, reviewedAreas, complete, score, priorities[]}, source`. Success is shown only on a 2xx response.

## Deploying (Vercel / Netlify / any static host)

- Build command: `npm run build`. Output directory: `dist`.
- Set the environment variables above in the host's dashboard. Do not commit `.env*` files.

## Assets still needed (placeholders are clearly labelled in the UI)

| What | Where it goes | Current placeholder |
|---|---|---|
| Webchirpy logo (SVG) | `Wordmark` in [Header.jsx](src/components/layout/Header.jsx) | Text wordmark with pixel mark |
| Client logos (13, with permission) | `public/assets/clients/<slug>.svg`, then swap the name tiles in [TrustedIndustries.jsx](src/components/sections/TrustedIndustries.jsx) and the hero logo strip | Names shown as text + "Shown as names until approved logo files are supplied" |
| Founder portrait (Vasanth Sampathkumar) | `public/assets/founder.jpg` → `.founder__portrait` | "VS" monogram + "Asset pending" |
| Founder video and client-story video | env vars above | "Video pending" |
| Work gallery screenshots | `public/assets/work/*.jpg` → `GALLERY` in TrustedIndustries.jsx | 1 described project (YRE portal) + 4 "Asset pending" slots |
| Client testimonials | TrustedIndustries.jsx (`voices`) | "Testimonials pending approval" |

## Project map

```
src/
  config/site.js                 env-driven config + feature flags
  context/SiteContext.jsx        modals, scorecard state (sessionStorage), honest scoring
  data/automationContent.js      VERBATIM DOCX copy + separated new UI microcopy (uiCopy)
  data/dashboardData.js          9 dashboard tabs (illustrative DOCX data)
  data/serviceModules.js         8 parts → pixel icon, example tools, card treatment, workflow
  design/tokens.css, typography.css
  lib/gsap.js, motionTokens.js, scroll.js
  hooks/useMediaQuery.js (useReducedMotion, useBreakpoint…), useInView.js
  components/ui/primitives.jsx   SectionShell, Eyebrow, DisplayHeading, CTAButton, GlassCard, FlowSignal, ScrollProgress
  components/visuals/            PixelField (canvas), PixelIcon, AppTile, CountUp
  components/interactions/       AutomationEngine, FolderCard (+useFlipMorph), ServiceWorkflow, IntegrationShelf,
                                 Scorecard, DashboardDemo, FAQAccordion, LeadForm, Modal
  components/layout/             Header, StickyCTA, SiteModals (lead/video/exit)
  components/sections/           14 sections in DOCX order
  styles/                        global, components, sections, sections-2
docs/                            design system, storyboard, reference audit, content verification, responsive QA
```
