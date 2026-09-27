import { asset, parts } from '../lib/content'
import { availableTasks, type Engine, type LessonState } from '../lib/engine'

interface Props {
  engine: Engine
  state: LessonState
  active: string | null
  /** Show ordering hints ("after: CPU") — off when "Show instructions" is unchecked. */
  hints: boolean
  onGrab: (part: string, e: React.PointerEvent) => void
}

/** The antistatic mat: the lesson's parts, ready to drag onto the case. */
export function PartsTray({ engine, state, active, hints, onGrab }: Props) {
  const available = availableTasks(engine, state)
  return (
    <section className="tray" aria-label="البساط المضاد للكهرباء الساكنة">
      <h2 className="tray-title">البساط المضاد للكهرباء الساكنة</h2>
      <ul className="tray-list">
        {engine.program.tasks.filter((t) => t.part).map((t) => {
          const id = t.part!
          const p = parts[id]
          const installed = state.done.includes(t.id)
          const ready = available.includes(t)
          const blocker = (t.after ?? []).find((a) => !state.done.includes(a))
          const blockerPart = blocker && engine.program.tasks.find((x) => x.id === blocker)?.part
          const status = installed ? 'مُثبَّت ✓' : blockerPart && hints ? `بعد: ${engine.names[blockerPart]}` : ''
          return (
            <li key={t.id}>
              <button
                className={`part-card${active === id ? ' active' : ''}${installed ? ' installed' : ''}${!ready ? ' locked' : ''}`}
                aria-pressed={active === id}
                aria-disabled={!ready}
                data-part={id}
                onPointerDown={(e) => {
                  e.preventDefault()
                  if (ready) onGrab(id, e)
                }}
              >
                <img src={asset(`media/thumbs/${p.thumb}`)} alt="" draggable={false} />
                <span className="part-name">{p.name.ar}</span>
                <span className="part-term" dir="ltr">{p.name.fr}</span>
                {status && <span className="part-status">{status}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
