import { describe, expect, it } from 'vitest'
import { addFavorite, isFavorite, removeFavorite } from './favorites'

describe('favorites', () => {
  it('adds an id to an empty list', () => {
    expect(addFavorite([], 5)).toContain(5)
  })

  it('removes an id from the list', () => {
    const result = removeFavorite([1, 2, 3], 2)

    expect(result).not.toContain(2)
    expect(result).toHaveLength(2)
  })

  it('does not duplicate the same id', () => {
    expect(addFavorite([1], 1)).toHaveLength(1)
  })

  it('reports membership', () => {
    expect(isFavorite([1, 2, 3], 2)).toBe(true)
    expect(isFavorite([1, 2, 3], 9)).toBe(false)
  })

  it('keeps insertion order', () => {
    expect(addFavorite(addFavorite([3], 1), 2)).toEqual([3, 1, 2])
  })
})
