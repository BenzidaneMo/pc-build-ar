import { UserRoundPlus } from 'lucide-react'
import { Dialog } from './Dialog'

/** «تلميذ جديد»: confirms clearing the lessons' ✓ marks before the next student sits down. */
export function ResetProgress({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <Dialog label="reset-title" className="confirm" onClose={onClose}>
      <span className="confirm-icon" aria-hidden="true"><UserRoundPlus /></span>
      <h2 id="reset-title">بدء جديد لتلميذ آخر؟</h2>
      <p>تُمحى علامات ✓ للدروس المنجزة على هذا الجهاز، ويعود التطبيق إلى الدرس الأول.</p>
      <p className="confirm-note">لا يمسّ هذا نتائج الاختبار.</p>
      <div className="confirm-actions">
        <button className="primary" onClick={onConfirm}>نعم، ابدأ من جديد</button>
        <button className="ghost" onClick={onClose}>إلغاء</button>
      </div>
    </Dialog>
  )
}
