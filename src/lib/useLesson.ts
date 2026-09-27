import { useCallback, useEffect, useReducer, useState } from 'react'
import { initialState, isAnimating, reducer, type Action, type Engine, type LessonState } from './engine'
import { loadEngine } from './content'

type Loaded = { engine: Engine; state: LessonState }

/** Loads a lesson and drives its state machine at the lesson's frame rate. */
export function useLesson(layer: number) {
  const [progress, setProgress] = useState(0)
  const [loaded, dispatchRaw] = useReducer(
    (cur: Loaded | null, a: Action | { type: 'loaded'; engine: Engine }): Loaded | null => {
      if (a.type === 'loaded') return { engine: a.engine, state: initialState(a.engine) }
      return cur && { ...cur, state: reducer(cur.engine, cur.state, a) }
    },
    null,
  )

  useEffect(() => {
    let cancelled = false
    setProgress(0)
    loadEngine(layer, (p) => !cancelled && setProgress(p)).then((engine) => {
      if (!cancelled) dispatchRaw({ type: 'loaded', engine })
    })
    return () => {
      cancelled = true
    }
  }, [layer])

  const animating = loaded ? isAnimating(loaded.state) : false
  const fps = loaded?.engine.assets.fps ?? 24
  useEffect(() => {
    if (!animating) return
    const t = setInterval(() => dispatchRaw({ type: 'tick' }), 1000 / fps)
    return () => clearInterval(t)
  }, [animating, fps])

  const dispatch = useCallback((a: Action) => dispatchRaw(a), [])
  return { progress, engine: loaded?.engine ?? null, state: loaded?.state ?? null, dispatch }
}
