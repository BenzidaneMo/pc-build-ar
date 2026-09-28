import { ArrowLeft, BookOpen, Check, Lightbulb, Target, Trophy } from 'lucide-react'
import { learn } from '../content/learn'
import { lessons, lessonTitles } from '../content/lessons'

interface Props {
  layer: number
  /** Highlight the current lesson (not while the test intro/results replace the lesson). */
  showCurrent: boolean
  completed: number[]
  testing: boolean
  testOpen: boolean
  /** Tasks done / total in the current lesson, once it has loaded. */
  progress: { done: number; total: number } | null
  onPick: (lesson: number) => void
  onTest: () => void
  onQuitTest: () => void
}

/** Lessons column: lesson list, the lesson's tip, its progress, the test and a word of encouragement. */
export function Sidebar({ layer, showCurrent, completed, testing, testOpen, progress, onPick, onTest, onQuitTest }: Props) {
  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0
  return (
    <aside className="sidebar">
      <nav className="lessons card" aria-labelledby="lessons-title">
        <h2 id="lessons-title" className="card-title"><BookOpen aria-hidden="true" />دروس التجميع</h2>
        <ol>
          {lessonTitles.map((t, i) => {
            const n = i + 1
            const current = showCurrent && n === layer
            const done = completed.includes(n)
            return (
              <li key={n}>
                <button className={current ? 'current' : ''} disabled={!(n in lessons) || testing}
                  aria-current={current ? 'step' : undefined} onClick={() => onPick(n)}>
                  <span className="num">{n}</span>
                  <span className="lesson-title">{t}</span>
                  {current ? <ArrowLeft className="go" aria-hidden="true" />
                    : <span className={`check${done ? ' done' : ''}`} aria-label={done ? 'مكتمل' : undefined}>
                      {done && <Check aria-hidden="true" />}
                    </span>}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {!testing && learn[layer] && (
        <section className="card tip-card" aria-labelledby="tip-title">
          <h3 id="tip-title"><Lightbulb aria-hidden="true" />معلومة مهمة</h3>
          <p>{learn[layer].tip}</p>
        </section>
      )}

      {progress && !testing && (
        <section className="card progress-card" aria-label="تقدّم الدرس">
          <div className="progress-head">
            <span>تقدّم الدرس</span>
            <span className="progress-count" dir="ltr">
              {progress.done} / {progress.total}
              {progress.done === progress.total && <Check aria-hidden="true" />}
            </span>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
            <div style={{ width: `${pct}%` }} />
          </div>
        </section>
      )}

      <section className="card test-card-cta" aria-labelledby="test-cta-title">
        <h3 id="test-cta-title"><Trophy aria-hidden="true" />اختبر نفسك</h3>
        {testing ? (
          <button className="test-button quit" onClick={onQuitTest}>إنهاء الاختبار</button>
        ) : (
          <>
            <p>جمّع الحاسوب كاملًا في 7 مراحل دون تعليمات.</p>
            <button className={`test-button${testOpen ? ' current' : ''}`} onClick={onTest}>اختبار</button>
          </>
        )}
      </section>

      <div className="cheer">
        <Target aria-hidden="true" />
        <strong>بالتوفيق!</strong>
        <span>أنت على الطريق الصحيح</span>
      </div>
    </aside>
  )
}
