import { describe, expect, it } from 'vitest'
import { farevarselPolygon } from './polygon'
import type { Ring } from '../types/warning'

const square: Ring = [
  [59.0, 10.0],
  [60.0, 10.0],
  [60.0, 11.0],
  [59.0, 11.0],
  [59.0, 10.0],
]

describe('farevarselPolygon', () => {
  it('detects a point inside the ring', () => {
    expect(farevarselPolygon(59.5, 10.5, square)).toBe(true)
  })

  it('rejects a point outside the ring', () => {
    expect(farevarselPolygon(58.0, 10.5, square)).toBe(false)
    expect(farevarselPolygon(59.5, 12.0, square)).toBe(false)
  })

  it('returns false for an empty ring', () => {
    expect(farevarselPolygon(59.5, 10.5, [])).toBe(false)
  })

  it('handles a concave ring', () => {
    const concave: Ring = [
      [0, 0],
      [0, 4],
      [4, 4],
      [4, 0],
      [2, 0],
      [2, 3],
      [1, 3],
      [1, 0],
    ]

    expect(farevarselPolygon(1.5, 1.0, concave)).toBe(false)
    expect(farevarselPolygon(3.0, 1.0, concave)).toBe(true)
  })
})
