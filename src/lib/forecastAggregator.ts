import type { DailyForecast, TimeSeries } from '../types/forecast'

interface Entry {
  timeMs: number
  dateKey: string
  ts: TimeSeries
}

function dayKeyOf(timeMs: number): string {
  return new Date(timeMs).toISOString().slice(0, 10)
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-')
  return year && month && day ? `${day}.${month}.${year}` : dateKey
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

export function aggregate(timeSeries: TimeSeries[]): DailyForecast[] {
  const entries: Entry[] = []
  for (const ts of timeSeries) {
    const timeMs = Date.parse(ts.time)
    if (Number.isNaN(timeMs)) continue
    entries.push({ timeMs, dateKey: dayKeyOf(timeMs), ts })
  }

  const byDay = new Map<string, Entry[]>()
  for (const entry of entries) {
    const bucket = byDay.get(entry.dateKey)
    if (bucket) bucket.push(entry)
    else byDay.set(entry.dateKey, [entry])
  }

  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 10)
  const result: DailyForecast[] = []

  for (const [dateKey, dayEntries] of days) {
    const temps: number[] = []
    for (const entry of dayEntries) {
      const d6 = entry.ts.data.next_6_hours?.details
      const d12 = entry.ts.data.next_12_hours?.details
      const instant = entry.ts.data.instant.details.air_temperature
      for (const candidate of [
        d12?.air_temperature_max,
        d12?.air_temperature_min,
        d6?.air_temperature_max,
        d6?.air_temperature_min,
        instant,
      ]) {
        if (candidate !== undefined && candidate !== null) temps.push(candidate)
      }
    }
    if (temps.length === 0) continue

    const precipitation = dayEntries.reduce((sum, entry) => {
      const value =
        entry.ts.data.next_1_hours?.details?.precipitation_amount ??
        entry.ts.data.next_6_hours?.details?.precipitation_amount ??
        0
      return sum + value
    }, 0)

    const firstMs = Date.parse(dayEntries[0].ts.time)
    const reference = new Date(Number.isNaN(firstMs) ? 0 : firstMs)
    const noonMs = Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
      12,
      0,
      0,
      reference.getUTCMilliseconds(),
    )

    let middayEntry = dayEntries[0]
    let bestDelta = Math.abs(middayEntry.timeMs - noonMs)
    for (const entry of dayEntries) {
      const delta = Math.abs(entry.timeMs - noonMs)
      if (delta < bestDelta) {
        bestDelta = delta
        middayEntry = entry
      }
    }

    const symbolCode =
      middayEntry.ts.data.next_6_hours?.summary?.symbol_code ??
      middayEntry.ts.data.next_1_hours?.summary?.symbol_code ??
      dayEntries[0]?.ts.data.next_6_hours?.summary?.symbol_code ??
      null

    result.push({
      dateKey,
      date: formatDateLabel(dateKey),
      tempMin: roundToOneDecimal(Math.min(...temps)),
      tempMax: roundToOneDecimal(Math.max(...temps)),
      precipitation: roundToOneDecimal(precipitation),
      windSpeed: roundToOneDecimal(middayEntry.ts.data.instant.details.wind_speed ?? 0),
      windDirection: middayEntry.ts.data.instant.details.wind_from_direction ?? 0,
      symbolCode,
      uvMax: null,
    })
  }

  return result
}

const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
]

export function degreesToCompass(degrees: number): string {
  const index = Math.trunc((degrees + 11.25) / 22.5) % 16
  return COMPASS[index]
}
