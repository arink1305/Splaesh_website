import type { UvResponse } from '../types/uv'
import { getJson } from './client'

const UV_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export async function fetchCurrentUv(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
  nowMillis: number = Date.now(),
): Promise<number | null> {
  try {
    const url = `${UV_BASE_URL}?latitude=${latitude}&longitude=${longitude}&hourly=uv_index&timezone=auto`
    const response = await getJson<UvResponse>(url, signal)
    const hourly = response.hourly
    if (!hourly) return null

    const offsetMs = (response.utc_offset_seconds ?? 0) * 1000
    let closestValue: number | null = null
    let bestDelta = Number.POSITIVE_INFINITY

    hourly.time.forEach((time, index) => {
      const parsed = Date.parse(`${time}:00Z`)
      if (Number.isNaN(parsed)) return
      const delta = Math.abs(parsed - offsetMs - nowMillis)
      if (delta < bestDelta) {
        bestDelta = delta
        closestValue = hourly.uv_index[index] ?? null
      }
    })

    return closestValue
  } catch {
    return null
  }
}

export async function fetchDailyUv(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Record<string, number>> {
  try {
    const url = `${UV_BASE_URL}?latitude=${latitude}&longitude=${longitude}&daily=uv_index_max&forecast_days=10&timezone=auto`
    const response = await getJson<UvResponse>(url, signal)
    const daily = response.daily
    if (!daily) return {}

    const result: Record<string, number> = {}
    daily.time.forEach((day, index) => {
      const value = daily.uv_index_max[index]
      if (value !== undefined && value !== null) result[day] = value
    })
    return result
  } catch {
    return {}
  }
}
