import { prefersReducedMotion } from './animation'

const HEADER_OFFSET = 84

export function scrollTargetFor(elementTop: number, scrollY: number, offset = HEADER_OFFSET): number {
  return Math.max(0, elementTop + scrollY - offset)
}

export function scrollToElement(id: string, offset = HEADER_OFFSET): void {
  const element = document.getElementById(id)
  if (!element) return

  window.scrollTo({
    top: scrollTargetFor(element.getBoundingClientRect().top, window.scrollY, offset),
    behavior: prefersReducedMotion() ? 'instant' : 'smooth',
  })
}
