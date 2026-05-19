import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockProducts } from '../../data/mockProducts'
import { mockTires } from '../../data/mockTires'
import { formatPrice } from '../../entities/product/model/product.types'
import { ProductGallery } from '../../features/product/ui/ProductGallery/ProductGallery'
import { ProductGalleryFullscreen } from '../../features/product/ui/ProductGalleryFullscreen/ProductGalleryFullscreen'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { cart } from '../../features/cart/model/cartStore'
import { AddedToCartSheet } from '../../features/cart/ui/AddedToCartSheet/AddedToCartSheet'
import { StatusBadge } from '../../shared/ui/StatusBadge/StatusBadge'
import { Button } from '../../shared/ui/Button/Button'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { StickyCTA } from '../../shared/ui/StickyCTA/StickyCTA'
import { ExpandableSection } from '../../shared/ui/ExpandableSection/ExpandableSection'
import { PlaceholderImage } from '../../shared/ui/PlaceholderImage/PlaceholderImage'
import { NovaPoshtaDelivery, type NovaPoshtaSelection } from '../../shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'
import { FavoriteButton } from '../../features/favorites/ui/FavoriteButton/FavoriteButton'
import { ProductCard } from '../../features/product/ui/ProductCard/ProductCard'
import { StarRating } from '../../shared/ui/StarRating/StarRating'
import { ReviewsSection } from '../../features/reviews/ui/ReviewsSection/ReviewsSection'
import { QASection } from '../../features/reviews/ui/QASection/QASection'
import { DeliveryEstimate } from '../../features/delivery/ui/DeliveryEstimate/DeliveryEstimate'
import { StockIndicator } from '../../features/product/ui/StockIndicator/StockIndicator'
import { SocialProof } from '../../features/product/ui/SocialProof/SocialProof'
import { SellerBadge } from '../../features/seller/ui/SellerBadge/SellerBadge'
import { BundleSection } from '../../features/bundles/ui/BundleSection/BundleSection'
import { getRatingFor } from '../../data/mockReviews'
import { Skeleton } from '../../shared/ui/Skeleton/Skeleton'
import { REQUEST_PATHS, ROUTES } from '../../shared/config/routes'
import './ProductPage.css'

/** Five placeholder tiles stacked vertically (1 per row) — the reference
 *  product card style: one big hero + five identical secondary frames. */
const PHOTO_PLACEHOLDERS = [
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
]

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const live = useEfpfProducts()
  const [qty, setQty] = useState(1)
  const [delivery, setDelivery] = useState<NovaPoshtaSelection | undefined>()
  const [added, setAdded] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState<number | null>(null)
  const [ctaCompact, setCtaCompact] = useState(false)
  const [ctaHidden, setCtaHidden] = useState(false)
  // Chain of product IDs the user has viewed in this session. Used to
  // exclude already-seen items from the "Вас також може зацікавити" block
  // so the user isn't bounced between the same 3-4 products.
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem('mp:viewedProducts')
      return new Set<string>(raw ? JSON.parse(raw) : [])
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    if (!productId) return
    setViewedIds((prev) => {
      if (prev.has(productId)) return prev
      const next = new Set(prev)
      next.add(productId)
      try {
        sessionStorage.setItem('mp:viewedProducts', JSON.stringify([...next]))
      } catch {}
      return next
    })
  }, [productId])
  const heroRef = useRef<HTMLDivElement | null>(null)
  const recsSecondRowRef = useRef<HTMLDivElement | null>(null)
  // Show the "back to top" fab once the user has scrolled past the hero.
  // Tracking via the same .screen-container scroll listener pattern.
  const [showTopFab, setShowTopFab] = useState(false)
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const scroller = (el.closest('.screen-container') as HTMLElement | null) ?? window
    function check() {
      const y = scroller instanceof Window ? window.scrollY : (scroller as HTMLElement).scrollTop
      setShowTopFab(y > 600)
    }
    check()
    scroller.addEventListener('scroll', check, { passive: true })
    return () => scroller.removeEventListener('scroll', check)
  }, [])

  function scrollToTop() {
    const scroller = (heroRef.current?.closest('.screen-container') as HTMLElement | null)
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Watch the hero (1st photo): once ≥20% of it has scrolled out of view
  // (i.e., visible ratio drops below 80%), collapse the sticky CTA. Hides
  // the title, shrinks the button, docks price to the right.
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setCtaCompact(entry.intersectionRatio < 0.8),
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Hide the sticky CTA entirely once the 2nd row of recs becomes visible —
  // by then the user is browsing other products and the bar would block them.
  useEffect(() => {
    const el = recsSecondRowRef.current
    if (!el) return
    // Hide whenever the 2nd row's top has crossed below the viewport bottom
    // (i.e. user has scrolled to where the row starts becoming visible) and
    // keep it hidden while scrolling further down. Reappear once the row
    // returns below the fold. A scroll listener is more reliable than
    // IntersectionObserver alone for "after" transitions.
    // The page scrolls inside ScreenContainer, not window. Listen on that
    // ancestor (fall back to window if not found).
    const scroller =
      (el!.closest('.screen-container') as HTMLElement | null) ?? window
    function update() {
      const top = el!.getBoundingClientRect().top
      setCtaHidden(top < window.innerHeight)
    }
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    return () => scroller.removeEventListener('scroll', update)
  }, [])

  const product =
    live.data?.find((p) => p.id === productId) ??
    mockProducts.find((p) => p.id === productId) ??
    mockTires.find((p) => p.id === productId)

  if (live.loading && !product) {
    return (
      <>
        <Header title="" showBack />
        <ScreenContainer withTopInset={false}>
          <div className="product-page__skeleton">
            <Skeleton height={360} />
            <div style={{ padding: '16px' }}>
              <Skeleton height={18} width="70%" />
              <div style={{ height: 8 }} />
              <Skeleton height={14} width="40%" />
              <div style={{ height: 24 }} />
              <Skeleton height={22} width="35%" />
              <div style={{ height: 24 }} />
              <Skeleton height={48} width="100%" />
            </div>
          </div>
        </ScreenContainer>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header title="Товар не знайдено" showBack />
        <ScreenContainer withTopInset={false}>
          <div className="product-page__not-found">
            <p>Такого товару не існує.</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.CATALOG)}>
              До каталогу
            </Button>
          </div>
        </ScreenContainer>
      </>
    )
  }

  const hasPrice = product.price?.value !== undefined
  void delivery // captured in state; will be submitted at checkout

  // Attributes split: card-visible "short" specs vs the long detail set.
  const detailSpecs = product.attributes
    .filter((a) => a.visibleInDetails !== false)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))

  function handleAddToCart() {
    if (!product) return
    if (product.stock === 0) return // CTA in render swaps to "ПОВІДОМИТИ" when OOS.
    cart.add({
      productId: product.id,
      title: product.title,
      subtitle: product.subtitle,
      image: product.image,
      price: product.price?.value,
      currency: product.price?.currency,
      qty,
      stock: product.stock,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
    setSheetOpen(true)
  }

  const galleryImages = [product.image, ...(product.gallery ?? [])].filter(Boolean) as string[]

  return (
    <>
      <Header title={product.title} showBack />
      <ScreenContainer withTopInset={false}>
        <div ref={heroRef} className="product-page__hero">
          {galleryImages.length > 0 ? (
            <ProductGallery
              images={galleryImages}
              alt={product.title}
              categoryId={product.categoryId}
              aspectRatio="3 / 4"
              onSlideClick={(i) => setFullscreen(i)}
              className="product-page__gallery"
            />
          ) : (
            <PlaceholderImage
              size="1248 × 1664"
              caption={product.title}
              aspectRatio="3 / 4"
              className="product-page__hero-placeholder"
            />
          )}
        </div>

        <div className="product-page__content">
          {/* Title row */}
          <div className="product-page__title-row">
            <div>
              <h1 className="product-page__title">{product.title}</h1>
              {product.subtitle && (
                <p className="product-page__subtitle">{product.subtitle}</p>
              )}
              <div className="product-page__rating-row">
                <StarRating
                  rating={getRatingFor(product.id).average}
                  showValue
                  count={getRatingFor(product.id).count}
                  size={13}
                />
              </div>
            </div>
            <div className="product-page__title-actions">
              {product.status && <StatusBadge status={product.status} />}
              <FavoriteButton productId={product.id} />
              <button
                type="button"
                className="product-page__share"
                aria-label="Поділитися"
                onClick={() => {
                  const url = window.location.href
                  const shareData: { title?: string; text?: string; url: string } = {
                    title: product.title,
                    text: product.subtitle,
                    url,
                  }
                  const nav = navigator as Navigator & {
                    share?: (data: ShareData) => Promise<void>
                  }
                  if (typeof nav.share === 'function') {
                    nav.share(shareData).catch(() => {})
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).catch(() => {})
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 9V5l7 7-7 7v-4H8c-2.2 0-4 1.8-4 4V18c0-4.4 3.6-8 8-8h2z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Seller + stock + social proof */}
          <div className="product-page__trust">
            <SellerBadge sellerId={product.sellerId} />
            <StockIndicator productId={product.id} stock={product.stock} size="md" />
          </div>

          <SocialProof productId={product.id} />

          {/* Delivery estimate */}
          <div className="product-page__delivery">
            <DeliveryEstimate categoryId={product.categoryId} />
          </div>

          {/* Description right under the title (Zara pattern). */}
          {product.description && (
            <p className="product-page__desc">{product.description}</p>
          )}

          {/* Badges row */}
          {product.badges && product.badges.length > 0 && (
            <div className="product-page__badges">
              {product.badges.map((badge) => (
                <span key={badge} className="product-page__badge">{badge}</span>
              ))}
            </div>
          )}
        </div>

        {/* 6-tile photo placeholder strip (reference look). */}
        <section className="product-page__photos" aria-label="Фотографії">
          {PHOTO_PLACEHOLDERS.map((p, i) => (
            <PlaceholderImage
              key={i}
              size={p.size}
              aspectRatio={p.ratio}
              caption={`${product.title.toUpperCase()} · ${i + 1}`}
            />
          ))}
        </section>

        {/* Spec table */}
        {detailSpecs.length > 0 && (
          <div className="product-page__section">
            <h2 className="product-page__section-title">ХАРАКТЕРИСТИКИ</h2>
            <dl className="product-page__spec">
              {detailSpecs.map((a) => (
                <SpecRow
                  key={a.key}
                  label={a.label}
                  value={`${a.value}${a.unit ? ` ${a.unit}` : ''}`}
                />
              ))}
            </dl>
          </div>
        )}

        {/* Zara-style expandable sections */}
        <div className="product-page__accordion">
          <ExpandableSection title="КОМПОЗИЦІЯ ТА ДОГЛЯД">
            <p>
              Виробник вказує склад на пакуванні. Дотримуйтесь рекомендацій для
              зберігання та обслуговування — це продовжить термін експлуатації.
            </p>
          </ExpandableSection>

          <ExpandableSection title="ДОСТАВКА ТА ПОВЕРНЕННЯ">
            <p>
              Доставка Новою Поштою або кур’єром по Україні. Безкоштовне
              повернення протягом 14 днів за умови збереження товарного вигляду
              та оригінального пакування.
            </p>
          </ExpandableSection>

          <ExpandableSection title="ГАРАНТІЯ">
            <p>
              Офіційна гарантія виробника. Гарантійні випадки розглядаються
              згідно з умовами, наданими в комплекті з товаром.
            </p>
          </ExpandableSection>

          {hasPrice && (
            <ExpandableSection title="ДОСТАВКА У ВАШЕ МІСТО">
              <NovaPoshtaDelivery value={delivery} onChange={setDelivery} label="" />
            </ExpandableSection>
          )}

        </div>

        {/* Bundle deals */}
        {(() => {
          const allCat = [...(live.data ?? []), ...mockProducts, ...mockTires].filter(
            (p) => p.categoryId === product.categoryId,
          )
          const dedup = new Map<string, typeof allCat[number]>()
          for (const p of allCat) if (!dedup.has(p.id)) dedup.set(p.id, p)
          return <BundleSection current={product} pool={[...dedup.values()]} />
        })()}

        {/* Reviews + Q&A */}
        <ReviewsSection productId={product.id} />
        <QASection productId={product.id} />

        {/* "ВАС ТАКОЖ МОЖЕ ЗАЦІКАВИТИ" — 3-column grid of same-category items. */}
        {(() => {
          const sameCatRaw = [...(live.data ?? []), ...mockProducts, ...mockTires].filter(
            (p) =>
              p.categoryId === product.categoryId &&
              p.id !== product.id &&
              !viewedIds.has(p.id),
          )
          // Dedupe by id — live API and mock fixtures can share entries.
          const sameCatById = new Map<string, typeof sameCatRaw[number]>()
          for (const p of sameCatRaw) if (!sameCatById.has(p.id)) sameCatById.set(p.id, p)
          const sameCat = [...sameCatById.values()]
          if (sameCat.length === 0) return null
          return (
            <section className="product-page__recs" aria-label="Вас також може зацікавити">
              <h3 className="product-page__recs-title">ВАС ТАКОЖ МОЖЕ ЗАЦІКАВИТИ</h3>
              <div className="product-page__recs-grid catalog-grid catalog-grid--cols-3">
                {sameCat.map((p, i) => (
                  <div
                    key={p.id}
                    ref={i === 3 ? recsSecondRowRef : undefined}
                  >
                    <ProductCard product={p} pool={sameCat} />
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {/* Sticky CTA: two equal-width buttons + always-visible price */}
        <StickyCTA className={ctaHidden ? 'sticky-cta--hidden' : ''}>
          <div className={`product-page__cta ${ctaCompact ? 'product-page__cta--compact' : ''}`}>
            <div className="product-page__cta-info" aria-hidden={ctaCompact}>
              <span className="product-page__cta-title">{product.title}</span>
              {product.price && (
                <div className="product-page__cta-meta">
                  <div className="product-page__cta-qty" role="group" aria-label="Кількість">
                    <button
                      type="button"
                      className="product-page__cta-qty-btn"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Зменшити"
                      disabled={qty <= 1}
                    >−</button>
                    <span className="product-page__cta-qty-value">{qty}</span>
                    <button
                      type="button"
                      className="product-page__cta-qty-btn"
                      onClick={() => setQty((q) => Math.min(99, q + 1))}
                      aria-label="Збільшити"
                    >+</button>
                  </div>
                  <span className="product-page__cta-price">
                    {formatPrice({ ...product.price, value: (product.price.value ?? 0) * qty })}
                  </span>
                </div>
              )}
            </div>
            <div className="product-page__cta-row">
              {product.stock === 0 ? (
                // Out-of-stock — channel the user into the stock-notify
                // sheet rendered by StockIndicator instead of letting the
                // cart accept a phantom add.
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => {
                    document
                      .querySelector<HTMLButtonElement>('.stock-ind--oos')
                      ?.click()
                  }}
                >
                  ПОВІДОМИТИ КОЛИ З'ЯВИТЬСЯ
                </Button>
              ) : hasPrice ? (
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={handleAddToCart}
                >
                  {added ? 'ДОДАНО' : 'ДОДАТИ'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={() => navigate(`${REQUEST_PATHS.QUOTE}/${product.id}`)}
                >
                  ЗАПИТАТИ
                </Button>
              )}
              {product.price && (
                <span
                  className="product-page__cta-price-inline"
                  aria-hidden={!ctaCompact}
                >
                  {formatPrice({ ...product.price, value: (product.price.value ?? 0) * qty })}
                </span>
              )}
            </div>
          </div>
        </StickyCTA>

        {/* Back-to-top fab — only after user has scrolled past the hero.
            Positioned above the StickyCTA so it doesn't overlap. */}
        {showTopFab && (
          <button
            type="button"
            className="product-page__top-fab"
            onClick={scrollToTop}
            aria-label="Нагору"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </ScreenContainer>

      <AddedToCartSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        product={product}
        allProducts={live.data ?? []}
        qty={qty}
      />

      <ProductGalleryFullscreen
        open={fullscreen !== null}
        images={galleryImages}
        initialIndex={fullscreen ?? 0}
        alt={product.title}
        categoryId={product.categoryId}
        onClose={() => setFullscreen(null)}
      />
    </>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="product-page__spec-label">{label}</dt>
      <dd className="product-page__spec-value">{value}</dd>
    </>
  )
}
