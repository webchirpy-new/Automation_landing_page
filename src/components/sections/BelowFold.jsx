// Everything under the first screen. App loads this file as its own chunk, after the hero is on screen.
import React from "react"
import Pattern from "./Pattern"
import DoubtsQA from "./DoubtsQA"
import ScorecardSection from "./ScorecardSection"
import EngineSection from "./EngineSection"
import DashboardSection from "./DashboardSection"
import WhyWebchirpy from "./WhyWebchirpy"
import AuditOffer from "./AuditOffer"
import TrustedIndustries from "./TrustedIndustries"
import FAQ from "./FAQ"
import WalkIn from "./WalkIn"
import FinalCTA from "./FinalCTA"

export function Sections() {
  return (
    <>
      {/* <Comparison /> and <Proof /> hidden for now; DoubtsQA (id="proof") replaces them */}
      <Pattern />
      <DoubtsQA />
      <ScorecardSection />
      <EngineSection />
      <DashboardSection />
      <WhyWebchirpy />
      {/* <AudienceFit /> hidden for now ("Built for owners who are ready to work smarter") */}
      <AuditOffer />
      <TrustedIndustries />
      <FAQ />
      <WalkIn />
    </>
  )
}

export function Footer() {
  return <FinalCTA />
}
