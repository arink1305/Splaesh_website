import { useEffect, useState } from 'react'
import { fetchWarnings } from '../api/met'
import type { Warning } from '../types/warning'

export function useWarnings(): { warnings: Warning[]; loading: boolean } {
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetchWarnings(controller.signal)
      .then(setWarnings)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return { warnings, loading }
}
