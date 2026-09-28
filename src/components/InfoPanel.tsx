import { CircleCheck } from 'lucide-react'
import { learn, remember } from '../content/learn'
import { BrushLabel, ComputerArt, Squiggle } from './Decor'

export type Terms = 'fr' | 'en'

/** The lesson's "learn" card (like the original LEARN accordion) and the rules to remember. */
export function InfoPanel({ lesson, terms }: { lesson: number; terms: Terms }) {
  const l = learn[lesson]
  return (
    <aside className="info-panel card" aria-labelledby="info-title">
      <ComputerArt />
      <h2 id="info-title">تجميع الحاسوب</h2>
      {l && (
        <div className="learn">
          {l.intro.map((p, i) => <p key={i}>{p}</p>)}
          {l.listTitle && <p className="learn-list-title">{l.listTitle}</p>}
          {l.items && (
            <ul className="learn-items">
              {l.items.map((it) => (
                <li key={it.ar}>
                  <span className="learn-item">{it.ar}</span>
                  {(it[terms] ?? it.fr) && <span className="learn-term" dir="ltr">{it[terms] ?? it.fr}</span>}
                  {it.note && <span className="learn-note">{it.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <BrushLabel>تذكّر دائمًا:</BrushLabel>
      <ul className="remember">
        {remember.map((r) => (
          <li key={r}><CircleCheck aria-hidden="true" />{r}</li>
        ))}
      </ul>
      <p className="tagline">
        خطوة بخطوة…<br />نحو خبير في الحاسوب
        <Squiggle />
      </p>
    </aside>
  )
}
