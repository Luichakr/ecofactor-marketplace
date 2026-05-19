import { useEffect, useRef, useState } from 'react'
import { MarketCarousel } from '../../features/marketplace/ui/MarketCarousel/MarketCarousel'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { RecentlyViewed } from '../../features/recently-viewed/ui/RecentlyViewed/RecentlyViewed'
import { SearchIconButton } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { CategoryGrid } from '../../features/marketplace/ui/CategoryGrid/CategoryGrid'
import { mockCategories } from '../../data/mockCategories'
import './MarketplaceHomePage.css'

export function MarketplaceHomePage() {
  // We need the actual ScreenContainer DOM node so the carousel can drive
  // vertical auto-scroll. ScreenContainer doesn't forward a ref — attach
  // post-mount via querySelector from a wrapper inside it.
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scroller, setScroller] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const el = wrapperRef.current?.closest('.screen-container') as HTMLElement | null
    setScroller(el ?? null)
  }, [])

  return (
    <ScreenContainer className="marketplace-home" withTopInset={false} withBottomNav={false}>
      <div ref={wrapperRef} className="marketplace-home__inner">
        <SearchIconButton className="marketplace-home__search" />
        <MarketCarousel scrollContainer={scroller} />
        <RecentlyViewed />
        {/* Quick category access — visible to every user (works even when
            RecentlyViewed above is empty for first-time visitors). */}
        <div className="marketplace-home__categories">
          <h2 className="marketplace-home__categories-title">КАТЕГОРІЇ</h2>
          <CategoryGrid categories={mockCategories} />
        </div>
      </div>
    </ScreenContainer>
  )
}
