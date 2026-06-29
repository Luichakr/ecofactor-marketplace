import { useSyncExternalStore } from 'react'
import { IS_DEMO } from '../../../shared/config/runtime'

export type OrderStatus =
  | 'placed'
  | 'paid'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returning'
  | 'returned'

export type OrderItem = {
  productId: string
  title: string
  subtitle?: string
  image?: string
  qty: number
  price: number
  currency: string
  variant?: string
}

export type Order = {
  id: string
  number: string
  createdAt: string
  status: OrderStatus
  /** ISO timestamps for cancel-window logic. */
  paidAt?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  items: OrderItem[]
  total: number
  currency: string
  deliveryCity: string
  deliveryBranch?: string
  deliveryPrice: number
  estimatedArrival?: string
  trackingNumber?: string
  paymentLast4?: string
  invoiceUrl?: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Оформлено',
  paid: 'Оплачено',
  packing: 'Збираємо',
  shipped: 'В дорозі',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
  returning: 'Повертається',
  returned: 'Повернуто',
}

/** Linear progression for the stepper visualization. */
export const ORDER_PROGRESS_STEPS: OrderStatus[] = [
  'paid',
  'packing',
  'shipped',
  'delivered',
]

const STORAGE_KEY = 'mp:orders'

const listeners = new Set<() => void>()
let snapshot: Order[] = load()

function load(): Order[] {
  // Production: start empty. Real orders accrue as the user checks out.
  // Demo: pre-populate so the screens look alive during walkthroughs.
  if (typeof window === 'undefined') return IS_DEMO ? seed() : []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = IS_DEMO ? seed() : []
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(raw) as Order[]
  } catch {
    return IS_DEMO ? seed() : []
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {}
  for (const fn of listeners) fn()
}

function seed(): Order[] {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  return [
    {
      id: 'o-1042',
      number: '1042',
      createdAt: new Date(now - day * 2).toISOString(),
      status: 'shipped',
      paidAt: new Date(now - day * 2).toISOString(),
      shippedAt: new Date(now - day).toISOString(),
      items: [
        {
          productId: 'tire-001',
          title: 'Michelin Pilot Sport 4',
          subtitle: '245/40 R18',
          qty: 4,
          price: 8950,
          currency: 'UAH',
          variant: '245-40-18',
        },
      ],
      total: 35800 + 189,
      currency: 'UAH',
      deliveryCity: 'Київ',
      deliveryBranch: '№ 47',
      deliveryPrice: 189,
      estimatedArrival: new Date(now + day).toISOString(),
      trackingNumber: '20450798123456',
      paymentLast4: '4242',
      invoiceUrl: '#',
    },
    {
      id: 'o-1037',
      number: '1037',
      createdAt: new Date(now - day * 18).toISOString(),
      status: 'delivered',
      paidAt: new Date(now - day * 18).toISOString(),
      shippedAt: new Date(now - day * 17).toISOString(),
      deliveredAt: new Date(now - day * 15).toISOString(),
      items: [
        {
          productId: 'ev-001',
          title: 'EV-зарядка DTEK 11 кВт',
          qty: 1,
          price: 24500,
          currency: 'UAH',
        },
        {
          productId: 'ev-cable-001',
          title: 'Кабель Type 2',
          qty: 1,
          price: 7779,
          currency: 'UAH',
        },
      ],
      total: 24500 + 7779 + 149,
      currency: 'UAH',
      deliveryCity: 'Львів',
      deliveryBranch: '№ 12',
      deliveryPrice: 149,
      trackingNumber: '20450798111111',
      paymentLast4: '4242',
      invoiceUrl: '#',
    },
    {
      id: 'o-1015',
      number: '1015',
      createdAt: new Date(now - day * 62).toISOString(),
      status: 'delivered',
      paidAt: new Date(now - day * 62).toISOString(),
      deliveredAt: new Date(now - day * 60).toISOString(),
      items: [
        {
          productId: 'rfid-card',
          title: 'RFID-картка ECOFACTOR',
          qty: 2,
          price: 60,
          currency: 'UAH',
        },
      ],
      total: 120 + 60,
      currency: 'UAH',
      deliveryCity: 'Одеса',
      deliveryBranch: '№ 8',
      deliveryPrice: 60,
      paymentLast4: '0001',
      invoiceUrl: '#',
    },
  ]
}

export const orders = {
  getAll(): Order[] {
    return snapshot
  },
  subscribe(cb: () => void) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
  add(order: Order) {
    snapshot = [order, ...snapshot]
    persist()
  },
  cancel(id: string) {
    snapshot = snapshot.map((o) =>
      o.id === id
        ? { ...o, status: 'cancelled' as OrderStatus, cancelledAt: new Date().toISOString() }
        : o,
    )
    persist()
  },
  reorderToCart(_id: string) {
    // Wires through cartStore at the call-site to avoid a circular import.
  },
  get(id: string): Order | undefined {
    return snapshot.find((o) => o.id === id)
  },
}

export function useOrders(): Order[] {
  return useSyncExternalStore(orders.subscribe, orders.getAll, orders.getAll)
}

/**
 * Export the full order journal as a single downloadable file — the "one file"
 * record of everything ordered. (In backend mode the Worker also keeps a
 * durable KV log; this is the on-device copy.)
 */
export function downloadOrdersLog(format: 'json' | 'csv' = 'json'): void {
  try {
    const stamp = new Date().toISOString().slice(0, 10)
    let content: string
    let mime: string
    let ext: string
    if (format === 'csv') {
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
      const header = ['number', 'createdAt', 'status', 'total', 'currency', 'deliveryCity', 'deliveryBranch', 'items']
      const rows = snapshot.map((o) =>
        [
          o.number,
          o.createdAt,
          o.status,
          o.total,
          o.currency,
          o.deliveryCity,
          o.deliveryBranch ?? '',
          o.items.map((i) => `${i.title} x${i.qty}`).join('; '),
        ]
          .map(esc)
          .join(','),
      )
      content = [header.map(esc).join(','), ...rows].join('\n')
      mime = 'text/csv;charset=utf-8'
      ext = 'csv'
    } else {
      content = JSON.stringify(snapshot, null, 2)
      mime = 'application/json'
      ext = 'json'
    }
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecofactor-orders-${stamp}.${ext}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    /* download is best-effort */
  }
}

/** Cancel-window helper — true while order is within 30 minutes of paidAt. */
export function isCancellable(order: Order): boolean {
  if (!['placed', 'paid', 'packing'].includes(order.status)) return false
  const ts = order.paidAt ?? order.createdAt
  return Date.now() - new Date(ts).getTime() < 30 * 60 * 1000
}

export function isReturnable(order: Order): boolean {
  if (order.status !== 'delivered') return false
  if (!order.deliveredAt) return false
  return Date.now() - new Date(order.deliveredAt).getTime() < 14 * 24 * 60 * 60 * 1000
}
