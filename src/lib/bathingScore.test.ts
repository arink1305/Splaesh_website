import { describe, expect, it } from 'vitest'
import { calculateBathingScore, type BathingScoreInput } from './bathingScore'

const perfect: BathingScoreInput = {
  profile: 'standard',
  warningSeverity: 'green',
  waterTemperature: 23,
  waveHeight: 0.1,
  currentSpeed: 0.05,
  uvIndex: 4,
  airTemperature: 22,
}

describe('calculateBathingScore', () => {
  it('marks the score unavailable when every live factor is missing', () => {
    const result = calculateBathingScore({
      profile: 'standard',
      warningSeverity: 'green',
      waterTemperature: null,
      waveHeight: null,
      currentSpeed: null,
      uvIndex: null,
      airTemperature: null,
    })

    expect(result.isUnavailable).toBe(true)
    expect(result.score).toBe(0)
    expect(result.label).toBe('Ikke tilgjengelig')
  })

  it('gives 100 for ideal conditions without warnings', () => {
    const result = calculateBathingScore(perfect)

    expect(result.score).toBe(100)
    expect(result.label).toBe('Svært bra')
    expect(result.isUnavailable).toBe(false)
  })

  it('removes the full warning weight for a red warning', () => {
    const result = calculateBathingScore({ ...perfect, warningSeverity: 'Red' })

    expect(result.score).toBe(70)
    expect(result.label).toBe('Bra')
    expect(result.primaryReason).toContain('Rødt farevarsel')
  })

  it('recognises Norwegian severity labels', () => {
    expect(calculateBathingScore({ ...perfect, warningSeverity: 'rød' }).score).toBe(70)
    expect(calculateBathingScore({ ...perfect, warningSeverity: 'oransje' }).score).toBe(76)
    expect(calculateBathingScore({ ...perfect, warningSeverity: 'gul' }).score).toBe(84)
  })

  it('falls back to a neutral weight for missing factors', () => {
    const result = calculateBathingScore({
      profile: 'standard',
      warningSeverity: 'green',
      waterTemperature: null,
      waveHeight: null,
      currentSpeed: null,
      uvIndex: null,
      airTemperature: 22,
    })

    expect(result.score).toBe(78)
    expect(result.isUnavailable).toBe(false)
  })

  it('never reports a missing factor as a reason', () => {
    const result = calculateBathingScore({
      profile: 'standard',
      warningSeverity: 'green',
      waterTemperature: null,
      waveHeight: null,
      currentSpeed: null,
      uvIndex: null,
      airTemperature: 22,
    })

    expect(result.primaryReason).toContain('Ingen farevarsler')
    expect(result.secondaryReason).toContain('lufttemperatur')
  })

  it('weights waves harder for the barnevennlig profile', () => {
    const rough = { ...perfect, waveHeight: 1.8 }

    expect(calculateBathingScore({ ...rough, profile: 'standard' }).score).toBe(93)
    expect(calculateBathingScore({ ...rough, profile: 'barnevennlig' }).score).toBe(77)
  })

  it('weights UV harder for the sol profile', () => {
    const highUv = { ...perfect, uvIndex: 11 }

    expect(calculateBathingScore({ ...highUv, profile: 'standard' }).score).toBe(89)
    expect(calculateBathingScore({ ...highUv, profile: 'sol' }).score).toBe(83)
  })

  it('promotes the warning to the secondary reason when something else dominates', () => {
    const result = calculateBathingScore({
      ...perfect,
      profile: 'barnevennlig',
      warningSeverity: 'gul',
      waveHeight: 3.0,
    })

    expect(result.score).toBe(56)
    expect(result.primaryReason).toContain('Høye bølger')
    expect(result.secondaryReason).toContain('Gult farevarsel')
  })

  it('keeps the score inside 0 and 100', () => {
    const worst = calculateBathingScore({
      profile: 'standard',
      warningSeverity: 'rød',
      waterTemperature: 2,
      waveHeight: 4,
      currentSpeed: 2,
      uvIndex: 11,
      airTemperature: -5,
    })

    expect(worst.score).toBeGreaterThanOrEqual(0)
    expect(worst.score).toBeLessThanOrEqual(100)
    expect(worst.label).toBe('Frarådes')
  })

  it('reproduces the gap in the air temperature bands from the Kotlin original', () => {
    const base: BathingScoreInput = {
      profile: 'standard',
      warningSeverity: 'green',
      waterTemperature: null,
      waveHeight: null,
      currentSpeed: null,
      uvIndex: null,
      airTemperature: 19.0,
    }

    expect(calculateBathingScore(base).score).toBe(74)
    expect(calculateBathingScore({ ...base, airTemperature: 19.95 }).score).toBe(75)
  })
})
