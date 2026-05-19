import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { ProductCard } from '../../../product/ui/ProductCard/ProductCard'
import { ProductImage } from '../../../product/ui/ProductImage/ProductImage'
import { quickAdd, useQuickAdd } from '../../model/quickAddStore'
import { cart } from '../../../cart/model/cartStore'
import { favorites, useIsFavorite } from '../../../favorites/model/favoritesStore'
import { formatPrice } from '../../../../entities/product/model/product.types'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ROUTES } from '../../../../shared/config/routes'
import './QuickAddSheet.css'

const AUTO_CLOSE_MS = 5000

/** Returns a label like "225-45-17" for tires, or the product's subtitle
 *  (cleaned), or "ОДИН РОЗМІР" when nothing useful is available. */
function variantLabel(p: MarketplaceProduct): string {
  const w = p.attributes.find((a) => a.key === 'width')?.value
  const pr = p.attributes.find((a) => a.key === 'profile')?.value
  const d = p.attributes.find((a) => a.key === 'diameter')?.value
  if (w != null && pr != null && d != null) return `${w}-${pr}-${d}`
  const sub = p.subtitle?.split('·')[0]?.trim()
  return sub && sub.length > 0 ? sub : 'ОДИН РОЗМІР'
}

export function QuickAddSheet() {
  const target = useQuickAdd()
  const open = target !== null
  // Persist target across closing animation; using the latest non-null target.
  const lastTarget = useRef(target)
  if (target) lastTarget.current = target
  const current = target ?? lastTarget.current

  return (
    <BottomSheet open={open} onClose={() => quickAdd.close()} maxHeightPct={88}>
      {current && <QuickAddBody key={current.product.id} state={current} />}
    </BottomSheet>
  )
}

function QuickAddBody({ state }: { state: { product: MarketplaceProduct; pool: MarketplaceProduct[] } }) {
  const { product, pool } = state
  const [phase, setPhase] = useState<'select' | 'added'>('select')
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const isFav = useIsFavorite(product.id)
  const navigate = useNavigate()

  // Siblings = same title, including current. De-duped by variant label so
  // we don't render two rows for the same size.
  const variants = useMemo(() => {
    const siblings = pool.filter((p) => p.title === product.title)
    const list = siblings.length > 0 ? siblings : [product]
    const seen = new Set<string>()
    const out: { label: string; product: MarketplaceProduct }[] = []
    for (const p of list) {
      const label = variantLabel(p)
      if (seen.has(label)) continue
      seen.add(label)
      out.push({ label, product: p })
    }
    return out
  }, [pool, product])

  // Recommendations for phase 2: up to 6 products from the same category,
  // excluding the chosen one.
  const recs = useMemo(() => {
    const same = pool.filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    return same.slice(0, 18)
  }, [pool, product])

  function handlePickSize(size: string, sized: MarketplaceProduct) {
    setSelectedSize(size)
    cart.add({
      productId: sized.id,
      title: sized.title,
      subtitle: sized.subtitle,
      image: sized.image,
      price: sized.price?.value,
      currency: sized.price?.currency,
      variant: size,
      qty,
      stock: sized.stock,
    })
    setPhase('added')
  }

  if (phase === 'select') {
    return (
      <div className="quick-add">
        <div className="quick-add__qty" role="group" aria-label="Кількість">
          <button
            type="button"
            className="quick-add__qty-btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Зменшити"
            disabled={qty <= 1}
          >−</button>
          <span className="quick-add__qty-value">{qty}</span>
          <button
            type="button"
            className="quick-add__qty-btn"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Збільшити"
          >+</button>
        </div>

        <ul className="quick-add__sizes">
          {variants.map(({ label, product: p }) => (
            <li key={p.id}>
              <button
                type="button"
                className="quick-add__size"
                onClick={() => handlePickSize(label, p)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="quick-add__fav"
          onClick={() => favorites.toggle(product.id)}
          aria-pressed={isFav}
        >
          <span>{isFav ? 'У ЗАКЛАДКАХ' : 'ДОДАТИ В ЗАКЛАДКИ'}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill={isFav ? 'currentColor' : 'none'}
            className={`quick-add__bookmark ${isFav ? 'quick-add__bookmark--active' : ''}`}
          >
            <path
              d="M6 6h12v12L12 14.5L6 18Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    )
  }

  // Phase 2: confirmation with recommendations.
  return (
    <AddedConfirmation
      product={product}
      size={selectedSize ?? ''}
      recs={recs}
      onView={() => {
        quickAdd.close()
        navigate(ROUTES.CART)
      }}
    />
  )
}

function AddedConfirmation({
  product,
  size,
  recs,
  onView,
}: {
  product: MarketplaceProduct
  size: string
  recs: MarketplaceProduct[]
  onView: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    const id = window.setTimeout(() => {
      if (!cancelled.current) quickAdd.close()
    }, AUTO_CLOSE_MS)
    const el = scrollerRef.current
    // Any user interaction with the sheet cancels the auto-close: scroll,
    // touch, pointer, click, wheel, keyboard. Once cancelled, the listeners
    // are removed so we don't keep handling events for nothing.
    const events = ['scroll', 'touchstart', 'pointerdown', 'wheel', 'keydown'] as const
    function killTimer() {
      cancelled.current = true
      window.clearTimeout(id)
      events.forEach((e) => el?.removeEventListener(e, killTimer))
    }
    events.forEach((e) => el?.addEventListener(e, killTimer, { passive: true }))
    return () => {
      cancelled.current = true
      window.clearTimeout(id)
      events.forEach((e) => el?.removeEventListener(e, killTimer))
    }
  }, [])

  return (
    <div className="quick-add added" ref={scrollerRef}>
      <div className="added__top">
        <span className="added__status">ДОДАНО В КОРЗИНУ</span>
        <button type="button" className="added__view" onClick={onView}>
          ПЕРЕГЛЯНУТИ
        </button>
      </div>

      <div className="added__product">
        <div className="added__thumb">
          <ProductImage src={product.image} alt={product.title} categoryId={product.categoryId} />
        </div>
        <div className="added__meta">
          <div className="added__title">{product.title}</div>
          <div className="added__variant">{size}</div>
          {product.price && (
            <div className="added__price">{formatPrice(product.price)}</div>
          )}
        </div>
      </div>

      {recs.length > 0 && (
        <>
          <h3 className="added__recs-title">ВАС ТАКОЖ МОЖЕ ЗАЦІКАВИТИ</h3>
          <div className="added__recs catalog-grid catalog-grid--cols-3">
            {recs.map((p) => (
              <ProductCard key={p.id} product={p} pool={recs} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
