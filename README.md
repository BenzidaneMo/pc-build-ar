# محاكي تجميع الحاسوب — PC Assembly Simulator

<div dir="rtl">

محاكٍ يتعلّم فيه تلاميذ الثانوي تجميع حاسوب مكتبي خطوة بخطوة: علبة التغذية، اللوحة الأم، البطاقات، الأقراص، والأسلاك. الواجهة بالعربية مع المصطلحات بالفرنسية، ويعمل **دون إنترنت**.

- **الدروس:** 7 دروس مع تعليمات ومناطق مضيئة، ويمكن إخفاؤها للتدرّب.
- **الاختبار:** تجميع الحاسوب كاملًا دون تعليمات، مع حساب الوقت والأخطاء وطباعة النتيجة.
- **للأستاذ:** دليل التثبيت والاستعمال في [docs/guide-enseignant.md](docs/guide-enseignant.md).

</div>

A rebuild of the 2007 Cisco IT Essentials "Virtual Desktop" (Flash 8) as an offline React app, for Algerian high-school computer science classes. The original lesson animations are extracted from the SWF files and replayed by a small lesson engine. The interface is Arabic (RTL), with French and English hardware terms.

## Features

- **Learn:** seven lessons (power supply, motherboard, expansion cards, hard drive, optical and floppy drives, internal cables, external cables). Each has a short description, drag-and-drop from the antistatic mat, rotate-to-fit connectors, and click targets for screws and latches.
- **Show instructions** toggle. Off is the original "expert mode": no instructions and no highlighted drop areas. With it on, three wrong drops in a row install the part automatically, as in the original.
- **Test:** all seven stages in a row without instructions. Time and mistakes are recorded per stage, and there's a printable result sheet.
- **Welcome tour**, reopened with the Help button.
- **Offline:** a Windows app (MSI or portable exe), or the `dist/` folder opened straight from disk in Chrome 109+ or Firefox 115+, which covers Windows 7.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173 (add --host 127.0.0.1 if localhost hangs)
npm test           # auto-solves every lesson against the extracted data
npm run build      # -> dist/, works from file://
npm run package    # -> release/PCBuilderDZ.msi and portable PCBuilderDZ.exe (+ WebView2Loader.dll)
```

`npm run package` uses [Pake](https://github.com/tw93/Pake), installed locally, with the Rust GNU toolchain (`rustup`, `stable-x86_64-pc-windows-gnu`). It also needs MinGW gcc, by default from `C:\msys64\ucrt64\bin`; set `MINGW_BIN` to override.

## How it works

- `legacy/` holds the untouched Flash original, which is the reference for behaviour and art.
- `tools/` is the asset pipeline, in Python with Pillow and a local JPEXS/JDK. It parses each lesson SWF, flattens its timelines (bitmaps, vector shapes, masks, named children) and writes WebP frames to `public/lessons/` plus frame data to `src/content/lessons/`.
- `src/lib/engine.ts` is a pure lesson interpreter. `src/content/lessons.ts` holds the lesson programs, transcribed from the decompiled ActionScript.
- `tools/smoke.mjs` plays lessons through the real UI in headless Chrome, and can also drive the packaged app.

[CLAUDE.md](CLAUDE.md) has the full developer notes: the pipeline commands, how the legacy lessons are built, and gotchas.

## Status

Classroom trial stage. The Arabic and French texts still need review by a teacher. Planned work includes the original "Explore" mode (360° views and videos of each part) and modern hardware (SSD, M.2, 24-pin ATX, HDMI/USB-C).

## Credits

The lesson animations, part images and original lesson content come from Cisco Networking Academy's *IT Essentials Virtual Desktop* and remain Cisco's property. This project is a non-commercial educational adaptation for classroom use.
