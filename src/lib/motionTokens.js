/** Central motion language. Seconds, for GSAP. CSS mirrors these in tokens.css. */
export const dur = {
  hover: 0.22,
  micro: 0.42,
  reveal: 0.7,
  path: 1.1,
  idle: 3.6,
}

export const ease = {
  out: "power2.out",
  inOut: "sine.inOut",
  spring: "back.out(1.4)",
  expo: "expo.out",
}

export const REDUCED = "(prefers-reduced-motion: reduce)"
export const MOTION_OK = "(prefers-reduced-motion: no-preference)"
