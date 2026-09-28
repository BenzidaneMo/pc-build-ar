# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A rebuild of the 2007 Cisco IT Essentials "Virtual Desktop" PC-assembly simulator (Flash 8 / ActionScript 2) as an offline React app. Algerian high-school CS teachers use it to teach students how to put a PC together. The UI is Arabic (RTL), with French and English hardware terms shown alongside. Packaging with Pake (`--use-local-file`) comes later, so `dist/` must keep working from `file://`. That's why `base: './'` is set, with no CDN, and the font is self-hosted.

## Commands

```bash
npm run dev                       # Vite dev server (use --host 127.0.0.1 if localhost hangs)
npm run build                     # tsc -b && vite build -> dist/
npm test                          # vitest: auto-solves every lesson against the real extracted data
npx vitest run -t "lesson 2"      # one lesson
node tools/smoke.mjs <lesson> [url]   # plays a lesson through the real UI in headless system Chrome; screenshots -> tools/.cache/smoke/lesson<N>/
HINTS=off node tools/smoke.mjs 2 [url]  # same with "Show instructions" unchecked
node tools/smoke.mjs test [url]       # TEST mode: all 7 stages then the results screen (~25 min)
python tools/contact_sheet.py tools/.cache/smoke/lesson<N>   # tiles those screenshots into sheet.png
```

Asset pipeline (needs Python + Pillow and JDK 21 at `C:\Program Files\Java\jdk-21`; JPEXS is unpacked in `tools/.cache/ffdec/`):

```bash
J="/c/Program Files/Java/jdk-21/bin/java"; FF=tools/.cache/ffdec/ffdec-cli.jar
"$J" -jar $FF -format image:png_gif_jpeg -export image tools/.cache/images/<Lesson> legacy/models/<Lesson>.swf
"$J" -jar $FF -format shape:svg -export shape tools/.cache/shapes/<Lesson> legacy/models/<Lesson>.swf
"$J" -jar $FF -export script tools/.cache/scripts/<Lesson> legacy/models/<Lesson>.swf   # decompiled AS2, the behaviour reference
python tools/extract_lessons.py [Lesson]   # SWF -> tools/.cache/manifests/<Lesson>.json
python tools/build_assets.py [Lesson]      # -> public/lessons/<Lesson>/ + src/content/lessons/<Lesson>.json (parallel, cached)
```

Transcription helpers:
- `python tools/summarize_lesson.py <Lesson>` prints clip labels, clickable children with frame ranges and rects, and the non-boilerplate script lines per frame.
- `python tools/render_frames.py <Lesson> <clip> <frames…>` renders what specific frames show, with named rects outlined.

`tools/convert_xml.py` generated `src/content/parts.json` once. It is now hand-maintained, so don't regenerate it over edits.

## Architecture

- **`legacy/`** holds the untouched Flash original: `RootMovie.swf`, `models/*.swf` (one per lesson), `media/`, English `essentials.xml`, and `essentials.ar.xml` (the earlier Arabic translation, stored in hand-reversed presentation-form glyphs). `RootMovie.swd` contains the original AS2 source of the shell. Read it with `strings`.
- **How the legacy lessons are built.** This is what everything relies on. Every lesson frame is made of **full-stage 664×412 bitmaps**, mostly drawn at 1:1. Each part (`iPowerSupply`, `iCPU`, …) is a sprite whose frames run backwards:
  - the last frame is "waiting", and holds the drop hotspot (`mcHotSpot` or `highlight`);
  - frame 0 is installed;
  - assembling plays backwards;
  - many parts pause in a rotation loop (`lStartRotation`..`lEndRotation`) where only a few frames count as the correct orientation, then jump to `lInstall`.

  Close-ups are separate sprites: unnamed ones on the root timeline become clips `s<charId>`. Named visual children (`mcConnector`, `plugged`/`unplugged`, rear-view plugs) become **sub-clips** keyed `parent.child`, with their own frame and visibility.
- **Extraction.** `tools/swf.py` is a minimal SWF parser. `extract_lessons.py` flattens timelines into layers per frame, recording:
  - bitmaps with a full matrix;
  - vector shapes as SVG;
  - sub-clip references;
  - named children and unnamed buttons (`btn<charId>`, the click targets) as rects.

  Root placement matrices are baked in. `build_assets.py` dedupes layers into `draws` and crops bitmaps to WebP.
- **`src/lib/engine.ts`** is a generic, pure interpreter. Each lesson is a set of **tasks**, started by dropping a tray part, by clicking a scene target (`start`), or automatically when prerequisites are done (no part, e.g. the "Install Motherboard" button). A task runs **steps**: `play`, `goto`, `scene`, `view` (close-up: draw only these clips), `show`/`hide`, `rotate`, `click`, `button`, `done`. Clips wait on their last frame, and sub-clips start at 0.
- **`src/content/lessons.ts`** holds the lesson programs, transcribed from `tools/.cache/scripts/<Lesson>/`. It also has helpers for repeated patterns (`card`, `driveScrews`, `power`, `data`, `plug`). **Flash `_currentframe` is 1-based and `stop()` in `frame_N` means index N-1, while everything here is 0-based.** A click target's rect exists only on the frame where the clip stops, and a label usually marks the frame *after* that stop. A lesson shows in the menu only once it's in `lessons`.
- **Modes (App.tsx):**
  - Learn is the default: lesson menu with the LEARN panel (`src/content/learn.ts`) and a "Show instructions" toggle. Off means the original expert mode: hotspots stay active but invisible, and instructions, order hints and error hints are hidden.
  - TEST chains lessons 1–7 with instructions forced off and the tray shuffled. It records `state.mistakes` (wrong place, order or orientation) and time per stage, then shows a printable result sheet (`components/TestPanels.tsx`).
  - Adding hooks to `App` resets its state on hot reload, which breaks a smoke run in progress.
- **Components:**
  - `AssemblyStage` scales the fixed stage and draws the scene or view clips, including sub-clips. It also renders drop, start and click hotspots (tiny ones are inflated), the rotate tools, and the action button.
  - `PartsTray` is the antistatic mat.
  - `App` owns pointer drag, plus tap-to-select/tap-to-place.

## Gotchas

- `npm test` catches most transcription mistakes. It fails when a click target, drop hotspot or start target has no rect at the frame where the step waits, or when a lesson can't be completed.
- Fully transparent placements (alpha multiplier 0) are the invisible hit buttons. They're kept as click targets but never drawn.
- Vector layers containing `#6699cc` are the old Flash UI button baked into scenes, and are skipped.
- The legacy `essentials.xml` is not well-formed and mixes UTF-8 with cp1252 bytes, so read it with regexes or `errors='replace'`, never a strict XML parser.
- Arabic and French text is written for the classroom and should be reviewed by a teacher before release.
