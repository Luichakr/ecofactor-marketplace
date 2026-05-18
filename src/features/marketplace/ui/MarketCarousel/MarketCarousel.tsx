import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MARKET_CARDS } from '../../../../data/marketCards'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import { useInactivityAutoScroll } from '../../../../shared/lib/hooks/useInactivityAutoScroll'
import './MarketCarousel.css'

type Props = {
  /** Scroll container that actually scrolls vertically (usually the
   *  parent ScreenContainer). Auto-scroll drives this element. */
  scrollContainer?: HTMLElement | null
}

export function MarketCarousel({ scrollContainer }: Props) {
  const navigate = useNavigate()
  const railRef = useRef<HTMLDivElement>(null)

  // Vertical auto-advance: 60s inactivity → advance one slide every 3s.
  useInactivityAutoScroll({
    scroller: scrollContainer,
    slideSelector: '.market-carousel__slide',
    axis: 'y',
    inactivityMs: 60_000,
    advanceMs: 3_000,
  })

  function go(href?: string) {
    if (href) navigate(href)
  }

  return (
    <div className="market-carousel" ref={railRef}>
      {MARKET_CARDS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`market-carousel__slide ${c.image ? 'market-carousel__slide--photo' : 'market-carousel__slide--placeholder'}`}
          onClick={() => go(c.href)}
          disabled={!c.href}
        >
          <span className="market-carousel__frame">
            {c.image ? (
              <img className="market-carousel__image" src={c.image} alt={c.caption} />
            ) : (
              <PlaceholderImage caption={c.caption} size={c.size ?? '1080 × 1920'} aspectRatio="9 / 16" />
            )}
            <span className="market-carousel__overlay" aria-hidden="true" />
            <h2 className="market-carousel__caption">{c.caption}</h2>
          </span>
        </button>
      ))}
    </div>
  )
}
