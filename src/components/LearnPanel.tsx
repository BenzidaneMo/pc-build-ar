import { learn } from '../content/learn'

/** The lesson's "learn" text, shown under the current lesson in the menu. */
export function LearnPanel({ lesson }: { lesson: number }) {
  const l = learn[lesson]
  if (!l) return null
  return (
    <div className="learn">
      {l.intro.map((p, i) => <p key={i}>{p}</p>)}
      {l.listTitle && <p className="learn-list-title">{l.listTitle}</p>}
      {l.items && (
        <ul>
          {l.items.map((it) => (
            <li key={it.ar}>
              <span className="learn-item">{it.ar}</span>
              {it.fr && <span className="learn-fr" dir="ltr">{it.fr}</span>}
              {it.note && <span className="learn-note">{it.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
