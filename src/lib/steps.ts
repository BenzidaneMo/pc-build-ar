import { availableTasks, type Engine, type LessonState } from './engine'

export type StepStatus = 'done' | 'current' | 'next' | 'todo'

export interface LessonStep {
  id: string
  label: string
  status: StepStatus
}

/** The lesson's tasks as a step list: done, running now, startable now, or later.
 *  Tasks without a label or part (e.g. the closing animation) are left out. */
export function lessonSteps(e: Engine, s: LessonState): LessonStep[] {
  const available = new Set(availableTasks(e, s).map((t) => t.id))
  return e.program.tasks.flatMap((t) => {
    const label = t.label ?? (t.part ? e.names[t.part] : undefined)
    if (!label) return []
    const status: StepStatus = s.done.includes(t.id) ? 'done'
      : s.running?.task === t.id ? 'current'
      : available.has(t.id) ? 'next'
      : 'todo'
    return [{ id: t.id, label, status }]
  })
}
