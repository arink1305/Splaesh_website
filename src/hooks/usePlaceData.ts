import { useEffect, useState } from 'react'
import { getPlaceData, type PlaceData } from '../data/placeData'
import type { Location } from '../types/location'

interface PlaceDataState {
  data: PlaceData | null
  loading: boolean
  error: string | null
}

export function usePlaceData(location: Location | null): PlaceDataState {
  const [state, setState] = useState<PlaceDataState>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!location) {
      setState({ data: null, loading: false, error: null })
      return
    }

    let active = true
    setState({ data: null, loading: true, error: null })

    getPlaceData(location.latitude, location.longitude)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Ukjent feil',
          })
        }
      })

    return () => {
      active = false
    }
  }, [location])

  return state
}
