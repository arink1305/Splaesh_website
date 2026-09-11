import { describe, expect, it } from 'vitest'
import { kindLabel, regionLabelFor, toGeoPlaces } from './geoResults'
import type { PhotonResponse } from '../types/geo'

function feature(
  name: string,
  countrycode: string,
  osm_key: string,
  osm_value: string,
  lon: number,
  lat: number,
  county?: string,
) {
  return {
    geometry: { coordinates: [lon, lat] },
    properties: { name, countrycode, osm_key, osm_value, county },
  }
}

const skrova: PhotonResponse = {
  features: [
    feature('Skrova', 'NO', 'place', 'locality', 7.679, 59.573, 'Telemark'),
    feature('Skrova', 'NO', 'place', 'island', 14.681, 68.162, 'Nordland'),
    feature('Skrova', 'NO', 'waterway', 'stream', 6.793, 61.685, 'Vestland'),
    feature('Skrova samfunnshus', 'NO', 'amenity', 'community_centre', 14.661, 68.169, 'Nordland'),
    feature('Skrövån', 'SE', 'waterway', 'river', 21.657, 66.863),
  ],
}

describe('toGeoPlaces', () => {
  it('keeps only Norwegian results', () => {
    const names = toGeoPlaces(skrova).map((p) => p.name)

    expect(names).not.toContain('Skrövån')
  })

  it('drops noise like community centres when real places exist', () => {
    const names = toGeoPlaces(skrova).map((p) => p.name)

    expect(names).not.toContain('Skrova samfunnshus')
    expect(names).toContain('Skrova')
  })

  it('reads coordinates as longitude, latitude', () => {
    const island = toGeoPlaces(skrova).find((p) => p.region === 'Nordland')

    expect(island?.latitude).toBeCloseTo(68.162, 3)
    expect(island?.longitude).toBeCloseTo(14.681, 3)
  })

  it('labels the county as the region', () => {
    const regions = toGeoPlaces(skrova).map((p) => p.region)

    expect(regions).toContain('Nordland')
    expect(regions).toContain('Telemark')
  })

  it('falls back to noisier results when nothing better is Norwegian', () => {
    const onlyNoise: PhotonResponse = {
      features: [feature('Lofoten Krigsminnemuseum', 'NO', 'tourism', 'museum', 14.565, 68.231, 'Nordland')],
    }

    expect(toGeoPlaces(onlyNoise).map((p) => p.name)).toEqual(['Lofoten Krigsminnemuseum'])
  })

  it('removes duplicates at the same spot', () => {
    const twice: PhotonResponse = {
      features: [
        feature('Geiranger', 'NO', 'place', 'village', 7.206, 62.101, 'Møre og Romsdal'),
        feature('Geiranger', 'NO', 'place', 'village', 7.206, 62.101, 'Møre og Romsdal'),
      ],
    }

    expect(toGeoPlaces(twice)).toHaveLength(1)
  })

  it('caps the number of suggestions', () => {
    expect(toGeoPlaces(skrova, 2)).toHaveLength(2)
  })

  it('survives a response with nothing in it', () => {
    expect(toGeoPlaces({})).toEqual([])
    expect(toGeoPlaces({ features: [] })).toEqual([])
  })

  it('skips features without a name or coordinates', () => {
    const broken: PhotonResponse = {
      features: [
        { properties: { countrycode: 'NO', osm_key: 'place' } },
        { geometry: { coordinates: [10] }, properties: { name: 'Halv', countrycode: 'NO', osm_key: 'place' } },
      ],
    }

    expect(toGeoPlaces(broken)).toEqual([])
  })
})

describe('kindLabel', () => {
  it('translates the common place types', () => {
    expect(kindLabel('island')).toBe('Øy')
    expect(kindLabel('water')).toBe('Innsjø')
    expect(kindLabel('city')).toBe('By')
  })

  it('falls back for anything unknown', () => {
    expect(kindLabel('gasworks')).toBe('Sted')
    expect(kindLabel(undefined)).toBe('Sted')
  })
})

describe('regionLabelFor', () => {
  it('prefers the county', () => {
    expect(regionLabelFor({ properties: { county: 'Nordland', state: 'X' } })).toBe('Nordland')
  })

  it('falls through to whatever context exists', () => {
    expect(regionLabelFor({ properties: { city: 'Oslo' } })).toBe('Oslo')
    expect(regionLabelFor({ properties: {} })).toBe('Norge')
    expect(regionLabelFor({})).toBe('Norge')
  })
})
