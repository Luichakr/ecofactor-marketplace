import { useSyncExternalStore } from 'react'
import type { MarketplaceProduct } from '../../../entities/product/model/product.types'

export type QuickAddState = {
  product: MarketplaceProduct
  pool: MarketplaceProduct[]
} | null

let state: QuickAddState = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function getSnapshot(): QuickAddState {
  return state
}

function open(product: MarketplaceProduct, pool: MarketplaceProduct[]): void {
  state = { product, pool }
  emit()
}

function close(): void {
  if (state === null) return
  state = null
  emit()
}

export const quickAdd = { open, close }

/** Subscribe to the current quick-add target (null when closed). */
export function useQuickAdd(): QuickAddState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
