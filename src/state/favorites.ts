const STORAGE_KEY = 'splaesh.favorites'

export function readFavorites(): number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
  } catch {
    return []
  }
}

export function writeFavorites(ids: number[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    return
  }
}

export function addFavorite(ids: number[], id: number): number[] {
  return [...new Set([...ids, id])]
}

export function removeFavorite(ids: number[], id: number): number[] {
  return ids.filter((value) => value !== id)
}

export function isFavorite(ids: number[], id: number): boolean {
  return ids.includes(id)
}
