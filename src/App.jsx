import React, { Suspense, lazy, useEffect, useState } from "react"
import { initSmoothScroll } from "./lib/smoothScroll"
import { SiteProvider } from "./context/SiteContext"
import WhatsAppButton from "./components/layout/WhatsAppButton"
import SiteModals from "./components/layout/SiteModals"
import Hero from "./components/sections/Hero"
// import Comparison from "./components/sections/Comparison" // hidden: merged into DoubtsQA
// import Proof from "./components/sections/Proof" // hidden: merged into DoubtsQA
// import AudienceFit from "./components/sections/AudienceFit" // hidden for now
// import PageSections from "./components/page-sections/PageSections" // hidden: only the hero changes per page
import { landOnHash } from "./lib/scroll"
import { ScrollTrigger } from "./lib/gsap"

// Sections under the first screen are a separate chunk, fetched once the hero has painted
const loadBelowFold = () => import("./components/sections/BelowFold")
const Sections = lazy(() => loadBelowFold().then((m) => ({ default: m.Sections })))
const Footer = lazy(() => loadBelowFold().then((m) => ({ default: m.Footer })))

/** true once the rest of the page should load: on idle, on the first scroll/touch/key, or straight away for #deep-links */
function useBelowFold() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (window.location.hash.length > 1) return setReady(true)
    const go = () => setReady(true)
    const events = ["scroll", "pointerdown", "keydown", "touchstart"]
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
    const idle = window.requestIdleCallback ? window.requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 1500)
    return () => {
      events.forEach((e) => window.removeEventListener(e, go))
      window.cancelIdleCallback ? window.cancelIdleCallback(idle) : clearTimeout(idle)
    }
  }, [])
  return ready
}

/**
 * 14 sections in the exact DOCX order, alternating light chapters with
 * full-bleed dark chapters. Sections meet cleanly — no connectors between them.
 */
export default function App() {
  const belowFold = useBelowFold()
  // The page grows when the lower sections arrive: re-measure scroll triggers once they have mounted
  useEffect(() => {
    if (!belowFold) return undefined
    const t = setTimeout(() => ScrollTrigger.refresh(), 800)
    return () => clearTimeout(t)
  }, [belowFold])
  useEffect(() => initSmoothScroll(), [])
  // Ad deep links (#story, #test, #connects …) land on their section once the page has rendered
  useEffect(() => landOnHash(), [])
  return (
    <SiteProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main">
        <Hero />
        {/* Landing pages 5–8 own sections (Launch Kit 04) hidden: only the hero changes per page,
            everything below it matches page 1. Restore the import and this line to bring them back. */}
        {/* <PageSections /> */}
        {belowFold && (
          <Suspense fallback={<div aria-hidden="true" style={{ minHeight: "300vh" }} />}>
            <Sections />
          </Suspense>
        )}
      </main>
      {belowFold && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
      <WhatsAppButton />
      <SiteModals />
    </SiteProvider>
  )
}
