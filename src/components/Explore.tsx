import { useState } from 'react'
import { ArrowLeftRight, ArrowRight, ChevronLeft, ChevronRight, Clock, Cog, Compass, History, Lightbulb, ScanSearch } from 'lucide-react'
import {
  entryThumb, eraOf, eras, exploreById, exploreEntries, features, photoCredits, todayTopics, viewNames, viewsOf,
  type Era, type ExploreEntry,
} from '../content/explore'
import { lessonTitles } from '../content/lessons'
import { asset } from '../lib/content'
import { Dialog } from './Dialog'
import type { Terms } from './InfoPanel'

/** «اكتشف القطع»: every component with its photos (the original EXPLORE views and their
 *  callouts, or Commons photos for today's parts), what it is, what it does, and then and now.
 *  Opens on the catalog (the 2007 parts of the lessons, or today's), or straight on one component
 *  from the parts tray. */
export function Explore({ start, terms, onClose }: { start: string | null; terms: Terms; onClose: () => void }) {
  const [id, setId] = useState(start)
  const entry = id ? exploreById[id] : null
  const [tab, setTab] = useState<Era>(entry ? eraOf(entry) : 'classic')
  const open = (next: string) => {
    setTab(eraOf(exploreById[next]))
    setId(next)
  }
  return (
    <Dialog label="explore-title" className="explore" onClose={onClose}>
      {entry ? <Detail key={entry.id} entry={entry} terms={terms} onPick={open} onCatalog={() => setId(null)} />
        : <Catalog tab={tab} terms={terms} onTab={setTab} onPick={open} />}
    </Dialog>
  )
}

function Catalog({ tab, terms, onTab, onPick }: { tab: Era; terms: Terms; onTab: (c: Era) => void; onPick: (id: string) => void }) {
  const entries = exploreEntries.filter((e) => eraOf(e) === tab)
  const lessons = [...new Set(entries.map((e) => e.lesson))]
  return (
    <>
      <header className="explore-head">
        <span className="explore-logo" aria-hidden="true"><Compass /></span>
        <div>
          <h2 id="explore-title">اكتشف قطع الحاسوب</h2>
          <p>اضغط على قطعة لتتعرّف عليها: صورها، أجزاؤها، ودورها في الحاسوب، وكيف كانت قديمًا أو كيف أصبحت اليوم.</p>
        </div>
      </header>
      <div className="explore-tabs" role="tablist" aria-label="الحقبة">
        {eras.map((c) => (
          <button key={c.id} role="tab" aria-selected={c.id === tab} className={c.id === tab ? 'on' : ''} onClick={() => onTab(c.id)}>
            {c.tab}
          </button>
        ))}
      </div>
      <div className="explore-catalog">
        {lessons.map((l) => (
          <section key={l} aria-labelledby={`explore-l${l}`}>
            {/* 2007: the lesson that installs these parts; today: a topic */}
            <h3 id={`explore-l${l}`}>{tab === 'classic' ? <><span>{l}</span>{lessonTitles[l - 1]}</> : todayTopics[l - 1]}</h3>
            <ul>
              {entries.filter((e) => e.lesson === l).map((e) => (
                <li key={e.id}>
                  <button className="explore-card" onClick={() => onPick(e.id)}>
                    <img src={asset(entryThumb(e))} alt="" />
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
  const views = viewsOf(entry)
  const [v, setV] = useState(0)
  // the callout under the pointer or keyboard focus, highlighted on the photo and in the list
  const [hot, setHot] = useState<number | null>(null)
  const view = views[v]
  const list = exploreEntries.filter((e) => eraOf(e) === eraOf(entry))
  const i = list.indexOf(entry)
  const prev = list[i - 1]
  const next = list[i + 1]
  const caption = (n: number) => entry.captions?.[n] ?? viewNames[views[n].view] ?? `صورة ${n + 1}`
  const credit = view && photoCredits[view.img.replace('modern/', '')]
  const pair = entry.pair ? exploreById[entry.pair] : undefined
  const src = view ? `media/explore/${view.img}` : entry.art ? `media/explore/modern/${entry.art}` : `media/images/${entry.image ?? entry.thumb}`

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
        {pair && (
          <button className="ghost icon-text explore-pair" onClick={() => onPick(pair.id)}
            title={eraOf(pair) === 'modern' ? 'كيف أصبحت اليوم' : 'كيف كانت في 2007'}>
            <ArrowLeftRight aria-hidden="true" />
            {eraOf(pair) === 'modern' ? 'اليوم' : 'في 2007'}: {pair.name.ar}
          </button>
        )}
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
            {/* every photo fits the same box (--photo-h): its frame keeps the photo's proportions, so
                the callouts, in % of the photo, stay on their parts */}
            <div className="explore-box">
            <div className="explore-frame" dir="ltr" style={view
              ? { aspectRatio: `${view.w} / ${view.h}`, width: `min(100%, calc(var(--photo-h) * ${view.w / view.h}))` }
              : { height: '100%' }}>
              <img src={asset(src)} alt={view ? `${entry.name.ar}: ${caption(v)}` : entry.name.ar}
                title={credit ? `${credit.author} · ${credit.license}` : undefined} />
              {view?.callouts.map((c, n) => (
                <span key={n} className={`callout${hot === n ? ' hot' : ''}`}
                  style={{ left: `${c.rect[0]}%`, top: `${c.rect[1]}%`, width: `${c.rect[2]}%`, height: `${c.rect[3]}%` }}
                  onPointerEnter={() => setHot(n)} onPointerLeave={() => setHot(null)}>
                  <b>{n + 1}</b>
                </span>
              ))}
            </div>
            </div>
            {views.length === 1 && (entry.captions?.[0] ?? viewNames[views[0].view]) && <figcaption>{caption(0)}</figcaption>}
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
          {entry.before && <Section icon={<History />} title="وقديمًا؟" text={entry.before} className="today" />}
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
