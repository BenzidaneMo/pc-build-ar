import partsData from '../content/parts.json'
import { lessons } from '../content/lessons'
import type { Engine } from './engine'
import type { Draw, LessonAssets, PartInfo } from './types'

export const parts: Record<string, PartInfo> = Object.fromEntries(
  (partsData.parts as PartInfo[]).map((p) => [p.id, p]),
)

const lessonFiles = import.meta.glob<LessonAssets>('../content/lessons/*.json', { import: 'default' })

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export function drawUrl(lesson: string, d: Draw) {
  return 'v' in d ? asset(`lessons/${lesson}/v${d.v}.svg`) : asset(`lessons/${lesson}/${d.b}.webp`)
}

/** Loads a lesson's frame data and preloads every image before play starts. */
export async function loadEngine(layer: number, onProgress: (p: number) => void): Promise<Engine> {
  const program = lessons[layer]
  const assets = await lessonFiles[`../content/lessons/${program.file}.json`]()
  const urls = [...new Set(assets.draws.map((d) => drawUrl(assets.name, d)))]
  let done = 0
  await Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = img.onerror = () => {
            onProgress(++done / urls.length)
            resolve()
          }
          img.src = url
        }),
    ),
  )
  const ids = program.tasks.flatMap((t) => (t.part ? [t.part] : []))
  return { assets, program, names: Object.fromEntries(ids.map((id) => [id, parts[id].name.ar])) }
}
