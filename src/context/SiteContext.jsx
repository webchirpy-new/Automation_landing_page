import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { scorecard } from "../data/automationContent"

const SiteContext = createContext(null)
const STORAGE_KEY = "wc-scorecard-v1"

const emptyScore = () => ({ checked: {}, cleared: {} })

/** Derived scorecard summary. Unanswered areas are never counted as "no gap". */
export function summarise(state) {
  const areas = scorecard.areas.map((a) => {
    const gaps = a.checks.filter((_, i) => state.checked[`${a.id}:${i}`]).length
    const reviewed = gaps > 0 || !!state.cleared[a.id]
    return { ...a, gaps, reviewed }
  })
  const gapCount = areas.reduce((n, a) => n + a.gaps, 0)
  const reviewedCount = areas.filter((a) => a.reviewed).length
  const complete = reviewedCount === areas.length
  const score = complete ? 100 - Math.round((100 * gapCount) / 16) : null
  const priorities = areas.filter((a) => a.gaps > 0).sort((a, b) => b.gaps - a.gaps)
  return { areas, gapCount, reviewedCount, complete, score, priorities }
}

export function SiteProvider({ children }) {
  const [modal, setModal] = useState(null) // "lead" | "video:founder" | "video:testimonial" | "exit"
  const [score, setScore] = useState(emptyScore)
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Restore scorecard for this tab session (survives in-page navigation/reload).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) setScore({ ...emptyScore(), ...JSON.parse(raw) })
    } catch (e) {
      /* storage unavailable — scorecard still works in memory */
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(score))
    } catch (e) {
      /* ignore */
    }
  }, [score])

  const toggleCheck = useCallback((areaId, idx) => {
    setScore((s) => {
      const key = `${areaId}:${idx}`
      const checked = { ...s.checked, [key]: !s.checked[key] }
      const cleared = { ...s.cleared, [areaId]: false }
      return { checked, cleared }
    })
  }, [])

  const clearArea = useCallback((areaId) => {
    setScore((s) => {
      const checked = { ...s.checked, [`${areaId}:0`]: false, [`${areaId}:1`]: false }
      return { checked, cleared: { ...s.cleared, [areaId]: !s.cleared[areaId] } }
    })
  }, [])

  const resetScore = useCallback(() => setScore(emptyScore()), [])
  const closeModal = useCallback(() => setModal(null), [])

  const summary = useMemo(() => summarise(score), [score])

  const value = useMemo(
    () => ({
      modal,
      openModal: setModal,
      closeModal,
      score,
      summary,
      toggleCheck,
      clearArea,
      resetScore,
      formSubmitted,
      setFormSubmitted,
    }),
    [modal, score, summary, toggleCheck, clearArea, resetScore, closeModal, formSubmitted]
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
