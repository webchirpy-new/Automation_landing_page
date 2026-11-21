import React, { useEffect } from "react"
import { initSmoothScroll } from "./lib/smoothScroll"
import { SiteProvider } from "./context/SiteContext"
import WhatsAppButton from "./components/layout/WhatsAppButton"
import SiteModals from "./components/layout/SiteModals"
import Hero from "./components/sections/Hero"
import Pattern from "./components/sections/Pattern"
// import Comparison from "./components/sections/Comparison" // hidden: merged into DoubtsQA
import DoubtsQA from "./components/sections/DoubtsQA"
import ScorecardSection from "./components/sections/ScorecardSection"
import EngineSection from "./components/sections/EngineSection"
import DashboardSection from "./components/sections/DashboardSection"
// import Proof from "./components/sections/Proof" // hidden: merged into DoubtsQA
import WhyWebchirpy from "./components/sections/WhyWebchirpy"
import TrustedIndustries from "./components/sections/TrustedIndustries"
// import AudienceFit from "./components/sections/AudienceFit" // hidden for now
import FAQ from "./components/sections/FAQ"
import AuditOffer from "./components/sections/AuditOffer"
import WalkIn from "./components/sections/WalkIn"
import FinalCTA from "./components/sections/FinalCTA"
import PageSections from "./components/page-sections/PageSections"
import { landOnHash } from "./lib/scroll"

/**
 * 14 sections in the exact DOCX order, alternating light chapters with
 * full-bleed dark chapters. Sections meet cleanly — no connectors between them.
 */
export default function App() {
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
        {/* Landing pages 5–8: the page's own section(s) from Launch Kit 04 */}
        <PageSections />
        <Pattern />
        {/* <Comparison /> hidden for now */}
        <DoubtsQA />
        <ScorecardSection />
        <EngineSection />
        <DashboardSection />
        {/* <Proof /> hidden for now; DoubtsQA (id="proof") replaces Comparison + Proof + Walk in/away */}
        <WhyWebchirpy />
        <TrustedIndustries />
        {/* <AudienceFit /> hidden for now ("Built for owners who are ready to work smarter") */}
        <FAQ />
        <AuditOffer />
        <WalkIn />
      </main>
      <FinalCTA />
      <WhatsAppButton />
      <SiteModals />
    </SiteProvider>
  )
}
