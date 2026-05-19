import type { MarketplaceCategoryId } from '../../category/model/category.types'

export type ProductAttributeType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'range'

export type ProductAttributeValue =
  | string
  | number
  | boolean
  | string[]
  | null

export type ProductAttribute = {
  key: string
  label: string
  value: ProductAttributeValue
  type: ProductAttributeType
  unit?: string
  filterable?: boolean
  visibleInCard?: boolean
  visibleInDetails?: boolean
  priority?: number
}

export type ProductStatus =
  | 'available'
  | 'inStock'
  | 'inTransit'
  | 'preorder'
  | 'service'

export type ProductPrice = {
  value?: number
  /** Pre-discount price. When present, UI renders it crossed-out next to
   *  the current `value`, signalling an active markdown. */
  oldValue?: number
  currency?: 'UAH' | 'USD' | 'EUR' | 'PLN'
  label?: string
}

export type ProductStats = {
  /** Snapshot of unique viewers in the last hour. Used for social-proof
   *  "X людей дивляться зараз" badges. Hidden under threshold (5). */
  viewersNow?: number
  /** Purchases in the last 30 days. Hidden under threshold (10). */
  monthlyPurchases?: number
  /** Weekly purchase count for catalog-card hotness badge. */
  weeklyPurchases?: number
}

export type MarketplaceProduct = {
  id: string
  categoryId: MarketplaceCategoryId
  title: string
  subtitle?: string
  description?: string
  price?: ProductPrice
  status?: ProductStatus
  image?: string
  gallery?: string[]
  badges?: string[]
  attributes: ProductAttribute[]
  createdAt?: string
  /** Units remaining on hand. `0` ⇒ OOS, ≤5 ⇒ low-stock badge. Undefined
   *  means "treat as in stock without explicit count". */
  stock?: number
  /** Seller-side identifier. Resolves to a `Seller` for the badge under
   *  the product title. Defaults to the platform seller. */
  sellerId?: string
  /** Companion product ids — rendered as "Часто купують разом". */
  bundle?: string[]
  /** Aggregate review stats (denormalized so cards don't need to fetch). */
  rating?: { average: number; count: number }
  /** Social-proof counters. */
  stats?: ProductStats
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  available: 'Доступно',
  inStock: 'В наявності',
  inTransit: 'В дорозі',
  preorder: 'Передзамовлення',
  service: 'Сервіс',
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: '₴',
  USD: '$',
  EUR: '€',
  PLN: 'zł',
}

function formatAmount(value: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA').format(value)
  return `${formatted} ${CURRENCY_SYMBOLS[currency] ?? currency}`
}

export function formatPrice(price: ProductPrice): string {
  if (price.label) return price.label
  if (price.value == null) return 'Ціна за запитом'
  return formatAmount(price.value, price.currency ?? 'UAH')
}

/** Returns the strikethrough "old" price string, or null when no markdown. */
export function formatOldPrice(price: ProductPrice): string | null {
  if (price.oldValue == null) return null
  return formatAmount(price.oldValue, price.currency ?? 'UAH')
}

/** Returns discount % (rounded) or null when no markdown. */
export function priceDiscountPct(price: ProductPrice): number | null {
  if (price.value == null || price.oldValue == null) return null
  if (price.oldValue <= price.value) return null
  return Math.round(((price.oldValue - price.value) / price.oldValue) * 100)
}
