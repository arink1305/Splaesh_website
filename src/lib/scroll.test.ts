import { describe, expect, it } from 'vitest'
import { scrollTargetFor } from './scroll'

describe('scrollTargetFor', () => {
  it('subtracts the sticky header height', () => {
    expect(scrollTargetFor(500, 0)).toBe(416)
  })

  it('accounts for how far the page is already scrolled', () => {
    expect(scrollTargetFor(200, 1000)).toBe(1116)
  })

  it('never scrolls above the top of the page', () => {
    expect(scrollTargetFor(10, 0)).toBe(0)
    expect(scrollTargetFor(-400, 0)).toBe(0)
  })

  it('takes a custom offset', () => {
    expect(scrollTargetFor(500, 0, 0)).toBe(500)
    expect(scrollTargetFor(500, 0, 120)).toBe(380)
  })
})
