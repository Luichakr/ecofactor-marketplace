import type { ProductAttributeType } from '../../../entities/product/model/product.types'
import type { MarketplaceCategoryId } from '../../../entities/category/model/category.types'

export type FacetOption = {
  value: string | number | boolean
  label: string
  count: number
}

export type FacetDefinition = {
  key: string
  label: string
  type: ProductAttributeType
  unit?: string
  options?: FacetOption[]
  min?: number
  max?: number
  priority?: number
}

export type RangeFilterValue = {
  min?: number
  max?: number
}

export type SelectedFilterValue = string[] | RangeFilterValue

export type SelectedFilters = Record<string, SelectedFilterValue>

export type SortOption = 'recommended' | 'priceAsc' | 'priceDesc' | 'newest' | 'titleAsc'

export const SORT_LABELS: Record<SortOption, string> = {
  recommended: 'Рекомендовані',
  priceAsc: 'Ціна: зростання',
  priceDesc: 'Ціна: спадання',
  newest: 'Нові спочатку',
  titleAsc: 'За назвою',
}

export type CatalogState = {
  categoryId?: MarketplaceCategoryId
  search: string
  sort: SortOption
  filters: SelectedFilters
}
