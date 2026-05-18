import { SORT_LABELS, type SortOption } from '../../model/catalog.types'
import './CatalogToolbar.css'

type ViewMode = 1 | 2 | 3

type Props = {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  totalCount: number
  activeFiltersCount: number
  onFiltersClick?: () => void
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function CatalogToolbar({
  sort,
  onSortChange,
  activeFiltersCount,
  onFiltersClick,
  view,
  onViewChange,
}: Props) {
  return (
    <div className="catalog-toolbar">
      <button
        className="catalog-toolbar__view"
        onClick={() => onViewChange(view === 3 ? 1 : ((view + 1) as ViewMode))}
      >
        ВИД {view}
      </button>

      <div className="catalog-toolbar__right">
        <select
          className="catalog-toolbar__sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>{SORT_LABELS[key]}</option>
          ))}
        </select>

        <button className="catalog-toolbar__filters" onClick={onFiltersClick}>
          ФІЛЬТРИ
          {activeFiltersCount > 0 && (
            <span className="catalog-toolbar__filter-count">({activeFiltersCount})</span>
          )}
        </button>
      </div>
    </div>
  )
}
