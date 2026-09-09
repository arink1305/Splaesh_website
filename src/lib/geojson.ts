import type { Location } from '../types/location'
import type { Warning } from '../types/warning'
import { mapSeverity, resolveWarningSeverityForLocation, warningColor } from './warningSeverity'

export interface GeoJsonFeature<G, P> {
  type: 'Feature'
  geometry: G
  properties: P
}

export interface GeoJsonCollection<G, P> {
  type: 'FeatureCollection'
  features: GeoJsonFeature<G, P>[]
}

export interface PointGeometry {
  type: 'Point'
  coordinates: [number, number]
}

export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: Array<Array<[number, number]>>
}

export interface PlaceProperties {
  id: number
  name: string
  pin: 'blue' | 'yellow' | 'red'
  selected: boolean
}

export interface WarningProperties {
  event: string
  area: string
  severity: string
  color: string
}

export function locationsToGeoJson(
  locations: Location[],
  warnings: Warning[],
  selectedId: number | null,
): GeoJsonCollection<PointGeometry, PlaceProperties> {
  return {
    type: 'FeatureCollection',
    features: locations.map((location) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
      properties: {
        id: location.id,
        name: location.name,
        pin: mapSeverity(
          resolveWarningSeverityForLocation(location.latitude, location.longitude, warnings),
        ),
        selected: location.id === selectedId,
      },
    })),
  }
}

export function warningsToGeoJson(
  warnings: Warning[],
): GeoJsonCollection<PolygonGeometry, WarningProperties> {
  return {
    type: 'FeatureCollection',
    features: warnings.flatMap((warning) =>
      warning.coordinates.map((ring) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [ring.map(([latitude, longitude]): [number, number] => [longitude, latitude])],
        },
        properties: {
          event: warning.event,
          area: warning.area,
          severity: warning.severity,
          color: warningColor(warning.severity),
        },
      })),
    ),
  }
}
