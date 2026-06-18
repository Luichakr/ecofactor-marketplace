import { useSyncExternalStore } from 'react'

/** A user-created marketplace listing (demo — persisted in localStorage). */
export type Listing = {
  id: string
  title: string
  description?: string
  price?: number
  currency: 'UAH'
  /** Photo data URLs (downscaled before save). First is the cover. */
  images: string[]
  createdAt: string
}

const KEY = 'ecofactor-listings'

function load(): Listing[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Listing[]) : []
  } catch {
    return []
  }
}

let items: Listing[] = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* quota — ignore */
  }
  listeners.forEach((l) => l())
}

export const listings = {
  add(l: Omit<Listing, 'id' | 'createdAt'>): string {
    const id = `lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    items = [{ ...l, id, createdAt: new Date().toISOString() }, ...items]
    emit()
    return id
  },
  remove(id: string) {
    items = items.filter((i) => i.id !== id)
    emit()
  },
  get() {
    return items
  },
}

export function useListings(): Listing[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => items,
    () => items,
  )
}
