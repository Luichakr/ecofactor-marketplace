import type { MarketplaceProduct } from '../../../entities/product/model/product.types'
import type { SortOption } from '../model/catalog.types'

export function sortProducts(
  products: MarketplaceProduct[],
  sort: SortOption,
): MarketplaceProduct[] {
  const arr = [...products]

  switch (sort) {
    case 'priceAsc':
      return arr.sort((a, b) => (a.price?.value ?? Infinity) - (b.price?.value ?? Infinity))

    case 'priceDesc':
      return arr.sort((a, b) => (b.price?.value ?? 0) - (a.price?.value ?? 0))

    case 'newest':
      return arr.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))

    case 'titleAsc':
      return arr.sort((a, b) => a.title.localeCompare(b.title, 'uk'))

    case 'recommended':
    default:
      return arr
  }
}
