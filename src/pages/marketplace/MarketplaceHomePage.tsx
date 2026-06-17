import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { RecentlyViewed } from '../../features/recently-viewed/ui/RecentlyViewed/RecentlyViewed'
import { useSearchTrigger } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { closeMarketplace } from '../../shared/lib/webview/webviewBridge'
import { CategoryGrid } from '../../features/marketplace/ui/CategoryGrid/CategoryGrid'
import { CategoryShowcase } from '../../features/marketplace/ui/CategoryShowcase/CategoryShowcase'
import { CatalogGrid } from '../../features/catalog/ui/CatalogGrid/CatalogGrid'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { mockCategories } from '../../data/mockCategories'
import { ROUTES } from '../../shared/config/routes'
import './MarketplaceHomePage.css'

/**
 * Marketplace home — proper shop landing in the spirit of Yandex Market
 * / AliExpress / Temu. Top: tappable search bar + horizontal scroll of
 * category shortcuts. Body: sponsored hero, "Популярне" product grid,
 * recently viewed strip, full categories card grid.
 */
export function MarketplaceHomePage() {
  const navigate = useNavigate()
  const { open: openSearch } = useSearchTrigger()
  const live = useEfpfProducts()

  // Featured products: first 12 from the live feed (already curated by
  // category/relevance upstream). Shuffle would be nice, but stable order
  // keeps the demo predictable when showing to internal users.
  const featured = useMemo(() => (live.data ?? []).slice(0, 12), [live.data])

  return (
    <ScreenContainer className="market-home" withTopInset={false}>
      {/* Sticky search header — close (return-to-app) + tappable search. */}
      <header className="market-home__top">
        <button
          type="button"
          className="market-home__close"
          onClick={closeMarketplace}
          aria-label="Закрити маркетплейс"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="market-home__search"
          onClick={openSearch}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>Знайти товари…</span>
        </button>
      </header>

      {/* Tabbed category showcase (Зарядки / Сонце / Про нас) at the top. */}
      <CategoryShowcase />

      {/* "Популярне" product grid — main "shop" feel. Two-column,
          tappable cards with photo swipe (same as catalog). */}
      <section className="market-home__section">
        <header className="market-home__section-head">
          <h2 className="market-home__section-title">ПОПУЛЯРНЕ</h2>
          <button
            type="button"
            className="market-home__section-link"
            onClick={() => navigate(ROUTES.CATALOG)}
          >
            УСІ
          </button>
        </header>
        {featured.length === 0 ? (
          <p className="market-home__loading">Завантаження…</p>
        ) : (
          <CatalogGrid products={featured} columns={2} />
        )}
      </section>

      {/* Recently viewed — empty on a fresh device, populates as user
          opens product pages. */}
      <RecentlyViewed />


      {/* Category cards at the bottom — full collection link-out. */}
      <div className="market-home__categories">
        <h2 className="market-home__section-title">КАТЕГОРІЇ</h2>
        <CategoryGrid categories={mockCategories} />
      </div>
    </ScreenContainer>
  )
}
