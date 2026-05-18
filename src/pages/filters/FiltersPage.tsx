import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { mockProducts } from '../../data/mockProducts'
import { mockCategories } from '../../data/mockCategories'
import type { MarketplaceCategoryId } from '../../entities/category/model/category.types'
import { buildFacets } from '../../features/catalog/lib/buildFacets'
import { DynamicFilters } from '../../features/catalog/ui/DynamicFilters/DynamicFilters'
import {
  parseCatalogSearchParams,
  buildCatalogSearchParams,
} from '../../features/catalog/lib/catalogSearchParams'
import { getActiveFiltersCount } from '../../features/catalog/lib/getActiveFiltersCount'
import type { SelectedFilters, SortOption } from '../../features/catalog/model/catalog.types'
import { Header } from '../../shared/ui/Header/Header'
import { Button } from '../../shared/ui/Button/Button'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { catalogCategoryPath, ROUTES } from '../../shared/config/routes'
import './FiltersPage.css'

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

  const facets = useMemo(
    () => buildFacets(mockProducts, categoryId ?? undefined),
    [categoryId],
  )

  // Invalid category guard — after hooks
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

  function handleChange(updated: SelectedFilters) {
    setSearchParams(
      buildFiltersPageParams({ categoryId, search, sort, filters: updated }),
      { replace: true },
    )
  }

  function handleReset() {
    setSearchParams(
      buildFiltersPageParams({ categoryId, search, sort, filters: {} }),
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

  return (
    <>
      <Header
        title="Фільтри"
        showBack
        rightSlot={
          activeCount > 0 ? (
            <button className="filters-page__reset-btn" onClick={handleReset}>
              Скинути
            </button>
          ) : undefined
        }
      />
      <ScreenContainer withTopInset={false}>
        {facets.length === 0 ? (
          <div className="filters-page__empty">
            <p>Немає доступних фільтрів для поточного каталогу</p>
          </div>
        ) : (
          <DynamicFilters facets={facets} selected={filters} onChange={handleChange} />
        )}

        <div className="filters-page__cta">
          <Button variant="primary" fullWidth size="lg" onClick={handleApply}>
            Застосувати{activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        </div>
      </ScreenContainer>
    </>
  )
}
