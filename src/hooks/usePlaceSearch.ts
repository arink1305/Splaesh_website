import { useEffect, useState } from 'react'
import { searchPlaces } from '../api/photon'
import type { GeoPlace } from '../types/geo'

export function usePlaceSearch(query: string, delayMs = 320) {
  const [places, setPlaces] = useState<GeoPlace[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setPlaces([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    const timer = window.setTimeout(() => {
      searchPlaces(trimmed, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setPlaces(result)
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, delayMs)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, delayMs])

  return { places, loading }
}
