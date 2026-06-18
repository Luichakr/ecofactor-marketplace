import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

  // The category row sticks just under the search header and slides 1:1 with
  // the scroll once it's pinned: dragging down tucks it up behind the header
  // at the exact speed of the finger, dragging up brings it back — no snap,
  // no leftover white gap. Before it's pinned it just scrolls in flow.
  const headerRef = useRef<HTMLElement>(null)
  const catsRef = useRef<HTMLDivElement>(null)
  const [headerH, setHeaderH] = useState(64)
  const lastY = useRef(0)
  const catsOffset = useRef(0)
  // Natural (pre-pin) scroll position where the row starts sticking. Captured
  // once — a sticky element's live offsetTop tracks the pinned position, so we
  // can't read it inside the scroll handler.
  const stickRef = useRef(0)

  useLayoutEffect(() => {
    const h = headerRef.current?.offsetHeight ?? 64
    setHeaderH(h)
    stickRef.current = Math.max(0, (catsRef.current?.offsetTop ?? 0) - h)
  }, [])

  useEffect(() => {
    function onScroll(e: Event) {
      const t = e.target as HTMLElement | null
      if (!t || typeof t.scrollTop !== 'number') return
      const el = catsRef.current
      if (!el) return
      const barH = el.offsetHeight || 90
      const stick = stickRef.current // scroll pos where it pins (captured once)
      const y = t.scrollTop
      const dy = y - lastY.current
      lastY.current = y
      if (y <= stick) {
        // Not pinned yet — let it scroll naturally, fully visible.
        catsOffset.current = 0
        el.style.transform = ''
        return
      }
      // Pinned: slide 1:1 with the scroll, clamped to [0, barH].
      catsOffset.current = Math.min(barH, Math.max(0, catsOffset.current + dy))
      el.style.transform = `translateY(${-catsOffset.current}px)`
    }
    document.addEventListener('scroll', onScroll, true)
    return () => document.removeEventListener('scroll', onScroll, true)
  }, [headerH])

  return (
    <ScreenContainer className="market-home" withTopInset={false}>
      {/* Sticky header — search bar + Каталог button. */}
      <header className="market-home__top" ref={headerRef}>
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

      {/* One row of category shortcuts — sticky, reveal on scroll-up. */}
      <div ref={catsRef} className="market-home__cats" style={{ top: headerH }}>
        <HomeCategoryRow />
      </div>

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
