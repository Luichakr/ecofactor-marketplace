import { useSyncExternalStore } from 'react'

const KEY = 'mp:stockNotify'

export type StockSubscription = {
  productId: string
  contact: string // email or phone
  createdAt: string
}

let state: StockSubscription[] = load()
const listeners = new Set<() => void>()

function load(): StockSubscription[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StockSubscription[]) : []
  } catch { return [] }
}

function persist() {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  for (const fn of listeners) fn()
}

export const stockNotify = {
  getAll() { return state },
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) },
  add(productId: string, contact: string) {
    if (state.some((s) => s.productId === productId && s.contact === contact)) return
    state = [...state, { productId, contact, createdAt: new Date().toISOString() }]
    persist()
  },
  hasFor(productId: string): boolean {
    return state.some((s) => s.productId === productId)
  },
}

export function useStockNotify() {
  return useSyncExternalStore(stockNotify.subscribe, stockNotify.getAll, stockNotify.getAll)
}
