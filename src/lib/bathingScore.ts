import type { BathingScore, BathingScoreProfile } from '../types/bathingScore'

const MISSING_DATA_NEUTRAL = 0.55

interface ScoreFactor {
  name: string
  weight: number
  normalized: number
  message: string | null
  contribution: number
  influence: number
}

interface BathingScoreWeights {
  warning: number
  wave: number
  current: number
  water: number
  air: number
  uv: number
}

export interface BathingScoreInput {
  profile: BathingScoreProfile
  warningSeverity: string
  waterTemperature: number | null
  waveHeight: number | null
  currentSpeed: number | null
  uvIndex: number | null
  airTemperature: number | null
}

function factor(
  name: string,
  weight: number,
  normalized: number,
  message: string | null,
): ScoreFactor {
  return {
    name,
    weight,
    normalized,
    message,
    contribution: weight * normalized,
    influence: weight * Math.abs(normalized - 0.5),
  }
}

function neutralFactor(name: string, weight: number): ScoreFactor {
  return factor(name, weight, MISSING_DATA_NEUTRAL, null)
}

function weightsForProfile(profile: BathingScoreProfile): BathingScoreWeights {
  switch (profile) {
    case 'sol':
      return { warning: 25, wave: 4, current: 4, water: 17, air: 25, uv: 25 }
    case 'barnevennlig':
      return { warning: 32, wave: 26, current: 22, water: 12, air: 4, uv: 4 }
    default:
      return { warning: 30, wave: 8, current: 6, water: 18, air: 22, uv: 16 }
  }
}

function has(severity: string, ...needles: string[]): boolean {
  const lower = severity.toLowerCase()
  return needles.some((needle) => lower.includes(needle))
}

function warningFactor(severity: string, weight: number): ScoreFactor {
  const isRed = has(severity, 'red', 'rød', 'rod')
  const isOrange = has(severity, 'orange', 'oransje')
  const isYellow = has(severity, 'yellow', 'gul')

  const normalized = isRed ? 0.0 : isOrange ? 0.2 : isYellow ? 0.45 : 1.0

  const message = isRed
    ? 'Rødt farevarsel gjør at badeforholdene vurderes som lite trygge.'
    : isOrange
      ? 'Oransje farevarsel trekker vurderingen tydelig ned.'
      : isYellow
        ? 'Gult farevarsel gjør at badeplassen bør vurderes mer forsiktig.'
        : 'Ingen farevarsler ved badeplassen trekker totalvurderingen opp.'

  return factor('warning', weight, normalized, message)
}

function waveHeightFactor(value: number | null, weight: number): ScoreFactor {
  if (value === null) return neutralFactor('wave', weight)

  const normalized =
    value <= 0.2 ? 1.0
    : value <= 0.5 ? 0.85
    : value <= 1.0 ? 0.55
    : value <= 1.5 ? 0.25
    : value <= 2.0 ? 0.1
    : 0.0

  const message =
    value <= 0.2 ? 'Svært rolige bølger gir gode og trygge badeforhold.'
    : value <= 0.5 ? 'Rolige bølger gjør badingen tryggere og mer behagelig.'
    : value <= 1.0 ? 'Merkbare bølger trekker badeforholdene noe ned.'
    : value <= 1.5 ? 'Ganske høye bølger gjør badeplassen mindre egnet.'
    : 'Høye bølger trekker badeforholdene tydelig ned.'

  return factor('wave', weight, normalized, message)
}

function currentSpeedFactor(value: number | null, weight: number): ScoreFactor {
  if (value === null) return neutralFactor('current', weight)

  const normalized =
    value <= 0.1 ? 1.0
    : value <= 0.3 ? 0.85
    : value <= 0.5 ? 0.6
    : value <= 0.8 ? 0.3
    : value <= 1.1 ? 0.1
    : 0.0

  const message =
    value <= 0.1 ? 'Svært svak strøm gir rolige og trygge forhold i vannet.'
    : value <= 0.3 ? 'Lite strøm gir roligere og tryggere badeforhold.'
    : value <= 0.5 ? 'Merkbar strøm trekker forholdene noe ned.'
    : value <= 0.8 ? 'Strøm i vannet gjør badeforholdene mer krevende.'
    : 'Sterk strøm trekker badeforholdene kraftig ned.'

  return factor('current', weight, normalized, message)
}

function waterTemperatureFactor(value: number | null, weight: number): ScoreFactor {
  if (value === null) return neutralFactor('water', weight)

  const normalized =
    value >= 22 ? 1.0
    : value >= 18 ? 0.9
    : value >= 15 ? 0.75
    : value >= 12 ? 0.55
    : value >= 8 ? 0.3
    : 0.1

  const message =
    value >= 22 ? 'Svært god vanntemperatur gjør badeplassen ekstra innbydende.'
    : value >= 18 ? 'God vanntemperatur trekker badeforholdene opp.'
    : value >= 15 ? 'Vanntemperaturen er brukbar for mange badegjester.'
    : value >= 12 ? 'Vanntemperaturen er grei, men ikke optimal.'
    : 'Kaldt vann trekker badeopplevelsen tydelig ned.'

  return factor('water', weight, normalized, message)
}

function airTemperatureFactor(value: number | null, weight: number): ScoreFactor {
  if (value === null) return neutralFactor('air', weight)

  const normalized =
    value >= 20.0 && value <= 26.0 ? 1.0
    : value >= 16.0 && value <= 19.9 ? 0.8
    : value >= 12.0 && value <= 15.9 ? 0.6
    : value >= 8.0 && value <= 11.9 ? 0.35
    : value < 8.0 ? 0.1
    : value <= 30.0 ? 0.85
    : 0.65

  const message =
    value >= 20.0 && value <= 26.0 ? 'Behagelig lufttemperatur gjør badeturen mer fristende.'
    : value >= 16.0 && value <= 19.9 ? 'Lufttemperaturen er ganske god for et bad.'
    : value >= 12.0 && value <= 15.9 ? 'Lufttemperaturen er brukbar, men ikke helt ideell.'
    : value < 12.0 ? 'Kjølig luft trekker totalopplevelsen noe ned.'
    : value > 30.0 ? 'Svært varm luft trekker litt ned på komforten rundt badingen.'
    : 'Lufttemperaturen er brukbar for bading.'

  return factor('air', weight, normalized, message)
}

function uvFactor(value: number | null, weight: number): ScoreFactor {
  if (value === null) return neutralFactor('uv', weight)

  const normalized =
    value < 1.0 ? 0.8
    : value < 3.0 ? 0.95
    : value < 6.0 ? 1.0
    : value < 8.0 ? 0.75
    : value < 10.0 ? 0.5
    : 0.3

  const rounded = Math.round(value)
  const message =
    value < 1.0 ? 'Svært lav UV gir rolige solforhold ved badeplassen.'
    : value < 3.0 ? 'Lav UV gjør oppholdet ved vannet mer behagelig.'
    : value < 6.0 ? 'UV-nivået er håndterbart for en badetur.'
    : value < 8.0 ? `UV på ${rounded} krever litt ekstra solbeskyttelse.`
    : `Høy UV på ${rounded} trekker komforten ned og krever mer forsiktighet.`

  return factor('uv', weight, normalized, message)
}

export function calculateBathingScore(input: BathingScoreInput): BathingScore {
  const liveFactors = [
    input.waterTemperature,
    input.waveHeight,
    input.currentSpeed,
    input.uvIndex,
    input.airTemperature,
  ]

  if (liveFactors.every((value) => value === null)) {
    return {
      score: 0,
      label: 'Ikke tilgjengelig',
      summary: 'Badescoren kan ikke beregnes uten oppdaterte data.',
      primaryReason: 'Appen får ikke hentet vær-, sjø- eller UV-data akkurat nå.',
      secondaryReason: 'Sjekk nettforbindelsen og prøv igjen senere.',
      isUnavailable: true,
    }
  }

  const weights = weightsForProfile(input.profile)
  const factors = [
    warningFactor(input.warningSeverity, weights.warning),
    waveHeightFactor(input.waveHeight, weights.wave),
    currentSpeedFactor(input.currentSpeed, weights.current),
    waterTemperatureFactor(input.waterTemperature, weights.water),
    airTemperatureFactor(input.airTemperature, weights.air),
    uvFactor(input.uvIndex, weights.uv),
  ]

  const total = factors.reduce((sum, item) => sum + item.contribution, 0)
  const score = Math.min(100, Math.max(0, Math.round(total)))

  const label =
    score >= 85 ? 'Svært bra'
    : score >= 70 ? 'Bra'
    : score >= 55 ? 'Greit'
    : score >= 40 ? 'Dårlig'
    : 'Frarådes'

  const summary =
    score >= 85 ? 'Trygge og komfortable forhold for bading.'
    : score >= 70 ? 'Forholdene ser gode ut for en badetur.'
    : score >= 55 ? 'Forholdene er brukbare, men ikke perfekte.'
    : score >= 40 ? 'Det går an å bade, men forholdene trekker ned.'
    : 'Forholdene tilsier at bading bør vurderes nøye.'

  const rankedReasons = factors
    .filter((item) => item.message !== null)
    .sort((a, b) => b.influence - a.influence)

  const warningReason =
    factors.find((item) => item.name === 'warning' && item.message !== null && item.normalized < 1.0)
      ?.message ?? null

  const primaryReason = rankedReasons[0]?.message ?? 'Lite datagrunnlag ennå.'
  const secondaryReason =
    warningReason !== null && warningReason !== primaryReason
      ? warningReason
      : (rankedReasons[1]?.message ?? null)

  return { score, label, summary, primaryReason, secondaryReason, isUnavailable: false }
}
