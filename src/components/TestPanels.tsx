import { useState } from 'react'
import { lessonTitles } from '../content/lessons'

export interface LessonResult {
  lesson: number
  mistakes: number
  seconds: number
}

export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

/** Start screen of TEST mode: what the test is, optional student name. */
export function TestIntro({ onStart, onCancel }: { onStart: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  return (
    <section className="test-card" aria-labelledby="test-title">
      <h2 id="test-title">اختبار: تجميع الحاسوب كاملًا</h2>
      <p>
        ستجمّع الحاسوب من البداية إلى النهاية في {lessonTitles.length} مراحل متتالية، <strong>دون تعليمات ودون مناطق مضيئة</strong>.
      </p>
      <p>يُحسب الوقت وعدد الأخطاء (مكان خاطئ، ترتيب خاطئ، اتجاه خاطئ) في كل مرحلة، ثم تظهر النتيجة في الأخير.</p>
      <label className="test-name">
        اسم التلميذ (اختياري)
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </label>
      <div className="test-actions">
        <button className="primary" onClick={() => onStart(name.trim())}>ابدأ الاختبار</button>
        <button className="ghost" onClick={onCancel}>رجوع</button>
      </div>
    </section>
  )
}

/** Result sheet shown at the end of a test; printable for the teacher. */
export function TestResults({ name, date, results, onClose, onRetry }: {
  name: string
  date: Date
  results: LessonResult[]
  onClose: () => void
  onRetry: () => void
}) {
  const mistakes = results.reduce((a, r) => a + r.mistakes, 0)
  const seconds = results.reduce((a, r) => a + r.seconds, 0)
  return (
    <section className="test-card test-results" aria-labelledby="results-title">
      <h2 id="results-title">نتيجة الاختبار</h2>
      <p className="test-meta">
        {name && <><strong>{name}</strong> · </>}
        {date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <table>
        <thead>
          <tr><th>المرحلة</th><th>الوقت</th><th>الأخطاء</th></tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.lesson}>
              <td>{r.lesson}. {lessonTitles[r.lesson - 1]}</td>
              <td dir="ltr">{formatTime(r.seconds)}</td>
              <td className={r.mistakes ? 'bad' : 'good'}>{r.mistakes}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><th>المجموع</th><th dir="ltr">{formatTime(seconds)}</th><th>{mistakes}</th></tr>
        </tfoot>
      </table>
      <p className="test-verdict">
        {mistakes === 0 ? 'ممتاز! جمّعت الحاسوب كاملًا دون أي خطأ.' : mistakes <= 5 ? 'أحسنت! أخطاء قليلة، راجع المراحل التي أخطأت فيها.' : 'راجع الدروس مع التعليمات ثم أعد الاختبار.'}
      </p>
      <div className="test-actions no-print">
        <button className="primary" onClick={() => window.print()}>طباعة النتيجة</button>
        <button className="ghost" onClick={onRetry}>إعادة الاختبار</button>
        <button className="ghost" onClick={onClose}>العودة إلى الدروس</button>
      </div>
    </section>
  )
}
