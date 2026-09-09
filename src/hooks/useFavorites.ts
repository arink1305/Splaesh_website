import { useCallback, useEffect, useState } from 'react'
import { addFavorite, isFavorite, readFavorites, removeFavorite, writeFavorites } from '../state/favorites'

export function useFavorites() {
  const [ids, setIds] = useState<number[]>([])

  useEffect(() => {
    setIds(readFavorites())
  }, [])

  const toggle = useCallback((id: number) => {
    setIds((current) => {
      const next = isFavorite(current, id) ? removeFavorite(current, id) : addFavorite(current, id)
      writeFavorites(next)
      return next
    })
  }, [])

  const removeMany = useCallback((removedIds: number[]) => {
    setIds((current) => {
      const next = current.filter((id) => !removedIds.includes(id))
      writeFavorites(next)
      return next
    })
  }, [])

  return {
    favoriteIds: ids,
    toggle,
    removeMany,
    isFavorite: (id: number) => isFavorite(ids, id),
  }
}
