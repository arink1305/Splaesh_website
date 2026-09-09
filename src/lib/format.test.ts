import { describe, expect, it } from 'vitest'
import { formatDistanceKm, formatReading } from './format'

describe('formatDistanceKm', () => {
  it('uses metres below one kilometre', () => {
    expect(formatDistanceKm(0.42)).toBe('420 m')
    expect(formatDistanceKm(0.999)).toBe('999 m')
  })

  it('uses one decimal between one and ten kilometres', () => {
    expect(formatDistanceKm(1)).toBe('1.0 km')
    expect(formatDistanceKm(4.27)).toBe('4.3 km')
  })

  it('drops the decimal from ten kilometres up', () => {
    expect(formatDistanceKm(10)).toBe('10 km')
    expect(formatDistanceKm(23.9)).toBe('23 km')
  })

  it('handles zero', () => {
    expect(formatDistanceKm(0)).toBe('0 m')
  })
})

describe('formatReading', () => {
  it('shows a dash for missing values', () => {
    expect(formatReading(null, '°C')).toBe('–')
    expect(formatReading(undefined, '°C')).toBe('–')
  })

  it('appends the unit', () => {
    expect(formatReading(17.14, '°C')).toBe('17.1 °C')
  })

  it('trims when there is no unit', () => {
    expect(formatReading(3.2, '')).toBe('3.2')
  })
})
