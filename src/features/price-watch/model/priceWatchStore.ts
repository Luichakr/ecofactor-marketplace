import { useSyncExternalStore } from 'react'

const KEY = 'mp:priceWatch'

type Watch = { productId: string; snapshotPrice: number }
let state: Watch[] = load()
const listeners = new Set<() => void>()

function load(): Watch[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Watch[]) : []
  } catch { return [] }
}

function persist() {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  for (const fn of listeners) fn()
}

export const priceWatch = {
  getAll() { return state },
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) },
  toggle(productId: string, currentPrice: number) {
    const has = state.find((w) => w.productId === productId)
    if (has) {
      state = state.filter((w) => w.productId !== productId)
    } else {
      state = [...state, { productId, snapshotPrice: currentPrice }]
    }
    persist()
  },
  isWatched(productId: string) {
    return state.some((w) => w.productId === productId)
  },
  getSnapshot(productId: string): number | undefined {
    return state.find((w) => w.productId === productId)?.snapshotPrice
  },
}

export function usePriceWatch() {
  return useSyncExternalStore(priceWatch.subscribe, priceWatch.getAll, priceWatch.getAll)
}

/** Compare current price against the stored snapshot. Returns the absolute
 *  drop and percent (always > 0 when not null), or null if not watched or
 *  the price didn't fall. Pure — call from render with the live price. */
export type PriceDrop = { drop: number; pct: number; snapshot: number }

export function getPriceDrop(productId: string, currentPrice: number): PriceDrop | null {
  const snap = priceWatch.getSnapshot(productId)
  if (snap == null || currentPrice >= snap) return null
  const drop = snap - currentPrice
  const pct = Math.round((drop / snap) * 100)
  return { drop, pct, snapshot: snap }
}

/** Reset the stored snapshot to a new baseline. Called once the user has
 *  acknowledged the drop so the next change is detected fresh. */
export function acknowledgePriceDrop(productId: string, newSnapshot: number) {
  state = state.map((w) =>
    w.productId === productId ? { ...w, snapshotPrice: newSnapshot } : w,
  )
  persist()
}
