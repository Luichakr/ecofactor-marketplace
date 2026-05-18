import type { MarketplaceProduct } from '../../../entities/product/model/product.types'
import type { MarketplaceCategoryId } from '../../../entities/category/model/category.types'
import type { FacetDefinition, FacetOption } from '../model/catalog.types'

export function buildFacets(
  products: MarketplaceProduct[],
  categoryId?: MarketplaceCategoryId,
): FacetDefinition[] {
  const filtered = categoryId
    ? products.filter((p) => p.categoryId === categoryId)
    : products

  if (filtered.length === 0) return []

  // Collect attribute metadata per key
  const attrMap = new Map<
    string,
    {
      label: string
      type: string
      unit?: string
      priority: number
      values: Map<string | number | boolean, number>
    }
  >()

  for (const product of filtered) {
    for (const attr of product.attributes) {
      if (!attr.filterable) continue

      if (!attrMap.has(attr.key)) {
        attrMap.set(attr.key, {
          label: attr.label,
          type: attr.type,
          unit: attr.unit,
          priority: attr.priority ?? 99,
          values: new Map(),
        })
      }

      const entry = attrMap.get(attr.key)!
      const rawValue = attr.value
      if (rawValue === null || rawValue === undefined) continue

      if (Array.isArray(rawValue)) {
        for (const v of rawValue) {
          entry.values.set(v, (entry.values.get(v) ?? 0) + 1)
        }
      } else {
        entry.values.set(rawValue as string | number | boolean, (entry.values.get(rawValue as string | number | boolean) ?? 0) + 1)
      }
    }
  }

  const facets: FacetDefinition[] = []

  for (const [key, meta] of attrMap) {
    const valuesArr = Array.from(meta.values.entries())

    if (meta.type === 'number' || meta.type === 'range') {
      const nums = valuesArr
        .map(([v]) => Number(v))
        .filter((n) => !isNaN(n))

      if (nums.length === 0) continue

      facets.push({
        key,
        label: meta.label,
        type: meta.type as FacetDefinition['type'],
        unit: meta.unit,
        min: Math.min(...nums),
        max: Math.max(...nums),
        priority: meta.priority,
      })
    } else {
      const options: FacetOption[] = valuesArr.map(([v, count]) => ({
        value: v,
        label: formatOptionLabel(v),
        count,
      }))

      options.sort((a, b) => b.count - a.count)

      facets.push({
        key,
        label: meta.label,
        type: meta.type as FacetDefinition['type'],
        unit: meta.unit,
        options,
        priority: meta.priority,
      })
    }
  }

  facets.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

  return facets
}

function formatOptionLabel(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'Так' : 'Ні'
  return String(value)
}
