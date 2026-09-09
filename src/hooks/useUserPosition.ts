import { useCallback, useState } from 'react'

export type PositionStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported'

export interface UserPosition {
  latitude: number
  longitude: number
}

export function useUserPosition() {
  const [position, setPosition] = useState<UserPosition | null>(null)
  const [status, setStatus] = useState<PositionStatus>('idle')

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }

    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        })
        setStatus('granted')
      },
      () => {
        setPosition(null)
        setStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }, [])

  return { position, status, request }
}
