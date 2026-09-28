import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { drawUrl } from '../lib/content'
import {
  availableTasks, childRect, dropClip, dropHotspot, inflate, isOnStage, scene, stageClips,
  type Action, type Engine, type LessonState,
} from '../lib/engine'
import type { FrameItem, Rect } from '../lib/types'

export interface StageHandle {
  /** Converts a viewport point to stage pixels, or null if outside the stage. */
  toStage(clientX: number, clientY: number): { x: number; y: number } | null
}

interface Props {
  engine: Engine
  state: LessonState
  dispatch: (a: Action) => void
  /** Part being dragged or selected in the tray. */
  active: string | null
  /** "Show instructions" off: hotspots still work but aren't highlighted (the original expert mode). */
  quiet: boolean
  onPlace: (x: number, y: number) => void
}

const DEFAULT_TOOLS: Rect = [69, 104.8, 29, 196]

export const AssemblyStage = forwardRef<StageHandle, Props>(function AssemblyStage(
  { engine, state, dispatch, active, quiet, onPlace },
  ref,
) {
  const { assets } = engine
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => setScale(el.clientWidth / assets.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [assets.width])

  const toStage = (cx: number, cy: number) => {
    const r = box.current!.getBoundingClientRect()
    const x = (cx - r.left) / scale
    const y = (cy - r.top) / scale
    return x >= 0 && y >= 0 && x <= assets.width && y <= assets.height ? { x, y } : null
  }
  useImperativeHandle(ref, () => ({ toStage }))

  const draw = (i: number, key: string) => {
    const d = assets.draws[i]
    const src = drawUrl(assets.name, d)
    if ('x' in d) {
      return <img key={key} src={src} alt="" draggable={false} className="layer"
        style={{ left: d.x, top: d.y, width: d.w, height: d.h }} />
    }
    // transformed bitmap (m maps image px -> stage px) or svg (m maps shape space -> stage)
    const [a, b, c, dd, tx, ty] = d.m
    const inner = 'v' in d ? { left: d.x0, top: d.y0 } : { left: 0, top: 0 }
    return (
      <div key={key} className="layer" style={{ left: 0, top: 0, transformOrigin: '0 0', transform: `matrix(${a},${b},${c},${dd},${tx},${ty})` }}>
        <img src={src} alt="" draggable={false} className="layer" style={{ ...inner, width: d.w, height: d.h }} />
      </div>
    )
  }

  // Flash mask: a box placed like the mask's svg draw uses that svg as its CSS mask;
  // its content is transformed back so the masked layers keep stage coordinates.
  const masked = (mask: number, content: React.ReactNode, key: string) => {
    const d = assets.draws[mask]
    if (!('v' in d)) return content
    const [a, b, c, dd, tx, ty] = d.m
    const TX = a * d.x0 + c * d.y0 + tx
    const TY = b * d.x0 + dd * d.y0 + ty
    const det = a * dd - b * c
    const [ia, ib, ic, id] = [dd / det, -b / det, -c / det, a / det]
    const url = `url("${drawUrl(assets.name, d)}")`
    return (
      <div key={key} className="layer" style={{
        left: 0, top: 0, width: d.w, height: d.h, transformOrigin: '0 0', transform: `matrix(${a},${b},${c},${dd},${TX},${TY})`,
        maskImage: url, maskSize: '100% 100%', maskRepeat: 'no-repeat',
        WebkitMaskImage: url, WebkitMaskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat',
      }}>
        <div className="layer" style={{ left: 0, top: 0, transformOrigin: '0 0',
          transform: `matrix(${ia},${ib},${ic},${id},${-(ia * TX + ic * TY)},${-(ib * TX + id * TY)})` }}>
          {content}
        </div>
      </div>
    )
  }

  const drawItems = (items: FrameItem[], key: string): React.ReactNode[] =>
    items.map((i, n) =>
      typeof i === 'number' ? draw(i, `${key}-${n}`)
        : typeof i === 'string' ? (state.hidden[i] ? null : drawClip(i))
        : masked(i.mask, drawItems(i.items, `${key}-${n}`), `${key}-m${n}`),
    )

  const drawClip = (clip: string): React.ReactNode[] =>
    drawItems(assets.clips[clip]?.frames[state.frames[clip] ?? 0] ?? [], clip)

  const w = state.wait
  const running = state.running != null
  const tools = w?.kind === 'rotate' ? childRect(engine, state, w.clip, 'iRotateTools') ?? DEFAULT_TOOLS : null
  const spin = (dir: 1 | -1 | 0) => dispatch({ type: 'spin', dir })

  return (
    <div className="stage-box" ref={box} style={{ aspectRatio: `${assets.width} / ${assets.height}` }}
      onClick={(e) => {
        const p = active && toStage(e.clientX, e.clientY)
        if (p) onPlace(p.x, p.y)
      }}>
      <div className="stage" dir="ltr" style={{ width: assets.width, height: assets.height, transform: `scale(${scale})` }}>
        {!state.view && scene(engine, state).draws.map((i, n) => draw(i, `bg${n}`))}
        {stageClips(engine, state).map((clip) => drawClip(clip))}

        {!running && availableTasks(engine, state).map((t) => {
          if (!t.part || !isOnStage(engine, state, dropClip(t))) return null
          const r = dropHotspot(engine, state, t)
          return r && <Hotspot key={t.id} quiet={quiet} part={t.part} rect={r} strong={active === t.part} label={`ضع ${engine.names[t.part]} هنا`}
            onActivate={active === t.part ? () => onPlace((r[0] + r[1]) / 2, (r[2] + r[3]) / 2) : undefined} />
        })}

        {!running && availableTasks(engine, state).map((t) => {
          if (!t.start || !isOnStage(engine, state, t.start.clip)) return null
          const r = inflate(childRect(engine, state, t.start.clip, t.start.target), 28)
          return r && <Hotspot key={t.id} quiet={quiet} rect={r} strong label={quiet ? 'اضغط هنا' : t.say} data-start={t.id}
            onActivate={() => dispatch({ type: 'start', task: t.id })} />
        })}

        {w?.kind === 'click' && w.targets.filter((t) => !w.clicked.includes(t)).map((t) => {
          const r = inflate(childRect(engine, state, w.clip, t), 28)
          return r && <Hotspot key={t} quiet={quiet} rect={r} strong label="اضغط هنا"
            onActivate={() => dispatch({ type: 'click', target: t })} />
        })}

        {tools && (
          <div className="rotate-tools" style={{ left: tools[0] - 8, top: tools[2] }} onClick={(e) => e.stopPropagation()}>
            {([[1, '↻', 'تدوير'], [-1, '↺', 'تدوير عكسي']] as const).map(([dir, icon, label], i) => (
              <button key={dir} className="tool" aria-label={label} title={label} style={{ order: i * 2 }}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); spin(dir) }}
                onPointerUp={() => spin(0)} onPointerCancel={() => spin(0)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat ? spin(dir) : undefined}
                onKeyUp={() => spin(0)}>
                {icon}
              </button>
            ))}
            <button className="tool install" style={{ order: 1 }} onClick={() => dispatch({ type: 'install' })}>تثبيت</button>
          </div>
        )}
      </div>

      {w?.kind === 'button' && (
        <button className="primary stage-action" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'button' }) }}>
          {w.label}
        </button>
      )}
    </div>
  )
})

function Hotspot({ rect, strong, quiet, label, part, onActivate, 'data-start': start }: {
  rect: Rect; strong: boolean; quiet: boolean; label: string; part?: string; onActivate?: () => void; 'data-start'?: string
}) {
  const style = { left: rect[0], top: rect[2], width: rect[1] - rect[0], height: rect[3] - rect[2] }
  const cls = `hotspot${quiet ? ' quiet' : strong ? ' strong' : ''}`
  return onActivate ? (
    <button className={cls} style={style} aria-label={label} title={quiet ? undefined : label} data-part={part} data-start={start}
      onClick={(e) => { e.stopPropagation(); onActivate() }} />
  ) : (
    <div className={cls} style={style} data-part={part} />
  )
}
