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
          {slides.map((_, i) => (
            <span
              key={i}
              className={`product-gallery__dot ${i === active ? 'product-gallery__dot--active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
