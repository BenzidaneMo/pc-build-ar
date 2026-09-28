// Packages dist/ into Windows apps with Pake (local pake-cli, Rust GNU toolchain), 64-bit and 32-bit.
// Usage: npm run package [-- x64|x86]      (runs the Vite build first; default: both)
//        node tools/package.mjs --repack   (only redo the zips/msi copies from the last build)
//
// Output in release/ (what gets handed to teachers):
//   PCBuilderDZ_<v>_x64.msi / _x86.msi          installers
//   PCBuilderDZ_<v>_portable_x64.zip / _x86.zip  exe + WebView2Loader.dll, no install needed
//   PCBuilderDZ_<v>_web.zip                       dist/ for PCs without WebView2 (Windows 7): open index.html
//   دليل-الأستاذ.md                                the teacher guide
//
// Toolchains (nothing is changed system-wide; PATH and the linker are set for this process only):
//   x64: MSYS2 ucrt64 gcc.      x86: MSYS2 mingw32 gcc (pacman -S mingw-w64-i686-gcc)
//   + rustup target add i686-pc-windows-gnu
// Pake 3.17 maps only x64 for --windows-toolchain gnu, so for x86 this runs a copy of its cli.js
// with an ia32 -> i686-pc-windows-gnu mapping added (checked text patch; the package is untouched).
import { spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const release = join(root, 'release')
const pake = join(root, 'node_modules/pake-cli')
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const msys = process.env.MSYS2_ROOT ?? 'C:\\msys64'
const name = 'PCBuilderDZ'

const ARCHS = {
  x64: { pake: 'x64', triple: 'x86_64-pc-windows-gnu', mingw: join(msys, 'ucrt64', 'bin') },
  x86: { pake: 'ia32', triple: 'i686-pc-windows-gnu', mingw: join(msys, 'mingw32', 'bin') },
}
const wanted = process.argv.slice(2).filter((a) => a in ARCHS)
const archs = wanted.length ? wanted : Object.keys(ARCHS)
// --repack: skip the Pake builds and only redo the zips from release/.build/<arch>/
const repack = process.argv.includes('--repack')

if (!existsSync(join(root, 'dist/index.html'))) throw new Error('dist/ is missing: run npm run build first')
mkdirSync(release, { recursive: true })

/** A copy of Pake's CLI that also knows the 32-bit GNU target. */
function patchedCli() {
  const src = readFileSync(join(pake, 'dist/cli.js'), 'utf8')
  const edits = [
    // WinBuilder accepts --targets ia32
    ["const validArchs = ['x64', 'arm64', 'auto'];", "const validArchs = ['x64', 'arm64', 'auto', 'ia32'];"],
    // ... and maps it to the i686 GNU triple
    ["WinBuilder.GNU_ARCH_MAPPINGS = {\n    x64: 'x86_64-pc-windows-gnu',\n};",
      "WinBuilder.GNU_ARCH_MAPPINGS = {\n    x64: 'x86_64-pc-windows-gnu',\n    ia32: 'i686-pc-windows-gnu',\n};"],
    ["BaseBuilder.ARCH_DISPLAY_NAMES = {\n    arm64: 'aarch64',", "BaseBuilder.ARCH_DISPLAY_NAMES = {\n    ia32: 'x86',\n    arm64: 'aarch64',"],
  ]
  let out = src.replace(/\r\n/g, '\n')
  for (const [a, b] of edits) {
    if (out.split(a).length !== 2) throw new Error(`pake-cli changed, x86 patch no longer applies: ${a.slice(0, 60)}`)
    out = out.replace(a, b)
  }
  // must live next to cli.js: Pake finds its package from the script's location
  const file = join(pake, 'dist/cli.x86.js')
  writeFileSync(file, out)
  return file
}

function build(arch) {
  const a = ARCHS[arch]
  const work = join(release, '.build', arch)
  if (repack) return pack(arch, work)
  if (!existsSync(join(a.mingw, 'gcc.exe'))) throw new Error(`${arch}: no MinGW gcc in ${a.mingw}`)
  const env = { ...process.env }
  const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH'
  // host build scripts are x86_64: keep the 64-bit gcc first on PATH, point the target at its own gcc
  env[pathKey] = [ARCHS.x64.mingw, a.mingw, env[pathKey]].join(';')
  if (arch === 'x86') {
    env.CARGO_TARGET_I686_PC_WINDOWS_GNU_LINKER = join(a.mingw, 'gcc.exe')
    env.CC_i686_pc_windows_gnu = join(a.mingw, 'gcc.exe')
    env.AR_i686_pc_windows_gnu = join(a.mingw, 'ar.exe')
    env.WINDRES_i686_pc_windows_gnu = join(a.mingw, 'windres.exe')
  }
  const cli = arch === 'x86' ? patchedCli() : join(pake, 'dist/cli.js')
  // Pake writes <name>.msi / <name>.exe to its working directory: one per arch
  rmSync(work, { recursive: true, force: true })
  mkdirSync(work, { recursive: true })
  const args = [
    cli, join(root, 'dist'),
    '--use-local-file',
    '--name', name,
    '--title', 'محاكي تجميع الحاسوب',
    '--icon', join(root, 'build/icon.ico'),
    '--width', '1280', '--height', '800', '--maximize',
    '--app-version', version,
    '--installer-language', 'fr-FR',
    '--windows-toolchain', 'gnu',
    '--targets', a.pake,
    '--keep-binary',
  ]
  console.log(`\n=== ${arch} (${a.triple}) ===`)
  const r = spawnSync(process.execPath, args, { cwd: work, env, stdio: 'inherit' })
  if (arch === 'x86') rmSync(cli, { force: true })
  if (r.status !== 0) throw new Error(`${arch} build failed (exit ${r.status})`)
  pack(arch, work)
}

/** release/ outputs of one arch: the installer, and exe + WebView2Loader.dll zipped together. */
function pack(arch, work) {
  const a = ARCHS[arch]
  // A GNU build loads WebView2Loader.dll at runtime (MSVC links it statically). The MSI
  // includes it, but --keep-binary copies only the .exe, so the portable exe needs it beside it.
  const loader = join(pake, 'src-tauri/target', a.triple, 'release/WebView2Loader.dll')
  if (!existsSync(loader)) throw new Error(`${arch}: WebView2Loader.dll not found at ${loader}`)
  const folder = `${name}_${version}_portable_${arch}`
  const portable = join(work, folder)
  rmSync(portable, { recursive: true, force: true })
  mkdirSync(portable, { recursive: true })
  copyFileSync(join(work, `${name}.exe`), join(portable, `${name}.exe`))
  copyFileSync(loader, join(portable, 'WebView2Loader.dll'))
  copyFileSync(join(work, `${name}.msi`), join(release, `${name}_${version}_${arch}.msi`))
  zip(work, folder, join(release, `${folder}.zip`))
}

/** Zips `parent/folder` as a single top-level folder (so extracting keeps its files together),
 *  with Windows' own tar (bsdtar), no extra dependency. Naming the folder, not ".", keeps
 *  "./" and "." entries out of the archive (WinRAR chokes on them). */
function zip(parent, folder, out) {
  rmSync(out, { force: true })
  const r = spawnSync('tar', ['-a', '-c', '-f', out, '-C', parent, folder], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`zip failed: ${out}`)
}

for (const arch of archs) build(arch)

// the browser version, with the teacher guide
const webFolder = `${name}_${version}_web`
const webParent = join(release, '.build', 'web')
rmSync(webParent, { recursive: true, force: true })
cpSync(join(root, 'dist'), join(webParent, webFolder), { recursive: true })
zip(webParent, webFolder, join(release, `${webFolder}.zip`))
copyFileSync(join(root, 'docs/guide-enseignant.md'), join(release, 'دليل-الأستاذ.md'))

console.log(`\nrelease/ ready: ${archs.map((a) => `${name}_${version}_${a}.msi + portable_${a}.zip`).join(', ')}, web.zip, دليل-الأستاذ.md`)
