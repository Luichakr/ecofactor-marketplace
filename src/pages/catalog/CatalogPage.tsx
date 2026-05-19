import { useMemo, useCallback, useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../shared/config/routes'
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
import { FiltersSheet } from '../../features/catalog/ui/FiltersSheet/FiltersSheet'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { Header } from '../../shared/ui/Header/Header'
import { SearchIconButton } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { GridSkeleton } from '../../shared/ui/Skeleton/Skeleton'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { buildCatalogSearchParams } from '../../features/catalog/lib/catalogSearchParams'
import type { SelectedFilters } from '../../features/catalog/model/catalog.types'
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
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, String(view))
  }, [view])

  const category = categoryId
    ? mockCategories.find((c) => c.id === categoryId)
    : undefined

  const { search, sort, filters } = parseCatalogSearchParams(searchParams)
  const activeSubcategory = searchParams.get('sub')

  // Once a subcategory is selected the top tab strip flips from
  // "Шини / Диски / …" to a per-brand strip "Усі / Michelin / …".
  // The active brand lives in the `brand` filter param (re-used by the
  // catalog filter pipeline so the result list narrows down).
  const activeBrand = ((filters.brand as string[] | undefined) ?? [])[0] ?? null

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
      // Switching subcategory resets every filter: tires and disks share
      // a category but have no attribute overlap (season/profile vs et/pcd),
      // so keeping stale filters silently empties the new result list.
      // Reserved keys (category, sub, q, sort) survive the reset.
      const RESERVED = new Set(['category', 'sub', 'q', 'sort'])
      const next = new URLSearchParams()
      for (const [k, v] of prev.entries()) {
        if (RESERVED.has(k)) next.set(k, v)
      }
      if (sub) next.set('sub', sub)
      else next.delete('sub')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setFilters = useCallback((updated: SelectedFilters) => {
    setSearchParams((prev) => {
      const next = buildCatalogSearchParams({ search, sort, filters: updated })
      // Re-attach the reserved (non-filter) params parseCatalogSearchParams skips
      for (const reserved of ['category', 'sub']) {
        const v = prev.get(reserved)
        if (v !== null) next.set(reserved, v)
      }
      return next
    }, { replace: true })
  }, [setSearchParams, search, sort])

  const setBrand = useCallback((brand: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (brand) next.set('brand', brand)
      else next.delete('brand')
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

  // Inside a subcategory we replace the subcategory tabs with a brand
  // strip. Brand list is computed from the products *of this subcategory*
  // so dropdowns only show brands the user can actually reach.
  const { brandList, brandCounts } = useMemo(() => {
    if (!activeSubcategory) return { brandList: [] as { id: string; title: string }[], brandCounts: {} as Record<string, number> }
    const counts: Record<string, number> = {}
    for (const p of baseProducts) {
      const subAttr = p.attributes.find((a) => a.key === 'subcategory')
      if (!subAttr || subAttr.value !== activeSubcategory) continue
      const brandAttr = p.attributes.find((a) => a.key === 'brand')
      if (!brandAttr || typeof brandAttr.value !== 'string') continue
      counts[brandAttr.value] = (counts[brandAttr.value] ?? 0) + 1
    }
    const list = Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, 'uk'))
      .map((b) => ({ id: b, title: b }))
    return { brandList: list, brandCounts: counts }
  }, [baseProducts, activeSubcategory])

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
      <Header
        title={headerTitle}
        showBack={!!categoryId}
        rightSlot={<SearchIconButton />}
        onBack={() => {
          // Always return to the Menu page on the tab whose section owns
          // this category, so the user lands on the same vertical strip
          // they tapped a moment ago (breadcrumb-like behaviour).
          const CATEGORY_TO_MENU_TAB: Record<string, string> = {
            'ev-charging': 'charging',
            solar: 'solar',
            cars: 'auto',
            wheels: 'wheels',
          }
          const tab = (categoryId && CATEGORY_TO_MENU_TAB[categoryId]) || ''
          navigate(tab ? `${ROUTES.MENU}?tab=${tab}` : ROUTES.MENU)
        }}
      />
      <ScreenContainer withTopInset={false}>
        {category?.subcategories && !activeSubcategory && (
          <SubcategoryTabs
            subcategories={category.subcategories}
            active={null}
            onChange={setSubcategory}
            counts={subcategoryCounts}
          />
        )}

        {activeSubcategory && brandList.length > 0 && (
          <SubcategoryTabs
            subcategories={brandList}
            active={activeBrand}
            onChange={setBrand}
            counts={brandCounts}
          />
        )}

        <CatalogToolbar
          sort={sort}
          onSortChange={setSort}
          totalCount={result.length}
          activeFiltersCount={activeFiltersCount}
          onFiltersClick={() => setFiltersOpen(true)}
          view={view}
          onViewChange={setView}
        />

        {isLoading && <GridSkeleton count={6} />}

        {liveError && (
          <EmptyState
            title="Не вдалося завантажити каталог"
            description={liveError}
          />
        )}

        {!isLoading && !liveError && (
          // Editorial view 1 is a category/subcategory look-book — it only
          // makes sense when the user is browsing the whole assortment.
          // Once they drill into a brand or any other deep filter, fall
          // back to the standard grid so the carousels don't show
          // duplicates of the same brand.
          view === 1 && category && activeFiltersCount === 0 ? (
            <div className="catalog-page__editorial">
              <EditorialLayout
                products={result}
                categoryTitle={category.title}
                subcategories={category.subcategories}
                imageAspect={categoryId === 'cars' ? 'landscape' : 'portrait'}
              />
            </div>
          ) : (
            <div className="catalog-page__grid">
              <CatalogGrid
                products={result}
                columns={view === 1 ? 2 : view}
                imageAspect={categoryId === 'cars' ? 'landscape' : 'portrait'}
                onReset={() => {
                  setSearchParams(new URLSearchParams(), { replace: true })
                }}
              />
            </div>
          )
        )}

        <div className="catalog-page__bottom-space" />
      </ScreenContainer>

      <FiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        products={live.data ?? []}
        categoryId={categoryId}
        subcategoryValue={activeSubcategory}
        search={search}
        sort={sort}
        filters={filters}
        onSortChange={setSort}
        onFiltersChange={setFilters}
        onReset={() => {
          // Keep category + subcategory params, drop everything else.
          setSearchParams((prev) => {
            const next = new URLSearchParams()
            for (const k of ['category', 'sub']) {
              const v = prev.get(k)
              if (v) next.set(k, v)
            }
            return next
          }, { replace: true })
        }}
      />
    </>
  )
}
