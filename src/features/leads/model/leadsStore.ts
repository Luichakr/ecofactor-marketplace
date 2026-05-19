import { useSyncExternalStore } from 'react'

export type LeadType =
  | 'callback'
  | 'quote'
  | 'installation'
  | 'location'
  | 'warranty'
  | 'autoservice'
  | 'custom-station'

export type Lead = {
  id: string
  type: LeadType
  createdAt: string
  name?: string
  phone?: string
  email?: string
  productId?: string
  message?: string
  /** Bag of form-specific fields (city, station model, plate, …). Kept
   *  loose so each form can pass whatever it collected without us having
   *  to mirror the schema here. */
  payload?: Record<string, unknown>
}

const STORAGE_KEY = 'mp:leads'
const listeners = new Set<() => void>()
let snapshot: Lead[] = load()

function load(): Lead[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Lead[]) : []
  } catch { return [] }
}

function persist() {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)) } catch {}
  for (const fn of listeners) fn()
}

export const leads = {
  getAll() { return snapshot },
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) },
  add(lead: Omit<Lead, 'id' | 'createdAt'>) {
    const entry: Lead = {
      ...lead,
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    snapshot = [entry, ...snapshot]
    persist()
    return entry
  },
  clear() {
    snapshot = []
    persist()
  },
}

export function useLeads(): Lead[] {
  return useSyncExternalStore(leads.subscribe, leads.getAll, leads.getAll)
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  callback: 'Зворотний дзвінок',
  quote: 'Запит ціни',
  installation: 'Монтаж',
  location: 'Підбір локації',
  warranty: 'Гарантійний випадок',
  autoservice: 'Автосервіс',
  'custom-station': 'Кастомна станція',
}
