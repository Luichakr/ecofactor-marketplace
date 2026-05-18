import { useEffect, useRef, useState } from 'react'
import { MarketCarousel } from '../../features/marketplace/ui/MarketCarousel/MarketCarousel'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
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
        <MarketCarousel scrollContainer={scroller} />
      </div>
    </ScreenContainer>
  )
}
