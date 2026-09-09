import { describe, expect, it } from 'vitest'
import {
  TIME_STEP_COUNT,
  clampTimeIndex,
  createBaseTime,
  dayOffsetOf,
  formatDayLabel,
  formatHour,
  hourOf,
  initialTimeIndex,
  timeIndexFor,
  wmsTimeAt,
} from './timeSteps'

const base = createBaseTime(Date.UTC(2026, 8, 9, 14, 37, 22, 500))

describe('createBaseTime', () => {
  it('rounds up to the next whole UTC hour', () => {
    expect(new Date(base).toISOString()).toBe('2026-09-09T15:00:00.000Z')
  })

  it('rolls over into the next day', () => {
    const late = createBaseTime(Date.UTC(2026, 8, 9, 23, 40, 0))

    expect(new Date(late).toISOString()).toBe('2026-09-10T00:00:00.000Z')
  })
})

describe('wmsTimeAt', () => {
  it('formats the base hour the way the WMS expects', () => {
    expect(wmsTimeAt(base, 0)).toBe('2026-09-09T15:00:00Z')
  })

  it('advances one hour per index', () => {
    expect(wmsTimeAt(base, 1)).toBe('2026-09-09T16:00:00Z')
    expect(wmsTimeAt(base, 24)).toBe('2026-09-10T15:00:00Z')
  })

  it('covers ten days of steps', () => {
    expect(wmsTimeAt(base, TIME_STEP_COUNT - 1)).toBe('2026-09-19T14:00:00Z')
  })
})

describe('clampTimeIndex', () => {
  it('holds the index inside the ten day window', () => {
    expect(clampTimeIndex(-5)).toBe(0)
    expect(clampTimeIndex(0)).toBe(0)
    expect(clampTimeIndex(239)).toBe(239)
    expect(clampTimeIndex(400)).toBe(239)
  })
})

describe('initialTimeIndex', () => {
  it('starts at zero because the base hour is always ahead of now', () => {
    expect(initialTimeIndex(base, Date.UTC(2026, 8, 9, 14, 37, 22))).toBe(0)
  })

  it('follows the clock once it has passed the base hour', () => {
    expect(initialTimeIndex(base, Date.UTC(2026, 8, 9, 18, 5, 0))).toBe(3)
  })

  it('stops at the end of the window', () => {
    expect(initialTimeIndex(base, Date.UTC(2026, 9, 30, 0, 0, 0))).toBe(239)
  })
})

describe('day and hour helpers', () => {
  it('splits an index into day offset and hour', () => {
    expect(dayOffsetOf(0)).toBe(0)
    expect(hourOf(0)).toBe(0)
    expect(dayOffsetOf(26)).toBe(1)
    expect(hourOf(26)).toBe(2)
  })

  it('rebuilds an index from a day and an hour', () => {
    expect(timeIndexFor(1, 2)).toBe(26)
    expect(timeIndexFor(9, 23)).toBe(239)
    expect(timeIndexFor(12, 0)).toBe(239)
  })
})

describe('formatDayLabel', () => {
  it('names the first two days in words', () => {
    expect(formatDayLabel(base, 0)).toBe('I dag')
    expect(formatDayLabel(base, 24)).toBe('I morgen')
  })

  it('writes later days out in Norwegian', () => {
    expect(formatDayLabel(base, 48)).toBe('Fredag 11. september')
  })
})

describe('formatHour', () => {
  it('pads to two digits', () => {
    expect(formatHour(0)).toBe('00:00')
    expect(formatHour(9)).toBe('09:00')
    expect(formatHour(23)).toBe('23:00')
  })
})
