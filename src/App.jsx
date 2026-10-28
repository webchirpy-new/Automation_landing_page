import React from "react"
import { SiteProvider } from "./context/SiteContext"
import Header from "./components/layout/Header"
import StickyCTA from "./components/layout/StickyCTA"
import SiteModals from "./components/layout/SiteModals"
import { FlowSignal } from "./components/ui/primitives"
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
 * 14 sections in the exact DOCX order. The violet thread (FlowSignal) appears
 * only at selected story beats: broken → repaired → into the engine.
 */
export default function App() {
  return (
    <SiteProvider>
      <Header />
      <main id="main">
        <Hero />
        <FlowSignal variant="broken" />
        <Pattern />
        <Comparison />
        <FlowSignal variant="repaired" />
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
