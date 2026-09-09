import type { Location } from '../types/location'
import badeplasser from './badeplasser.json'

export function getLocations(): Location[] {
  return badeplasser as Location[]
}

export function findLocationById(id: number): Location | undefined {
  return getLocations().find((location) => location.id === id)
}
