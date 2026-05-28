import { useEffect, useRef, useState } from 'react'
import { ProductImage } from '../ProductImage/ProductImage'
import './ProductImageSlider.css'

type Props = {
  /** Ordered list of photo URLs. First entry is the hero (same one used
   *  when only a single image is available). */
  images: string[]
  alt: string
  /** Category — passed through to ProductImage for placeholder routing. */
  categoryId?: string
  /** Click on a slide. Catalog uses this to navigate to product page;
   *  the slider intentionally fires the click ONLY when the gesture is
   *  a tap (not a swipe), so finger-drag through photos never triggers
   *  an accidental navigation. */
  onTap?: () => void
}

/**
 * Horizontal photo carousel for catalog cards. Native scroll-snap on the
 * rail, no JS-driven scroll animation — feels instant on touch.
 * Pagination dots track the rail's scroll position; tap navigates to the
 * product page; drag pages through photos.
 */
export function ProductImageSlider({ images, alt, categoryId, onTap }: Props) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Track scroll position → which slide is centered. Throttled via rAF
  // so we don't thrash state during a fast swipe.
  useEffect(() => {
    const rail = railRef.current
    if (!rail || images.length <= 1) return
    let raf = 0
    function update() {
      if (!rail) return
      const idx = Math.round(rail.scrollLeft / rail.clientWidth)
      setActiveIdx(Math.max(0, Math.min(images.length - 1, idx)))
    }
    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      rail.removeEventListener('scroll', onScroll)
    }
  }, [images.length])

  // Distinguish tap vs swipe: tap = pointer moves <8px between down/up.
  // Anything bigger is a drag and we suppress the click → navigate.
  const downX = useRef<number | null>(null)
  const downY = useRef<number | null>(null)

  function onPointerDown(e: React.PointerEvent) {
    downX.current = e.clientX
    downY.current = e.clientY
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!onTap) return
    if (downX.current == null || downY.current == null) return
    const dx = Math.abs(e.clientX - downX.current)
    const dy = Math.abs(e.clientY - downY.current)
    if (dx < 8 && dy < 8) onTap()
  }

  // Fallback: when product has 0 or 1 photo we render a single still
  // image without any swipe machinery. Keeps the simple case simple.
  if (images.length <= 1) {
    return (
      <button
        type="button"
        className="product-slider__single"
        onClick={onTap}
        aria-label={alt}
      >
        <ProductImage src={images[0]} alt={alt} categoryId={categoryId} />
      </button>
    )
  }

  return (
    <div className="product-slider">
      <div
        className="product-slider__rail"
        ref={railRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {images.map((src, i) => (
          <div key={i} className="product-slider__slide">
            <ProductImage src={src} alt={alt} categoryId={categoryId} />
          </div>
        ))}
      </div>
      <div className="product-slider__dots" aria-hidden="true">
        {(() => {
          // Sliding-window dot strip — Instagram/Snap pattern. Capped at
          // MAX_DOTS visible at once; window slides as the user swipes so
          // the active dot stays roughly centered. Dots that border more
          // off-screen photos shrink ("edge fade") so the viewer
          // intuitively reads "there's more in that direction".
          const MAX_DOTS = 7
          const total = images.length
          const half = Math.floor(MAX_DOTS / 2)
          let start = total <= MAX_DOTS ? 0 : Math.max(0, Math.min(activeIdx - half, total - MAX_DOTS))
          const end = Math.min(start + MAX_DOTS, total)
          const visible: number[] = []
          for (let i = start; i < end; i++) visible.push(i)

          return visible.map((i, posInWindow) => {
            const isFirstVisible = posInWindow === 0
            const isLastVisible = posInWindow === visible.length - 1
            const hasMoreLeft = start > 0
            const hasMoreRight = end < total
            const isEdgeShrink =
              (isFirstVisible && hasMoreLeft) ||
              (isLastVisible && hasMoreRight)
            return (
              <span
                key={i}
                className={[
                  'product-slider__dot',
                  i === activeIdx && 'product-slider__dot--active',
                  isEdgeShrink && 'product-slider__dot--edge',
                ].filter(Boolean).join(' ')}
              />
            )
          })
        })()}
      </div>
    </div>
  )
}
