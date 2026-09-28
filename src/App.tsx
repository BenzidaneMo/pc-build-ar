import { useEffect, useRef, useState } from 'react'
import { AssemblyStage, type StageHandle } from './components/AssemblyStage'
import { LearnPanel } from './components/LearnPanel'
import { PartsTray } from './components/PartsTray'
import { TestIntro, TestResults, type LessonResult } from './components/TestPanels'
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

const HINTS_KEY = 'pc-build-ar:show-instructions'

function loadHints(): boolean {
  try {
    return localStorage.getItem(HINTS_KEY) !== 'false'
  } catch {
    return true
  }
}

const LESSON_COUNT = lessonTitles.length

type Test =
  | { phase: 'intro' }
  | { phase: 'running'; name: string; results: LessonResult[]; lessonStart: number | null }
  | { phase: 'results'; name: string; results: LessonResult[]; date: Date }

type Drag = { part: string; x: number; y: number; moved: boolean; startX: number; startY: number }

export default function App() {
  const [layer, setLayer] = useState(1)
  const { progress, engine, state, dispatch } = useLesson(layer)
  const stage = useRef<StageHandle>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [completed, setCompleted] = useState<number[]>(loadCompleted)
  const [hints, setHints] = useState(loadHints)
  const [test, setTest] = useState<Test | null>(null)
  const testing = test?.phase === 'running'
  // A test always runs without instructions (the original TEST = expert mode across all lessons).
  const showHints = hints && !testing

  const toggleHints = (on: boolean) => {
    setHints(on)
    try {
      localStorage.setItem(HINTS_KEY, String(on))
    } catch {
      // storage unavailable: the choice lasts for this session only
    }
  }

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

  // TEST: start the clock when a lesson is ready, record the result when it completes.
  // `current` guards against the previous lesson's state lingering for a render after switching.
  const current = engine?.program === lessons[layer]
  useEffect(() => {
    if (test?.phase === 'running' && current && state && test.lessonStart == null) {
      setTest({ ...test, lessonStart: Date.now() })
    }
  }, [test, current, state])
  useEffect(() => {
    if (test?.phase !== 'running' || !current || !state?.complete || test.results.some((r) => r.lesson === layer)) return
    const seconds = test.lessonStart ? (Date.now() - test.lessonStart) / 1000 : 0
    setTest({ ...test, results: [...test.results, { lesson: layer, mistakes: state.mistakes, seconds }] })
  }, [test, current, state?.complete, state?.mistakes, layer])

  const goTo = (n: number) => {
    setSelected(null)
    setLayer(n)
  }
  const startTest = (name: string) => {
    setTest({ phase: 'running', name, results: [], lessonStart: null })
    goTo(1)
  }
  const nextInTest = () => {
    if (test?.phase !== 'running') return
    if (layer < LESSON_COUNT) {
      setTest({ ...test, lessonStart: null })
      goTo(layer + 1)
    } else {
      setTest({ phase: 'results', name: test.name, results: test.results, date: new Date() })
    }
  }

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
  // Without instructions, only completion is announced (the original "expert mode").
  const shown = showHints || state?.complete ? instruction
    : testing ? `الاختبار — المرحلة ${layer} من ${LESSON_COUNT}: ركّب القطع بالاعتماد على معلوماتك.`
    : 'التعليمات مخفية: ركّب القطع بالاعتماد على معلوماتك.'

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
                <button className={n === layer && test?.phase !== 'intro' && test?.phase !== 'results' ? 'current' : ''} disabled={!ready || testing}
                  onClick={() => { setTest(null); goTo(n) }}>
                  <span className="num">{n}</span>
                  <span>{t}</span>
                  {!ready && <span className="soon">قريبًا</span>}
                  {completed.includes(n) && <span className="check" aria-label="مكتمل">✓</span>}
                </button>
                {n === layer && !test && <LearnPanel lesson={n} />}
              </li>
            )
          })}
        </ol>
        {testing ? (
          <button className="test-button quit" onClick={() => setTest(null)}>إنهاء الاختبار</button>
        ) : (
          <button className={`test-button${test ? ' current' : ''}`} onClick={() => setTest({ phase: 'intro' })}>اختبار</button>
        )}
      </nav>

      <main className="workspace">
        {test?.phase === 'intro' ? (
          <TestIntro onStart={startTest} onCancel={() => setTest(null)} />
        ) : test?.phase === 'results' ? (
          <TestResults name={test.name} date={test.date} results={test.results}
            onRetry={() => setTest({ phase: 'intro' })} onClose={() => setTest(null)} />
        ) : !engine || !state ? (
          <div className="loading" role="status">
            جارٍ تحميل الدرس… {Math.round(progress * 100)}٪
            <div className="bar"><div style={{ width: `${progress * 100}%` }} /></div>
          </div>
        ) : (
          <>
            <div className="instruction-row">
              <p className={`instruction${state.complete ? ' done' : showHints ? '' : ' hidden-hints'}`} aria-live="polite">{shown}</p>
              {testing ? (
                <span className="test-chip">الأخطاء: {state.mistakes}</span>
              ) : (
                <>
                  <label className="hints-toggle">
                    <input type="checkbox" checked={hints} onChange={(e) => toggleHints(e.target.checked)} />
                    إظهار التعليمات
                  </label>
                  <button className="ghost" onClick={() => { setSelected(null); dispatch({ type: 'reset' }) }}>
                    إعادة الدرس
                  </button>
                </>
              )}
            </div>
            <div className="stage-wrap">
              <AssemblyStage ref={stage} engine={engine} state={state} dispatch={dispatch} active={active} quiet={!showHints}
                onPlace={(x, y) => active && place(active, x, y)} />
              {state.message && state.message.text !== instruction && (
                <p className={`message ${state.message.kind}`} role="alert">
                  {state.message.text}{showHints && state.message.hint ? ` ${state.message.hint}` : ''}
                </p>
              )}
            </div>
            {state.complete && current && (testing ? (
              <button className="primary next" onClick={nextInTest}>
                {layer < LESSON_COUNT ? 'المرحلة التالية ←' : 'عرض النتيجة'}
              </button>
            ) : lessons[layer + 1] && (
              <button className="primary next" onClick={() => goTo(layer + 1)}>الدرس التالي ←</button>
            ))}
            <PartsTray engine={engine} state={state} active={active} hints={showHints} shuffle={testing}
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
