# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A rebuild of the 2007 Cisco IT Essentials "Virtual Desktop" PC-assembly simulator (Flash 8 / ActionScript 2) as an offline React app. Algerian high-school CS teachers use it to teach students how to put a PC together. The UI is Arabic (RTL), with French and English hardware terms shown alongside. It ships as a Windows app built with Pake, and `dist/` must also work opened straight from a folder (`file://`) as a fallback for lab PCs without WebView2 (Windows 7). That's why `base: './'` is set, with no CDN and a self-hosted font. `vite.config.ts` also builds one classic IIFE script (no `type="module"`, no `crossorigin`; browsers block both from `file://`) plus one CSS file, targeting Chrome 109 / Firefox 115, the last browsers on Windows 7. Lesson data is an eager glob inside that script. Target hardware is mouse-and-keyboard desktop lab PCs, not touch screens.

## Commands

```bash
npm run dev                       # Vite dev server (use --host 127.0.0.1 if localhost hangs)
npm run build                     # tsc -b && vite build -> dist/
npm run package [-- x64|x86]      # build + Pake (GNU toolchain), 64- and 32-bit -> release/ (msi, portable zip, web.zip, guide)
npm test                          # vitest: auto-solves every lesson against the real extracted data
npx vitest run -t "lesson 2"      # one lesson
node tools/smoke.mjs <lesson> [url]   # plays a lesson through the real UI in headless system Chrome; screenshots -> tools/.cache/smoke/lesson<N>/; exits 1 on console errors
node tools/smoke.mjs 6 "file:///$PWD/dist/index.html"   # the web.zip case: run before packaging (blocked file:// resources show up as console errors)
HINTS=off node tools/smoke.mjs 2 [url]  # same with "Show instructions" unchecked
node tools/smoke.mjs test [url]       # TEST mode: all 7 stages then the results screen (~25 min)
CPU=4 node tools/smoke.mjs 6 [url]    # slow-PC check: logs load time and fps during an assembly animation
CDP=http://127.0.0.1:9222 node tools/smoke.mjs 1   # drive the packaged app (see Packaging)
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
# «اكتشف القطع» photos + callouts from legacy/media/explore/*.swf (export images and texts first, see the script's docstring):
python tools/extract_explore.py [--debug]  # -> public/media/explore/ + src/content/explore.json; --debug outlines callouts in tools/.cache/explore-debug/
# today's parts in «اكتشف القطع»: photos from Wikimedia Commons
python tools/fetch_photos.py search "<query>"       # Commons files with their licence (OK = allowed)
python tools/fetch_photos.py preview "File:..."     # small previews -> tools/.cache/photo-candidates/
python tools/fetch_photos.py                        # fetch tools/photos.json -> public/media/explore/modern/ + photoCredits.json + CREDITS.md
```

Transcription helpers:
- `python tools/summarize_lesson.py <Lesson>` prints clip labels, clickable children with frame ranges and rects, and the non-boilerplate script lines per frame.
- `python tools/render_frames.py <Lesson> <clip> <frames…>` renders what specific frames show, with named rects outlined.

`tools/convert_xml.py` generated `src/content/parts.json` once. It is now hand-maintained, so don't regenerate it over edits.

## Packaging

`tools/package.mjs` runs the project-local `pake-cli` on `dist/` once per arch, each in `release/.build/<arch>/`, because Pake writes `<name>.msi/.exe` to its cwd. It uses `--use-local-file` and `--windows-toolchain gnu`. It then assembles `release/`: `PCBuilderDZ_<v>_{x64,x86}.msi`, `PCBuilderDZ_<v>_portable_{x64,x86}.zip`, `PCBuilderDZ_<v>_web.zip` (dist/, for Windows 7 without WebView2), and `دليل-الأستاذ.md`.
- **Toolchains:** x64 uses MSYS2 `ucrt64` gcc. x86 uses MSYS2 `mingw32` gcc (`pacman -S mingw-w64-i686-gcc`) plus `rustup target add i686-pc-windows-gnu`. The x86 linker, CC, AR and WINDRES are set through `CARGO_TARGET_I686_…` / `*_i686_pc_windows_gnu`. The 64-bit gcc stays first on PATH for the host build scripts. Everything is set per process; `MSYS2_ROOT` overrides `C:\msys64`. Pake sets `RUSTUP_TOOLCHAIN=stable-x86_64-pc-windows-gnu` itself.
- **x86 needs a patched Pake:** Pake 3.17 maps only x64 for GNU. For x86 the script writes `pake-cli/dist/cli.x86.js`, a checked text patch adding `ia32` → `i686-pc-windows-gnu` (it fails loudly if pake-cli changes), runs it with `--targets ia32`, then deletes it.
- **The portable exe never ships alone:** a GNU build imports `WebView2Loader.dll` at runtime, so the portable zips contain exe + DLL. Without the DLL, Windows shows "WebView2Loader.dll was not found". Both archs were verified to run offline, with every resource served from `tauri.localhost`.
- The icon comes from `python tools/make_icon.py` (-> `build/icon.*`).
- To smoke-test the packaged app, start `release/PCBuilderDZ.exe` with `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`, then run smoke with `CDP=http://127.0.0.1:9222`.
- `docs/guide-enseignant.md` is the teacher handout for the classroom trial.

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
  - **Masks** (`clip_depth`) become `{mask, items}` frame entries. The renderer uses the mask shape's SVG as a CSS `mask-image`. They hide the part of a drive or cable that has slid inside the case. Without them, parts are drawn in front of the case. Mask draws carry the SVG inline as a `data:` URL (`mask`): browsers fetch `mask-image` in CORS mode, which fails from `file://`, and a mask that can't load hides everything inside it. A test checks every mask is inline.
  - One shape can stack several full-stage bitmap fills, for example a close-up painted over the previous view. Some come from `StateNewStyles` records mid-shape. `Swf.shape_bitmap_fills()` walks the shape records to find them all, bottom first.
- **Playback runs at 35 fps** (`useLesson.ts`), RootMovie's rate. Flash plays movies loaded with `loadMovie` at the host's rate, whatever their own header says (24, or 12 for ExternalCables).
- **`src/lib/engine.ts`** is a generic, pure interpreter. Each lesson is a set of **tasks**, started by dropping a tray part, by clicking a scene target (`start`), or automatically when prerequisites are done (no part, e.g. the "Install Motherboard" button). A task runs **steps**: `play`, `goto`, `scene`, `view` (close-up: draw only these clips), `show`/`hide`, `rotate`, `click`, `button`, `done`. Clips wait on their last frame, and sub-clips start at 0.
- **`src/content/lessons.ts`** holds the lesson programs, transcribed from `tools/.cache/scripts/<Lesson>/`. It also has helpers for repeated patterns (`card`, `driveScrews`, `power`, `data`, `plug`). **Flash `_currentframe` is 1-based and `stop()` in `frame_N` means index N-1, while everything here is 0-based.** A click target's rect exists only on the frame where the clip stops, and a label usually marks the frame *after* that stop. A lesson shows in the menu only once it's in `lessons`.
- **Modes (App.tsx):**
  - Learn is the default: the lesson menu, the info card and the tip (from `src/content/learn.ts`: goal, intro, items with fr/en terms, tip), and a "Show instructions" toggle. Off means the original expert mode: hotspots stay active but invisible, and instructions, order hints and error hints are hidden.
    - With instructions on, drops carry `assist`. The 3rd wrong-place drop in a row then installs the part, as the original's `stepCounter` did.
  - A welcome tour (`components/Tour.tsx`) opens on the first visit and again from the Help button. The smoke script skips it.
  - TEST chains lessons 1–7 with instructions forced off and the tray shuffled. It records `state.mistakes` (wrong place, order or orientation) and time per stage, then shows a printable result sheet (`components/TestPanels.tsx`).
  - Adding hooks to `App` resets its state on hot reload, which breaks a smoke run in progress.
- **Layout** follows a mock-up; see "UI" below. It is three columns: info card | lesson | lessons, right to left. The lesson column is one screen tall (`--col-h`): the title, instruction and mat keep their size, and the stage row takes the rest. `.stage-wrap` is a size container, and `.stage-box` is sized in `cqw`/`cqh`. `.side-col` wraps both side cards. It is `display: contents` on wide screens; below 1480 px it becomes one column that scrolls on its own. Below 900 px everything stacks and the page scrolls. «تكبير» (`.app.focus`) hides the side column. The header (`--top-h`) and the mat (`.tray-body`) have fixed heights, so the stage never changes size mid-lesson.
- **Components:**
  - `AssemblyStage` scales the fixed stage and draws the scene or view clips, including sub-clips. It also renders drop, start and click hotspots (tiny ones are inflated), the rotate tools, and the action button.
  - `PartsTray` is the antistatic mat: pastel cards, FR/EN term, and scroll arrows when the cards overflow. With instructions off it gives no order hints and lets any part be picked up.
  - `Sidebar` holds the lesson list, the tip, the progress, and the test card. `InfoPanel` holds the learn text, the terms and «تذكّر دائمًا».
  - `Explore` is «اكتشف القطع» (header button, or ⓘ on a tray card). Its catalog has two tabs: «حاسوب 2007» (the lessons' parts, by lesson) and «حاسوب اليوم» (today's parts, by topic: `era: 'modern'`, `todayTopics`). Per component: its photos with numbered callouts, what it is, its role, today's equivalent («واليوم؟») or what it replaced («وقديمًا؟»), a fact, and a then-and-now button (`pair`). Texts, callout translations, the callouts on today's photos and the part → entry map are in `src/content/explore.ts`.
    - 2007 photos and callout rects come from `tools/extract_explore.py`.
    - Today's photos come from Wikimedia Commons (`tools/photos.json` → `fetch_photos.py`). **Only CC0, public domain, CC BY and CC BY-SA**: the script refuses others. Their authors and licences are listed in `About` (and in each photo's tooltip), and CREDITS.md lists them with sources. They load only when a component is opened.
  - «تلميذ جديد» (`ResetProgress`) clears the ✓ marks and returns to lesson 1, for the next student on the same PC. It's disabled during a test and leaves a result sheet on screen alone. `Dialog` is the shared modal shell.
  - Stage feedback (`.message`) closes on click, or by itself after 4 s (7 s with a hint).
  - `About` is the «حول التطبيق» dialog from the header, with details from `src/content/about.ts` and the photo at `public/media/about/`. The GitHub, LinkedIn and Facebook logos are inline SVG paths, because lucide 1.x has no brand icons.
  - `LessonPanels` holds `LessonHead`, `StepsCard` (built from `lib/steps.ts`, using `Task.label` or the part name) and `TestStatus`. `Decor` holds the SVG blobs and illustrations.
  - `App` owns pointer drag, plus tap-to-select/tap-to-place.

## UI

- **Look:** cream page, chocolate header and mat, orange for current/primary, teal for done/progress, yellow accents. Tokens live on `:root` in `styles.css`.
- **Fonts:** Cairo for headings, Noto Sans Arabic for body text, and Aref Ruqaa only for the handwritten tagline. All are self-hosted via `@fontsource`.
- **Icons:** `lucide-react`, bundled, so there's no CDN.
- **Target screens** are lab PCs and laptops, from 1024×640 up to 1920×1080. Include browser windows with toolbars, e.g. 1920×890 or 1366×650. Phones aren't supported. `max-height` media queries shrink the header, the mat cards, the lesson title and the mat title on short screens.
- **Tour highlighting** is a fixed `.tour-spot` drawn over the measured element. Its huge box-shadow does the dimming. Lifting elements with `z-index` doesn't work inside the sticky columns.
- **Wording:** the parts area is «القطع المتوفّرة». Avoid the literal «البساط المضاد للكهرباء الساكنة» (antistatic mat), which students found confusing.
- **Checking the layout:** `node tools/ui-shots.mjs` (or `SIZES=1366x650,...`) screenshots it at six sizes into `tools/.cache/ui/` and reports the stage size and any page scroll.

## Gotchas

- `npm test` catches most transcription mistakes. It fails when a click target, drop hotspot or start target has no rect at the frame where the step waits, or when a lesson can't be completed.
- Fully transparent placements (alpha multiplier 0) are the invisible hit buttons. They're kept as click targets but never drawn.
- Vector layers containing `#6699cc` are the old Flash UI button baked into scenes, and are skipped.
- The legacy `essentials.xml` is not well-formed and mixes UTF-8 with cp1252 bytes, so read it with regexes or `errors='replace'`, never a strict XML parser.
- Arabic and French text is written for the classroom and should be reviewed by a teacher before release.
- Keep the user's email out of requests to external services. The Commons User-Agent names the public repository instead.
