import { useSyncExternalStore } from 'react'

/** Moderation lifecycle of a user listing. */
export type ListingStatus = 'pending' | 'approved' | 'rejected'

/** Verdict produced by the AI/keyword classifier (and refined by a manager). */
export type ModerationVerdict = {
  /** Subject matter is energy-related (the only allowed domain). */
  relevant: boolean
  /** Not prohibited (no weapons/drugs/adult/etc.). */
  allowed: boolean
  /** Confidence 0..1. */
  score: number
  /** Detected energy category, e.g. "EV-зарядка", "Сонячні панелі". */
  category?: string
  /** Human-readable reasons (Ukrainian) for the decision. */
  reasons: string[]
  /** Who produced the latest decision. */
  decidedBy: 'ai' | 'manager'
  /** ISO timestamp of the decision. */
  at: string
}

/** A user-created marketplace listing (persisted in localStorage). */
export type Listing = {
  id: string
  title: string
  description?: string
  price?: number
  currency: 'UAH'
  /** Photo data URLs (downscaled before save). First is the cover. */
  images: string[]
  createdAt: string
  /** Publishing state — only `approved` listings may surface publicly. */
  status: ListingStatus
  /** Last moderation verdict (AI pre-screen and/or manager decision). */
  moderation?: ModerationVerdict
}

const KEY = 'ecofactor-listings'

type StoredListing = Omit<Listing, 'status'> & { status?: ListingStatus }

function load(): Listing[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredListing[]
    // Migrate pre-moderation listings (no status) — treat them as approved so
    // existing demo listings keep showing.
    return parsed.map((l) => ({ ...l, status: l.status ?? 'approved' }))
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
  /** Add a listing. Status/moderation come from the submission flow. */
  add(l: Omit<Listing, 'id' | 'createdAt'>): string {
    const id = `lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    items = [{ ...l, id, createdAt: new Date().toISOString() }, ...items]
    emit()
    return id
  },
  /** Add with a caller-supplied id (so it matches the moderation submission). */
  create(l: Omit<Listing, 'createdAt'>): string {
    items = [{ ...l, createdAt: new Date().toISOString() }, ...items]
    emit()
    return l.id
  },
  /** Stable id generator shared with the submission flow. */
  newId(): string {
    return `lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  },
  remove(id: string) {
    items = items.filter((i) => i.id !== id)
    emit()
  },
  /** Update moderation outcome (e.g. after polling the backend for a manager decision). */
  setStatus(id: string, status: ListingStatus, moderation?: ModerationVerdict) {
    items = items.map((i) =>
      i.id === id ? { ...i, status, moderation: moderation ?? i.moderation } : i,
    )
    emit()
  },
  get() {
    return items
  },
  /** Listings safe to surface publicly. */
  approved() {
    return items.filter((i) => i.status === 'approved')
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

export const STATUS_LABELS: Record<ListingStatus, string> = {
  pending: 'На перевірці',
  approved: 'Опубліковано',
  rejected: 'Відхилено',
}
