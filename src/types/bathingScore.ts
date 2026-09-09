export interface BathingScore {
  score: number
  label: string
  summary: string
  primaryReason: string
  secondaryReason: string | null
  isUnavailable: boolean
}

export type BathingScoreProfile = 'standard' | 'sol' | 'barnevennlig'

export const BATHING_SCORE_PROFILES: Record<
  BathingScoreProfile,
  { title: string; shortDescription: string }
> = {
  standard: {
    title: 'Standard',
    shortDescription: 'Legger større vekt på lufttemperatur, vann og UV.',
  },
  sol: {
    title: 'Sol',
    shortDescription: 'Legger størst vekt på solforhold og varme.',
  },
  barnevennlig: {
    title: 'Barnevennlig',
    shortDescription: 'Legger større vekt på bølger og strøm.',
  },
}

export function profileFromStorageKey(value: string | null | undefined): BathingScoreProfile {
  return value === 'sol' || value === 'barnevennlig' ? value : 'standard'
}
