import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Flip } from "gsap/Flip"
import { Draggable } from "gsap/Draggable"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { useGSAP } from "@gsap/react"

// Guarded so the module stays safe to import outside a browser (tests, prerendering).
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, Draggable, MotionPathPlugin, DrawSVGPlugin, useGSAP)
  // Re-measure once webfonts settle so trigger positions are correct.
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
}

export { gsap, ScrollTrigger, Flip, Draggable, MotionPathPlugin, DrawSVGPlugin, useGSAP }
