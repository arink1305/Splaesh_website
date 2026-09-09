import type { Ring } from '../types/warning'

export function farevarselPolygon(latitude: number, longitude: number, polygon: Ring): boolean {
  let inside = false
  let j = polygon.length - 1

  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i][1]
    const yi = polygon[i][0]
    const xj = polygon[j][1]
    const yj = polygon[j][0]

    const intersect =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
    j = i
  }

  return inside
}
