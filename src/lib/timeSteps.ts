export const TIME_STEP_COUNT = 240

export function createBaseTime(now: number = Date.now()): number {
  const date = new Date(now)
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours() + 1,
    0,
    0,
    0,
  )
}

export function clampTimeIndex(index: number): number {
  return Math.min(TIME_STEP_COUNT - 1, Math.max(0, index))
}

export function timeStepAt(baseTime: number, index: number): number {
  return baseTime + clampTimeIndex(index) * 3600000
}

export function wmsTimeAt(baseTime: number, index: number): string {
  return `${new Date(timeStepAt(baseTime, index)).toISOString().slice(0, 13)}:00:00Z`
}

export function initialTimeIndex(baseTime: number, now: number = Date.now()): number {
  return clampTimeIndex(Math.trunc((now - baseTime) / 3600000))
}

export function dayOffsetOf(index: number): number {
  return Math.trunc(clampTimeIndex(index) / 24)
}

export function hourOf(index: number): number {
  return clampTimeIndex(index) % 24
}

export function timeIndexFor(dayOffset: number, hour: number): number {
  return clampTimeIndex(dayOffset * 24 + hour)
}

export function formatDayLabel(baseTime: number, index: number): string {
  const dayOffset = dayOffsetOf(index)
  if (dayOffset === 0) return 'I dag'
  if (dayOffset === 1) return 'I morgen'

  const formatted = new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(timeStepAt(baseTime, index)))

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}
