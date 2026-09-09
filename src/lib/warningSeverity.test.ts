import { describe, expect, it } from 'vitest'
import {
  mapSeverity,
  parseWarningSeverityLevel,
  resolveWarningSeverityForLocation,
  warningColor,
  warningDescriptionForLocation,
} from './warningSeverity'
import type { Warning } from '../types/warning'

const osloBox: Warning = {
  event: 'storm',
  severity: 'gul',
  area: 'Oslo',
  coordinates: [
    [
      [59.0, 10.0],
      [60.0, 10.0],
      [60.0, 11.0],
      [59.0, 11.0],
      [59.0, 10.0],
    ],
  ],
  description: 'Lett vind',
}

const osloRed: Warning = { ...osloBox, severity: 'rød', description: 'Kraftig storm' }

describe('mapSeverity', () => {
  it('returns red for rod', () => expect(mapSeverity('rød')).toBe('red'))
  it('returns red for orange because there is no orange pin', () =>
    expect(mapSeverity('oransje')).toBe('red'))
  it('returns yellow for gul', () => expect(mapSeverity('gul')).toBe('yellow'))
  it('returns blue for unknown severity', () => expect(mapSeverity('ukjent')).toBe('blue'))
})

describe('warningColor', () => {
  it('returns the red hex for rod severity', () => expect(warningColor('rød')).toBe('#D92D20'))
  it('returns the yellow hex for gul severity', () => expect(warningColor('gul')).toBe('#FACC15'))
  it('returns gray for unknown severity', () => expect(warningColor('ukjent')).toBe('#888888'))
})

describe('parseWarningSeverityLevel', () => {
  it('reads both English and Norwegian labels', () => {
    expect(parseWarningSeverityLevel('Red')).toBe('red')
    expect(parseWarningSeverityLevel('rod')).toBe('red')
    expect(parseWarningSeverityLevel('Orange')).toBe('orange')
    expect(parseWarningSeverityLevel('Yellow')).toBe('yellow')
    expect(parseWarningSeverityLevel('')).toBe('none')
  })
})

describe('resolveWarningSeverityForLocation', () => {
  it('returns green when there are no warnings', () => {
    expect(resolveWarningSeverityForLocation(59.89, 10.67, [])).toBe('green')
  })

  it('returns green when the point falls outside every polygon', () => {
    expect(resolveWarningSeverityForLocation(63.43, 10.39, [osloBox])).toBe('green')
  })

  it('returns the severity of a polygon containing the point', () => {
    expect(resolveWarningSeverityForLocation(59.5, 10.5, [osloBox])).toBe('gul')
  })

  it('keeps the worst severity when polygons overlap', () => {
    expect(resolveWarningSeverityForLocation(59.5, 10.5, [osloBox, osloRed])).toBe('rød')
    expect(resolveWarningSeverityForLocation(59.5, 10.5, [osloRed, osloBox])).toBe('rød')
  })
})

describe('warningDescriptionForLocation', () => {
  it('returns the description of the first matching warning', () => {
    expect(warningDescriptionForLocation(59.5, 10.5, [osloBox])).toBe('Lett vind')
  })

  it('returns null when nothing matches', () => {
    expect(warningDescriptionForLocation(63.43, 10.39, [osloBox])).toBeNull()
  })
})
