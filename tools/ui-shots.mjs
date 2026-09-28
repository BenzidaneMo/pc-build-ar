// Usage: node tools/ui-shots.mjs [url]   (dev server must be running) -> tools/.cache/ui/
// Screenshots the UI at typical classroom screen sizes (the tour, lesson 7 like the reference
// mock-up, lesson 2 mid-lesson) and reports the stage size and any sideways page scroll.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://127.0.0.1:5173/'
const out = 'tools/.cache/ui'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
// full screens, then the same screens inside a browser window (tabs, address and bookmarks bars)
const sizes = process.env.SIZES
  ? process.env.SIZES.split(',').map((s) => s.split('x').map(Number))
  : [[1920, 1080], [1920, 890], [1366, 768], [1366, 650], [1280, 720], [1024, 640]]
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(url)
  await page.locator('.tour').waitFor({ timeout: 10000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${out}/${w}x${h}-tour.png` })
  await page.getByRole('button', { name: 'تخطّي الجولة' }).click()
  await page.locator('.lessons button').nth(6).click()
  await page.locator('.part-card').first().waitFor({ timeout: 60000 })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/${w}x${h}-lesson7.png` })
  await page.locator('.lessons button').nth(1).click()
  await page.locator('.part-card').first().waitFor({ timeout: 60000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/${w}x${h}-lesson2.png` })
  const m = await page.evaluate(() => {
    const s = document.querySelector('.stage-box')?.getBoundingClientRect()
    return {
      hScroll: document.documentElement.scrollWidth > innerWidth,
      vScroll: document.documentElement.scrollHeight - innerHeight,
      stage: s && `${Math.round(s.width)}x${Math.round(s.height)}`,
      trayBottom: Math.round(document.querySelector('.tray')?.getBoundingClientRect().bottom ?? 0),
    }
  })
  console.log(`${w}x${h}`, JSON.stringify(m), 'errors:', errors.length ? errors : 'none')
  await page.close()
}
await browser.close()
