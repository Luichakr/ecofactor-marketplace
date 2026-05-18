import type { RangeFilterValue, SelectedFilters, SortOption } from '../model/catalog.types'

const SORT_OPTIONS: SortOption[] = ['recommended', 'priceAsc', 'priceDesc', 'newest', 'titleAsc']
const RESERVED_KEYS = new Set(['q', 'sort', 'category', 'sub'])

export type CatalogSearchParams = {
  search: string
  sort: SortOption
  filters: SelectedFilters
}

export function parseCatalogSearchParams(searchParams: URLSearchParams): CatalogSearchParams {
  const search = searchParams.get('q') ?? ''

  const rawSort = searchParams.get('sort') ?? ''
  const sort: SortOption = (SORT_OPTIONS as string[]).includes(rawSort)
    ? (rawSort as SortOption)
    : 'recommended'

  const filters: SelectedFilters = {}

  // Collect all bare (non-_min/_max) keys → string[] filters
  for (const [key] of searchParams.entries()) {
    if (RESERVED_KEYS.has(key)) continue
    if (key.endsWith('_min') || key.endsWith('_max')) continue
    if (key in filters) continue // already processed

    filters[key] = searchParams.getAll(key)
  }

  // Collect range keys — support partial (only _min or only _max)
  for (const key of searchParams.keys()) {
    if (!key.endsWith('_min')) continue
    const baseKey = key.slice(0, -4)
    if (RESERVED_KEYS.has(baseKey)) continue

    const minStr = searchParams.get(`${baseKey}_min`)
    const maxStr = searchParams.get(`${baseKey}_max`)
    const range: RangeFilterValue = {}

    if (minStr !== null && minStr !== '') {
      const min = Number(minStr)
      if (!isNaN(min)) range.min = min
    }
    if (maxStr !== null && maxStr !== '') {
      const max = Number(maxStr)
      if (!isNaN(max)) range.max = max
    }

    if (range.min !== undefined || range.max !== undefined) {
      filters[baseKey] = range
    }
  }

  // Catch _max-only keys whose _min counterpart doesn't exist
  for (const key of searchParams.keys()) {
    if (!key.endsWith('_max')) continue
    const baseKey = key.slice(0, -4)
    if (RESERVED_KEYS.has(baseKey)) continue
    if (baseKey in filters) continue // already handled via _min pass

    const maxStr = searchParams.get(`${baseKey}_max`)
    if (maxStr !== null && maxStr !== '') {
      const max = Number(maxStr)
      if (!isNaN(max)) filters[baseKey] = { max }
    }
  }

  return { search, sort, filters }
}

export function buildCatalogSearchParams(params: CatalogSearchParams): URLSearchParams {
  const sp = new URLSearchParams()

  if (params.search) sp.set('q', params.search)
  if (params.sort && params.sort !== 'recommended') sp.set('sort', params.sort)

  for (const [key, value] of Object.entries(params.filters)) {
    if (!value) continue

    if (Array.isArray(value)) {
      if (value.length === 0) continue
      for (const v of value) sp.append(key, v)
    } else {
      // RangeFilterValue
      const range = value as RangeFilterValue
      if (range.min !== undefined) sp.set(`${key}_min`, String(range.min))
      if (range.max !== undefined) sp.set(`${key}_max`, String(range.max))
    }
  }

  return sp
}
