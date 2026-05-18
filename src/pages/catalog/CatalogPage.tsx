import { useMemo, useCallback, useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { mockCategories } from '../../data/mockCategories'
import { filterProducts } from '../../features/catalog/lib/filterProducts'
import { sortProducts } from '../../features/catalog/lib/sortProducts'
import { parseCatalogSearchParams } from '../../features/catalog/lib/catalogSearchParams'
import { getActiveFiltersCount } from '../../features/catalog/lib/getActiveFiltersCount'
import type { SortOption } from '../../features/catalog/model/catalog.types'
import { CatalogGrid } from '../../features/catalog/ui/CatalogGrid/CatalogGrid'
import { EditorialLayout } from '../../features/catalog/ui/EditorialLayout/EditorialLayout'
import { CatalogToolbar } from '../../features/catalog/ui/CatalogToolbar/CatalogToolbar'
import { SubcategoryTabs } from '../../features/catalog/ui/SubcategoryTabs/SubcategoryTabs'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { filtersPath } from '../../shared/config/routes'
import './CatalogPage.css'

type ViewMode = 1 | 2 | 3
const VIEW_KEY = 'ecofactor-catalog-view'

export function CatalogPage() {
  const { categoryId } = useParams<{ categoryId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [view, setView] = useState<ViewMode>(() => {
    const saved = Number(localStorage.getItem(VIEW_KEY))
    return saved === 1 || saved === 3 ? saved : 2
  })

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, String(view))
  }, [view])

  const category = categoryId
    ? mockCategories.find((c) => c.id === categoryId)
    : undefined

  const { search, sort, filters } = parseCatalogSearchParams(searchParams)
  const activeSubcategory = searchParams.get('sub')

  const setSort = useCallback((value: SortOption) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value && value !== 'recommended') next.set('sort', value)
      else next.delete('sort')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setSubcategory = useCallback((sub: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (sub) next.set('sub', sub)
      else next.delete('sub')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const live = useEfpfProducts()

  const baseProducts = useMemo(() => {
    if (!live.data) return []
    if (categoryId) return live.data.filter((p) => p.categoryId === categoryId)
    return live.data
  }, [live.data, categoryId])

  // Counts are computed BEFORE the subcategory filter is applied so totals
  // stay stable as the user clicks between tabs.
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of baseProducts) {
      const sub = p.attributes.find((a) => a.key === 'subcategory')
      if (!sub || typeof sub.value !== 'string') continue
      counts[sub.value] = (counts[sub.value] ?? 0) + 1
    }
    return counts
  }, [baseProducts])

  const result = useMemo(() => {
    let products = baseProducts
    if (activeSubcategory) {
      products = products.filter((p) =>
        p.attributes.some((a) => a.key === 'subcategory' && a.value === activeSubcategory),
      )
    }
    const filtered = filterProducts({
      products,
      categoryId: undefined,
      filters,
      search,
    })
    return sortProducts(filtered, sort)
  }, [baseProducts, activeSubcategory, filters, search, sort])

  if (categoryId && !category) {
    return (
      <>
        <Header title="Категорія не знайдена" showBack />
        <ScreenContainer withTopInset={false}>
          <EmptyState
            title="Такої категорії не існує"
            description="Перевірте посилання або поверніться до каталогу"
          />
        </ScreenContainer>
      </>
    )
  }

  const activeFiltersCount = getActiveFiltersCount(filters)
  const headerTitle = category ? category.title.toUpperCase() : 'УСІ ТОВАРИ'
  const isLoading = live.loading
  const liveError = live.error

  return (
    <>
      <Header title={headerTitle} showBack={!!categoryId} />
      <ScreenContainer withTopInset={false}>
        {category?.subcategories && (
          <SubcategoryTabs
            subcategories={category.subcategories}
            active={activeSubcategory}
            onChange={setSubcategory}
            counts={subcategoryCounts}
          />
        )}

        <CatalogToolbar
          sort={sort}
          onSortChange={setSort}
          totalCount={result.length}
          activeFiltersCount={activeFiltersCount}
          onFiltersClick={() => navigate(filtersPath({ categoryId, searchParams }))}
          view={view}
          onViewChange={setView}
        />

        {isLoading && (
          <div className="catalog-page__status">Завантаження…</div>
        )}

        {liveError && (
          <EmptyState
            title="Не вдалося завантажити каталог"
            description={liveError}
          />
        )}

        {!isLoading && !liveError && (
          view === 1 && category ? (
            // Editorial look-book layout — only when a category is opened.
            <div className="catalog-page__editorial">
              <EditorialLayout products={result} categoryTitle={category.title} />
            </div>
          ) : (
            <div className="catalog-page__grid">
              <CatalogGrid
                products={result}
                columns={view}
                onReset={() => {
                  setSearchParams(new URLSearchParams(), { replace: true })
                }}
              />
            </div>
          )
        )}

        <div className="catalog-page__bottom-space" />
      </ScreenContainer>
    </>
  )
}
