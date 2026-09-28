import { useCallback, useEffect, useReducer, useState } from 'react'
import { initialState, isAnimating, reducer, type Action, type Engine, type LessonState } from './engine'
import { loadEngine } from './content'

type Loaded = { engine: Engine; state: LessonState }

/** Flash plays a movie loaded with loadMovie at the host's frame rate, so every lesson ran at
 *  RootMovie.swf's 35 fps whatever its own header says (24, or 12 for ExternalCables). */
const PLAYBACK_FPS = 35

/** Loads a lesson and drives its state machine at the lesson's frame rate. */
export function useLesson(layer: number) {
  const [progress, setProgress] = useState(0)
  const [loaded, dispatchRaw] = useReducer(
    (cur: Loaded | null, a: Action | { type: 'loaded'; engine: Engine } | { type: 'unload' }): Loaded | null => {
      if (a.type === 'loaded') return { engine: a.engine, state: initialState(a.engine) }
      if (a.type === 'unload') return null
      return cur && { ...cur, state: reducer(cur.engine, cur.state, a) }
    },
    null,
  )

  useEffect(() => {
    let cancelled = false
    setProgress(0)
    dispatchRaw({ type: 'unload' }) // show the loading bar, not the previous lesson
    loadEngine(layer, (p) => !cancelled && setProgress(p)).then((engine) => {
      if (!cancelled) dispatchRaw({ type: 'loaded', engine })
    })
    return () => {
      cancelled = true
    }
  }, [layer])

  const animating = loaded ? isAnimating(loaded.state) : false
  useEffect(() => {
    if (!animating) return
    const t = setInterval(() => dispatchRaw({ type: 'tick' }), 1000 / PLAYBACK_FPS)
    return () => clearInterval(t)
  }, [animating])

  const dispatch = useCallback((a: Action) => dispatchRaw(a), [])
  return { progress, engine: loaded?.engine ?? null, state: loaded?.state ?? null, dispatch }
}
