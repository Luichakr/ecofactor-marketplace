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
  currency?: 'UAH' | 'USD' | 'EUR' | 'PLN'
  label?: string
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
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  available: 'Доступно',
  inStock: 'В наявності',
  inTransit: 'В дорозі',
  preorder: 'Передзамовлення',
  service: 'Сервіс',
}

export function formatPrice(price: ProductPrice): string {
  if (price.label) return price.label
  if (price.value == null) return 'Ціна за запитом'
  const formatted = new Intl.NumberFormat('uk-UA').format(price.value)
  const currency = price.currency ?? 'UAH'
  const symbols: Record<string, string> = {
    UAH: '₴',
    USD: '$',
    EUR: '€',
    PLN: 'zł',
  }
  return `${formatted} ${symbols[currency] ?? currency}`
}
