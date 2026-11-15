import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { summarise } from "../lib/scoring"

const SiteContext = createContext(null)
// v2: adds the two context answers. A new key means an old saved shape can never be misread.
const STORAGE_KEY = "wc-scorecard-v2"

const emptyScore = () => ({ checked: {}, cleared: {}, context: {} })
const asMap = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {})

/** Ad creative id (e.g. "PP8-P02-4x5"), read from the landing URL. Used only for the lane. */
const utmContent = (() => {
  try {
    return new URLSearchParams(window.location.search).get("utm_content")
  } catch {
    return null
  }
})()

/** Restored once per tab session (survives in-page navigation and reload). */
function loadScore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyScore()
    const saved = JSON.parse(raw)
    return { checked: asMap(saved?.checked), cleared: asMap(saved?.cleared), context: asMap(saved?.context) }
  } catch {
    return emptyScore() // storage unavailable — the scorecard still works in memory
  }
}

export function SiteProvider({ children }) {
  const [modal, setModal] = useState(null) // "lead" | "video:founder" | "video:testimonial" | "exit"
  const [score, setScore] = useState(loadScore)
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(score))
    } catch {
      /* ignore */
    }
  }, [score])

  const toggleCheck = useCallback((areaId, idx) => {
    setScore((s) => {
      const key = `${areaId}:${idx}`
      return { ...s, checked: { ...s.checked, [key]: !s.checked[key] }, cleared: { ...s.cleared, [areaId]: false } }
    })
  }, [])

  /** Set one check explicitly (used by the vsl-07 test to pre-tick Insights). */
  const setCheck = useCallback((areaId, idx, on = true) => {
    setScore((s) => ({
      ...s,
      checked: { ...s.checked, [`${areaId}:${idx}`]: on },
      cleared: { ...s.cleared, [areaId]: false },
    }))
  }, [])

  const clearArea = useCallback((areaId) => {
    setScore((s) => ({
      ...s,
      checked: { ...s.checked, [`${areaId}:0`]: false, [`${areaId}:1`]: false },
      cleared: { ...s.cleared, [areaId]: !s.cleared[areaId] },
    }))
  }, [])

  /** One-tap context answer; tapping the chosen option again clears it. */
  const setContext = useCallback((questionId, optionId) => {
    setScore((s) => ({ ...s, context: { ...s.context, [questionId]: s.context[questionId] === optionId ? null : optionId } }))
  }, [])

  const resetScore = useCallback(() => setScore(emptyScore()), [])
  const closeModal = useCallback(() => setModal(null), [])

  const summary = useMemo(() => summarise(score, { utmContent }), [score])

  const value = useMemo(
    () => ({
      modal,
      openModal: setModal,
      closeModal,
      score,
      summary,
      toggleCheck,
      setCheck,
      clearArea,
      setContext,
      resetScore,
      formSubmitted,
      setFormSubmitted,
    }),
    [modal, score, summary, toggleCheck, setCheck, clearArea, setContext, resetScore, closeModal, formSubmitted]
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
