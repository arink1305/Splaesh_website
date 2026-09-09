export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.trunc(distanceKm * 1000)} m`
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`
  return `${Math.trunc(distanceKm)} km`
}

export function formatReading(
  value: number | null | undefined,
  unit: string,
  digits = 1,
): string {
  if (value === null || value === undefined) return '–'
  return `${value.toFixed(digits)} ${unit}`.trim()
}
