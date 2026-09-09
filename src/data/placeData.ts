import { fetchForecast, fetchOceanForecast } from '../api/met'
import { fetchCurrentUv, fetchDailyUv } from '../api/uv'
import { aggregate } from '../lib/forecastAggregator'
import type { DailyForecast } from '../types/forecast'
import type { SeaInfo } from '../types/ocean'

export interface PlaceData {
  forecasts: DailyForecast[]
  seaInfo: SeaInfo | null
  currentUv: number | null
  airTemperature: number | null
}

const cache = new Map<string, Promise<PlaceData>>()

export function getPlaceData(latitude: number, longitude: number): Promise<PlaceData> {
  const key = `${latitude},${longitude}`
  const cached = cache.get(key)
  if (cached) return cached

  const pending = fetchPlaceData(latitude, longitude).catch((error) => {
    cache.delete(key)
    throw error
  })
  cache.set(key, pending)
  return pending
}

async function fetchPlaceData(latitude: number, longitude: number): Promise<PlaceData> {
  const [forecastResponse, oceanResponse, dailyUv, currentUv] = await Promise.all([
    fetchForecast(latitude, longitude),
    fetchOceanForecast(latitude, longitude).catch(() => null),
    fetchDailyUv(latitude, longitude),
    fetchCurrentUv(latitude, longitude),
  ])

  const forecasts = aggregate(forecastResponse.properties.timeseries).map((forecast) => ({
    ...forecast,
    uvMax: dailyUv[forecast.dateKey] ?? null,
  }))

  const details = oceanResponse?.properties.timeseries[0]?.data.instant.details ?? null
  const seaInfo: SeaInfo | null = details
    ? {
        waterTemperature: details.sea_water_temperature ?? null,
        waveHeight: details.sea_surface_wave_height ?? null,
        currentSpeed: details.sea_water_speed ?? null,
        currentDirection: details.sea_water_to_direction ?? null,
        waveDirection: details.sea_surface_wave_from_direction ?? null,
      }
    : null

  return {
    forecasts,
    seaInfo,
    currentUv,
    airTemperature:
      forecastResponse.properties.timeseries[0]?.data.instant.details.air_temperature ?? null,
  }
}
