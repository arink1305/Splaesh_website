export interface OceanInstantDetails {
  sea_water_temperature?: number
  sea_surface_wave_height?: number
  sea_water_speed?: number
  sea_water_to_direction?: number
  sea_surface_wave_from_direction?: number
}

export interface OceanForecastResponse {
  type: string
  geometry: { type: string; coordinates: number[] }
  properties: {
    meta: { updated_at: string; units: Record<string, string | undefined> }
    timeseries: Array<{
      time: string
      data: { instant: { details: OceanInstantDetails } }
    }>
  }
}

export interface SeaInfo {
  waterTemperature: number | null
  waveHeight: number | null
  currentSpeed: number | null
  currentDirection: number | null
  waveDirection: number | null
}
