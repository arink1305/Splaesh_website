import { useEffect, useRef, useState } from 'react'
import { countUpValue, prefersReducedMotion } from '../lib/animation'

export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0)
  const fromRef = useRef(value)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }

    const from = fromRef.current
    const start = performance.now()
    let frame = 0

    const step = (now: number) => {
      const progress = (now - start) / durationMs
      const next = countUpValue(from, target, progress)
      setValue(next)
      fromRef.current = next
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}
