import { useEffect, useRef, useState } from 'react'
import { AssemblyStage, type StageHandle } from './components/AssemblyStage'
import { PartsTray } from './components/PartsTray'
import { lessons, lessonTitles } from './content/lessons'
import { asset, parts } from './lib/content'
import { currentInstruction } from './lib/engine'
import { useLesson } from './lib/useLesson'

const DONE_KEY = 'pc-build-ar:completed'

/** Lessons this browser has completed (a per-viewer convenience; storage may be unavailable). */
function loadCompleted(): number[] {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]')
  } catch {
    return []
  }
}

type Drag = { part: string; x: number; y: number; moved: boolean; startX: number; startY: number }

export default function App() {
  const [layer, setLayer] = useState(1)
  const { progress, engine, state, dispatch } = useLesson(layer)
  const stage = useRef<StageHandle>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [completed, setCompleted] = useState<number[]>(loadCompleted)

  useEffect(() => {
    if (!state?.complete || completed.includes(layer)) return
    const next = [...completed, layer]
    setCompleted(next)
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify(next))
    } catch {
      // private mode / blocked storage: the checkmark just won't persist
    }
  }, [state?.complete, layer, completed])

  const place = (part: string, x: number, y: number) => {
    dispatch({ type: 'drop', part, x, y })
    setSelected(null)
  }

  // Pointer drag from the tray. A press without movement selects the part
  // instead (tap-to-place for tablets and keyboard users).
  useEffect(() => {
    if (!drag) return
    const move = (e: PointerEvent) =>
      setDrag((d) => d && { ...d, x: e.clientX, y: e.clientY,
        moved: d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6 })
    const up = (e: PointerEvent) => {
      setDrag(null)
      if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) <= 6) {
        setSelected((s) => (s === drag.part ? null : drag.part))
        return
      }
      const p = stage.current?.toStage(e.clientX, e.clientY)
      if (p) place(drag.part, p.x, p.y)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [drag?.part, drag?.moved])

  const active = drag?.moved ? drag.part : selected
  const instruction = engine && state ? currentInstruction(engine, state) : ''

  return (
    <div className="app">
      <header className="topbar">
        <h1>محاكي تجميع الحاسوب</h1>
        <span className="subtitle" dir="ltr">Assemblage d'un ordinateur</span>
      </header>

      <nav className="lessons" aria-label="الدروس">
        <ol>
          {lessonTitles.map((t, i) => {
            const n = i + 1
            const ready = n in lessons
            return (
              <li key={n}>
                <button className={n === layer ? 'current' : ''} disabled={!ready}
                  onClick={() => { setSelected(null); setLayer(n) }}>
                  <span className="num">{n}</span>
                  <span>{t}</span>
                  {!ready && <span className="soon">قريبًا</span>}
                  {completed.includes(n) && <span className="check" aria-label="مكتمل">✓</span>}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <main className="workspace">
        {!engine || !state ? (
          <div className="loading" role="status">
            جارٍ تحميل الدرس… {Math.round(progress * 100)}٪
            <div className="bar"><div style={{ width: `${progress * 100}%` }} /></div>
          </div>
        ) : (
          <>
            <div className="instruction-row">
              <p className={`instruction${state.complete ? ' done' : ''}`} aria-live="polite">{instruction}</p>
              <button className="ghost" onClick={() => { setSelected(null); dispatch({ type: 'reset' }) }}>
                إعادة الدرس
              </button>
            </div>
            <div className="stage-wrap">
              <AssemblyStage ref={stage} engine={engine} state={state} dispatch={dispatch} active={active}
                onPlace={(x, y) => active && place(active, x, y)} />
              {state.message && state.message.text !== instruction && (
                <p className={`message ${state.message.kind}`} role="alert">{state.message.text}</p>
              )}
            </div>
            {state.complete && lessons[layer + 1] && (
              <button className="primary next" onClick={() => setLayer(layer + 1)}>الدرس التالي ←</button>
            )}
            <PartsTray engine={engine} state={state} active={active}
              onGrab={(part, e) => setDrag({ part, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false })} />
          </>
        )}
      </main>

      {drag?.moved && (
        <img className="drag-ghost" src={asset(`media/images/${parts[drag.part].image}`)} alt=""
          style={{ left: drag.x, top: drag.y }} />
      )}
    </div>
  )
}
