import { describe, expect, it } from 'vitest'
import { findLocationById, getLocations } from './locations'

describe('locations', () => {
  it('loads every bathing place from the bundled JSON', () => {
    expect(getLocations()).toHaveLength(61)
  })

  it('gives every place the fields the app relies on', () => {
    for (const location of getLocations()) {
      expect(typeof location.id).toBe('number')
      expect(location.name.length).toBeGreaterThan(0)
      expect(location.latitude).toBeGreaterThan(57)
      expect(location.latitude).toBeLessThan(72)
      expect(location.longitude).toBeGreaterThan(4)
      expect(location.longitude).toBeLessThan(32)
    }
  })

  it('uses unique ids', () => {
    const ids = getLocations().map((location) => location.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('finds a place by id', () => {
    const first = getLocations()[0]

    expect(findLocationById(first.id)?.name).toBe(first.name)
    expect(findLocationById(-1)).toBeUndefined()
  })
})
