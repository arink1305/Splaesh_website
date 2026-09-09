import { useEffect, useState } from 'react'
import { getPlaceData, type PlaceData } from '../data/placeData'
import type { Location } from '../types/location'

export function useLocationDetails(locations: Location[]) {
  const [details, setDetails] = useState<Record<number, PlaceData>>({})
  const [loading, setLoading] = useState(false)

  const key = locations.map((location) => location.id).join(',')

  useEffect(() => {
    if (locations.length === 0) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    void Promise.all(
      locations.map(async (location) => {
        try {
          const data = await getPlaceData(location.latitude, location.longitude)
          if (active) setDetails((current) => ({ ...current, [location.id]: data }))
        } catch {
          return
        }
      }),
    ).then(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [key])

  return { details, loading }
}
