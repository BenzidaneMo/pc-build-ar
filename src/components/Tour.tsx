import { useEffect, useRef, useState } from 'react'

// The original's welcome walkthrough (RootMovie introMovie, reopened by its Help
// button), rewritten for this interface: each page outlines the element it describes.
const PAGES: { title: string; text: string; target?: string }[] = [
  {
    title: 'مرحبًا بك في محاكي تجميع الحاسوب',
    text: 'ستتعلّم هنا خطوات تجميع حاسوب مكتبي، قطعةً قطعة، ثم تختبر معلوماتك. خذ دقيقة لتتعرّف على الواجهة. يمكنك إعادة هذه الجولة في أي وقت بزر «مساعدة» في الأعلى.',
  },
  {
    title: 'الدروس',
    text: 'اختر درسًا من القائمة. تحت الدرس الحالي تجد شرحًا قصيرًا وأسماء القطع بالعربية والفرنسية. تظهر علامة ✓ أمام كل درس أكملته.',
    target: '.lessons ol',
  },
  {
    title: 'البساط المضاد للكهرباء الساكنة',
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
    text: 'عندما تتقن الدرس، ألغِ هذه الخانة لتتدرّب دون تعليمات ولا مناطق مضيئة.',
    target: '.hints-toggle',
  },
  {
    title: 'الاختبار',
    text: 'في النهاية اختبر نفسك: تجمّع الحاسوب كاملًا في 7 مراحل دون تعليمات، ويُحسب الوقت والأخطاء في كل مرحلة، ثم تُطبع النتيجة.',
    target: '.test-button',
  },
]

export function Tour({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(0)
  const next = useRef<HTMLButtonElement>(null)
  const { title, text, target } = PAGES[page]
  const last = page === PAGES.length - 1

  useEffect(() => {
    next.current?.focus()
    const el = target ? document.querySelector(target) : null
    el?.classList.add('tour-focus')
    el?.scrollIntoView({ block: 'nearest' })
    return () => el?.classList.remove('tour-focus')
  }, [target])

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  // backdrop and dialog are siblings so the dialog stacks above the lifted element
  return (
    <>
      <div className="tour-backdrop" />
      <section className={`tour${target === '.tray' ? ' top' : ''}`} role="dialog" aria-modal="true" aria-labelledby="tour-title">
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
