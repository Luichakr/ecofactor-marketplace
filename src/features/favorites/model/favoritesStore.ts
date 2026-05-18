import { useSyncExternalStore } from 'react'
import { track } from '../../../shared/lib/analytics/analytics'

const STORAGE_KEY = 'ecofactor-favorites'

function loadInitial(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

let ids: string[] = loadInitial()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore quota
  }
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

function subscribe(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

function getSnapshot(): string[] {
  return ids
}

function add(id: string): void {
  if (ids.includes(id)) return
  ids = [...ids, id]
  emit()
}

function remove(id: string): void {
  if (!ids.includes(id)) return
  ids = ids.filter((x) => x !== id)
  emit()
}

function toggle(id: string): boolean {
  const nowActive = !ids.includes(id)
  if (nowActive) add(id)
  else remove(id)
  track('favorite_toggle', { product_id: id, action: nowActive ? 'add' : 'remove', total: ids.length })
  return nowActive
}

function has(id: string): boolean {
  return ids.includes(id)
}

function clear(): void {
  ids = []
  emit()
}

export const favorites = { add, remove, toggle, has, clear }

/** React hook returning current favorite ids (re-renders on change). */
export function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Hook: is a specific id in favorites? */
export function useIsFavorite(id: string): boolean {
  const list = useFavorites()
  return list.includes(id)
}
