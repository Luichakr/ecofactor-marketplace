import { useEffect, useRef, useState } from 'react'
import type { MarketplaceCategoryId } from '../../../../entities/category/model/category.types'
import { ProductImage } from '../ProductImage/ProductImage'
import './ProductGalleryFullscreen.css'

type Props = {
  open: boolean
  images: string[]
  initialIndex?: number
  alt: string
  categoryId?: MarketplaceCategoryId | string
  onClose: () => void
}

/**
 * Fullscreen image viewer with horizontal swipe and a 4-thumbnail strip
 * at the bottom-left (Zara reference). Tap thumb to jump; swipe to scroll.
 */
export function ProductGalleryFullscreen({
  open,
  images,
  initialIndex = 0,
  alt,
  categoryId,
  onClose,
}: Props) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(initialIndex)

  useEffect(() => {
    if (!open) return
    setActive(initialIndex)
    // Jump to initial slide once rendered
    requestAnimationFrame(() => {
      const rail = railRef.current
      if (rail) rail.scrollLeft = rail.clientWidth * initialIndex
    })
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, initialIndex, onClose])

  useEffect(() => {
    if (!open) return
    const rail = railRef.current
    if (!rail) return
    function onScroll() {
      const idx = Math.round(rail!.scrollLeft / rail!.clientWidth)
      setActive(Math.max(0, Math.min(images.length - 1, idx)))
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [open, images.length])

  if (!open) return null

  const slides = images.length > 0 ? images : [undefined]

  function jumpTo(i: number) {
    const rail = railRef.current
    if (rail) rail.scrollTo({ left: rail.clientWidth * i, behavior: 'smooth' })
  }

  return (
    <div className="gallery-fs" role="dialog" aria-modal="true">
      <button type="button" className="gallery-fs__close" onClick={onClose} aria-label="Закрити">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="gallery-fs__rail" ref={railRef}>
        {slides.map((src, i) => (
          <div key={i} className="gallery-fs__slide">
            <ProductImage src={src} alt={alt} categoryId={categoryId} />
          </div>
        ))}
      </div>

      {/* Thumbnails bottom-left */}
      {images.length > 1 && (
        <div className="gallery-fs__thumbs" aria-label="Slides">
          {images.slice(0, 4).map((src, i) => (
            <button
              key={i}
              type="button"
              className={`gallery-fs__thumb ${active === i ? 'gallery-fs__thumb--active' : ''}`}
              onClick={() => jumpTo(i)}
              aria-label={`Слайд ${i + 1}`}
            >
              <ProductImage src={src} alt={alt} categoryId={categoryId} />
            </button>
          ))}
          {images.length > 4 && (
            <span className="gallery-fs__thumb gallery-fs__thumb--more">+{images.length - 4}</span>
          )}
        </div>
      )}

      {/* Counter top-right */}
      <span className="gallery-fs__counter">{active + 1}/{images.length}</span>
    </div>
  )
}
