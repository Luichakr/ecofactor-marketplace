import type { RangeFilterValue, SelectedFilters } from '../model/catalog.types'

export function getActiveFiltersCount(filters: SelectedFilters): number {
  let count = 0
  for (const value of Object.values(filters)) {
    if (!value) continue
    if (Array.isArray(value)) {
      if (value.length > 0) count++
    } else {
      const range = value as RangeFilterValue
      if (range.min !== undefined || range.max !== undefined) count++
    }
  }
  return count
}
