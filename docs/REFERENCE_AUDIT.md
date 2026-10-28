# Reference audit

Written before implementation and updated after it. Lists each source, what was learned from it, and what must not be copied.

## Sources actually used

| # | Source | Status | What we learned | Must NOT copy |
|---|---|---|---|---|
| 1 | `3-1_AI Automation Engine – Landing Page 1 Content.docx` (Downloads; the brief calls it `…Content(2).docx`, but only the un-suffixed file exists) | ✅ Extracted in full: 14 sections + page meta + persistent elements | All copy, section order, 8 parts table, 16 scorecard checks, 9 dashboard tabs, FAQ, form fields | n/a: this is the content master |
| 2 | `ui design for automation.zip` → `n8n.io__utm_source=chatgpt.com.png` | ✅ Viewed | Dotted-grid workflow canvas, thin routes, dark immersive process scenes, state changes | n8n UI, node visuals, brand, copy |
| 3 | `www.codelevate.com_ai_ai-automation-agency….png` | ✅ Viewed | Benefit-first B2B hierarchy, calm negative space, dark/white rhythm, FAQ placement | Lime/green brand colour, layout blocks, copy, stats |
| 4 | `5ed39b9ec2bc7193e76a39c36a3fdbd0.jpg` (Clay integrations) | ✅ Viewed | Layered app tiles in shallow perspective → **IntegrationShelf** (2.5D, draggable fan) | Clay brand, catalogue layout, claim of integrations |
| 5 | `8831811a6ad25723f3b183ce92ea0956.jpg` (FlowiseAI orbit) | ✅ Viewed | Hub + surrounding nodes → **eight-part engine wheel**; hero constellation | FlowiseAI logo, its tool roster |
| 6 | `Screenshot 2026-10-28 132832.png` (Lindy) | ✅ Viewed | Floating icon tiles at safe margins around an editorial hero; whitespace | Headline, CTAs, G2 rating, promo claims |
| 7 | Pest Control Growth Engine URL (structure only) | ⚠️ **Not loaded.** No browser fetch was made in this environment | Section sequence taken from the brief's description (hero → pattern → rooms → scorecard → engine → dashboard → proof → founder → clients → fit → FAQ → audit → decision/form → CTA/footer + sticky elements), which matches the DOCX | Any of its content, colours, numbers, testimonials, imagery |
| 8 | GSAP demo hub, n8n.io, codelevate.com live sites | ⚠️ **Not loaded.** Techniques implemented from GSAP documentation knowledge | Proximity grid, trails, Draggable, Flip, MotionPath, DrawSVG techniques | Exact demo designs |
| — | Book/folder-opening card reference | ❌ Not present in the ZIP (5 images, none a folder card) | Built from the written spec in the brief | — |

## Brand marks

App tiles use official single-colour paths from **Simple Icons** (CC0, `simple-icons@13`) in their brand hex, unmodified, inside a neutral tile. Only the tile animates. Microsoft Outlook isn't in Simple Icons, so email uses our own pixel glyph. Every app-icon cluster carries: *"Example tools & channels — compatibility confirmed during your audit."* The UI claims no partnerships or verified integrations.
