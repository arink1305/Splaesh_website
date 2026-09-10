import { describe, expect, it } from 'vitest'
import { regionOf, waterLabel } from './place'
import { getLocations } from '../data/locations'

describe('regionOf', () => {
  it('places the far north correctly', () => {
    expect(regionOf(70.91, 24.61)).toBe('Nord-Norge')
    expect(regionOf(67.22, 14.45)).toBe('Nord-Norge')
  })

  it('separates Trøndelag from Møre', () => {
    expect(regionOf(63.45, 10.43)).toBe('Trøndelag')
    expect(regionOf(62.73, 7.09)).toBe('Vestlandet')
  })

  it('puts Agder in Sørlandet even west of the eighth meridian', () => {
    expect(regionOf(58.29, 6.66)).toBe('Sørlandet')
    expect(regionOf(58.15, 8.01)).toBe('Sørlandet')
  })

  it('keeps Jæren in Vestlandet', () => {
    expect(regionOf(58.73, 5.51)).toBe('Vestlandet')
    expect(regionOf(60.4, 5.3)).toBe('Vestlandet')
  })

  it('puts the Oslo fjord and Vestfold in Østlandet', () => {
    expect(regionOf(59.9, 10.68)).toBe('Østlandet')
    expect(regionOf(58.97, 9.82)).toBe('Østlandet')
  })

  it('classifies every bathing place into a known region', () => {
    const known = ['Nord-Norge', 'Trøndelag', 'Vestlandet', 'Sørlandet', 'Østlandet']

    for (const location of getLocations()) {
      expect(known).toContain(regionOf(location.latitude, location.longitude))
    }
  })
})

describe('waterLabel', () => {
  it('lets a lake name win over the sea model', () => {
    expect(waterLabel('Sognsvann', true)).toBe('Ferskvann')
    expect(waterLabel('Nøklevann', true)).toBe('Ferskvann')
  })

  it('uses MET only where the name says nothing', () => {
    expect(waterLabel('Hamar Koigen', false)).toBe('Ferskvann')
    expect(waterLabel('Hamar Koigen', true)).toBe('Saltvann')
    expect(waterLabel('Huk Strand', true)).toBe('Saltvann')
  })

  it('falls back to the name before the data arrives', () => {
    expect(waterLabel('Sognsvann')).toBe('Ferskvann')
    expect(waterLabel('Nøklevann')).toBe('Ferskvann')
    expect(waterLabel('Gangvatnet berg badeplass')).toBe('Ferskvann')
    expect(waterLabel('Hestsjøen badeplass')).toBe('Ferskvann')
    expect(waterLabel('Brekkedammen ved Frysja')).toBe('Ferskvann')
    expect(waterLabel('Huk Strand')).toBe('Saltvann')
  })

  it('does not mistake a sjøbad for a lake', () => {
    expect(waterLabel('Sørenga Sjøbad')).toBe('Saltvann')
    expect(waterLabel('Nordnes Sjøbad')).toBe('Saltvann')
    expect(waterLabel('Tjuvholmen Sjøbad')).toBe('Saltvann')
  })

  it('treats an unknown coverage as no answer and uses the name', () => {
    expect(waterLabel('Sognsvann', null)).toBe('Ferskvann')
    expect(waterLabel('Huk Strand', null)).toBe('Saltvann')
  })
})
