export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function easeOutCubic(progress: number): number {
  const t = clamp01(progress)
  return 1 - (1 - t) ** 3
}

export function countUpValue(from: number, to: number, progress: number): number {
  return Math.round(from + (to - from) * easeOutCubic(progress))
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
