import { describe, expect, it } from 'vitest'
import { haversineKm } from './haversine'

describe('haversineKm', () => {
  it('returns zero for the same point', () => {
    expect(haversineKm(59.89, 10.67, 59.89, 10.67)).toBe(0)
  })

  it('matches the known distance between Oslo and Bergen', () => {
    expect(haversineKm(59.9139, 10.7522, 60.3913, 5.3221)).toBeCloseTo(305, 0)
  })

  it('is symmetric', () => {
    const forward = haversineKm(59.89, 10.67, 63.43, 10.39)
    const backward = haversineKm(63.43, 10.39, 59.89, 10.67)
    expect(forward).toBeCloseTo(backward, 9)
  })
})
