import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { FilterPanel } from '../FilterPanel/FilterPanel'
import type { MarketplaceCategoryId } from '../../../../entities/category/model/category.types'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import type { SelectedFilters, SortOption } from '../../model/catalog.types'

type Props = {
  open: boolean
  onClose: () => void
  products: MarketplaceProduct[]
  categoryId?: MarketplaceCategoryId | null
  subcategoryValue?: string | null
  search: string
  sort: SortOption
  filters: SelectedFilters
  onSortChange: (sort: SortOption) => void
  onFiltersChange: (filters: SelectedFilters) => void
  onReset: () => void
}

/**
 * Slide-up filter overlay. Reuses the FilterPanel UI in a BottomSheet so
 * tapping the dimmed strip above (or the close handle) drops the user
 * back onto the catalog grid without losing scroll position.
 */
export function FiltersSheet({
  open,
  onClose,
  products,
  categoryId,
  subcategoryValue,
  search,
  sort,
  filters,
  onSortChange,
  onFiltersChange,
  onReset,
}: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="ФІЛЬТРИ" maxHeightPct={92}>
      <FilterPanel
        products={products}
        categoryId={categoryId}
        subcategoryValue={subcategoryValue}
        search={search}
        sort={sort}
        filters={filters}
        onSortChange={onSortChange}
        onFiltersChange={onFiltersChange}
        onApply={onClose}
        onReset={onReset}
      />
    </BottomSheet>
  )
}
