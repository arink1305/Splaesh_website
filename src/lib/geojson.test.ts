import { describe, expect, it } from 'vitest'
import { locationsToGeoJson, warningsToGeoJson } from './geojson'
import type { Location } from '../types/location'
import type { Warning } from '../types/warning'

const huk: Location = {
  id: 1,
  name: 'Huk Strand',
  longitude: 10.67666,
  latitude: 59.89536,
  image: '',
  source: 'Bymiljøetaten',
}

const trondheim: Location = { ...huk, id: 2, name: 'Korsvika', longitude: 10.43, latitude: 63.45 }

const osloWarning: Warning = {
  event: 'storm',
  severity: 'rød',
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
  description: 'Kraftig storm',
}

describe('locationsToGeoJson', () => {
  it('writes coordinates in longitude, latitude order', () => {
    const [feature] = locationsToGeoJson([huk], [], null).features

    expect(feature.geometry.coordinates).toEqual([10.67666, 59.89536])
  })

  it('picks the pin from the warning covering the place', () => {
    const features = locationsToGeoJson([huk, trondheim], [osloWarning], null).features

    expect(features[0].properties.pin).toBe('red')
    expect(features[1].properties.pin).toBe('blue')
  })

  it('marks only the selected place', () => {
    const features = locationsToGeoJson([huk, trondheim], [], 2).features

    expect(features[0].properties.selected).toBe(false)
    expect(features[1].properties.selected).toBe(true)
  })
})

describe('warningsToGeoJson', () => {
  it('flips the rings back to longitude, latitude order', () => {
    const [feature] = warningsToGeoJson([osloWarning]).features

    expect(feature.geometry.coordinates[0][0]).toEqual([10.0, 59.0])
    expect(feature.geometry.coordinates[0]).toHaveLength(5)
  })

  it('carries the severity colour on the feature', () => {
    const [feature] = warningsToGeoJson([osloWarning]).features

    expect(feature.properties.color).toBe('#D92D20')
    expect(feature.properties.area).toBe('Oslo')
  })

  it('emits one feature per ring', () => {
    const twoRings: Warning = {
      ...osloWarning,
      coordinates: [osloWarning.coordinates[0], osloWarning.coordinates[0]],
    }

    expect(warningsToGeoJson([twoRings]).features).toHaveLength(2)
  })

  it('returns an empty collection when there are no warnings', () => {
    expect(warningsToGeoJson([]).features).toEqual([])
  })
})
