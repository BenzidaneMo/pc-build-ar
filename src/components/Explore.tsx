import { useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Cog, Compass, Lightbulb, ScanSearch } from 'lucide-react'
import { exploreById, exploreEntries, exploreViews, features, viewNames, type ExploreEntry } from '../content/explore'
import { lessonTitles } from '../content/lessons'
import { asset } from '../lib/content'
import { Dialog } from './Dialog'
import type { Terms } from './InfoPanel'

/** «اكتشف القطع»: every component with its photos (the original EXPLORE views and their
 *  callouts), what it is, what it does and what it looks like today. Opens on the catalog,
 *  or straight on one component from the parts tray. */
export function Explore({ start, terms, onClose }: { start: string | null; terms: Terms; onClose: () => void }) {
  const [id, setId] = useState(start)
  const entry = id ? exploreById[id] : null
  return (
    <Dialog label="explore-title" className="explore" onClose={onClose}>
      {entry ? <Detail key={entry.id} entry={entry} terms={terms} onPick={setId} onCatalog={() => setId(null)} />
        : <Catalog terms={terms} onPick={setId} />}
    </Dialog>
  )
}

function Catalog({ terms, onPick }: { terms: Terms; onPick: (id: string) => void }) {
  const lessons = [...new Set(exploreEntries.map((e) => e.lesson))]
  return (
    <>
      <header className="explore-head">
        <span className="explore-logo" aria-hidden="true"><Compass /></span>
        <div>
          <h2 id="explore-title">اكتشف قطع الحاسوب</h2>
          <p>اضغط على قطعة لتتعرّف عليها: صورها من كل الجهات، أجزاؤها، ودورها في الحاسوب.</p>
        </div>
      </header>
      <div className="explore-catalog">
        {lessons.map((l) => (
          <section key={l} aria-labelledby={`explore-l${l}`}>
            <h3 id={`explore-l${l}`}><span>{l}</span>{lessonTitles[l - 1]}</h3>
            <ul>
              {exploreEntries.filter((e) => e.lesson === l).map((e) => (
                <li key={e.id}>
                  <button className="explore-card" onClick={() => onPick(e.id)}>
                    <img src={asset(`media/thumbs/${e.thumb}`)} alt="" />
                    <span className="explore-card-name">{e.name.ar}</span>
                    <span className="explore-card-term" dir="ltr">{e.name[terms]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}

function Detail({ entry, terms, onPick, onCatalog }: {
  entry: ExploreEntry; terms: Terms; onPick: (id: string) => void; onCatalog: () => void
}) {
  const views = entry.swf ? exploreViews[entry.swf] ?? [] : []
  const [v, setV] = useState(0)
  // the callout under the pointer or keyboard focus, highlighted on the photo and in the list
  const [hot, setHot] = useState<number | null>(null)
  const view = views[v]
  const i = exploreEntries.indexOf(entry)
  const prev = exploreEntries[i - 1]
  const next = exploreEntries[i + 1]
  const caption = (n: number) => entry.captions?.[n] ?? viewNames[views[n].view] ?? views[n].view

  return (
    <>
      <header className="explore-head">
        <button className="ghost icon-text explore-back" onClick={onCatalog}>
          <ArrowRight aria-hidden="true" />كل القطع
        </button>
        <div>
          <h2 id="explore-title">{entry.name.ar}</h2>
          <p className="explore-term" dir="ltr">{entry.name[terms]}</p>
        </div>
      </header>

      <div className="explore-body">
        <div className="explore-media">
          {views.length > 1 && (
            <div className="explore-views" role="tablist" aria-label="المنظر">
              {views.map((x, n) => (
                <button key={x.view} role="tab" aria-selected={n === v} className={n === v ? 'on' : ''}
                  onClick={() => { setV(n); setHot(null) }}>
                  {caption(n)}
                </button>
              ))}
            </div>
          )}
          <figure className="explore-photo">
            <div className="explore-frame" dir="ltr" style={view ? { aspectRatio: `${view.w} / ${view.h}` } : undefined}>
              <img src={asset(view ? `media/explore/${view.img}` : `media/images/${entry.image ?? entry.thumb}`)}
                alt={view ? `${entry.name.ar}: ${caption(v)}` : entry.name.ar} />
              {view?.callouts.map((c, n) => (
                <span key={n} className={`callout${hot === n ? ' hot' : ''}`}
                  style={{ left: `${c.rect[0]}%`, top: `${c.rect[1]}%`, width: `${c.rect[2]}%`, height: `${c.rect[3]}%` }}
                  onPointerEnter={() => setHot(n)} onPointerLeave={() => setHot(null)}>
                  <b>{n + 1}</b>
                </span>
              ))}
            </div>
            {views.length === 1 && <figcaption>{caption(0)}</figcaption>}
          </figure>
          {view && view.callouts.length > 0 && (
            <>
              <p className="explore-hint"><ScanSearch aria-hidden="true" />مرّر الفأرة على رقم أو اسم لتراه في الصورة.</p>
              <ol className="explore-features">
                {view.callouts.map((c, n) => {
                  const f = features[c.en]
                  return (
                    <li key={n} className={hot === n ? 'hot' : ''} tabIndex={0}
                      onPointerEnter={() => setHot(n)} onPointerLeave={() => setHot(null)}
                      onFocus={() => setHot(n)} onBlur={() => setHot(null)}>
                      <b>{n + 1}</b>
                      <span>{f?.ar ?? c.en}</span>
                      <small dir="ltr">{terms === 'en' || !f ? c.en : f.fr}</small>
                    </li>
                  )
                })}
              </ol>
            </>
          )}
        </div>

        <div className="explore-text">
          <Section icon={<ScanSearch />} title="ما هي؟" text={entry.what} />
          <Section icon={<Cog />} title="ما دورها؟" text={entry.role} />
          {entry.today && <Section icon={<Clock />} title="واليوم؟" text={entry.today} className="today" />}
          {entry.fact && <Section icon={<Lightbulb />} title="هل تعلم؟" text={entry.fact} className="fact" />}
        </div>
      </div>

      <nav className="explore-nav" aria-label="القطع">
        {prev ? <button className="ghost icon-text" onClick={() => onPick(prev.id)}><ChevronRight aria-hidden="true" />{prev.name.ar}</button> : <span />}
        {next && <button className="ghost icon-text" onClick={() => onPick(next.id)}>{next.name.ar}<ChevronLeft aria-hidden="true" /></button>}
      </nav>
    </>
  )
}

function Section({ icon, title, text, className = '' }: { icon: React.ReactNode; title: string; text: string; className?: string }) {
  return (
    <section className={`explore-section ${className}`}>
      <h3><span aria-hidden="true">{icon}</span>{title}</h3>
      <p>{text}</p>
    </section>
  )
}
