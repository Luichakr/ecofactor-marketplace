import { useSyncExternalStore } from 'react'

const KEY = 'mp:recentSearches'
const MAX = 10

let state: string[] = load()
const listeners = new Set<() => void>()

function load(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch { return [] }
}

function persist() {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  for (const fn of listeners) fn()
}

export const recentSearches = {
  getAll() { return state },
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) },
  add(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    state = [trimmed, ...state.filter((s) => s !== trimmed)].slice(0, MAX)
    persist()
  },
  remove(q: string) {
    state = state.filter((s) => s !== q)
    persist()
  },
  clear() {
    state = []
    persist()
  },
}

export function useRecentSearches() {
  return useSyncExternalStore(recentSearches.subscribe, recentSearches.getAll, recentSearches.getAll)
}

export const POPULAR_SEARCHES = [
  'Michelin',
  'Літні шини',
  'Зарядка 11 кВт',
  'Type 2',
  'Bridgestone',
  'Зимові 17',
]
