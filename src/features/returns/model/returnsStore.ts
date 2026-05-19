import { useSyncExternalStore } from 'react'

const KEY = 'mp:returns'

export type ReturnReason =
  | 'wrongSize'
  | 'qualityDiffersFromDescription'
  | 'changedMind'
  | 'damaged'
  | 'other'

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  wrongSize: 'Не підійшов розмір',
  qualityDiffersFromDescription: 'Якість не та що в описі',
  changedMind: 'Передумав',
  damaged: 'Пошкоджений',
  other: 'Інше',
}

export type ReturnRefundMethod = 'card' | 'replacement' | 'storeCredit'

export type ReturnStatus = 'pending' | 'approved' | 'received' | 'refunded' | 'rejected'

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  pending: 'На розгляді',
  approved: 'Підтверджено',
  received: 'Отримано',
  refunded: 'Кошти повернуто',
  rejected: 'Відхилено',
}

export type ReturnRequest = {
  id: string
  orderId: string
  itemProductIds: string[]
  reason: ReturnReason
  comment?: string
  refundMethod: ReturnRefundMethod
  status: ReturnStatus
  createdAt: string
}

let state: ReturnRequest[] = load()
const listeners = new Set<() => void>()

function load(): ReturnRequest[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ReturnRequest[]) : []
  } catch { return [] }
}

function persist() {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  for (const fn of listeners) fn()
}

export const returnsStore = {
  getAll() { return state },
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) },
  open(r: Omit<ReturnRequest, 'id' | 'status' | 'createdAt'>) {
    const req: ReturnRequest = {
      ...r,
      id: `ret-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    state = [req, ...state]
    persist()
    return req
  },
  forOrder(orderId: string): ReturnRequest[] {
    return state.filter((r) => r.orderId === orderId)
  },
}

export function useReturns() {
  return useSyncExternalStore(returnsStore.subscribe, returnsStore.getAll, returnsStore.getAll)
}
