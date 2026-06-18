import { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../../shared/config/routes'
import { mockCategories } from '../../data/mockCategories'
import { filterProducts } from '../../features/catalog/lib/filterProducts'
import { sortProducts } from '../../features/catalog/lib/sortProducts'
import { parseCatalogSearchParams } from '../../features/catalog/lib/catalogSearchParams'
import { getActiveFiltersCount } from '../../features/catalog/lib/getActiveFiltersCount'
import type { SortOption } from '../../features/catalog/model/catalog.types'
import { CatalogGrid } from '../../features/catalog/ui/CatalogGrid/CatalogGrid'
import { CatalogList } from '../../features/catalog/ui/CatalogList/CatalogList'
import { CatalogToolbar } from '../../features/catalog/ui/CatalogToolbar/CatalogToolbar'
import { SubcategoryTabs } from '../../features/catalog/ui/SubcategoryTabs/SubcategoryTabs'
import { FiltersSheet } from '../../features/catalog/ui/FiltersSheet/FiltersSheet'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { Header } from '../../shared/ui/Header/Header'
import { useSearchTrigger } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { useGoBack } from '../../shared/lib/useGoBack'
import { Icon } from '../../shared/ui/Icon/Icon'
import { GridSkeleton } from '../../shared/ui/Skeleton/Skeleton'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { buildCatalogSearchParams } from '../../features/catalog/lib/catalogSearchParams'
import type { SelectedFilters } from '../../features/catalog/model/catalog.types'
import './CatalogPage.css'

type ViewMode = 1 | 2 | 3
const VIEW_KEY = 'ecofactor-catalog-view'

export function CatalogPage() {
  const { categoryId: routeCategoryId } = useParams<{ categoryId?: string }>()
  // `/catalog/all` is the whole-assortment list (no category filter).
  const isAll = routeCategoryId === 'all'
  const categoryId = isAll ? undefined : routeCategoryId
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<ViewMode>(() => {
    // An explicit ?view= in the URL wins (e.g. the home EV-зарядка tile forces
    // Вид 2). Otherwise fall back to the saved preference, then to grid (2).
    // View 3 is retired — only the Amazon list (1) and the 2-col grid (2).
    const fromUrl = Number(searchParams.get('view'))
    if (fromUrl === 1 || fromUrl === 2) return fromUrl as ViewMode
    // Guarded — localStorage throws in private-mode WebView / when storage
    // is disabled, which would otherwise crash the catalog on mount.
    try {
      const saved = Number(localStorage.getItem(VIEW_KEY))
      return saved === 1 ? 1 : 2
    } catch {
      return 2
    }
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const goBack = useGoBack(ROUTES.MARKETPLACE)
  const { open: openSearch } = useSearchTrigger()
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, String(view))
    } catch {
      /* storage disabled — view preference just won't persist */
    }
  }, [view])

  // Sticky subcategory tabs slide with the scroll 1:1 (like the Safari address
  // bar) — moving up as you scroll down and back down as you scroll up, at the
  // exact speed of the finger, instead of a separate snap animation.
  const tabsRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const tabsOffset = useRef(0)
  useEffect(() => {
    function onScroll(e: Event) {
      const t = e.target as HTMLElement | null
      if (!t || typeof t.scrollTop !== 'number') return
      const el = tabsRef.current
      if (!el) return
      const barH = el.offsetHeight || 100
      const y = t.scrollTop
      const dy = y - lastScrollY.current
      lastScrollY.current = y
      // Accumulate the offset in [0, barH]; clamp so it never over-shoots.
      tabsOffset.current = y <= 0 ? 0 : Math.min(barH, Math.max(0, tabsOffset.current + dy))
      el.style.transform = `translateY(${-tabsOffset.current}px)`
    }
    document.addEventListener('scroll', onScroll, true)
    return () => document.removeEventListener('scroll', onScroll, true)
  }, [])

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

  // A lone result reads better as a full-width list row than a half-width
  // grid card, so a single match always renders as view 1; otherwise the
  // user's chosen view (default the 2-col grid) applies.
  const effectiveView: ViewMode = result.length === 1 ? 1 : view

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
      {/* Top bar: round back button (brand style) + search field. The category
          name lives below as a heading, then tabs, then products. */}
      <div className="catalog-page__bar">
        <button
          type="button"
          className="catalog-page__back"
          onClick={goBack}
          aria-label="Назад"
        >
          <Icon name="arrow_back" size={24} />
        </button>
        <button type="button" className="catalog-page__search" onClick={openSearch}>
          <Icon name="search" size={20} />
          <span>Пошук</span>
        </button>
      </div>

      <ScreenContainer withTopInset={false} className="catalog-page">
        <h1 className="catalog-page__title">{headerTitle}</h1>

        {/* Sticky subcategory tabs — slide up out of view on scroll-down and
            back in on scroll-up so the category switcher is always one swipe
            away, no scroll-to-top needed. */}
        {category?.subcategories && (
          <div ref={tabsRef} className="catalog-page__sticky-tabs">
            <SubcategoryTabs
              subcategories={category.subcategories}
              active={activeSubcategory}
              onChange={setSubcategory}
              counts={subcategoryCounts}
              variant="tiles"
            />

            {activeSubcategory && brandList.length > 0 && (
              <SubcategoryTabs
                subcategories={brandList}
                active={activeBrand}
                onChange={setBrand}
                counts={brandCounts}
              />
            )}
          </div>
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
          // View 1 — Amazon-style list (photo left, details right, one per
          // row). Views 2/3 — 2- and 3-column product grids.
          effectiveView === 1 ? (
            <CatalogList
              products={result}
              onReset={() => {
                setSearchParams(new URLSearchParams(), { replace: true })
              }}
            />
          ) : (
            <div className="catalog-page__grid">
              <CatalogGrid
                products={result}
                columns={effectiveView}
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
