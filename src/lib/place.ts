import type { Location } from '../types/location'

const FRESHWATER_NAME = /(vann|vatn|vatnet|sjøen|dammen|tjern)/i

export type WaterLabel = 'Saltvann' | 'Ferskvann'

export function regionOf(latitude: number, longitude: number): string {
  if (latitude >= 65) return 'Nord-Norge'
  if (latitude >= 63) return 'Trøndelag'
  if (latitude < 58.6) return 'Sørlandet'
  if (longitude < 8) return 'Vestlandet'
  return 'Østlandet'
}

export function regionOfLocation(location: Location): string {
  return regionOf(location.latitude, location.longitude)
}

export function waterLabel(name: string, seaCovered?: boolean | null): WaterLabel {
  if (FRESHWATER_NAME.test(name)) return 'Ferskvann'
  if (seaCovered === false) return 'Ferskvann'
  return 'Saltvann'
}
