import { useEffect, useState } from 'react'
import { Check, CircleAlert, Hand, ListChecks, Timer } from 'lucide-react'
import { learn } from '../content/learn'
import { lessonOrdinals, lessonTitles } from '../content/lessons'
import type { LessonStep } from '../lib/steps'
import { lessonIcons } from './lessonIcons'
import { formatTime } from './TestPanels'

/** Title block above the stage: lesson badge, icon, title and one-line goal. */
export function LessonHead({ lesson, stage }: { lesson: number; stage?: string }) {
  const Icon = lessonIcons[lesson]
  return (
    <header className="lesson-head">
      <div className="lesson-title-row">
        <span className="lesson-icon" aria-hidden="true">{Icon && <Icon />}</span>
        <h2>{lessonTitles[lesson - 1]}</h2>
        <span className="lesson-badge">{stage ?? `الدرس ${lessonOrdinals[lesson - 1]}`}</span>
      </div>
      {learn[lesson] && <p className="lesson-goal">{learn[lesson].goal}</p>}
    </header>
  )
}

/** The lesson's steps with their state; `hints` off hides which one comes next. */
export function StepsCard({ steps, hints, children }: { steps: LessonStep[]; hints: boolean; children?: React.ReactNode }) {
  return (
    <section className="steps-card card" aria-labelledby="steps-title">
      <h3 id="steps-title" className="steps-head"><ListChecks aria-hidden="true" />خطوات الدرس</h3>
      <ol className="steps">
        {steps.map((s, i) => {
          const status = !hints && s.status === 'next' ? 'todo' : s.status
          return (
            <li key={s.id} className={`step ${status}`} aria-current={status === 'current' ? 'step' : undefined}>
              <span className="step-mark" aria-hidden="true">
                {status === 'done' ? <Check /> : status === 'current' ? <Hand /> : i + 1}
              </span>
              <span className="step-label">{s.label}</span>
            </li>
          )
        })}
      </ol>
      {children && <div className="steps-foot">{children}</div>}
    </section>
  )
}

/** Replaces the steps card during a test: stage, elapsed time and mistakes (no order hints). */
export function TestStatus({ stage, total, mistakes, since, children }: {
  stage: number; total: number; mistakes: number; since: number | null; children?: React.ReactNode
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <section className="steps-card test-status card" aria-label="حالة الاختبار">
      <h3 className="steps-head"><ListChecks aria-hidden="true" />الاختبار</h3>
      <p className="test-stage">المرحلة <strong>{stage}</strong> من {total}</p>
      <div className="test-stats">
        <span><Timer aria-hidden="true" /><span dir="ltr">{formatTime(since ? (now - since) / 1000 : 0)}</span></span>
        <span className="test-chip"><CircleAlert aria-hidden="true" />الأخطاء: {mistakes}</span>
      </div>
      <p className="test-note">لا تعليمات في الاختبار: ركّب القطع بالاعتماد على معلوماتك.</p>
      {children && <div className="steps-foot">{children}</div>}
    </section>
  )
}
