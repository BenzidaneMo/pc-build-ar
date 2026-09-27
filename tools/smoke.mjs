// Plays a lesson through the real UI in headless Chrome, screenshotting each new instruction.
// Usage: node tools/smoke.mjs [lesson=1] [url]      (dev server must be running)
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const lesson = Number(process.argv[2] ?? 1)
const url = process.argv[3] ?? 'http://localhost:5173/'
const out = `tools/.cache/smoke/lesson${lesson}`
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
let shots = 0
const shot = (name) => page.screenshot({ path: `${out}/${String(++shots).padStart(2, '0')}-${name}.png` })
const visible = async (sel) => (await page.locator(sel).count()) > 0 && page.locator(sel).first().isVisible()

async function drag(part) {
  const card = page.locator(`.part-card[data-part="${part}"]`)
  await card.scrollIntoViewIfNeeded()
  const c = await card.boundingBox()
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2)
  await page.mouse.down()
  await page.mouse.move(c.x, c.y - 40, { steps: 5 })
  const h = await page.locator(`.hotspot[data-part="${part}"]`).boundingBox()
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2, { steps: 8 })
  await page.mouse.up()
}

await page.goto(url)
await page.locator('.lessons button').nth(lesson - 1).click()
await page.locator('.instruction').waitFor({ timeout: 60000 })
let last = ''
const start = Date.now()
while (Date.now() - start < 900000) {
  const text = (await page.locator('.instruction').textContent()) ?? ''
  if (text && text !== last) { last = text; await shot('step') }
  if (await visible('.instruction.done')) break
  if (await visible('.rotate-tools')) {
    // one step at a time until "install" is accepted
    const rot = page.getByRole('button', { name: 'تدوير', exact: true })
    for (let i = 0; i < 160 && (await visible('.rotate-tools')); i++) {
      await page.getByRole('button', { name: 'تثبيت' }).click()
      await page.waitForTimeout(40)
      if (!(await visible('.rotate-tools'))) break
      const b = await rot.boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down(); await page.waitForTimeout(35); await page.mouse.up()
      await page.waitForTimeout(50)
    }
    continue
  }
  if (await visible('.stage-action')) { await page.locator('.stage-action').click(); continue }
  if (await visible('button.hotspot:not([data-part])')) { await page.locator('button.hotspot:not([data-part])').first().click(); continue }
  const drop = page.locator('div.hotspot[data-part]')
  if (await drop.count()) { await drag(await drop.first().getAttribute('data-part')); await page.waitForTimeout(100); continue }
  await page.waitForTimeout(150)
}
await page.waitForTimeout(400)
await shot('end')
console.log(`lesson ${lesson}:`, (await visible('.instruction.done')) ? 'COMPLETED' : 'NOT completed', '| last:', last)
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
