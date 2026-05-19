import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice } from '../../../../entities/product/model/product.types'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import { productPath } from '../../../../shared/config/routes'
import './SeasonShowcase.css'

type Props = {
  /** Big serif heading, e.g. "ЗИМА" or "ЛІТО". */
  title: string
  /** Caption under the heading, e.g. "MAN 2026" or "ТОП 10". */
  subtitle?: string
  /** Up to ~10 products to surface in the horizontal scroller. */
  items: MarketplaceProduct[]
}

/**
 * Full-bleed horizontal showcase modeled on the Zara seasonal blocks:
 * each slide is one near-full-width product photo with the title +
 * price beneath; the next slide peeks ~6% off the right. An "X/N"
 * pagination indicator in the header tracks scroll position.
 */
export function SeasonShowcase({ title, subtitle, items }: Props) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    function onScroll() {
      if (!rail) return
      const slideWidth = rail.clientWidth
      const idx = Math.round(rail.scrollLeft / slideWidth)
      setCurrent(Math.max(0, Math.min(items.length - 1, idx)))
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [items.length])

  if (items.length === 0) return null

  return (
    <section className="season-showcase">
      <header className="season-showcase__head">
        <h2 className="season-showcase__title">{title}</h2>
        {subtitle && <p className="season-showcase__subtitle">{subtitle}</p>}
        <span className="season-showcase__counter">
          {current + 1}/{items.length}
        </span>
      </header>

      <div className="season-showcase__rail" ref={railRef}>
        {items.map((p) => (
          <button
            key={p.id}
            type="button"
            className="season-showcase__slide"
            onClick={() => navigate(productPath(p.id))}
          >
            <div className="season-showcase__image">
              {p.image ? (
                <img src={p.image} alt={p.title} loading="lazy" />
              ) : (
                <PlaceholderImage size="1248 × 1664" aspectRatio="3 / 4" caption={p.title} />
              )}
            </div>
            <div className="season-showcase__info">
              <p className="season-showcase__name">{p.title}</p>
              {p.price && (
                <p className="season-showcase__price">{formatPrice(p.price)}</p>
              )}
              {p.attributes.some((a) => a.key === 'brand') && (
                <p className="season-showcase__more-colors">
                  <span className="season-showcase__swatch" />
                  Більше розмірів
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
