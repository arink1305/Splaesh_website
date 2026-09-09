import { describe, expect, it } from 'vitest'
import { aggregate, degreesToCompass } from './forecastAggregator'
import type { TimeSeries } from '../types/forecast'

function entry(
  time: string,
  airTemperature: number,
  extras: Partial<TimeSeries['data']> = {},
  wind?: { speed: number; direction: number },
): TimeSeries {
  return {
    time,
    data: {
      instant: {
        details: {
          air_temperature: airTemperature,
          wind_speed: wind?.speed,
          wind_from_direction: wind?.direction,
        },
      },
      ...extras,
    },
  }
}

const oneDay: TimeSeries[] = [
  entry('2026-07-01T06:00:00Z', 14, {
    next_1_hours: { summary: { symbol_code: 'cloudy' }, details: { precipitation_amount: 0.2 } },
  }),
  entry(
    '2026-07-01T12:00:00Z',
    21,
    {
      next_1_hours: { summary: { symbol_code: 'fair_day' }, details: { precipitation_amount: 0 } },
      next_6_hours: {
        summary: { symbol_code: 'clearsky_day' },
        details: { air_temperature_max: 22, air_temperature_min: 18 },
      },
    },
    { speed: 5.24, direction: 180 },
  ),
  entry('2026-07-01T18:00:00Z', 17, {
    next_1_hours: { summary: { symbol_code: 'rain' }, details: { precipitation_amount: 1.3 } },
  }),
]

describe('aggregate', () => {
  it('collapses a day into one forecast', () => {
    const [day] = aggregate(oneDay)

    expect(day.dateKey).toBe('2026-07-01')
    expect(day.date).toBe('01.07.2026')
    expect(day.tempMin).toBe(14)
    expect(day.tempMax).toBe(22)
    expect(day.precipitation).toBe(1.5)
  })

  it('takes wind and symbol from the entry closest to noon', () => {
    const [day] = aggregate(oneDay)

    expect(day.windSpeed).toBe(5.2)
    expect(day.windDirection).toBe(180)
    expect(day.symbolCode).toBe('clearsky_day')
  })

  it('groups by UTC day and keeps chronological order', () => {
    const days = aggregate([...oneDay, entry('2026-07-02T12:00:00Z', 19)])

    expect(days.map((day) => day.dateKey)).toEqual(['2026-07-01', '2026-07-02'])
  })

  it('caps the result at ten days', () => {
    const many = Array.from({ length: 14 }, (_, index) =>
      entry(`2026-07-${String(index + 1).padStart(2, '0')}T12:00:00Z`, 18),
    )

    expect(aggregate(many)).toHaveLength(10)
  })

  it('skips days without any temperature and unparseable timestamps', () => {
    const days = aggregate([
      entry('not-a-date', 20),
      { time: '2026-07-03T12:00:00Z', data: { instant: { details: {} } } },
      entry('2026-07-04T12:00:00Z', 18),
    ])

    expect(days.map((day) => day.dateKey)).toEqual(['2026-07-04'])
  })

  it('returns an empty list for an empty series', () => {
    expect(aggregate([])).toEqual([])
  })
})

describe('degreesToCompass', () => {
  it('maps the cardinal directions', () => {
    expect(degreesToCompass(0)).toBe('N')
    expect(degreesToCompass(90)).toBe('E')
    expect(degreesToCompass(180)).toBe('S')
    expect(degreesToCompass(270)).toBe('W')
  })

  it('wraps around at 360 degrees', () => {
    expect(degreesToCompass(350)).toBe('N')
    expect(degreesToCompass(359.9)).toBe('N')
  })

  it('maps an intermediate bearing', () => {
    expect(degreesToCompass(22.5)).toBe('NNE')
  })
})
