import React, { useEffect } from "react"
import { initSmoothScroll } from "./lib/smoothScroll"
import { SiteProvider } from "./context/SiteContext"
import StickyCTA from "./components/layout/StickyCTA"
import SiteModals from "./components/layout/SiteModals"
import Hero from "./components/sections/Hero"
import Pattern from "./components/sections/Pattern"
import Comparison from "./components/sections/Comparison"
import ScorecardSection from "./components/sections/ScorecardSection"
import EngineSection from "./components/sections/EngineSection"
import DashboardSection from "./components/sections/DashboardSection"
import Proof from "./components/sections/Proof"
import WhyWebchirpy from "./components/sections/WhyWebchirpy"
import TrustedIndustries from "./components/sections/TrustedIndustries"
import AudienceFit from "./components/sections/AudienceFit"
import FAQ from "./components/sections/FAQ"
import AuditOffer from "./components/sections/AuditOffer"
import WalkIn from "./components/sections/WalkIn"
import FinalCTA from "./components/sections/FinalCTA"

/**
 * 14 sections in the exact DOCX order, alternating light chapters with
 * full-bleed dark chapters. Sections meet cleanly — no connectors between them.
 */
export default function App() {
  useEffect(() => initSmoothScroll(), [])
  return (
    <SiteProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main">
        <Hero />
        <Pattern />
        <Comparison />
        <ScorecardSection />
        <EngineSection />
        <DashboardSection />
        <Proof />
        <WhyWebchirpy />
        <TrustedIndustries />
        <AudienceFit />
        <FAQ />
        <AuditOffer />
        <WalkIn />
      </main>
      <FinalCTA />
      <StickyCTA />
      <SiteModals />
    </SiteProvider>
  )
}
