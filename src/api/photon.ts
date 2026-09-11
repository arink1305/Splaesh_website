import { toGeoPlaces } from '../lib/geoResults'
import type { GeoPlace, PhotonResponse } from '../types/geo'

const PHOTON_URL = 'https://photon.komoot.io/api/'
const NORWAY_BBOX = '4.0,57.8,31.6,71.4'

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = `${PHOTON_URL}?q=${encodeURIComponent(trimmed)}&limit=12&bbox=${NORWAY_BBOX}`

  try {
    const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!response.ok) return []
    return toGeoPlaces((await response.json()) as PhotonResponse)
  } catch {
    return []
  }
}
