import { describe, expect, it } from 'vitest'
import { clamp01, countUpValue, easeOutCubic } from './animation'

describe('clamp01', () => {
  it('holds progress inside zero and one', () => {
    expect(clamp01(-2)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(9)).toBe(1)
  })
})

describe('easeOutCubic', () => {
  it('starts at zero and ends at one', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })

  it('decelerates: most of the distance is covered early', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
    expect(easeOutCubic(0.25)).toBeGreaterThan(0.25)
  })

  it('never leaves the unit range', () => {
    expect(easeOutCubic(-1)).toBe(0)
    expect(easeOutCubic(4)).toBe(1)
  })
})

describe('countUpValue', () => {
  it('returns the start value at zero progress', () => {
    expect(countUpValue(0, 84, 0)).toBe(0)
  })

  it('lands exactly on the target', () => {
    expect(countUpValue(0, 84, 1)).toBe(84)
    expect(countUpValue(12, 84, 1)).toBe(84)
  })

  it('counts down as happily as it counts up', () => {
    expect(countUpValue(84, 40, 1)).toBe(40)
    expect(countUpValue(84, 40, 0)).toBe(84)
  })

  it('stays between the two endpoints', () => {
    for (const p of [0.1, 0.3, 0.7, 0.9]) {
      const value = countUpValue(0, 84, p)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(84)
    }
  })

  it('returns whole numbers', () => {
    expect(Number.isInteger(countUpValue(0, 84, 0.37))).toBe(true)
  })
})
