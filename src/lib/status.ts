import { parseWarningSeverityLevel } from './warningSeverity'

export type StatusTone = 'safe' | 'warn' | 'danger'

export interface SafetyStatus {
  label: string
  tone: StatusTone
}

export function safetyStatus(severity: string): SafetyStatus {
  switch (parseWarningSeverityLevel(severity)) {
    case 'red':
      return { label: 'Frarådes', tone: 'danger' }
    case 'orange':
      return { label: 'Vær varsom', tone: 'danger' }
    case 'yellow':
      return { label: 'Vær obs', tone: 'warn' }
    default:
      return { label: 'Trygt', tone: 'safe' }
  }
}
