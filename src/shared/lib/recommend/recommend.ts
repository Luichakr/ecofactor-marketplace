import type { MarketplaceProduct } from '../../../entities/product/model/product.types'

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function subcategoryOf(p: MarketplaceProduct): string | undefined {
  const attr = p.attributes.find((a) => a.key === 'subcategory')
  return typeof attr?.value === 'string' ? attr.value : undefined
}

/**
 * Pick N items to recommend based on what's in the cart.
 *
 * Strategy:
 *  - Exclude items already in cart.
 *  - Prefer items from the same subcategory as cart items (score +3).
 *  - Then items from the same top-level category (+2).
 *  - Add jitter so the list isn't deterministic.
 *
 * `mode` flavours:
 *  - "similar"     — strongly favours same subcategory (for "Вам також може сподобатися").
 *  - "complementary" — different subcategory, same top category (cross-sell: cable + charger).
 *  - "mix"         — blend of both, mostly used inside the cart page.
 */
export function recommendFor({
  all,
  cartProductIds,
  cartCategories,
  cartSubcategories,
  mode = 'mix',
  limit = 6,
}: {
  all: MarketplaceProduct[]
  cartProductIds: Set<string>
  cartCategories: Set<string>
  cartSubcategories: Set<string>
  mode?: 'similar' | 'complementary' | 'mix'
  limit?: number
}): MarketplaceProduct[] {
  const candidates = all.filter((p) => !cartProductIds.has(p.id))
  if (candidates.length === 0) return []

  const scored = candidates.map((p) => {
    const sub = subcategoryOf(p)
    let score = Math.random() * 0.5 // jitter
    const sameSub = sub && cartSubcategories.has(sub)
    const sameCat = cartCategories.has(p.categoryId)

    if (mode === 'similar') {
      if (sameSub) score += 5
      else if (sameCat) score += 2
    } else if (mode === 'complementary') {
      // Same top-level category but DIFFERENT subcategory.
      if (sameCat && !sameSub) score += 5
      else if (sameCat) score += 1
    } else {
      if (sameSub) score += 3
      else if (sameCat) score += 2
    }
    return { p, score }
  })

  scored.sort((a, b) => b.score - a.score)

  // Take top half of scored as "favoured", then shuffle within to add variety.
  const half = Math.max(limit, Math.ceil(scored.length / 2))
  const top = scored.slice(0, half).map((s) => s.p)
  return shuffle(top).slice(0, limit)
}

/**
 * Convenience wrapper that derives the necessary sets from a list of cart
 * items + the full product catalog.
 */
export function recommendForCart({
  all,
  cartItemProductIds,
  mode = 'mix',
  limit = 6,
}: {
  all: MarketplaceProduct[]
  cartItemProductIds: string[]
  mode?: 'similar' | 'complementary' | 'mix'
  limit?: number
}): MarketplaceProduct[] {
  const ids = new Set(cartItemProductIds)
  const cartProducts = all.filter((p) => ids.has(p.id))
  const cats = new Set(cartProducts.map((p) => p.categoryId))
  const subs = new Set(
    cartProducts
      .map((p) => subcategoryOf(p))
      .filter((s): s is string => Boolean(s)),
  )
  return recommendFor({
    all,
    cartProductIds: ids,
    cartCategories: cats,
    cartSubcategories: subs,
    mode,
    limit,
  })
}
