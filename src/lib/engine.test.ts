import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lessons } from '../content/lessons'
import partsData from '../content/parts.json'
import {
  availableTasks, childRect, dropHotspot, initialState, reducer, type Engine, type LessonState,
} from './engine'
import type { LessonAssets } from './types'

const names = Object.fromEntries(partsData.parts.map((p) => [p.id, p.name.ar]))

function engineFor(layer: number): Engine {
  const program = lessons[layer]
  const assets = JSON.parse(
    readFileSync(new URL(`../content/lessons/${program.file}.json`, import.meta.url), 'utf-8'),
  ) as LessonAssets
  return { assets, program, names }
}

/** Initial state with the intro animation finished. */
function ready(e: Engine): LessonState {
  let s = initialState(e)
  while (s.running) s = reducer(e, s, { type: 'tick' })
  return s
}

const center = (r: [number, number, number, number]) => ({ x: (r[0] + r[1]) / 2, y: (r[2] + r[3]) / 2 })

/** Plays a lesson like a student who always does the right thing. Returns the task order. */
function solve(e: Engine, maxSteps = 20000) {
  let s: LessonState = initialState(e)
  const order: string[] = []
  for (let i = 0; i < maxSteps && !s.complete; i++) {
    const w = s.wait
    if (w?.kind === 'rotate') {
      s = { ...s, frames: { ...s.frames, [w.clip]: w.correct[0][0] } }
      s = reducer(e, s, { type: 'install' })
    } else if (w?.kind === 'click') {
      for (const t of w.targets) {
        expect(childRect(e, s, w.clip, t), `${w.clip}.${t} has a rect at frame ${s.frames[w.clip]}`).not.toBeNull()
        s = reducer(e, s, { type: 'click', target: t })
      }
    } else if (w?.kind === 'button') {
      s = reducer(e, s, { type: 'button' })
    } else if (s.running) {
      s = reducer(e, s, { type: 'tick' })
    } else {
      const avail = availableTasks(e, s)
      const starter = avail.find((x) => x.start && !x.part)
      if (!avail.some((x) => x.part) && starter) {
        const st = starter.start!
        expect(childRect(e, s, st.clip, st.target), `${starter.id} start target ${st.clip}.${st.target}`).not.toBeNull()
        order.push(starter.id)
        s = reducer(e, s, { type: 'start', task: starter.id })
        continue
      }
      const t = avail.find((x) => x.part)
      if (!t) throw new Error(`stuck: nothing available, done=${s.done}`)
      const r = dropHotspot(e, s, t)
      expect(r, `${t.id} has a drop hotspot`).not.toBeNull()
      order.push(t.id)
      s = reducer(e, s, { type: 'drop', part: t.part!, ...center(r!) })
      expect(s.running?.task, `${t.id} starts on drop`).toBe(t.id)
    }
  }
  return { s, order }
}

describe.each(Object.keys(lessons).map(Number))('lesson %i', (layer) => {
  const e = engineFor(layer)

  it('can be completed', () => {
    const { s } = solve(e)
    expect(s.complete).toBe(true)
    expect(s.done.length).toBe(e.program.tasks.length)
  })

  it('refuses a drop outside the hotspot', () => {
    const s = ready(e)
    const t = availableTasks(e, s).find((x) => x.part)!
    const next = reducer(e, s, { type: 'drop', part: t.part!, x: -10, y: -10 })
    expect(next.running).toBeNull()
    expect(next.message?.kind).toBe('error')
  })

  it('refuses parts whose prerequisites are missing', () => {
    const s = ready(e)
    const blocked = e.program.tasks.find((t) => t.part && t.after?.length)
    if (!blocked) return
    const next = reducer(e, s, { type: 'drop', part: blocked.part!, x: 0, y: 0 })
    expect(next.running).toBeNull()
    expect(next.message?.text).toContain('أولاً')
  })
})

describe('rotation', () => {
  it('refuses a wrong orientation', () => {
    const e = engineFor(1)
    let s = ready(e)
    const t = availableTasks(e, s)[0]
    s = reducer(e, s, { type: 'drop', part: t.part!, ...center(dropHotspot(e, s, t)!) })
    while (s.wait?.kind === 'play') s = reducer(e, s, { type: 'tick' })
    expect(s.wait?.kind).toBe('rotate')
    s = reducer(e, s, { type: 'install' })
    expect(s.message?.kind).toBe('error')
    expect(s.wait?.kind).toBe('rotate')
  })
})
