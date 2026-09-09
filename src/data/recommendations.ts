import { calculateBathingScore } from '../lib/bathingScore'
import { haversineKm } from '../lib/haversine'
import {
  resolveWarningSeverityForLocation,
  warningDescriptionForLocation,
} from '../lib/warningSeverity'
import type { BathingScore, BathingScoreProfile } from '../types/bathingScore'
import type { Location } from '../types/location'
import type { SeaInfo } from '../types/ocean'
import type { Warning } from '../types/warning'
import { getLocations } from './locations'
import { getPlaceData } from './placeData'

export interface RecommendationPlace {
  location: Location
  distanceKm: number
  score: BathingScore
  warningSeverity: string
  seaInfo: SeaInfo | null
  uvValue: number | null
  airTemperature: number | null
  warningDescription: string | null
}

const CONCURRENCY = 6

export async function getRecommendations(
  userLatitude: number,
  userLongitude: number,
  radiusKm: number,
  warnings: Warning[],
  profile: BathingScoreProfile,
): Promise<RecommendationPlace[]> {
  const withinRadius = getLocations()
    .map((location) => ({
      location,
      distanceKm: haversineKm(userLatitude, userLongitude, location.latitude, location.longitude),
    }))
    .filter((candidate) => candidate.distanceKm <= radiusKm)

  const results: RecommendationPlace[] = []
  let cursor = 0

  async function worker(): Promise<void> {
    while (cursor < withinRadius.length) {
      const candidate = withinRadius[cursor++]
      const built = await buildRecommendation(candidate.location, candidate.distanceKm, warnings, profile)
      if (built) results.push(built)
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, withinRadius.length) }, worker))

  return results.sort((a, b) => b.score.score - a.score.score || a.distanceKm - b.distanceKm)
}

async function buildRecommendation(
  location: Location,
  distanceKm: number,
  warnings: Warning[],
  profile: BathingScoreProfile,
): Promise<RecommendationPlace | null> {
  try {
    const placeData = await getPlaceData(location.latitude, location.longitude)
    const warningSeverity = resolveWarningSeverityForLocation(
      location.latitude,
      location.longitude,
      warnings,
    )

    return {
      location,
      distanceKm,
      score: calculateBathingScore({
        profile,
        warningSeverity,
        waterTemperature: placeData.seaInfo?.waterTemperature ?? null,
        waveHeight: placeData.seaInfo?.waveHeight ?? null,
        currentSpeed: placeData.seaInfo?.currentSpeed ?? null,
        uvIndex: placeData.currentUv,
        airTemperature: placeData.airTemperature,
      }),
      warningSeverity,
      seaInfo: placeData.seaInfo,
      uvValue: placeData.currentUv,
      airTemperature: placeData.airTemperature,
      warningDescription: warningDescriptionForLocation(
        location.latitude,
        location.longitude,
        warnings,
      ),
    }
  } catch {
    return null
  }
}
