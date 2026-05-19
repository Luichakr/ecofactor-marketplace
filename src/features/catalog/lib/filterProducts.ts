import type { MarketplaceProduct, ProductAttributeValue } from '../../../entities/product/model/product.types'
import type { MarketplaceCategoryId } from '../../../entities/category/model/category.types'
import type { RangeFilterValue, SelectedFilterValue, SelectedFilters } from '../model/catalog.types'

type FilterParams = {
  products: MarketplaceProduct[]
  categoryId?: MarketplaceCategoryId
  filters: SelectedFilters
  search: string
}

export function filterProducts({ products, categoryId, filters, search }: FilterParams): MarketplaceProduct[] {
  let result = products

  if (categoryId) {
    result = result.filter((p) => p.categoryId === categoryId)
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      (p.subtitle ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      p.attributes.some((a) => String(a.value).toLowerCase().includes(q)),
    )
  }

  for (const [key, selected] of Object.entries(filters)) {
    if (!selected) continue
    if (Array.isArray(selected) && selected.length === 0) continue

    result = result.filter((p) => {
      // `price` is special — it lives on product.price.value, not in
      // attributes. The "price" facet is synthesized for every category
      // (see buildFacets), so the matching path needs a special case too.
      if (key === 'price') {
        const v = p.price?.value
        if (typeof v !== 'number') return false
        return matchesFilter(v, selected)
      }
      const attr = p.attributes.find((a) => a.key === key)
      if (!attr) return false
      return matchesFilter(attr.value, selected)
    })
  }

  return result
}

function matchesFilter(attrValue: ProductAttributeValue, selected: SelectedFilterValue): boolean {
  if (Array.isArray(selected)) {
    // Boolean attributes stored as 'true'/'false' string options
    const vals = selected
    const strAttr = String(attrValue)
    if (Array.isArray(attrValue)) {
      return vals.some((v) => (attrValue as string[]).includes(v))
    }
    return vals.includes(strAttr)
  }

  // RangeFilterValue
  const range = selected as RangeFilterValue
  const num = Number(attrValue)
  if (isNaN(num)) return false
  if (range.min !== undefined && num < range.min) return false
  if (range.max !== undefined && num > range.max) return false
  return true
}
