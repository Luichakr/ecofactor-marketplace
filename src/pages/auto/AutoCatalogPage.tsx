import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { autoCarPath } from '../../shared/config/routes'
import { track } from '../../shared/lib/analytics/analytics'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { useAutoElectricInStock } from '../../features/auto/hooks/useAutoCars'
import type { AutoCard } from '../../features/auto/api/lubeavtoApi'
import { AutoSkeletonList } from '../../features/auto/ui/AutoCardSkeleton/AutoCardSkeleton'
import {
  AutoFiltersSheet,
  applyAutoFilters,
  countActiveAutoFilters,
  type AutoFilterValue,
} from '../../features/auto/ui/AutoFiltersSheet/AutoFiltersSheet'
import '../../features/catalog/ui/SubcategoryTabs/SubcategoryTabs.css'
import '../../features/catalog/ui/CatalogToolbar/CatalogToolbar.css'
import './AutoCatalogPage.css'

type Tab = 'all' | 'electric' | 'hybrid'
type View = 1 | 2 | 3
type Sort = 'recommended' | 'newest' | 'price-asc' | 'price-desc' | 'mileage-asc'

const SORT_LABELS: Record<Sort, string> = {
  'recommended': 'РЕКОМЕНДОВАНІ',
  'newest': 'СПОЧАТКУ НОВІШІ',
  'price-asc': 'ДЕШЕВШІ',
  'price-desc': 'ДОРОЖЧІ',
  'mileage-asc': 'МЕНШИЙ ПРОБІГ',
}

const VIEW_STORAGE_KEY = 'ecofactor-auto-view'
const EMPTY_FILTERS: AutoFilterValue = { makes: [] }

function loadView(): View {
  if (typeof window === 'undefined') return 1
  const raw = window.localStorage.getItem(VIEW_STORAGE_KEY)
  const n = Number(raw)
  return n === 1 || n === 2 || n === 3 ? (n as View) : 1
}

function sortCars(cars: AutoCard[], sort: Sort): AutoCard[] {
  const copy = [...cars]
  switch (sort) {
    case 'newest':
      copy.sort((a, b) => b.year - a.year || a.mileageKm - b.mileageKm)
      break
    case 'price-asc':
      copy.sort((a, b) => (a.priceUsd || Infinity) - (b.priceUsd || Infinity))
      break
    case 'price-desc':
      copy.sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0))
      break
    case 'mileage-asc':
      copy.sort((a, b) => a.mileageKm - b.mileageKm)
      break
    case 'recommended':
    default:
      // electric first, then by year, then by mileage (original API sort)
      break
  }
  return copy
}

export function AutoCatalogPage() {
  const { data, loading, error } = useAutoElectricInStock()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = (searchParams.get('type') as Tab | null) ?? 'all'
  const [tab, setTab] = useState<Tab>(
    initial === 'electric' || initial === 'hybrid' ? initial : 'all',
  )
  const [view, setView] = useState<View>(loadView)
  const [sort, setSort] = useState<Sort>('recommended')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<AutoFilterValue>(EMPTY_FILTERS)

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, String(view))
  }, [view])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (tab === 'all') next.delete('type')
    else next.set('type', tab)
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [tab, searchParams, setSearchParams])

  const byTab = useMemo(() => {
    if (tab === 'electric') return data.filter((c) => c.isElectric)
    if (tab === 'hybrid') return data.filter((c) => c.isHybrid)
    return data
  }, [data, tab])

  const filtered = useMemo(() => applyAutoFilters(byTab, filters), [byTab, filters])
  const sorted = useMemo(() => sortCars(filtered, sort), [filtered, sort])

  const counts = useMemo(() => ({
    all: data.length,
    electric: data.filter((c) => c.isElectric).length,
    hybrid: data.filter((c) => c.isHybrid).length,
  }), [data])

  const activeFilterCount = countActiveAutoFilters(filters)

  return (
    <>
      <Header title="EV-АВТО" showBack />
      <ScreenContainer withTopInset={false}>
        {/* Subcategory tabs (catalog style) */}
        <div className="subcategory-tabs auto-page__tabs-row">
          {(['all', 'electric', 'hybrid'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`subcategory-tabs__item ${tab === t ? 'subcategory-tabs__item--active' : ''}`}
              onClick={() => { setTab(t); track('auto_tab_switch', { tab: t }) }}
            >
              {t === 'all' ? 'ВСІ' : t === 'electric' ? 'ЕЛЕКТРО' : 'ГІБРИД'}
              <span className="subcategory-tabs__count">({counts[t]})</span>
            </button>
          ))}
        </div>

        {/* Toolbar (catalog style: ВИД N · РЕКОМЕНДОВАНІ · ФІЛЬТРИ) */}
        <div className="catalog-toolbar">
          <button
            type="button"
            className="catalog-toolbar__view"
            onClick={() => setView((v) => {
              const next = (v === 3 ? 1 : ((v + 1) as View))
              track('auto_view_change', { view: next })
              return next
            })}
          >
            ВИД {view}
          </button>

          <div className="catalog-toolbar__right">
            <select
              className="catalog-toolbar__sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              {(Object.keys(SORT_LABELS) as Sort[]).map((key) => (
                <option key={key} value={key}>{SORT_LABELS[key]}</option>
              ))}
            </select>

            <button
              type="button"
              className="catalog-toolbar__filters"
              onClick={() => setFiltersOpen(true)}
            >
              ФІЛЬТРИ
              {activeFilterCount > 0 && (
                <span className="catalog-toolbar__filter-count">({activeFilterCount})</span>
              )}
            </button>
          </div>
        </div>

        {loading && <AutoSkeletonList view={view} count={view === 3 ? 8 : 6} />}

        {error && !loading && (
          <EmptyState
            title="Не вдалося завантажити каталог"
            description={`Lubeavto API: ${error}. Перевірте токен LUBEAVTO_API_TOKEN у .env.local`}
          />
        )}

        {!loading && !error && sorted.length === 0 && (
          <EmptyState
            title="Нічого не знайдено"
            description="Спробуйте змінити фільтр або скинути."
            action={activeFilterCount > 0 ? { label: 'Скинути фільтри', onClick: () => setFilters(EMPTY_FILTERS) } : undefined}
          />
        )}

        {!loading && sorted.length > 0 && (
          <ul className={`auto-page__list auto-page__list--v${view}`}>
            {sorted.map((car) => (
              <CarRow
                key={car.id}
                car={car}
                view={view}
                onClick={() => {
                  track('auto_card_click', {
                    car_id: car.id,
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    fuel: car.fuel,
                    price_usd: car.priceUsd,
                    view,
                    tab,
                  })
                  navigate(autoCarPath(car.id))
                }}
              />
            ))}
          </ul>
        )}
      </ScreenContainer>

      <AutoFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={(next) => {
          setFilters(next)
          track('auto_filter_apply', {
            makes: next.makes,
            year_min: next.yearMin,
            year_max: next.yearMax,
            price_min: next.priceMin,
            price_max: next.priceMax,
            mileage_max_km: next.mileageMaxKm,
            transmission: next.transmission,
            drive: next.drive,
            tab,
          })
        }}
        source={byTab}
        matchCount={applyAutoFilters(byTab, filters).length}
      />
    </>
  )
}

function CarRow({ car, view, onClick }: { car: AutoCard; view: View; onClick: () => void }) {
  return (
    <li className={`auto-card auto-card--v${view}`} onClick={onClick} role="button" tabIndex={0}>
      <div className="auto-card__image">
        {car.image ? (
          <img src={car.image} alt={car.title} loading="lazy" />
        ) : (
          <div className="auto-card__image-empty">PHOTO TBD</div>
        )}
        <span className={`auto-card__badge auto-card__badge--${car.isElectric ? 'ev' : 'hybrid'}`}>
          {car.isElectric ? 'ELECTRIC' : 'HYBRID'}
        </span>
      </div>
      <div className="auto-card__body">
        <p className="auto-card__title">{car.title}</p>
        {view !== 2 && (
          <p className="auto-card__meta">
            {car.mileageLabel} · {car.transmission} · {car.drive}
          </p>
        )}
        {view !== 2 && <p className="auto-card__location">{car.location}</p>}
        <p className="auto-card__price">{car.priceLabel}</p>
      </div>
    </li>
  )
}
