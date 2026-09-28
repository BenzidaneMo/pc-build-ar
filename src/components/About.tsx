import { useEffect, useRef } from 'react'
import { Code, Globe, X } from 'lucide-react'
import { developer, repo, socials, type SocialId } from '../content/about'
import { asset } from '../lib/content'
import { ComputerArt } from './Decor'

// Brand marks (lucide no longer ships logos), 24x24 paths in the logos' own shapes.
const BRAND: Record<Exclude<SocialId, 'portfolio'>, string> = {
  github: 'M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z',
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z',
  facebook: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z',
}

function SocialIcon({ id }: { id: SocialId }) {
  if (id === 'portfolio') return <Globe aria-hidden="true" />
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={BRAND[id]} fill="currentColor" /></svg>
  )
}

/** About dialog: what the app is, who made it, where it comes from. */
export function About({ onClose }: { onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  return (
    <div className="about-backdrop" onClick={onClose}>
      <section className="about" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(e) => e.stopPropagation()}>
        <button ref={close} className="about-close" onClick={onClose} aria-label="إغلاق"><X aria-hidden="true" /></button>

        <div className="about-app">
          <ComputerArt />
          <h2 id="about-title">حول التطبيق</h2>
          <p>
            محاكٍ لتعلّم تجميع الحاسوب المكتبي خطوة بخطوة، موجّه لتلاميذ وأساتذة الإعلام الآلي في الثانويات الجزائرية.
            يعمل دون إنترنت، بالعربية مع المصطلحات بالفرنسية والإنجليزية.
          </p>
        </div>

        <div className="about-dev">
          <img src={asset(developer.photo)} alt={developer.name} width={112} height={112} />
          <div>
            <span className="about-role">{developer.role}</span>
            <h3>{developer.nameAr}</h3>
            <span className="about-name-lat" dir="ltr">{developer.name}</span>
          </div>
        </div>

        <ul className="about-links">
          {socials.map((s) => (
            <li key={s.id}>
              <a className={`social ${s.id}`} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}>
                <SocialIcon id={s.id} />
                <span>{s.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <a className="about-repo" href={repo} target="_blank" rel="noopener noreferrer">
          <Code aria-hidden="true" />الشيفرة المصدرية على GitHub
        </a>

        <p className="about-credits">
          الرسوم المتحركة وصور القطع مأخوذة من برنامج <span dir="ltr">IT Essentials Virtual Desktop</span> لأكاديمية
          <span dir="ltr"> Cisco Networking Academy</span>، وتبقى ملكًا لها. هذا التطبيق اقتباس تعليمي غير تجاري.
        </p>
      </section>
    </div>
  )
}
