import { useEffect, useRef, useState } from 'react'

// The original's welcome walkthrough (RootMovie introMovie, reopened by its Help
// button), rewritten for this interface: each page outlines the element it describes.
const PAGES: { title: string; text: string; target?: string }[] = [
  {
    title: 'مرحبًا بك في محاكي تجميع الحاسوب',
    text: 'ستتعلّم هنا خطوات تجميع حاسوب مكتبي، قطعةً قطعة، ثم تختبر معلوماتك. خذ دقيقة لتتعرّف على الواجهة. يمكنك إعادة هذه الجولة في أي وقت بزر «مساعدة» في الأعلى.',
  },
  {
    title: 'دروس التجميع',
    text: 'اختر درسًا من القائمة. تظهر علامة ✓ أمام كل درس أكملته، وتحت القائمة نصيحة الدرس ومدى تقدّمك فيه.',
    target: '.lessons',
  },
  {
    title: 'بطاقة الدرس',
    text: 'هنا شرح الدرس وأسماء القطع بالعربية مع مصطلحاتها بالفرنسية أو الإنجليزية. اختر لغة المصطلحات من أعلى الصفحة.',
    target: '.info-panel',
  },
  {
    title: 'خطوات الدرس',
    text: 'تتبّع خطوات الدرس الحالي: الخطوات المنجزة ✓، والخطوة التي تعمل عليها الآن، وما بقي منها.',
    target: '.steps-card',
  },
  {
    title: 'القطع المتوفّرة',
    text: 'هنا توجد القطع. اسحب القطعة بالفأرة وأفلتها في المنطقة المضيئة داخل الحاسوب، أو اضغط على القطعة ثم على مكانها.',
    target: '.tray',
  },
  {
    title: 'منطقة العمل',
    text: 'تُركَّب القطعة أمامك. بعض القطع تُدار بزر «تدوير» حتى تأخذ الاتجاه الصحيح ثم تُثبَّت بزر «تثبيت»، وأحيانًا يُطلب منك الضغط على البراغي أو المزالج. إذا وضعت القطعة في مكان خاطئ 3 مرات متتالية، تُركَّب تلقائيًا لتتعلّم مكانها.',
    target: '.stage-box',
  },
  {
    title: 'إظهار التعليمات',
    text: 'عندما تتقن الدرس، ألغِ هذه الخانة لتتدرّب دون تعليمات ولا مناطق مضيئة. وزرّ «تكبير» يكبّر منطقة العمل.',
    target: '.hints-toggle',
  },
  {
    title: 'اكتشف القطع',
    text: 'تعرّف على كل قطعة: صورها من كل الجهات، أسماء أجزائها، دورها، وكيف أصبحت اليوم. يمكنك أيضًا الضغط على الزر ⓘ فوق أي قطعة في «القطع المتوفّرة».',
    target: '.explore-button',
  },
  {
    title: 'الاختبار',
    text: 'في النهاية اختبر نفسك: تجمّع الحاسوب كاملًا في 7 مراحل دون تعليمات، ويُحسب الوقت والأخطاء في كل مرحلة، ثم تُطبع النتيجة.',
    target: '.test-button',
  },
  {
    title: 'للأستاذ: تلميذ جديد',
    text: 'قبل أن يجلس تلميذ آخر أمام الجهاز، اضغط «تلميذ جديد» لمسح علامات ✓ والعودة إلى الدرس الأول. نتائج الاختبار لا تتأثّر.',
    target: '.reset-button',
  },
]

export function Tour({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0)
  const next = useRef<HTMLButtonElement>(null)
  const { title, text, target } = PAGES[page]
  const last = page === PAGES.length - 1
  const [spot, setSpot] = useState<DOMRect | null>(null)

  // The described element is shown through a "spotlight" drawn over it (fixed position, from its
  // measured box), which works wherever it sits: lifting it with z-index fails inside the sticky
  // columns, which are their own stacking contexts.
  useEffect(() => {
    next.current?.focus()
    const el = target ? document.querySelector(target) : null
    if (!el) {
      setSpot(null)
      return
    }
    el.scrollIntoView({ block: 'nearest' })
    const measure = () => setSpot(el.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [target])

  // dialog at the bottom centre, unless that would cover the described element
  const top = !!spot && spot.bottom > innerHeight - 280 && spot.left < innerWidth / 2 + 240 && spot.right > innerWidth / 2 - 240

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  const pad = 6
  return (
    <>
      {/* blocks the page; dims it when nothing is described, else the spotlight's shadow does */}
      <div className={`tour-backdrop${spot ? ' clear' : ''}`} />
      {spot && (
        <div className="tour-spot" aria-hidden="true" style={{
          top: spot.top - pad, left: spot.left - pad, width: spot.width + 2 * pad, height: spot.height + 2 * pad,
        }} />
      )}
      <section className={`tour${top ? ' top' : ''}`} role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <p className="tour-count">{page + 1} / {PAGES.length}</p>
        <h2 id="tour-title">{title}</h2>
        <p>{text}</p>
        <div className="tour-actions">
          <button ref={next} className="primary" onClick={() => (last ? onClose() : setPage(page + 1))}>
            {last ? 'ابدأ' : 'التالي ←'}
          </button>
          {page > 0 && <button className="ghost" onClick={() => setPage(page - 1)}>→ السابق</button>}
          {!last && <button className="link" onClick={onClose}>تخطّي الجولة</button>}
        </div>
      </section>
    </>
  )
}
