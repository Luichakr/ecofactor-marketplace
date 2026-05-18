/**
 * Marketplace category IDs are open strings — the catalog is universal
 * and new top-level categories can be added without code changes.
 *
 * Current production categories:
 *   - 'ev-charging' — EV charging infrastructure (chargers, cables, accessories)
 *   - 'solar'       — Solar power systems (panels, inverters, batteries, components)
 */
export type MarketplaceCategoryId = string

export type MarketplaceSubcategory = {
  id: string
  title: string
}

export type MarketplaceCategory = {
  id: MarketplaceCategoryId
  title: string
  subtitle: string
  icon: string
  description?: string
  productCount?: number
  subcategories?: MarketplaceSubcategory[]
}
