import type { GeoPlace, PhotonFeature, PhotonResponse } from '../types/geo'

const USEFUL_KEYS = new Set(['place', 'natural', 'waterway'])

const KIND_LABELS: Record<string, string> = {
  city: 'By',
  town: 'Tettsted',
  village: 'Bygd',
  hamlet: 'Grend',
  municipality: 'Kommune',
  locality: 'Sted',
  island: 'Øy',
  islet: 'Holme',
  farm: 'Gård',
  suburb: 'Bydel',
  water: 'Innsjø',
  bay: 'Bukt',
  beach: 'Strand',
  peak: 'Fjell',
  fjord: 'Fjord',
  river: 'Elv',
  stream: 'Bekk',
}

export function kindLabel(osmValue?: string): string {
  if (!osmValue) return 'Sted'
  return KIND_LABELS[osmValue] ?? 'Sted'
}

export function regionLabelFor(feature: PhotonFeature): string {
  const p = feature.properties ?? {}
  return p.county ?? p.state ?? p.city ?? p.district ?? 'Norge'
}

function toGeoPlace(feature: PhotonFeature): GeoPlace | null {
  const name = feature.properties?.name
  const coordinates = feature.geometry?.coordinates
  if (!name || !coordinates || coordinates.length < 2) return null

  const [longitude, latitude] = coordinates
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null

  return {
    name,
    region: regionLabelFor(feature),
    kind: kindLabel(feature.properties?.osm_value),
    latitude,
    longitude,
  }
}

function dedupe(places: GeoPlace[]): GeoPlace[] {
  const seen = new Set<string>()
  return places.filter((place) => {
    const key = `${place.name}|${place.region}|${place.latitude.toFixed(3)}|${place.longitude.toFixed(3)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function toGeoPlaces(response: PhotonResponse, limit = 5): GeoPlace[] {
  const norwegian = (response.features ?? []).filter(
    (feature) => feature.properties?.countrycode === 'NO',
  )

  const preferred = norwegian.filter((feature) => USEFUL_KEYS.has(feature.properties?.osm_key ?? ''))
  const source = preferred.length > 0 ? preferred : norwegian

  return dedupe(source.map(toGeoPlace).filter((place): place is GeoPlace => place !== null)).slice(
    0,
    limit,
  )
}
