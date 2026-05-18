import { useSyncExternalStore } from 'react'
import { track } from '../../../shared/lib/analytics/analytics'

export type CartItem = {
  productId: string
  title: string
  subtitle?: string
  image?: string
  /** Numeric price unit (per single item). Currency code separately. */
  price?: number
  currency?: string
  /** User-selected quantity. */
  qty: number
  /** Optional variant string (size, color, etc.). */
  variant?: string
}

const STORAGE_KEY = 'ecofactor-cart'

function loadInitial(): CartItem[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

let items: CartItem[] = loadInitial()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota errors
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

function getSnapshot(): CartItem[] {
  return items
}

function addItem(item: Omit<CartItem, 'qty'> & { qty?: number }): void {
  const qty = item.qty ?? 1
  const existingIdx = items.findIndex(
    (i) => i.productId === item.productId && i.variant === item.variant,
  )
  if (existingIdx >= 0) {
    items = items.map((it, i) => (i === existingIdx ? { ...it, qty: it.qty + qty } : it))
  } else {
    items = [...items, { ...item, qty }]
  }
  track('cart_add', {
    product_id: item.productId,
    title: item.title,
    qty,
    price: item.price,
    currency: item.currency,
    variant: item.variant,
    cart_size: items.reduce((s, i) => s + i.qty, 0),
  })
  emit()
}

function setQty(productId: string, qty: number, variant?: string): void {
  if (qty <= 0) {
    items = items.filter((i) => !(i.productId === productId && i.variant === variant))
  } else {
    items = items.map((i) =>
      i.productId === productId && i.variant === variant ? { ...i, qty } : i,
    )
  }
  emit()
}

function removeItem(productId: string, variant?: string): void {
  items = items.filter((i) => !(i.productId === productId && i.variant === variant))
  emit()
}

function clear(): void {
  items = []
  emit()
}

export const cart = {
  add: addItem,
  setQty,
  remove: removeItem,
  clear,
}

/** React hook — re-renders when cart changes. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Memoized totals (count of items + total amount in major currency). */
export function useCartTotals(): { count: number; subtotal: number; currency: string } {
  const list = useCart()
  let count = 0
  let subtotal = 0
  let currency = 'UAH'
  for (const i of list) {
    count += i.qty
    if (i.price !== undefined) subtotal += i.price * i.qty
    if (i.currency) currency = i.currency
  }
  return { count, subtotal, currency }
}
