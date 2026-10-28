# Design system — "The Self-Organising Intelligent System"

Scattered business inputs (pixels) organise into routed, completed work. The hero opens as a reactive pixel field. A thin violet signal recurs at key beats: broken, repaired, a ring, a data dash. The footer resolves the hero's pixels into one completed loop.

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
| Room windows | Comparison | Window chrome; grayscale, tilted rows vs violet rail |
| Assessment rows + map | Scorecard | Custom checkboxes, 4×2 map with violet route |
| **FolderCard**, 4 variants | Engine detail | `folder` (tab + papers), `stack` (offset sheets), `sleeve` (side papers), `bento` (violet tab, tile grid) |
| Dark control room | Dashboard | Bento KPI grid, single-series lavender charts |
| **Book covers** | Proof | Three proportions; cover hinges open (rotateY) |
| Stat strip + timeline + split frame | Why | Drawn 3-stop line, founder frame |
| Typographic grid + asymmetric bento | Trusted | Ink-invert hover |
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
