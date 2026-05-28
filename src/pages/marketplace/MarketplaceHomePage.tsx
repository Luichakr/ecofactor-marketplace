import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { RecentlyViewed } from '../../features/recently-viewed/ui/RecentlyViewed/RecentlyViewed'
import { useSearchTrigger } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { CategoryGrid } from '../../features/marketplace/ui/CategoryGrid/CategoryGrid'
import { CatalogGrid } from '../../features/catalog/ui/CatalogGrid/CatalogGrid'
import { SponsoredCarousel } from '../../features/catalog/ui/SponsoredCarousel/SponsoredCarousel'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { mockCategories } from '../../data/mockCategories'
import { catalogCategoryPath, REQUEST_PATHS, ROUTES } from '../../shared/config/routes'
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

  // Quick category chips at the top — same 4 verticals + 2 service entries.
  const shortcuts: { label: string; href: string; icon: React.ReactNode }[] = [
    {
      label: 'EV-зарядка',
      href: catalogCategoryPath('ev-charging'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M7 3L4 12H8L7 21L17 10H12L14 3H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Сонячна',
      href: catalogCategoryPath('solar'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Авто',
      href: catalogCategoryPath('cars'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 17h14v-4l-2-5H7l-2 5v4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="8" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: 'Колеса',
      href: catalogCategoryPath('wheels'),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: 'Сервіс',
      href: REQUEST_PATHS.AUTOSERVICE,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M14 6l4 4-8 8H6v-4l8-8zm0 0L18 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Конфігуратор',
      href: REQUEST_PATHS.CUSTOM_STATION,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="4" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
          <rect x="4" y="13" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="13" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: 'Закладки',
      href: ROUTES.FAVORITES,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s-7-4.5-7-10.5C5 7.5 7.5 5 10.5 5c1.5 0 3 .8 1.5 2 1.5-1.2 3-2 4.5-2C19.5 5 22 7.5 22 10.5 22 16.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <ScreenContainer className="market-home" withTopInset={false}>
      {/* Sticky search header — tappable opens the full SearchOverlay. */}
      <header className="market-home__top">
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

      {/* Horizontal scroll of category shortcuts. */}
      <nav className="market-home__shortcuts" aria-label="Швидкі категорії">
        {shortcuts.map((s) => (
          <Link key={s.label} to={s.href} className="market-home__shortcut">
            <span className="market-home__shortcut-icon">{s.icon}</span>
            <span className="market-home__shortcut-label">{s.label}</span>
          </Link>
        ))}
      </nav>

      {/* Hero promo — auto-rotating carousel through SPONSORED_CARDS.
          Swipeable, 5-second auto-advance, ~3% peek of neighbouring
          slides on each side. */}
      <SponsoredCarousel />

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
