import { describe, expect, it } from 'vitest'
import { normalizeForSearch, searchLocations } from './search'
import { getLocations } from '../data/locations'

const all = getLocations()

describe('normalizeForSearch', () => {
  it('folds the Norwegian letters the way the Kotlin app does', () => {
    expect(normalizeForSearch('Åkrasanden')).toBe('akrasanden')
    expect(normalizeForSearch('Sørenga')).toBe('sorenga')
    expect(normalizeForSearch('Splæsh')).toBe('splaesh')
  })

  it('lowercases and strips accents', () => {
    expect(normalizeForSearch('HUK')).toBe('huk')
    expect(normalizeForSearch('Café')).toBe('cafe')
  })

  it('leaves plain text alone', () => {
    expect(normalizeForSearch('huk strand')).toBe('huk strand')
  })
})

describe('searchLocations', () => {
  it('returns nothing for an empty query', () => {
    expect(searchLocations(all, '')).toEqual([])
    expect(searchLocations(all, '   ')).toEqual([])
  })

  it('matches on a substring anywhere in the name', () => {
    const names = searchLocations(all, 'strand').map((l) => l.name)

    expect(names.length).toBeGreaterThan(1)
    expect(names.every((n) => n.toLowerCase().includes('strand'))).toBe(true)
  })

  it('ignores case', () => {
    expect(searchLocations(all, 'HUK')[0].name).toBe('Huk Strand')
  })

  it('finds Norwegian letters typed without them', () => {
    expect(searchLocations(all, 'sorenga')[0].name).toBe('Sørenga Sjøbad')
    expect(searchLocations(all, 'akrasanden')[0].name).toBe('Åkrasanden')
  })

  it('finds them when typed with them too', () => {
    expect(searchLocations(all, 'Sørenga')[0].name).toBe('Sørenga Sjøbad')
  })

  it('puts the shortest names first', () => {
    const results = searchLocations(all, 'bad')
    const lengths = results.map((l) => l.name.length)

    expect([...lengths].sort((a, b) => a - b)).toEqual(lengths)
  })

  it('caps the number of suggestions', () => {
    expect(searchLocations(all, 'a', 6).length).toBeLessThanOrEqual(6)
    expect(searchLocations(all, 'a', 3).length).toBeLessThanOrEqual(3)
  })

  it('returns nothing when there is no match', () => {
    expect(searchLocations(all, 'zzzzzz')).toEqual([])
  })
})
