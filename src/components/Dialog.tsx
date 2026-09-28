import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Modal shell: backdrop and Esc close it, focus starts on the close button. */
export function Dialog({ label, className = '', onClose, children }: {
  /** id of the heading that names the dialog */
  label: string
  className?: string
  onClose: () => void
  children: ReactNode
}) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  return (
    <div className="about-backdrop" onClick={onClose}>
      <section className={`dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={label} onClick={(e) => e.stopPropagation()}>
        <button ref={close} className="about-close" onClick={onClose} aria-label="إغلاق"><X aria-hidden="true" /></button>
        {children}
      </section>
    </div>
  )
}
