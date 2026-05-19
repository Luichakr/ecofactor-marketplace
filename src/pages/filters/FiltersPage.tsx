import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { mockCategories } from '../../data/mockCategories'
import type { MarketplaceCategoryId } from '../../entities/category/model/category.types'
import { buildFacets } from '../../features/catalog/lib/buildFacets'
import { filterProducts } from '../../features/catalog/lib/filterProducts'
import {
  parseCatalogSearchParams,
  buildCatalogSearchParams,
} from '../../features/catalog/lib/catalogSearchParams'
import { getActiveFiltersCount } from '../../features/catalog/lib/getActiveFiltersCount'
import {
  SORT_LABELS,
  type FacetDefinition,
  type RangeFilterValue,
  type SelectedFilters,
  type SortOption,
} from '../../features/catalog/model/catalog.types'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { Header } from '../../shared/ui/Header/Header'
import { Button } from '../../shared/ui/Button/Button'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { catalogCategoryPath, ROUTES } from '../../shared/config/routes'
import './FiltersPage.css'

const COLLAPSED_OPTION_LIMIT = 6

function buildFiltersPageParams(params: {
  categoryId: string | null
  search: string
  sort: SortOption
  filters: SelectedFilters
}): URLSearchParams {
  const sp = buildCatalogSearchParams({
    search: params.search,
    sort: params.sort,
    filters: params.filters,
  })
  if (params.categoryId) sp.set('category', params.categoryId)
  return sp
}

export function FiltersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('category') as MarketplaceCategoryId | null

  const category = categoryId
    ? mockCategories.find((c) => c.id === categoryId)
    : undefined

  const { search, sort, filters } = parseCatalogSearchParams(searchParams)
  const live = useEfpfProducts()

  // Subcategory is selected via a catalog-tab and surfaced through the
  // `subcategory` query param (string[] semantics, but at most one active).
  const subcategoryValue = (() => {
    const raw = filters.subcategory
    if (Array.isArray(raw) && raw.length > 0) return raw[0]
    return null
  })()

  // Source the facet list and the match-count from the same product set
  // the catalog page would render, so the "Показати N" counter is honest.
  const facets = useMemo(
    () => buildFacets(live.data ?? [], categoryId ?? undefined, subcategoryValue),
    [live.data, categoryId, subcategoryValue],
  )
  const matchCount = useMemo(() => {
    const pool = categoryId
      ? (live.data ?? []).filter((p) => p.categoryId === categoryId)
      : (live.data ?? [])
    return filterProducts({ products: pool, categoryId: undefined, filters, search }).length
  }, [live.data, categoryId, filters, search])

  if (categoryId && !category) {
    return (
      <>
        <Header title="Фільтри" showBack />
        <ScreenContainer withTopInset={false}>
          <EmptyState
            title="Категорію не знайдено"
            description="Повернутися до каталогу"
            action={{ label: 'До каталогу', onClick: () => navigate(ROUTES.CATALOG) }}
          />
        </ScreenContainer>
      </>
    )
  }

  const activeCount = getActiveFiltersCount(filters)

  function setSort(value: SortOption) {
    setSearchParams(
      buildFiltersPageParams({ categoryId, search, sort: value, filters }),
      { replace: true },
    )
  }

  function setFilters(updated: SelectedFilters) {
    setSearchParams(
      buildFiltersPageParams({ categoryId, search, sort, filters: updated }),
      { replace: true },
    )
  }

  function toggleOption(key: string, value: string) {
    const current = (filters[key] as string[] | undefined) ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    const merged = { ...filters }
    if (next.length === 0) delete merged[key]
    else merged[key] = next
    setFilters(merged)
  }

  function setRange(key: string, range: RangeFilterValue) {
    const merged = { ...filters }
    if (range.min === undefined && range.max === undefined) delete merged[key]
    else merged[key] = range
    setFilters(merged)
  }

  function handleReset() {
    setSearchParams(
      buildFiltersPageParams({ categoryId, search, sort: 'recommended', filters: {} }),
      { replace: true },
    )
  }

  function handleApply() {
    const catalogParams = buildCatalogSearchParams({ search, sort, filters })
    const qs = catalogParams.toString()
    const destination = categoryId
      ? qs
        ? `${catalogCategoryPath(categoryId)}?${qs}`
        : catalogCategoryPath(categoryId)
      : qs
        ? `${ROUTES.CATALOG}?${qs}`
        : ROUTES.CATALOG
    navigate(destination)
  }

  // Filter out the subcategory facet — sub is handled by the tab strip
  // on the catalog page, surfacing it here would duplicate the control.
  const sortedFacets = facets
    .filter((f) => f.key !== 'subcategory')
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

  return (
    <>
      <Header title="ФІЛЬТРИ" showBack />
      <ScreenContainer withTopInset={false} className="filters-page">
        {/* |01| СОРТУВАННЯ — always first */}
        <FilterSection num="01" title="СОРТУВАННЯ">
          {(Object.entries(SORT_LABELS) as Array<[SortOption, string]>).map(([key, label]) => (
            <OptionRow
              key={key}
              label={label}
              active={sort === key}
              onClick={() => setSort(key)}
            />
          ))}
        </FilterSection>

        {sortedFacets.map((facet, i) => (
          <FilterSection
            key={facet.key}
            num={String(i + 2).padStart(2, '0')}
            title={facet.label.toUpperCase()}
          >
            {facet.type === 'number' || facet.type === 'range' ? (
              <RangeBlock facet={facet} value={filters[facet.key] as RangeFilterValue | undefined} onChange={(r) => setRange(facet.key, r)} />
            ) : (
              <OptionList
                facet={facet}
                selected={(filters[facet.key] as string[] | undefined) ?? []}
                onToggle={(val) => toggleOption(facet.key, val)}
              />
            )}
          </FilterSection>
        ))}

        <div className="filters-page__cta">
          <Button variant="primary" fullWidth size="lg" onClick={handleApply}>
            ПОКАЗАТИ {matchCount} ТОВАРІВ
          </Button>
          {activeCount > 0 && (
            <button type="button" className="filters-page__reset" onClick={handleReset}>
              СКИНУТИ ФІЛЬТРИ
            </button>
          )}
        </div>
      </ScreenContainer>
    </>
  )
}

function FilterSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="filter-section">
      <div className="filter-section__head">
        <span className="filter-section__num">|{num}|</span>
        <span className="filter-section__title">{title}</span>
      </div>
      <div className="filter-section__body">{children}</div>
    </section>
  )
}

function OptionRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`filter-option ${active ? 'filter-option--active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function OptionList({
  facet,
  selected,
  onToggle,
}: {
  facet: FacetDefinition
  selected: string[]
  onToggle: (value: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const options = facet.options ?? []
  const visible = expanded ? options : options.slice(0, COLLAPSED_OPTION_LIMIT)
  return (
    <>
      {visible.map((opt) => (
        <OptionRow
          key={String(opt.value)}
          label={opt.label}
          active={selected.includes(String(opt.value))}
          onClick={() => onToggle(String(opt.value))}
        />
      ))}
      {options.length > COLLAPSED_OPTION_LIMIT && (
        <button
          type="button"
          className="filter-option filter-option--more"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'ПОКАЗАТИ МЕНШЕ' : 'ПОКАЗАТИ БІЛЬШЕ'}
        </button>
      )}
    </>
  )
}

function RangeBlock({
  facet,
  value,
  onChange,
}: {
  facet: FacetDefinition
  value: RangeFilterValue | undefined
  onChange: (next: RangeFilterValue) => void
}) {
  const min = facet.min ?? 0
  const max = facet.max ?? 100
  const currentMin = value?.min ?? min
  const currentMax = value?.max ?? max
  return (
    <div className="filter-range">
      <div className="filter-range__inputs">
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(min)}
          value={value?.min ?? ''}
          onChange={(e) => onChange({ min: e.target.value ? Number(e.target.value) : undefined, max: value?.max })}
          className="filter-range__num"
        />
        <span className="filter-range__dash">—</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(max)}
          value={value?.max ?? ''}
          onChange={(e) => onChange({ min: value?.min, max: e.target.value ? Number(e.target.value) : undefined })}
          className="filter-range__num"
        />
      </div>
      <div className="filter-range__hint">
        {currentMin}{facet.unit ? ` ${facet.unit}` : ''} – {currentMax}{facet.unit ? ` ${facet.unit}` : ''}
      </div>
    </div>
  )
}
