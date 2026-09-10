import type { ForecastResponse } from '../types/forecast'
import type { OceanForecastResponse } from '../types/ocean'
import type { MetAlertFeature, MetAlertsResponse, Ring, Warning } from '../types/warning'
import { getMetJson } from './client'

export function fetchForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<ForecastResponse> {
  return getMetJson<ForecastResponse>(
    `/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}&altitude=0`,
    signal,
  )
}

export function fetchOceanForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<OceanForecastResponse> {
  return getMetJson<OceanForecastResponse>(
    `/weatherapi/oceanforecast/2.0/complete?lat=${latitude}&lon=${longitude}`,
    signal,
  )
}

export async function fetchWarnings(signal?: AbortSignal): Promise<Warning[]> {
  try {
    const response = await getMetJson<MetAlertsResponse>(
      '/weatherapi/metalerts/2.0/current.json',
      signal,
    )
    return (response.features ?? []).map(toWarning).filter((item): item is Warning => item !== null)
  } catch {
    return []
  }
}

function toWarning(feature: MetAlertFeature): Warning | null {
  const properties = feature.properties
  if (!properties) return null

  const coordinates = parseGeometry(feature)
  if (!coordinates) return null

  return {
    event: properties.event ?? 'ukjent',
    severity: properties.awareness_level ?? 'ukjent',
    area: properties.area ?? 'ukjent',
    coordinates,
    description: properties.description ?? '',
  }
}

function parseGeometry(feature: MetAlertFeature): Ring[] | null {
  const geometry = feature.geometry
  if (!geometry?.coordinates) return null

  const rings =
    geometry.type === 'Polygon'
      ? parsePolygon(geometry.coordinates)
      : geometry.type === 'MultiPolygon'
        ? parseMultiPolygon(geometry.coordinates)
        : null

  return rings && rings.length > 0 ? rings : null
}

function parsePolygon(coordinates: unknown): Ring[] {
  if (!Array.isArray(coordinates)) return []
  return coordinates.map(parseRing).filter((ring): ring is Ring => ring !== null)
}

function parseMultiPolygon(coordinates: unknown): Ring[] {
  if (!Array.isArray(coordinates)) return []
  return coordinates.flatMap((polygon) =>
    Array.isArray(polygon)
      ? polygon.map(parseRing).filter((ring): ring is Ring => ring !== null)
      : [],
  )
}

function parseRing(ring: unknown): Ring | null {
  if (!Array.isArray(ring)) return null
  const points = ring.map(parsePoint).filter((point): point is [number, number] => point !== null)
  return points.length > 0 ? points : null
}

function parsePoint(point: unknown): [number, number] | null {
  if (!Array.isArray(point) || point.length < 2) return null
  const longitude = Number(point[0])
  const latitude = Number(point[1])
  if (Number.isNaN(longitude) || Number.isNaN(latitude)) return null
  return [latitude, longitude]
}
