import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { eraOf, exploreById, exploreEntries, features, photoCredits, viewsOf } from './explore'

const ALLOWED = /^(CC0|Public domain|CC BY(-SA)? \d\.\d( \w+)?)$/i
const file = (path: string) => new URL(`../../public/${path}`, import.meta.url)

describe('«اكتشف القطع»', () => {
  it('credits every photo: Commons ones under a free licence, the others to their maker', () => {
    for (const [name, c] of Object.entries(photoCredits)) {
      if (c.license === 'Manufacturer photo') expect(c.source, name).toMatch(/^https:\/\//)
      else {
        expect(c.license, name).toMatch(ALLOWED)
        expect(c.source, name).toMatch(/^https:\/\/commons\.wikimedia\.org\//)
      }
      expect(c.author, name).not.toBe('')
      expect(existsSync(file(`media/explore/modern/${name}`)), name).toBe(true)
    }
  })

  it('shows a picture for every entry of today', () => {
    for (const e of exploreEntries.filter((x) => eraOf(x) === 'modern')) {
      expect(viewsOf(e).length > 0 || !!e.art, e.id).toBe(true)
      if (e.art) expect(existsSync(file(`media/explore/modern/${e.art}`)), e.art).toBe(true)
    }
  })

  it('translates every callout', () => {
    for (const e of exploreEntries) {
      for (const v of viewsOf(e)) for (const c of v.callouts) expect(features[c.en], `${e.id}: ${c.en}`).toBeDefined()
    }
  })

  it('pairs then and now across the two tabs', () => {
    for (const e of exploreEntries.filter((x) => x.pair)) {
      const pair = exploreById[e.pair!]
      expect(pair, `${e.id} -> ${e.pair}`).toBeDefined()
      expect(eraOf(pair), `${e.id} -> ${e.pair}`).not.toBe(eraOf(e))
    }
  })
})
