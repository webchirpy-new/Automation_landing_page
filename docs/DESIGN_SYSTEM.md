# Design system — "The Self-Organising Intelligent System"

Scattered business inputs (pixels) organise into routed, completed work. The hero opens as a reactive pixel field. A thin violet signal recurs at key beats: broken, repaired, a ring, a data dash. The footer resolves the hero's pixels into one completed loop.

## Current colour and CTA system: Spectral (V4)
V4 replaces the V3 notes (70–80% highlight coverage, blue-leaning accents) and the Neo Green system and the older violet and ember descriptions further down this file. The accent language comes from the iridescent glass aircraft in the Hero intro. Backgrounds, layout and copy did not change; only accents did.

- **Palette** (`src/design/tokens.css`): `--spectral-cyan` #8CE6F0, `--spectral-blue` #87BAFF, `--spectral-periwinkle` #A3A1F7, `--spectral-violet` #B79AEE, `--spectral-lavender` #C9B8F5, `--spectral-pink` #F0BEDF, plus deep tones for white ground (`--spectral-*-deep`, all at least 5.5:1 on white). Neutrals: `--spectral-light-neutral` #F7F8FB (on dark ground), `--spectral-dark-neutral` #111419 (on white).
- **Presets:** `--spectral-stroke` / `--spectral-stroke-light` (edges, rails, progress), `--spectral-fill-dark` / `--spectral-fill-light` (small fills), `--spectral-glow` / `--spectral-glow-sm` (hover and focus bloom only), `--spectral-flow-duration` 16 s. `--spectral-fill` and `--spectral-line` are scope-aware: they switch with `--accent`, so text on a fill keeps its contrast. Components vary angle, size and phase, never the palette.
- **Neutrals:** the old green-tinted greys (#0A0F0C, #F2F7F3, #58625B…) are now cool neutrals at the same lightness, so every contrast ratio is unchanged.
- **Shared materials** (`src/styles/spectral.css`, CSS only, no per-element script):
  - `.hl-flow--dark` / `.hl-flow--light` (via `Marked` / `FlowText`): a full spectral base inside the letters, four drifting colour clouds over it, and one small neutral island, so about 90% of the phrase is coloured and about 10% neutral. Alternating ease-in-out loop (13–19 s, phase-shifted per section), so it never jumps. Paused off screen, static spectral under reduced motion, system text colour in forced-colours mode.
  - `.btn--primary` and `.floating-cta`: near-black glass with four visible colour pockets (cyan, sapphire, violet, rose; `cta-liquid`, 11–14 s), a 1.2 px multi-hue rim (`cta-rim`), and a small three-colour bloom plus a 1 px lift on hover or keyboard focus only. Focus keeps a solid 2 px ring. The white label keeps at least 4.9:1 against the brightest pocket.
  - Glass corners: two mixed-hue glints per card on opposite corners, in four arrangements that rotate between neighbours (`::after`, `.fit__col::before`), about 8–12% of the card, fainter on white cards.
  - Starfield behind glass: `backdrop-filter: blur(6px)` (4 px on phones) on translucent cards in dark chapters only (`space-atmosphere.css`); stars stay sharp everywhere else.
  - App tiles: a two-hue corner glint on the tile container only. Brand logos keep their own colours.
  - Section 6 of `spectral.css` migrates the remaining flat-blue decorative accents (selected tabs, step numbers, rails, check fills, carousel focus rim, dark-card glows, SVG strokes with gradients defined next to the markup).
- **Kept on purpose:** focus outlines (solid, for clarity), form-field focus, the scorecard map's gap levels and score ring, dashboard chart series (colour carries data), `--danger` red, `--success` green (semantic), and every third-party logo colour.

## Font status: New Black is not installed
The page still uses Bricolage Grotesque. "New Black Typeface" (Evin Tony, FoxType) is a paid family and no files or licence are in this repo. MyFonts lists seven styles (Ultra Light, Light, Regular, Medium, Semi Bold, Bold, Extra Bold) and sells a separate per-domain Webfonts licence.

To switch once a Webfonts licence and WOFF2 files are supplied:
1. Put the files in `src/assets/fonts/`.
2. Add one `@font-face` per weight at the top of `src/design/tokens.css`, with `font-display: swap`.
3. Put `"New Black Typeface"` first in `--font-primary`.
4. Remove the Bricolage links from `index.html`.
5. Re-check the type scale, because the family has no 800+ "Black" cut listed and headings currently use weights 750 and 800.

## Master frame
- Design at 1440 px. Content max 1280 px (`--content-max`) with 16–32 px fluid gutters. At 1920 px and above, content centres.
- 12-column editorial grid on desktop, 6–8 on tablet, one column on mobile. Content never uses page-level absolute positioning.
- Section rhythm, following Q13: white hero → paper pattern → white rooms/scorecard → **night engine + dashboard** → white proof/why → paper trusted → white fit/FAQ → paper audit → white decision → **night final/footer**.

## Tokens (`src/design/tokens.css`, the only place colours are defined)
| Token | Value | Use |
|---|---|---|
| `--background` / `--paper` | #FFFFFF / #F8F8FA | Main bands |
| `--ink` / `--muted` | #111111 / #5C5C66 (6.4:1) | Text |
| `--violet` / `--violet-ink` | #7C3AED / #6D28D9 | CTA and signal / violet text on white |
| `--lavender` / `--violet-wash` | #A78BFA / #F3EDFF | Glow and dark-mode marks / quiet highlight |
| `--night` / `--night-surface` / `--night-raised` | #101017 / #1A1924 / #22212E | Immersive panels |
| `--night-muted` | #B4B1C2 (8.7:1 on night) | Secondary text on dark |
| `--line` / `--line-dark` | #E7E5EE / #393441 | Dividers |
| `--danger` / `--danger-ink` | #DA5D67 / #B23A45 | Leaks, gaps, broken paths only |
| `--success` | #20A985 | Reserved; violet carries "done" |

Radius scale: 12 / 18 / 24 / 32 / pill. Glass (`.glass`, blur 16px) appears only on the header, the hero leaks card, the route card, the founder card and the scorecard mini-bar.

## Type
**Bricolage Grotesque** (Google Fonts, variable `opsz 12–96`, `wght 400–800`) for the whole page via one token, `--font-primary`. `--font-sans` and `--font-mono` alias it, so utility labels keep their uppercase + 0.06em tracking but use Bricolage. Heading tracking was loosened slightly (-0.02 to -0.03em) because Bricolage sets tighter than the previous Manrope. Display text scales 38→88 px (`--fs-display`), H2 32→64 px, body 16–17 px. Text measure is capped at about 62ch.

## Card families (deliberately different per section)
| Family | Where | Signature |
|---|---|---|
| Floating tile field | Hero first fold | Centred copy column; 13 glass app tiles (8 at ≤1024, 5 on phones) float independently around it; hover lifts with violet outline + tooltip |
| Leak strip | Hero "Where leads leak" | Four cards, dashed coral leak line |
| Stalled path rows | Pattern | Violet packet stalls at a coral gap |
| Two rooms (2.5D) | Comparison | Same isometric floor and five channels in both rooms; grey person-in-the-middle vs spectral core + wires; five synced moments, then a verdict (`TwoRooms.jsx`) |
| Assessment rows + map | Scorecard | Custom checkboxes, 4×2 map with violet route |
| Living engine | Engine | Eight pill nodes on a tilted orbit around one glass core that plays each part's micro-demo; 4 × 2 circuit on narrow screens (`EngineOrbit.jsx`, `EngineMicroDemos.jsx`) |
| Data convergence | Dashboard | Eight signals wire into a core that opens (clip-path) into one compact illustrative dashboard, then one decision at a time; full tabbed dashboard behind "Explore the full dashboard" (`DataConvergence.jsx`) |
| **Book covers** | Proof | Three proportions; cover hinges open (rotateY) |
| Stat strip + timeline + split frame | Why | Drawn 3-stop line, founder frame |
| 3D logo carousel + five scattered project cards | Trusted | Lift, glow and depth on hover |
| Branching columns | Fit | Solid violet vs dashed grey path |
| Hairline accordion | FAQ | Pixel "+" rotates 45° |
| Perforated ticket | Audit | Night stub with ₹0 and seal, unfolding sheet |
| Choice panes + form | Walk in | Broken vs intact path |
| Pixel resolution | Final | Ring + check assembled from 8 clusters |

## Pixel-SVG icon system (`PixelIcon.jsx`)
- A 16×16 grid drawn only with `rect`s and `shape-rendering: crispEdges`. Layers are `base` (ink), `muted` (35% ink) and `accent` (violet; lavender on dark).
- Each of the 8 parts has its own motion: Lead Capture *drop* (5 cells snap into a tray), Instant Reply *blink → bolt*, Operations *slot* slides in, Back Office *stack*, Follow-up *seq* Day 1→3→7, Sales Pipeline *grow*, Retention *close* the loop + *beat*, Insights *rise + twinkle*.
- States: rest is static. Motion plays on hover/focus of a `.px-host`, or when `.is-active`, `aria-selected`, `aria-pressed`, `aria-expanded` or `.is-pinged`. Duration is 520 ms with a 70 ms stagger, and it runs once.
- Utility glyphs: form, mail, headset, chat, crm, invoice, chart, check, cross, help, clock, play, people, seal.

## App tiles
A neutral white tile (radius 28% of size) holding an unmodified Simple Icons path in its brand hex. Hover lifts the tile only. Tiles always appear next to the "examples" disclaimer.
