# محاكي تجميع الحاسوب — PC Assembly Simulator

<div dir="rtl">

محاكٍ يتعلّم فيه تلاميذ الثانوي تجميع حاسوب مكتبي خطوة بخطوة: علبة التغذية، اللوحة الأم، البطاقات، الأقراص، والأسلاك. الواجهة بالعربية مع المصطلحات بالفرنسية، ويعمل **دون إنترنت**.

- **الدروس:** 7 دروس مع تعليمات ومناطق مضيئة، ويمكن إخفاؤها للتدرّب.
- **الاختبار:** تجميع الحاسوب كاملًا دون تعليمات، مع حساب الوقت والأخطاء وطباعة النتيجة.
- **اكتشف القطع:** صور كل قطعة من كل الجهات مع أسماء أجزائها، ودورها، وما عوّضها اليوم.
- **للأستاذ:** دليل التثبيت والاستعمال في [docs/guide-enseignant.md](docs/guide-enseignant.md).

</div>

A rebuild of the 2007 Cisco IT Essentials "Virtual Desktop" (Flash 8) as an offline React app, for Algerian high-school computer science classes. The original lesson animations are extracted from the SWF files and replayed by a small lesson engine. The interface is Arabic (RTL), with French and English hardware terms.

## Features

- **Learn:** seven lessons (power supply, motherboard, expansion cards, hard drive, optical and floppy drives, internal cables, external cables). Each has a short description, drag-and-drop from the antistatic mat, rotate-to-fit connectors, and click targets for screws and latches.
- **Show instructions** toggle. Off is the original "expert mode": no instructions and no highlighted drop areas. With it on, three wrong drops in a row install the part automatically, as in the original.
- **Test:** all seven stages in a row without instructions. Time and mistakes are recorded per stage, and there's a printable result sheet.
- **Explore the parts:** every component with the original's photos from each side, numbered callouts for its connectors and features, and a short explanation of what it is, what it does and what replaced it today (floppy drives, PATA, PS/2…).
- **New student** button: clears the lessons' ✓ marks on a shared lab PC.
- **Welcome tour**, reopened with the Help button.
- **Offline:** a Windows app (MSI or portable exe), or the `dist/` folder opened straight from disk in Chrome 109+ or Firefox 115+, which covers Windows 7.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173 (add --host 127.0.0.1 if localhost hangs)
npm test           # auto-solves every lesson against the extracted data
npm run build      # -> dist/, works from file://
npm run package    # -> release/: x64 and x86 .msi installers, portable .zip (exe + WebView2Loader.dll), web.zip
```

`npm run package` uses [Pake](https://github.com/tw93/Pake), installed locally, with the Rust GNU toolchain (`rustup`, `stable-x86_64-pc-windows-gnu`, plus the `i686-pc-windows-gnu` target for 32-bit). It also needs MSYS2's MinGW gcc: `ucrt64` for 64-bit and `mingw32` for 32-bit. It looks in `C:\msys64` by default; set `MSYS2_ROOT` to override. Add `-- x64` or `-- x86` to build only one.

## How it works

- `legacy/` holds the untouched Flash original, which is the reference for behaviour and art.
- `tools/` is the asset pipeline, in Python with Pillow and a local JPEXS/JDK. It parses each lesson SWF, flattens its timelines (bitmaps, vector shapes, masks, named children) and writes WebP frames to `public/lessons/` plus frame data to `src/content/lessons/`.
- `src/lib/engine.ts` is a pure lesson interpreter. `src/content/lessons.ts` holds the lesson programs, transcribed from the decompiled ActionScript.
- `tools/smoke.mjs` plays lessons through the real UI in headless Chrome, and can also drive the packaged app.

[CLAUDE.md](CLAUDE.md) has the full developer notes: the pipeline commands, how the legacy lessons are built, and gotchas.

## Status

Changes per version are in [CHANGELOG.md](CHANGELOG.md).

Classroom trial stage. The Arabic and French texts still need review by a teacher. Planned work includes the original 360° spin videos of each part (FLV in `legacy/media/explore/flv/`, they need converting) and modern hardware (SSD, M.2, 24-pin ATX, HDMI/USB-C).

## Credits

Developed by **Mohamed Benzidane**: [GitHub](https://github.com/BenzidaneMo) · [LinkedIn](https://www.linkedin.com/in/mohamed-benzidane-42b958210) · [Portfolio](https://portfolio-mohamed-benzidane.netlify.app)

The lesson animations, part images and original lesson content come from Cisco Networking Academy's *IT Essentials Virtual Desktop* and remain Cisco's property. This project is a non-commercial educational adaptation for classroom use.
