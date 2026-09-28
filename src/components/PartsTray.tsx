import { useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react'
import { asset, parts } from '../lib/content'
import { availableTasks, type Engine, type LessonState } from '../lib/engine'
import type { Terms } from './InfoPanel'

interface Props {
  engine: Engine
  state: LessonState
  active: string | null
  /** Show ordering hints ("after: CPU") — off when "Show instructions" is unchecked. */
  hints: boolean
  /** TEST mode: don't reveal the assembly order through the card order. */
  shuffle?: boolean
  terms: Terms
  onGrab: (part: string, e: React.PointerEvent) => void
}

/** Pastel card colours, cycled along the mat. */
const TINTS = ['mint', 'sky', 'sun', 'lilac', 'peach', 'aqua']

/** The antistatic mat: the lesson's parts, ready to drag onto the case. */
export function PartsTray({ engine, state, active, hints, shuffle, terms, onGrab }: Props) {
  const available = availableTasks(engine, state)
  const tasks = engine.program.tasks.filter((t) => t.part)
  if (shuffle) tasks.sort((a, b) => scramble(a.part!) - scramble(b.part!))
  const list = useRef<HTMLUListElement>(null)
  const [scroll, setScroll] = useState({ back: false, more: false })

  // arrows only when the cards overflow (RTL: scrollLeft runs from 0 down to negative)
  useEffect(() => {
    const el = list.current!
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setScroll({ back: Math.abs(el.scrollLeft) > 2, more: Math.abs(el.scrollLeft) < max - 2 })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', update)
    }
  }, [tasks.length])
  const page = (dir: 1 | -1) => list.current?.scrollBy({ left: -dir * list.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <section className="tray" aria-labelledby="tray-title">
      <h2 id="tray-title" className="tray-title">
        <Sparkles aria-hidden="true" />القطع المتوفّرة
        <span className="tray-hint">اسحب القطعة إلى مكانها</span>
      </h2>
      <div className="tray-body">
        {scroll.back && (
          <button className="tray-scroll back" onClick={() => page(-1)} aria-label="القطع السابقة"><ChevronRight aria-hidden="true" /></button>
        )}
        <ul className="tray-list" ref={list}>
          {tasks.map((t, i) => {
            const id = t.part!
            const p = parts[id]
            const installed = state.done.includes(t.id)
            const ready = available.includes(t)
            const blocker = (t.after ?? []).find((a) => !state.done.includes(a))
            const blockerPart = blocker && engine.program.tasks.find((x) => x.id === blocker)?.part
            // without instructions (expert mode, TEST) nothing tells which part comes next, and any
            // part can be picked up: a wrong-order drop is then refused and counted, as in the original
            const grabbable = !installed && (ready || !hints)
            return (
              <li key={t.id}>
                <button
                  className={`part-card tint-${TINTS[i % TINTS.length]}${active === id ? ' active' : ''}${installed ? ' installed' : ''}${!grabbable ? ' locked' : ''}`}
                  aria-pressed={active === id}
                  aria-disabled={!grabbable}
                  data-part={id}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    if (grabbable) onGrab(id, e)
                  }}
                >
                  <img src={asset(`media/thumbs/${p.thumb}`)} alt="" draggable={false} />
                  <span className="part-name">{p.name.ar}</span>
                  <span className="part-term" dir="ltr">{p.name[terms]}</span>
                  <span className="part-status">
                    {installed ? <><Check aria-hidden="true" />مُثبَّت</>
                      : !hints ? null
                      : blockerPart ? <><Lock aria-hidden="true" />بعد: {engine.names[blockerPart]}</>
                      : ready ? <><Check aria-hidden="true" />جاهز</>
                      : <Lock aria-label="ليس بعد" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {scroll.more && (
          <button className="tray-scroll more" onClick={() => page(1)} aria-label="القطع التالية"><ChevronLeft aria-hidden="true" /></button>
        )}
      </div>
    </section>
  )
}

/** Stable pseudo-random key per part, so the shuffled order doesn't jump between renders. */
function scramble(id: string): number {
  let h = 2166136261
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}
