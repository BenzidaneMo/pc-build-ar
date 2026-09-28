// Packages dist/ into a Windows app with Pake (local pake-cli, Rust GNU toolchain).
// Usage: npm run package        (runs the Vite build first)
// Output: release/PCBuilderDZ.msi (installer) and release/PCBuilderDZ.exe + WebView2Loader.dll (portable).
//
// The GNU toolchain links with MinGW gcc found on PATH; MSYS2's ucrt64 is
// prepended for this build only, nothing is changed system-wide.
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const release = join(root, 'release')
const cli = join(root, 'node_modules/pake-cli/dist/cli.js')
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const mingw = process.env.MINGW_BIN ?? 'C:\\msys64\\ucrt64\\bin'

if (!existsSync(join(root, 'dist/index.html'))) throw new Error('dist/ is missing: run npm run build first')
mkdirSync(release, { recursive: true })

const env = { ...process.env }
const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH'
if (existsSync(mingw)) env[pathKey] = `${mingw};${env[pathKey]}`

const args = [
  cli, join(root, 'dist'),
  '--use-local-file',
  '--name', 'PCBuilderDZ',
  '--title', 'محاكي تجميع الحاسوب',
  '--icon', join(root, 'build/icon.ico'),
  '--width', '1280', '--height', '800', '--maximize',
  '--app-version', version,
  '--installer-language', 'fr-FR',
  '--windows-toolchain', 'gnu',
  '--keep-binary',
  ...process.argv.slice(2),
]
// Pake writes its artifacts to the working directory.
const r = spawnSync(process.execPath, args, { cwd: release, env, stdio: 'inherit' })
if (r.status !== 0) process.exit(r.status ?? 1)

// A GNU build loads WebView2Loader.dll at runtime (MSVC links it statically). The MSI
// includes it, but --keep-binary copies only the .exe, so the portable exe needs it beside it.
const loader = join(root, 'node_modules/pake-cli/src-tauri/target/x86_64-pc-windows-gnu/release/WebView2Loader.dll')
if (!existsSync(loader)) throw new Error(`WebView2Loader.dll not found at ${loader}`)
copyFileSync(loader, join(release, 'WebView2Loader.dll'))
console.log('portable: release/PCBuilderDZ.exe + release/WebView2Loader.dll (keep them together)')
