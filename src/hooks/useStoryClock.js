import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useInView } from "./useInView"
import { useReducedMotion } from "./useMediaQuery"

/**
 * useStoryClock — drives an auto-playing sequence of steps (phases, stages, modules).
 *
 * - One requestAnimationFrame loop, running only while the story is playing AND on screen,
 *   so off-screen sections cost nothing and a paused story stays exactly where it was.
 * - Progress is reported through `onProgress(p, index)` every frame (0 → 1 within the current
 *   step). Callers write it straight into a CSS variable, so progress bars never re-render React.
 * - `epoch` counts (re)starts from step 1: the first time the story actually plays (or is used),
 *   every loop back to step 1, and every jump back to it. Key one-shot animations on it so they
 *   replay instead of showing their end state. `epoch === 0` means "never seen yet".
 * - Reduced motion: autoplay starts paused; visitors can still step through or press play.
 * - `go()` holds the story on the chosen step; `release()` lets go of that hold and gives the
 *   current step a fresh, full duration before the story moves on.
 *
 * `durations` is an array of milliseconds, one per step. The story loops.
 */
export function useStoryClock({ durations, rootRef, threshold = 0.3, onProgress }) {
  const count = durations.length
  const reduced = useReducedMotion()
  const inView = useInView(rootRef, { threshold })
  const [index, setIndex] = useState(0)
  const [epoch, setEpoch] = useState(0)
  // null = follow the default (play, unless reduced motion); true/false = the visitor's choice.
  // The ref mirrors it so release() can tell a hold apart without a stale closure.
  const [choice, setChoiceState] = useState(null)
  const choiceRef = useRef(null)
  const setChoice = useCallback((v) => {
    choiceRef.current = v
    setChoiceState(v)
  }, [])
  const playing = choice ?? !reduced
  const running = playing && inView

  const indexRef = useRef(0)
  const elapsed = useRef(0)
  const startedRef = useRef(false)
  const durationsRef = useRef(durations)
  const progressRef = useRef(onProgress)
  useLayoutEffect(() => {
    durationsRef.current = durations
    progressRef.current = onProgress
  })

  const markStarted = useCallback((restart) => {
    if (!startedRef.current || restart) setEpoch((e) => e + 1)
    startedRef.current = true
  }, [])

  useEffect(() => {
    if (!running) return undefined
    let raf = 0
    let last = performance.now()
    const tick = (now) => {
      markStarted(false)
      // Clamp the frame delta so a backgrounded tab doesn't skip a whole step on return.
      elapsed.current += Math.min(64, now - last)
      last = now
      const d = durationsRef.current[indexRef.current]
      if (elapsed.current >= d) {
        elapsed.current = 0
        indexRef.current = (indexRef.current + 1) % count
        setIndex(indexRef.current)
        if (indexRef.current === 0) markStarted(true)
      }
      progressRef.current?.(Math.min(1, elapsed.current / durationsRef.current[indexRef.current]), indexRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, count, markStarted])

  /** Jump to a step. Pauses by default: a visitor who picks something wants to look at it.
   *  `pause: false` keeps the story playing from the chosen step; add `resume: true` to also lift
   *  an earlier pause (back to the default: plays, unless reduced motion), and `replay: true` to
   *  restart step 1's one-shot animations when step 1 is picked while it is already showing. */
  const go = useCallback(
    (i, { pause = true, at = 0, resume = false, replay = false } = {}) => {
      const n = ((i % count) + count) % count
      const restart = n === 0 && (indexRef.current !== 0 || replay)
      indexRef.current = n
      elapsed.current = at * durationsRef.current[n]
      setIndex(n)
      markStarted(restart)
      if (pause) setChoice(false)
      else if (resume && choiceRef.current === false) setChoice(null)
      progressRef.current?.(at, n)
    },
    [count, markStarted, setChoice]
  )

  const toggle = useCallback(() => setChoice(!playing), [playing, setChoice])
  const pause = useCallback(() => setChoice(false), [setChoice])
  const replay = useCallback(() => {
    const wasFirst = indexRef.current === 0
    go(0, { pause: false }) // restarts the epoch itself when coming from a later step
    if (wasFirst) markStarted(true)
    setChoice(true)
  }, [go, markStarted, setChoice])

  /** End a hold: stay on the current step, restart its full duration, return to autoplay
   *  (autoplay still stays off under reduced motion). Does nothing when nothing is held. */
  const release = useCallback(() => {
    if (choiceRef.current !== false) return
    elapsed.current = 0
    progressRef.current?.(0, indexRef.current)
    setChoice(null)
  }, [setChoice])

  return { index, epoch, playing, running, reduced, inView, go, toggle, pause, replay, release }
}
