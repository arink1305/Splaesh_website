import type { Location } from '../types/location'

export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFD')
    .replace(/\p{Mn}+/gu, '')
}

export function searchLocations(
  locations: Location[],
  query: string,
  limit = 6,
): Location[] {
  const normalized = normalizeForSearch(query.trim())
  if (normalized.length === 0) return []

  return locations
    .filter((location) => normalizeForSearch(location.name).includes(normalized))
    .sort((a, b) => a.name.length - b.name.length)
    .slice(0, limit)
}
