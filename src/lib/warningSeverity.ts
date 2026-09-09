import type { Warning } from '../types/warning'
import { farevarselPolygon } from './polygon'

export type WarningSeverityLevel = 'none' | 'yellow' | 'orange' | 'red'

const RANK: Record<WarningSeverityLevel, number> = { none: 0, yellow: 1, orange: 2, red: 3 }

export function parseWarningSeverityLevel(severity: string): WarningSeverityLevel {
  const lower = severity.toLowerCase()
  if (lower.includes('red') || lower.includes('rød') || lower.includes('rod')) return 'red'
  if (lower.includes('orange') || lower.includes('oransje')) return 'orange'
  if (lower.includes('yellow') || lower.includes('gul')) return 'yellow'
  return 'none'
}

export function resolveWarningSeverityForLocation(
  latitude: number,
  longitude: number,
  warnings: Warning[],
): string {
  if (warnings.length === 0) return 'green'

  let worst = 'green'
  for (const warning of warnings) {
    for (const ring of warning.coordinates) {
      if (farevarselPolygon(latitude, longitude, ring)) {
        if (RANK[parseWarningSeverityLevel(warning.severity)] > RANK[parseWarningSeverityLevel(worst)]) {
          worst = warning.severity
        }
      }
    }
  }
  return worst
}

export function warningColor(severity: string): string {
  switch (parseWarningSeverityLevel(severity)) {
    case 'red':
      return '#D92D20'
    case 'orange':
      return '#F79009'
    case 'yellow':
      return '#FACC15'
    default:
      return '#888888'
  }
}

export function mapSeverity(severity: string): 'red' | 'yellow' | 'blue' {
  switch (parseWarningSeverityLevel(severity)) {
    case 'red':
    case 'orange':
      return 'red'
    case 'yellow':
      return 'yellow'
    default:
      return 'blue'
  }
}

export function warningDescriptionForLocation(
  latitude: number,
  longitude: number,
  warnings: Warning[],
): string | null {
  const match = warnings.find((warning) =>
    warning.coordinates.some((ring) => farevarselPolygon(latitude, longitude, ring)),
  )
  return match?.description ?? null
}
