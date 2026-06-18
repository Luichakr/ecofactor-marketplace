import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { RecentlyViewed } from '../../features/recently-viewed/ui/RecentlyViewed/RecentlyViewed'
import { useSearchTrigger } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { HomePromoSlider } from '../../features/marketplace/ui/HomePromoSlider/HomePromoSlider'
import { HomeCategoryRow } from '../../features/marketplace/ui/HomeCategoryRow/HomeCategoryRow'
import { HomeProductRail } from '../../features/marketplace/ui/HomeProductRail/HomeProductRail'
import { buildHomeSections } from '../../features/marketplace/lib/buildHomeSections'
import { Icon } from '../../shared/ui/Icon/Icon'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { ROUTES } from '../../shared/config/routes'
import './MarketplaceHomePage.css'

/**
 * ECOFACTOR Marketplace home — Monobank/Rozetka-style shop landing, fully
 * themed around our verticals (EV-зарядка + Сонячні станції). Top: search +
 * Каталог. Then a promo slider with real ECOFACTOR offers, one row of
 * category shortcuts, and a stack of feed-driven themed product rails.
 */
export function MarketplaceHomePage() {
  const navigate = useNavigate()
  const { open: openSearch } = useSearchTrigger()
  const live = useEfpfProducts()

  const sections = useMemo(() => buildHomeSections(live.data ?? []), [live.data])

  return (
    <ScreenContainer className="market-home" withTopInset={false}>
      {/* Sticky header — search bar + Каталог button. */}
      <header className="market-home__top">
        <button type="button" className="market-home__search" onClick={openSearch}>
          <Icon name="search" size={20} />
          <span>Пошук</span>
        </button>
        <button
          type="button"
          className="market-home__catalog"
          onClick={() => navigate(ROUTES.CATALOG)}
          aria-label="Каталог"
        >
          <Icon name="grid_view" size={24} />
        </button>
      </header>

      {/* Promo banners slider with dots. */}
      <HomePromoSlider />

      {/* One row of category shortcuts. */}
      <HomeCategoryRow />

      {/* Feed-driven themed product collections. */}
      {sections.length === 0 ? (
        <p className="market-home__loading">Завантаження…</p>
      ) : (
        sections.map((s) => (
          <HomeProductRail key={s.id} title={s.title} products={s.products} viewAllTo={s.viewAllTo} />
        ))
      )}

      {/* Recently viewed — populates as the user opens product pages. */}
      <RecentlyViewed />
    </ScreenContainer>
  )
}
