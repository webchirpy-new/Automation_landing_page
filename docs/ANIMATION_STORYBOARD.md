# Animation storyboard

Shared rules:
- Durations come from `src/lib/motionTokens.js`: hover 220 ms, micro 420 ms, reveal 700 ms, path 1.1 s, idle about 3.6 s. Eases are `power2.out`, `sine.inOut` and `expo.out`.
- There is no scroll-jacking, no pinning and no smooth-scroll library. Native scroll and anchors always work.
- Every element is readable at rest. With JS disabled or reduced motion, the final state shows.
- Section reveals (`[data-reveal]`) use `ScrollTrigger.batch` and fire once.
- Idle loops pause offscreen: the hero canvas, engine signal and dashboard capsule use IntersectionObserver, and the hero also pauses on `visibilitychange`.

| # | Section | Trigger | Sequence | Exit / rest state | Touch | Reduced motion |
|---|---|---|---|---|---|---|
| 01 | Hero (follows the 6-frame storyboard) | Load, pointer, hover/focus | **F1** centred eyebrow → headline → violet punch line → body → CTA fade/rise (0–0.7 s, 90 ms stagger). **F2** tiles enter in shuffled order from their own outward offsets (0.3 s + 100 ms each, 0.9 s, power3). **F3** each tile floats on its own path (±8 px x, −4 to −10 px y, ±1.6°, 3.4–6.2 s, sine yoyo, random phase), paused offscreen. **F4** canvas dot grid at 0.7 intensity: proximity glow, 700 ms drag trail, press ripple. **F5** hover/Tab-focus lifts the tile 4 px with a violet outline and a tooltip ("Example · feeds …"); click deep-links to that engine part. Fine pointers get a gentle magnet (≤160 px). **F6** idle: low-intensity float, no hard reset. A collision guard hides any tile that would touch the copy, CTA or footnote at the current size. | Idle float | `touch-action: pan-y`; tap ripples, sideways swipe paints; 5 tiles in the band above the eyebrow, smaller drift ≤1024 px | Static composition: all tiles visible, no float/entrance/magnet, static grid |
| — | Thread (hero→pattern) | Scroll scrub | Violet line draws down, then breaks into a coral dashed gap; packet stops at the break | Drawn | Same | Static |
| 02 | Pattern | Each row enters (once) | Violet path draws → packet travels to the stall point → coral gap appears → packet pulses "stalled". Week bar scrubs from customer-heavy to manual-heavy. The closing line repairs (violet draws across, coral gap fades) | Stalled pulses | Stall label flows under the track | Final composition |
| — | Thread (compare→scorecard) | Scroll scrub | Repaired S-curve draws | Drawn | Same | Static |
| 03 | Comparison | Row select / "Compare again" | Manual packet stutters (`steps(5)`) and blinks unfinished; automated packet glides to the row and pulses | Packets at the selected row | Phones get a stacked per-row comparison (no packets) | Rows only |
| 04 | Scorecard | Tick / "Neither applies" | Ring fills by areas reviewed (lavender), then shows the score (violet). Map cells change state. Violet route links reviewed cells. Priorities list updates | Live | Accordion, one area open, sticky mini score | Instant |
| 05 | Engine | Visible / click | Idle: a violet cell steps node to node (0.9 s move + 1.6 s rest) and pings each icon. Click: spoke highlights → **GSAP Flip** morphs the panel → CSS 3D lid swings down (rotateX −92°) → folder items stagger in → mini workflow plays → shelf tiles stand in 2.5D (drag to fan, elastic return). "Back" morphs closed. Four-stage cycle: line scrubs, stages light in order, loop path draws back | Selected node, open sheet | 2- or 4-column node grid, panel scrolls into view | Instant open/close, workflows show final frame |
| 06 | Dashboard | Visible / tab | MotionPath capsule DATA → DASHBOARD → DECISIONS (3.2 s, repeats while visible), nodes flash on hit. On tab change: panel fades and rises 12 px, bars scale from the baseline, trend line draws, counters count up 0.8 s | Tab content | Horizontal scroll-snap tabs with edge fade, no capsule | Static panels |
| 07 | Proof | Button | Cover rotates −178° about its spine (0.9 s) → steps stagger in | Open spread, "← Close" | Tap | Instant |
| 08 | Why | Scroll | Story line scrubs down the 3 stops. Founder frame unmasks via clip-path inset | Drawn | Same | Static |
| 09 | Trusted | Reveal once | Grid and bento stagger in. Hover inverts a client tile | Static | — | Static |
| 10 | Fit | Enter once | Stem draws → branches draw → violet dot rides to "A good fit", grey dot rides to "Not a fit" | Dots at ends | Same | Dots at ends |
| 11 | FAQ | Click | Pixel "+" rotates 45°, answer fades in. Multi-open | Open items | Tap | Instant |
| 12 | Audit | Enter once | Ticket sheet unfolds (rotateX −88° → 0) → items stagger → seal stamps | Unfolded | Same | Unfolded |
| 13 | Walk in | Idle | Four pixels arrive in the "Walk in" lane. Input focus shows a violet ring | — | Same | Static |
| 14 | Final | 35% visible, once | Pixels fly from scatter, cluster by cluster (8 × 90 ms), into ring + check → loop circle draws → CTA gains a violet halo | Resolved mark | Same | Resolved from the start |
| — | Sticky bar / floating CTA | Hero CTA leaves view | Slides up. Hidden near `#book`, `#final` or any open modal | — | Floating pill with safe-area inset | Instant |
