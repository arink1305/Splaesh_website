const EARTH_RADIUS_KM = 6371.0

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const originLat = toRadians(lat1)
  const targetLat = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(dLon / 2) ** 2

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a))
}
