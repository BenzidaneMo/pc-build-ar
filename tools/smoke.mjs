// Plays a lesson through the real UI in headless Chrome, screenshotting each new instruction.
// Usage: node tools/smoke.mjs [lesson=1|test] [url]      (dev server must be running)
//   "test" runs TEST mode: all 7 stages without instructions, then the results screen.
// Env options:
//   CDP=http://127.0.0.1:9222  drive an already-open page instead (e.g. the packaged app, started with
//                              WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222)
//   CPU=4                      throttle the CPU (slow lab PC) and report load time and frame rate
//   TOUCH=1                    play with taps (tap-to-select, tap-to-place) instead of mouse drags
//   HINTS=off                  play with "Show instructions" unchecked
import { chromium } from 'playwright-core'
import { mkdirSync, rmSync } from 'node:fs'

const testMode = process.argv[2] === 'test'
const lesson = testMode ? 1 : Number(process.argv[2] ?? 1)
const url = process.argv[3] ?? 'http://localhost:5173/'
const out = testMode ? 'tools/.cache/smoke/test' : `tools/.cache/smoke/lesson${lesson}`
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const touch = process.env.TOUCH === '1'
const browser = process.env.CDP
  ? await chromium.connectOverCDP(process.env.CDP)
  : await chromium.launch({ channel: 'chrome', headless: true })
const page = process.env.CDP
  ? browser.contexts()[0].pages()[0]
  : await (await browser.newContext({ viewport: { width: 1280, height: 860 }, hasTouch: touch })).newPage()
if (process.env.CPU) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.CPU) })
}
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
let shots = 0
const shot = (name) => page.screenshot({ path: `${out}/${String(++shots).padStart(2, '0')}-${name}.png` })
const visible = async (sel) => (await page.locator(sel).count()) > 0 && page.locator(sel).first().isVisible()

async function drag(part) {
  const card = page.locator(`.part-card[data-part="${part}"]`)
  await card.scrollIntoViewIfNeeded()
  if (touch) {
    await card.tap()
    await page.locator(`.hotspot[data-part="${part}"]`).tap()
    return
  }
  const c = await card.boundingBox()
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2)
  await page.mouse.down()
  await page.mouse.move(c.x, c.y - 40, { steps: 5 })
  const h = await page.locator(`.hotspot[data-part="${part}"]`).boundingBox()
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2, { steps: 8 })
  await page.mouse.up()
}

const press = (loc) => (touch ? loc.tap() : loc.click())

/** Samples the page's rendering rate (requestAnimationFrame callbacks per second) over `ms`. */
const fps = (ms = 1500) => page.evaluate((ms) => new Promise((done) => {
  let n = 0
  const t0 = performance.now()
  const f = () => (performance.now() - t0 < ms ? (n++, requestAnimationFrame(f)) : done(Math.round((n * 1000) / ms)))
  requestAnimationFrame(f)
}), ms)

/** Plays the lesson on screen until its completion message shows. */
async function playLesson() {
  let last = ''
  let sampled = false
  const start = Date.now()
  while (Date.now() - start < 900000) {
    const text = (await page.locator('.instruction').textContent()) ?? ''
    if (text && text !== last) { last = text; await shot('step') }
    if (await visible('.instruction.done')) break
    if (await visible('.rotate-tools')) {
      // one step at a time until "install" is accepted (the first try is deliberately wrong)
      const rot = page.getByRole('button', { name: 'تدوير', exact: true })
      for (let i = 0; i < 160 && (await visible('.rotate-tools')); i++) {
        await press(page.getByRole('button', { name: 'تثبيت' }))
        await page.waitForTimeout(40)
        if (!(await visible('.rotate-tools'))) break
        if (touch) { await rot.tap() } else {
          const b = await rot.boundingBox()
          await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
          await page.mouse.down(); await page.waitForTimeout(35); await page.mouse.up()
        }
        await page.waitForTimeout(50)
      }
      continue
    }
    if (await visible('.stage-action')) { await press(page.locator('.stage-action')); continue }
    if (await visible('button.hotspot:not([data-part])')) { await press(page.locator('button.hotspot:not([data-part])').first()); continue }
    const drop = page.locator('div.hotspot[data-part]')
    if (await drop.count()) {
      await drag(await drop.first().getAttribute('data-part'))
      if (process.env.CPU && !sampled) { sampled = true; console.log(`fps during assembly animation: ${await fps(1000)}`) }
      await page.waitForTimeout(100)
      continue
    }
    await page.waitForTimeout(150)
  }
  return { done: await visible('.instruction.done'), last }
}

if (!process.env.CDP) await page.goto(url)
// a fresh profile opens the welcome tour first
await page.getByRole('button', { name: 'تخطّي الجولة' }).click({ timeout: 3000 }).catch(() => {})
// layout jitter check: every stage size seen during the run (should stay one size)
await page.evaluate(() => {
  window.__stageSizes = new Map()
  const h = (s) => Math.round(document.querySelector(s)?.getBoundingClientRect().height ?? -1)
  setInterval(() => {
    const b = document.querySelector('.stage-box')?.getBoundingClientRect()
    const size = b && `${b.width.toFixed(1)}x${b.height.toFixed(1)}`
    // what the rest of the lesson column looked like when this size first appeared
    if (size && !window.__stageSizes.has(size)) {
      window.__stageSizes.set(size, `head ${h('.lesson-head')} instruction ${h('.instruction-row')} tray ${h('.tray')}`)
    }
  }, 50)
})
if (testMode) {
  await page.locator('.test-button').click()
  await page.locator('.test-name input').fill('تلميذ تجريبي')
  await shot('intro')
  await page.getByRole('button', { name: 'ابدأ الاختبار' }).click()
  for (let stage = 1; stage <= 7; stage++) {
    await page.locator('.instruction').waitFor({ timeout: 120000 })
    const r = await playLesson()
    console.log(`stage ${stage}:`, r.done ? 'COMPLETED' : 'NOT completed', '| mistakes', await page.locator('.test-chip').textContent())
    if (!r.done) break
    await page.locator('.primary.next').click()
  }
  await page.locator('.test-results').waitFor({ timeout: 10000 })
  await shot('results')
  console.log('results:', (await page.locator('.test-results tbody tr').allTextContents()).join(' | '))
} else {
  const t0 = Date.now()
  await press(page.locator('.lessons button').nth(lesson - 1))
  await page.locator('.instruction').waitFor({ timeout: 60000 })
  if (process.env.CPU) console.log(`load: ${Date.now() - t0} ms at ${process.env.CPU}x CPU slowdown, idle fps ${await fps()}`)
  // HINTS=off plays with "Show instructions" unchecked (hotspots invisible but still active)
  const box = page.locator('.hints-toggle input')
  if ((process.env.HINTS === 'off') === (await box.isChecked())) await box.click()
  const t1 = Date.now()
  const r = await playLesson()
  if (process.env.CPU) console.log(`played in ${Math.round((Date.now() - t1) / 1000)} s`)
  await page.waitForTimeout(400)
  await shot('end')
  console.log(`lesson ${lesson}:`, r.done ? 'COMPLETED' : 'NOT completed', '| last:', r.last)
}
console.log('stage sizes seen:', await page.evaluate(() => [...window.__stageSizes].map(([s, d]) => `${s} (${d})`)))
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
