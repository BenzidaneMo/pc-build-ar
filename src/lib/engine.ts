// Generic lesson interpreter. A lesson (src/content/lessons.ts) is a set of
// tasks; dropping a tray part on its hotspot (or finishing prerequisites)
// runs the task's steps: play clip animations, switch scenes, and wait for the
// student (rotate to the right orientation, click targets, press a button).
// The steps are transcribed from the legacy SWF scripts, so the frame numbers
// here are the original timelines (0-based).
import type { ClipAssets, FrameRef, LessonAssets, LessonProgram, Rect, Step, Task } from './types'

export const ROOT = '@root'

export type Wait =
  | { kind: 'play'; clip: string }
  | { kind: 'rotate'; clip: string; from: number; to: number; correct: [number, number][]; install: number; say: string }
  | { kind: 'click'; clip: string; targets: string[]; all: boolean; clicked: string[]; say: string }
  | { kind: 'button'; label: string; say: string }

export interface LessonState {
  frames: Record<string, number>
  hidden: Record<string, boolean>
  /** Clips drawn instead of the main scene during a close-up. */
  view: string[] | null
  /** Running animations: clip -> target frame. */
  anims: Record<string, number>
  running: { task: string; step: number } | null
  wait: Wait | null
  done: string[]
  installed: string[]
  spin: 1 | -1 | null
  /** `hint` is extra help shown only when "Show instructions" is on. */
  message: { kind: 'error' | 'success'; text: string; hint?: string } | null
  complete: boolean
}

export type Action =
  | { type: 'drop'; part: string; x: number; y: number }
  | { type: 'tick' }
  | { type: 'spin'; dir: 1 | -1 | 0 }
  | { type: 'install' }
  | { type: 'click'; target: string }
  | { type: 'button' }
  | { type: 'start'; task: string }
  | { type: 'reset' }

export interface Engine {
  assets: LessonAssets
  program: LessonProgram
  names: Record<string, string>
}

const INTRO = '@intro'
const DROP_HOTSPOTS = ['mcHotSpot', 'highlight']

function clipAssets(e: Engine, clip: string): ClipAssets | undefined {
  return e.assets.clips[clip]
}

export function frameOf(e: Engine, clip: string, f: FrameRef): number {
  if (typeof f === 'number') return f
  const labels = clip === ROOT ? e.assets.rootLabels : clipAssets(e, clip)?.labels
  const n = labels?.[f]
  if (n == null) throw new Error(`unknown label ${clip}:${f}`)
  return n
}

export function lastFrame(e: Engine, clip: string): number {
  return clip === ROOT
    ? e.assets.scenes[e.assets.scenes.length - 1].to
    : clipAssets(e, clip)!.frames.length - 1
}

/** Rect of a clip's named child at the clip's current frame. */
export function childRect(e: Engine, s: LessonState, clip: string, child: string): Rect | null {
  const f = s.frames[clip] ?? 0
  return clipAssets(e, clip)?.named[child]?.find((r) => f >= r.from && f <= r.to)?.rect ?? null
}

export function scene(e: Engine, s: LessonState) {
  const f = s.frames[ROOT]
  return e.assets.scenes.find((r) => f >= r.from && f <= r.to) ?? e.assets.scenes[0]
}

/** Clips drawn right now, back to front. */
export function stageClips(e: Engine, s: LessonState): string[] {
  return (s.view ?? scene(e, s).clips).filter((c) => !s.hidden[c])
}

export function isOnStage(e: Engine, s: LessonState, clip: string): boolean {
  return stageClips(e, s).includes(clip)
}

function task(e: Engine, id: string): Task {
  if (id === INTRO) return { id, say: '', steps: e.program.intro }
  return e.program.tasks.find((t) => t.id === id)!
}

export function dropClip(t: Task): string {
  return t.dropClip ?? t.part!
}

/** Grows tiny hit areas (screw holes are ~10px) to something a finger can hit. */
export function inflate(r: Rect | null, min = 32): Rect | null {
  if (!r) return r
  const dx = Math.max(0, min - (r[1] - r[0])) / 2
  const dy = Math.max(0, min - (r[3] - r[2])) / 2
  return [r[0] - dx, r[1] + dx, r[2] - dy, r[3] + dy]
}

export function dropHotspot(e: Engine, s: LessonState, t: Task): Rect | null {
  for (const n of DROP_HOTSPOTS) {
    const r = childRect(e, s, dropClip(t), n)
    if (r) return inflate(r)
  }
  return null
}

/** Tasks the student can start now (by dropping their part). */
export function availableTasks(e: Engine, s: LessonState): Task[] {
  if (s.running) return []
  return e.program.tasks.filter((t) => !s.done.includes(t.id) && (t.after ?? []).every((a) => s.done.includes(a)))
}

export function initialState(e: Engine): LessonState {
  const frames: Record<string, number> = { [ROOT]: 0 }
  // parts wait on their last frame; sub-clips (mcConnector...) start at their first
  for (const [k, c] of Object.entries(e.assets.clips)) frames[k] = k.includes('.') ? 0 : c.frames.length - 1
  const s: LessonState = {
    frames, hidden: {}, view: null, anims: {}, running: { task: INTRO, step: 0 }, wait: null,
    done: [], installed: [], spin: null, message: null, complete: false,
  }
  return advance(e, s)
}

/** Execute steps of the running task until one has to wait. */
function advance(e: Engine, s: LessonState): LessonState {
  s = { ...s, frames: { ...s.frames }, hidden: { ...s.hidden }, anims: { ...s.anims } }
  for (;;) {
    if (!s.running) {
      // tasks without a tray part (e.g. "install the motherboard") start by themselves
      const auto = availableTasks(e, s).find((t) => !t.part && !t.start)
      if (!auto) break
      s.running = { task: auto.id, step: 0 }
    }
    if (s.wait) break
    const t = task(e, s.running.task)
    const step: Step | undefined = t.steps[s.running.step]
    if (!step) {
      if (t.id !== INTRO) s.done = [...s.done, t.id]
      s.running = null
      if (e.program.tasks.every((x) => s.done.includes(x.id))) {
        s.complete = true
        s.message = { kind: 'success', text: e.program.done }
      }
      continue
    }
    s.running = { ...s.running, step: s.running.step + 1 }
    switch (step.op) {
      case 'play': {
        if (step.from != null) s.frames[step.clip] = frameOf(e, step.clip, step.from)
        const to = frameOf(e, step.clip, step.to)
        if (s.frames[step.clip] !== to) {
          s.anims[step.clip] = to
          if (step.wait !== false) s.wait = { kind: 'play', clip: step.clip }
        }
        break
      }
      case 'goto':
        s.frames[step.clip] = frameOf(e, step.clip, step.frame)
        delete s.anims[step.clip]
        break
      case 'scene':
        s.frames[ROOT] = frameOf(e, ROOT, step.frame)
        break
      case 'view':
        s.view = step.clips
        break
      case 'show':
      case 'hide':
        for (const c of step.clips) s.hidden[c] = step.op === 'hide'
        break
      case 'rotate':
        s.wait = {
          kind: 'rotate', clip: step.clip, say: step.say, correct: step.correct,
          from: frameOf(e, step.clip, step.range[0]), to: frameOf(e, step.clip, step.range[1]),
          install: frameOf(e, step.clip, step.install),
        }
        break
      case 'click':
        s.wait = { kind: 'click', clip: step.clip, targets: step.targets, all: step.all ?? false, clicked: [], say: step.say }
        break
      case 'button':
        s.wait = { kind: 'button', label: step.label, say: step.say }
        break
      case 'done':
        s.installed = [...s.installed, step.part]
        break
    }
  }
  return s
}

function resume(e: Engine, s: LessonState): LessonState {
  return advance(e, { ...s, wait: null, spin: null })
}

function inside(r: Rect | null, x: number, y: number) {
  return !!r && x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3]
}

export function reducer(e: Engine, s: LessonState, a: Action): LessonState {
  switch (a.type) {
    case 'reset':
      return initialState(e)

    case 'drop': {
      const t = e.program.tasks.find((x) => x.part === a.part && !s.done.includes(x.id))
      if (!t) return s
      if (s.running) return { ...s, message: { kind: 'error', text: 'أكمِل الخطوة الحالية أولاً.' } }
      const missing = (t.after ?? []).find((x) => !s.done.includes(x))
      if (missing) {
        const need = task(e, missing)
        const what = need.part ? `«${e.names[need.part]}»` : 'الخطوة السابقة'
        return { ...s, message: { kind: 'error', text: 'ليس بعد: هناك خطوة يجب إنجازها أولاً.', hint: `ركّب ${what} أولاً.` } }
      }
      if (!inside(dropHotspot(e, s, t), a.x, a.y)) {
        return { ...s, message: { kind: 'error', text: `ليس هذا مكان «${e.names[a.part]}».`, hint: 'ضعه في المنطقة المضيئة.' } }
      }
      return advance(e, { ...s, message: null, running: { task: t.id, step: 0 } })
    }

    case 'start': {
      const t = availableTasks(e, s).find((x) => x.id === a.task && x.start)
      return t ? advance(e, { ...s, message: null, running: { task: t.id, step: 0 } }) : s
    }

    case 'spin': {
      const w = s.wait
      if (w?.kind !== 'rotate') return s
      if (a.dir === 0) return { ...s, spin: null }
      // step once right away so a quick tap always turns the part, then keep turning while held
      let f = s.frames[w.clip] + a.dir
      if (f > w.to) f = w.from
      if (f < w.from) f = w.to
      return { ...s, spin: a.dir, message: null, frames: { ...s.frames, [w.clip]: f } }
    }

    case 'install': {
      const w = s.wait
      if (w?.kind !== 'rotate') return s
      const f = s.frames[w.clip]
      if (w.correct.some(([lo, hi]) => f >= lo && f <= hi)) {
        return resume(e, { ...s, message: null, frames: { ...s.frames, [w.clip]: w.install } })
      }
      return { ...s, message: { kind: 'error', text: 'الاتجاه غير صحيح. واصل التدوير حتى تتطابق القطعة مع مكانها، ثم اضغط «تثبيت».' } }
    }

    case 'click': {
      const w = s.wait
      if (w?.kind !== 'click' || !w.targets.includes(a.target) || w.clicked.includes(a.target)) return s
      const clicked = [...w.clicked, a.target]
      if (w.all && clicked.length < w.targets.length) return { ...s, message: null, wait: { ...w, clicked } }
      return resume(e, { ...s, message: null })
    }

    case 'button':
      return s.wait?.kind === 'button' ? resume(e, { ...s, message: null }) : s

    case 'tick': {
      const frames = { ...s.frames }
      const anims = { ...s.anims }
      let changed = false
      for (const [clip, to] of Object.entries(s.anims)) {
        const f = frames[clip]
        frames[clip] = f + Math.sign(to - f)
        if (frames[clip] === to) delete anims[clip]
        changed = true
      }
      if (s.spin && s.wait?.kind === 'rotate') {
        const w = s.wait
        let f = frames[w.clip] + s.spin
        if (f > w.to) f = w.from
        if (f < w.from) f = w.to
        frames[w.clip] = f
        changed = true
      }
      if (!changed) return s
      const next = { ...s, frames, anims }
      if (s.wait?.kind === 'play' && anims[s.wait.clip] == null) return resume(e, next)
      return next
    }
  }
}

export function isAnimating(s: LessonState): boolean {
  return s.spin != null || Object.keys(s.anims).length > 0
}

/** The instruction for the student's next step. */
export function currentInstruction(e: Engine, s: LessonState): string {
  if (s.complete) return e.program.done
  if (s.wait && s.wait.kind !== 'play') return s.wait.say
  if (s.running) return ''
  const avail = availableTasks(e, s)
  if (avail.length === 1) return avail[0].say
  return e.program.idle ?? avail[0]?.say ?? ''
}
