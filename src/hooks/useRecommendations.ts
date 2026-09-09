import { useEffect, useState } from 'react'
import { getRecommendations, type RecommendationPlace } from '../data/recommendations'
import type { BathingScoreProfile } from '../types/bathingScore'
import type { Warning } from '../types/warning'
import type { UserPosition } from './useUserPosition'

interface RecommendationsState {
  recommendations: RecommendationPlace[]
  loading: boolean
}

export function useRecommendations(
  position: UserPosition | null,
  radiusKm: number,
  warnings: Warning[],
  profile: BathingScoreProfile,
): RecommendationsState {
  const [state, setState] = useState<RecommendationsState>({
    recommendations: [],
    loading: false,
  })

  useEffect(() => {
    if (!position) {
      setState({ recommendations: [], loading: false })
      return
    }

    let active = true
    setState({ recommendations: [], loading: true })

    getRecommendations(position.latitude, position.longitude, radiusKm, warnings, profile)
      .then((recommendations) => {
        if (active) setState({ recommendations, loading: false })
      })
      .catch(() => {
        if (active) setState({ recommendations: [], loading: false })
      })

    return () => {
      active = false
    }
  }, [position, radiusKm, warnings, profile])

  return state
}
