# Changelog

All notable changes to this project. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Today's parts in «اكتشف القطع»:** a second tab, «حاسوب اليوم», with 20 components of a PC built today (LGA CPU and socket, DDR5, M.2 NVMe, tower cooler, ATX board and case, modular PSU and its 24-pin and 8-pin cables, graphics card and 12V-2x6, SATA SSD, front panel header, case fan, HDMI, DisplayPort, USB-C, USB drive, UEFI), grouped by topic. The lessons are unchanged.
  - Photos from Wikimedia Commons under free licences (CC0, public domain, CC BY, CC BY-SA), with numbered callouts on the main ones. Each photo shows its author and licence; `CREDITS.md` lists them all with their sources.
  - Then and now: a 2007 part links to what replaced it («اليوم»), and a part of today to what it replaced («في 2007», «وقديمًا؟»).
- `tools/fetch_photos.py`: finds, previews and fetches Commons photos listed in `tools/photos.json`, converts them to WebP and writes the credits. It refuses any other licence.

## [0.2.0] - 2026-09-28

### Added
- **«اكتشف القطع» (Explore the parts):** a catalog of all 25 components, grouped by lesson. It opens from the header, or from the ⓘ button on any card in the parts tray.
  - Each component shows the original EXPLORE photos (front, back, top…) with numbered callouts for its connectors and features, in Arabic with the French or English term.
  - Each component also answers four questions: what it is, what it does, what replaced it today, and a fun fact.
  - This matters most for hardware students no longer know, such as floppy drives, PATA cables and PS/2 ports.
- **«تلميذ جديد» (New student) button** in the header. After a confirmation, it clears the lessons' ✓ marks and returns to lesson 1, so the next student on a shared lab PC starts fresh. It is disabled during a test, and a test result sheet on screen is not affected.
- Two welcome-tour pages, for the two new buttons.
- `tools/extract_explore.py`, which extracts the explore photos and callout positions from `legacy/media/explore/*.swf`.
- This changelog.

### Changed
- Messages over the stage (such as «أكمل الخطوة الحالية أولاً») now close when clicked, or by themselves after 4 seconds (7 seconds when they include a hint). Before, they stayed on screen until the next action.
- On narrower screens, the header buttons show only their icons.
- `tools/smoke.mjs` exits with an error when the page logs console errors.

### Fixed
- **Web version (`web.zip`) opened from a folder:** drives and cables inside the case were not drawn (lessons 2 to 7). Browsers block CSS masks loaded from `file://`, so everything inside a mask disappeared. Masks are now embedded in the lesson data. The MSI and portable builds were not affected.
- A lesson could be ticked ✓ without being finished. When switching lessons, the previous lesson's completed state could count for the new one for a moment.
- `npm run package` failed from Git Bash, where `tar` is GNU tar. It now calls Windows' `tar.exe` by path.

## [0.1.0] - 2026-09-28

First release, for a classroom trial.

### Added
- The 2007 Cisco IT Essentials "Virtual Desktop" rebuilt as an offline React app, in Arabic, with French and English hardware terms.
- Seven lessons, animated with the original lesson animations: power supply, motherboard, expansion cards, hard drive, drives in external bays, internal cables and external cables.
- Learn mode with a «إظهار التعليمات» (Show instructions) toggle. With instructions shown, the part installs itself after 3 wrong drops in a row.
- Test mode: the seven stages in a row without instructions, timed and scored, with a printable result sheet.
- A welcome tour, and an About dialog.
- Windows packages built with Pake (GNU toolchain):
  - x64 and x86 MSI installers;
  - portable zips (exe + `WebView2Loader.dll`);
  - a web zip for Windows 7.

[0.2.0]: https://github.com/BenzidaneMo/pc-build-ar/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/BenzidaneMo/pc-build-ar/releases/tag/v0.1.0
