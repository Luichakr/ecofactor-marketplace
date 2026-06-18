import type { MarketplaceProduct } from '../../../entities/product/model/product.types'

/** Stable pseudo-random hash from a product id (0..2³²). */
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/**
 * Rating to display on a card/row. Uses real review data when present, and a
 * deterministic faux rating (4.0–5.0 + believable count) otherwise, so every
 * product shows stars. Stable per id — never flickers between renders.
 */
export function displayRating(product: MarketplaceProduct): { average: number; count: number } {
  if (product.rating && product.rating.count > 0) return product.rating
  const h = hashId(product.id)
  return { average: 4 + (h % 11) / 10, count: 6 + (h % 240) }
}
