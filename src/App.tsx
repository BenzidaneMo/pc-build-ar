import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, CircleHelp, Compass, Info, Lightbulb, Maximize2, Minimize2, RotateCcw, UserRoundPlus, X } from 'lucide-react'
import { About } from './components/About'
import { AssemblyStage, type StageHandle } from './components/AssemblyStage'
import { Explore } from './components/Explore'
import { BrandLogo, PageDecor, StageDecor } from './components/Decor'
import { InfoPanel, type Terms } from './components/InfoPanel'
import { LessonHead, StepsCard, TestStatus } from './components/LessonPanels'
import { PartsTray } from './components/PartsTray'
import { ResetProgress } from './components/ResetProgress'
import { Sidebar } from './components/Sidebar'
import { TestIntro, TestResults, type LessonResult } from './components/TestPanels'
import { Tour } from './components/Tour'
import { exploreFor } from './content/explore'
import { lessons, lessonTitles } from './content/lessons'
import { asset, parts } from './lib/content'
import { currentInstruction, type LessonState } from './lib/engine'
import { lessonSteps } from './lib/steps'
import { useLesson } from './lib/useLesson'

// Per-viewer conveniences kept in localStorage; storage may be unavailable, so every access is guarded.
function load<T>(key: string, parse: (v: string | null) => T, fallback: T): T {
  try {
    return parse(localStorage.getItem(key))
  } catch {
    return fallback
  }
}
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage unavailable: the choice lasts for this session only
  }
}

const DONE_KEY = 'pc-build-ar:completed'
const HINTS_KEY = 'pc-build-ar:show-instructions'
const TOUR_KEY = 'pc-build-ar:tour-seen'
const TERMS_KEY = 'pc-build-ar:terms'

const LESSON_COUNT = lessonTitles.length
/** How long stage feedback stays up (longer when it carries a hint to read). */
const MESSAGE_MS = 4000
const MESSAGE_HINT_MS = 7000

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
  const [completed, setCompleted] = useState<number[]>(() => load(DONE_KEY, (v) => JSON.parse(v ?? '[]'), []))
  const [hints, setHints] = useState(() => load(HINTS_KEY, (v) => v !== 'false', true))
  const [terms, setTerms] = useState<Terms>(() => load(TERMS_KEY, (v) => (v === 'en' ? 'en' : 'fr'), 'fr'))
  // "enlarge": hides the side columns so the stage can grow (projector, small screens)
  const [focus, setFocus] = useState(false)
  const [test, setTest] = useState<Test | null>(null)
  const testing = test?.phase === 'running'
  // the welcome tour opens on the first visit and again from the Help button
  const [tour, setTour] = useState(() => load(TOUR_KEY, (v) => v !== '1', true))
  const [about, setAbout] = useState(false)
  const closeAbout = useCallback(() => setAbout(false), [])
  // «اكتشف القطع»: undefined = closed, null = the catalog, or an entry id
  const [explore, setExplore] = useState<string | null | undefined>(undefined)
  const closeExplore = useCallback(() => setExplore(undefined), [])
  const [resetting, setResetting] = useState(false)
  const closeReset = useCallback(() => setResetting(false), [])
  const closeTour = useCallback(() => {
    setTour(false)
    save(TOUR_KEY, '1')
  }, [])
  // A test always runs without instructions (the original TEST = expert mode across all lessons).
  const showHints = hints && !testing

  const toggleHints = (on: boolean) => {
    setHints(on)
    save(HINTS_KEY, String(on))
  }
  const pickTerms = (t: Terms) => {
    setTerms(t)
    save(TERMS_KEY, t)
  }

  // `current` guards against the previous lesson's state lingering for a render after switching
  const current = engine?.program === lessons[layer]
  useEffect(() => {
    if (!current || !state?.complete || completed.includes(layer)) return
    const next = [...completed, layer]
    setCompleted(next)
    save(DONE_KEY, JSON.stringify(next))
  }, [current, state?.complete, layer, completed])

  // TEST: start the clock when a lesson is ready, record the result when it completes.
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
  // «تلميذ جديد»: clears the ✓ marks and restarts from lesson 1. A test result sheet on screen stays.
  const resetProgress = () => {
    setResetting(false)
    setCompleted([])
    save(DONE_KEY, '[]')
    if (test) return
    setSelected(null)
    if (layer === 1) dispatch({ type: 'reset' })
    else setLayer(1)
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
    // with instructions shown, the 3rd wrong drop in a row plays the step (as the original did)
    dispatch({ type: 'drop', part, x, y, assist: showHints })
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

  // Esc leaves the enlarged view
  useEffect(() => {
    if (!focus) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setFocus(false)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [focus])

  const active = drag?.moved ? drag.part : selected
  const ready = engine && state && current
  const instruction = ready ? currentInstruction(engine, state) : ''
  // Without instructions, only completion is announced (the original "expert mode").
  const shown = showHints || state?.complete ? instruction || (state?.running ? 'شاهد التركيب…' : '')
    : testing ? 'ركّب القطع بالاعتماد على معلوماتك.'
    : 'التعليمات مخفية: ركّب القطع بالاعتماد على معلوماتك.'
  const steps = ready ? lessonSteps(engine, state) : []
  // feedback over the stage: closes on click or by itself (every new message is a new object)
  const [dismissed, setDismissed] = useState<LessonState['message']>(null)
  const message = ready && state.message && state.message !== dismissed && state.message.text !== instruction ? state.message : null
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setDismissed(message), message.hint && showHints ? MESSAGE_HINT_MS : MESSAGE_MS)
    return () => clearTimeout(t)
  }, [message, showHints])
  const lessonView = test?.phase !== 'intro' && test?.phase !== 'results'

  const nextButton = ready && state.complete && (testing ? (
    <button className="primary next" onClick={nextInTest}>
      {layer < LESSON_COUNT ? 'المرحلة التالية' : 'عرض النتيجة'}<ArrowLeft aria-hidden="true" />
    </button>
  ) : lessons[layer + 1] && (
    <button className="primary next" onClick={() => goTo(layer + 1)}>
      الدرس التالي: {lessonTitles[layer]}<ArrowLeft aria-hidden="true" />
    </button>
  ))

  return (
    <div className={`app${focus && lessonView ? ' focus' : ''}`}>
      <PageDecor />
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true"><BrandLogo /></span>
          <div>
            <h1>محاكي تجميع الحاسوب</h1>
            <p className="brand-tagline">تعلّم • اكتشف • ركّب بنفسك</p>
          </div>
        </div>
        <div className="top-actions">
          <div className="terms-switch" role="group" aria-label="لغة المصطلحات">
            <span>المصطلحات</span>
            {(['fr', 'en'] as const).map((t) => (
              <button key={t} className={terms === t ? 'on' : ''} aria-pressed={terms === t} onClick={() => pickTerms(t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="help-button explore-button" onClick={() => setExplore(null)} disabled={testing} title="اكتشف القطع">
            <Compass aria-hidden="true" /><span>اكتشف القطع</span>
          </button>
          <button className="help-button reset-button" onClick={() => setResetting(true)} disabled={testing}
            title="تلميذ جديد: مسح التقدّم والبدء من الدرس الأول">
            <UserRoundPlus aria-hidden="true" /><span>تلميذ جديد</span>
          </button>
          <button className="help-button" onClick={() => setTour(true)} disabled={testing} title="مساعدة">
            <CircleHelp aria-hidden="true" /><span>مساعدة</span>
          </button>
          <button className="help-button" onClick={() => setAbout(true)} disabled={testing} title="حول التطبيق">
            <Info aria-hidden="true" /><span>حول التطبيق</span>
          </button>
        </div>
      </header>

      {/* wide screens: the two cards sit on either side of the lesson (the wrapper is display: contents);
          narrower: one scrolling column beside it */}
      <div className="side-col">
        <Sidebar layer={layer} showCurrent={lessonView} completed={completed} testing={testing}
          testOpen={!!test} progress={ready && !testing ? { done: steps.filter((s) => s.status === 'done').length, total: steps.length } : null}
          onPick={(n) => { setTest(null); goTo(n) }}
          onTest={() => setTest({ phase: 'intro' })} onQuitTest={() => setTest(null)} />
        {!testing && <InfoPanel lesson={layer} terms={terms} />}
      </div>

      <main className="workspace">
        {test?.phase === 'intro' ? (
          <TestIntro onStart={startTest} onCancel={() => setTest(null)} />
        ) : test?.phase === 'results' ? (
          <TestResults name={test.name} date={test.date} results={test.results}
            onRetry={() => setTest({ phase: 'intro' })} onClose={() => setTest(null)} />
        ) : (
          <>
            <LessonHead lesson={layer} stage={testing ? `المرحلة ${layer} من ${LESSON_COUNT}` : undefined} />
            <div className="instruction-row">
              <p className={`instruction${state?.complete ? ' done' : showHints ? '' : ' hidden-hints'}`} aria-live="polite">
                <Lightbulb className="instruction-icon" aria-hidden="true" />{ready ? shown : 'جارٍ تحميل الدرس…'}
              </p>
              {!testing && (
                <div className="controls">
                  <label className="hints-toggle">
                    <input type="checkbox" checked={hints} onChange={(e) => toggleHints(e.target.checked)} />
                    إظهار التعليمات
                  </label>
                  <button className="ghost icon-text" disabled={!ready} title="إعادة الدرس" aria-label="إعادة الدرس"
                    onClick={() => { setSelected(null); dispatch({ type: 'reset' }) }}>
                    <RotateCcw aria-hidden="true" /><span className="btn-label">إعادة الدرس</span>
                  </button>
                </div>
              )}
              <button className="ghost icon-text" aria-pressed={focus} title={focus ? 'تصغير' : 'تكبير منطقة العمل'}
                aria-label={focus ? 'تصغير' : 'تكبير منطقة العمل'} onClick={() => setFocus(!focus)}>
                {focus ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
                <span className="btn-label">{focus ? 'تصغير' : 'تكبير'}</span>
              </button>
            </div>

            <div className="lesson-body">
              <div className="stage-wrap">
                <StageDecor />
                {ready ? (
                  <AssemblyStage ref={stage} engine={engine} state={state} dispatch={dispatch} active={active} quiet={!showHints}
                    onPlace={(x, y) => active && place(active, x, y)} />
                ) : (
                  <div className="stage-box loading" role="status">
                    <span>جارٍ تحميل الدرس… {Math.round(progress * 100)}٪</span>
                    <div className="bar"><div style={{ width: `${progress * 100}%` }} /></div>
                  </div>
                )}
                {message && (
                  <p className={`message ${message.kind}`} role="alert" title="اضغط للإغلاق" onClick={() => setDismissed(message)}>
                    {message.text}{showHints && message.hint ? ` ${message.hint}` : ''}
                    <X className="message-close" aria-hidden="true" />
                  </p>
                )}
              </div>
              {testing ? (
                <TestStatus stage={layer} total={LESSON_COUNT} mistakes={state?.mistakes ?? 0}
                  since={test.lessonStart}>{nextButton}</TestStatus>
              ) : (
                <StepsCard steps={steps} hints={showHints}>{nextButton}</StepsCard>
              )}
            </div>

            {ready && (
              <PartsTray engine={engine} state={state} active={active} hints={showHints} shuffle={testing} terms={terms}
                onGrab={(part, e) => setDrag({ part, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false })}
                onInfo={testing ? undefined : (part) => setExplore(exploreFor(part)?.id ?? null)} />
            )}
          </>
        )}
      </main>

      {tour && !testing && <Tour onClose={closeTour} />}
      {about && <About onClose={closeAbout} />}
      {explore !== undefined && <Explore start={explore} terms={terms} onClose={closeExplore} />}
      {resetting && <ResetProgress onConfirm={resetProgress} onClose={closeReset} />}

      {drag?.moved && (
        <img className="drag-ghost" src={asset(`media/images/${parts[drag.part].image}`)} alt=""
          style={{ left: drag.x, top: drag.y }} />
      )}
    </div>
  )
}
