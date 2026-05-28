import { useEffect, useRef, useState } from 'react'
import { ProductImage } from '../ProductImage/ProductImage'
import type { MarketplaceCategoryId } from '../../../../entities/category/model/category.types'
import './ProductGallery.css'

type Props = {
  /** All images to show, in order. If only one, falls back to a single static frame. */
  images: string[]
  /** Used as alt text and for the skeleton fallback. */
  alt: string
  categoryId?: MarketplaceCategoryId | string
  /** Aspect ratio of each slide, default 3/4. */
  aspectRatio?: string
  /** Called when the user taps a slide. */
  onSlideClick?: (index: number) => void
  /** Override class. */
  className?: string
}

/**
 * Horizontal scroll-snap gallery, Instagram-style. Each slide fills the
 * container width; user swipes to navigate. Dots at the bottom indicate
 * the current slide.
 */
export function ProductGallery({
  images,
  alt,
  categoryId,
  aspectRatio = '3 / 4',
  onSlideClick,
  className = '',
}: Props) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  const slides = images.length > 0 ? images : [undefined]

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    function onScroll() {
      const idx = Math.round(rail!.scrollLeft / rail!.clientWidth)
      setActive(Math.max(0, Math.min(slides.length - 1, idx)))
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [slides.length])

  return (
    <div className={`product-gallery ${className}`} style={{ aspectRatio }}>
      <div className="product-gallery__rail" ref={railRef}>
        {slides.map((src, i) => (
          <button
            key={i}
            type="button"
            className="product-gallery__slide"
            onClick={() => onSlideClick?.(i)}
          >
            <ProductImage src={src} alt={alt} categoryId={categoryId} />
          </button>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="product-gallery__dots" aria-hidden="true">
          {(() => {
            // Same sliding-window dot strip as ProductImageSlider — capped
            // at 7 visible, slides with the active index, edge dots scale
            // down when more photos exist off-window in that direction.
            const MAX_DOTS = 7
            const total = slides.length
            const half = Math.floor(MAX_DOTS / 2)
            const start = total <= MAX_DOTS
              ? 0
              : Math.max(0, Math.min(active - half, total - MAX_DOTS))
            const end = Math.min(start + MAX_DOTS, total)
            const visible: number[] = []
            for (let i = start; i < end; i++) visible.push(i)
            return visible.map((i, posInWindow) => {
              const isFirstVisible = posInWindow === 0
              const isLastVisible = posInWindow === visible.length - 1
              const hasMoreLeft = start > 0
              const hasMoreRight = end < total
              const isEdge =
                (isFirstVisible && hasMoreLeft) ||
                (isLastVisible && hasMoreRight)
              return (
                <span
                  key={i}
                  className={[
                    'product-gallery__dot',
                    i === active && 'product-gallery__dot--active',
                    isEdge && 'product-gallery__dot--edge',
                  ].filter(Boolean).join(' ')}
                />
              )
            })
          })()}
        </div>
      )}
    </div>
  )
}
