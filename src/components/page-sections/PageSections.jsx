import React from "react"
import { pageId } from "../../data/landingPages"
import { pageSections } from "../../data/pageSections"
import StorySection from "./StorySection"
import ConnectsSection from "./ConnectsSection"
import CounterSection from "./CounterSection"
import TestSection from "./TestSection"
import SummarySection from "./SummarySection"
import StepsSection from "./StepsSection"
import TimelineSection from "./TimelineSection"

const BY_TYPE = {
  story: StorySection,
  connects: ConnectsSection,
  counter: CounterSection,
  test: TestSection,
  summary: SummarySection,
  steps: StepsSection,
  timeline: TimelineSection,
}

/**
 * The page's own sections (Launch Kit 04), rendered directly under the hero.
 * Pages without an entry in pageSections.js render nothing, so pages 1–4 are unchanged.
 */
export default function PageSections() {
  const sections = pageSections[pageId]
  if (!sections?.length) return null
  return sections.map((s) => {
    const Section = BY_TYPE[s.type]
    return Section ? <Section key={s.id} section={s} /> : null
  })
}
