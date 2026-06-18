import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockProducts } from '../../data/mockProducts'
import { mockTires } from '../../data/mockTires'
import { formatPrice } from '../../entities/product/model/product.types'
import { ProductGallery } from '../../features/product/ui/ProductGallery/ProductGallery'
import { ProductGalleryFullscreen } from '../../features/product/ui/ProductGalleryFullscreen/ProductGalleryFullscreen'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { cart } from '../../features/cart/model/cartStore'
import { showCartToast } from '../../features/cart/ui/CartToast/bus'
import { Button } from '../../shared/ui/Button/Button'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { StickyCTA } from '../../shared/ui/StickyCTA/StickyCTA'
import { ExpandableSection } from '../../shared/ui/ExpandableSection/ExpandableSection'
import { PlaceholderImage } from '../../shared/ui/PlaceholderImage/PlaceholderImage'
import { NovaPoshtaDelivery, type NovaPoshtaSelection } from '../../shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'
import { FavoriteButton } from '../../features/favorites/ui/FavoriteButton/FavoriteButton'
import { StarRating } from '../../shared/ui/StarRating/StarRating'
import { ReviewsSection } from '../../features/reviews/ui/ReviewsSection/ReviewsSection'
import { QASection } from '../../features/reviews/ui/QASection/QASection'
import { DeliveryEstimate } from '../../features/delivery/ui/DeliveryEstimate/DeliveryEstimate'
import { StockIndicator } from '../../features/product/ui/StockIndicator/StockIndicator'
import { SocialProof } from '../../features/product/ui/SocialProof/SocialProof'
import { SellerBadge } from '../../features/seller/ui/SellerBadge/SellerBadge'
import { RecsTabs } from '../../features/product/ui/RecsTabs/RecsTabs'
import { ProductTabs, type ProductTabId } from '../../features/product/ui/ProductTabs/ProductTabs'
import { Icon } from '../../shared/ui/Icon/Icon'
import { useGoBack } from '../../shared/lib/useGoBack'
import { CarReservationSheet } from '../../features/car-reservation/ui/CarReservationSheet/CarReservationSheet'
import { useAutoCarPhotos } from '../../features/auto/hooks/useAutoCarPhotos'
import { SALES_PHONE_TEL } from '../../shared/config/contacts'
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
  const [descOpen, setDescOpen] = useState(false)
  const goBack = useGoBack(ROUTES.MARKETPLACE)
  const [activeTab, setActiveTab] = useState<ProductTabId>('description')
  const descSecRef = useRef<HTMLDivElement>(null)
  const specsSecRef = useRef<HTMLDivElement>(null)
  const reviewsSecRef = useRef<HTMLDivElement>(null)
  const spyLockRef = useRef(false)
  const spyTimerRef = useRef<number | undefined>(undefined)
  const [delivery, setDelivery] = useState<NovaPoshtaSelection | undefined>()
  const [added, setAdded] = useState(false)
  const [reserveOpen, setReserveOpen] = useState(false)
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
  // The fab doubles as a depth gauge — black fills from the bottom in lock
  // step with the scroll position. To keep the fill perfectly synced with
  // the finger, the percentage is written straight to a CSS custom
  // property via a ref (no React re-render per frame). Only the
  // boolean "should we even show the fab" goes through state.
  const [showTopFab, setShowTopFab] = useState(false)
  const fabRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const scroller = (el.closest('.screen-container') as HTMLElement | null) ?? window
    let visible = false
    function check() {
      let y: number
      let max: number
      if (scroller instanceof Window) {
        y = window.scrollY
        max = document.documentElement.scrollHeight - window.innerHeight
      } else {
        const s = scroller as HTMLElement
        y = s.scrollTop
        max = s.scrollHeight - s.clientHeight
      }
      const shouldShow = y > 600
      if (shouldShow !== visible) {
        visible = shouldShow
        setShowTopFab(shouldShow)
      }
      const pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0
      if (fabRef.current) {
        fabRef.current.style.setProperty('--fab-fill', `${pct}%`)
      }
    }
    check()
    scroller.addEventListener('scroll', check, { passive: true })
    return () => scroller.removeEventListener('scroll', check)
  }, [showTopFab, live.data])

  function scrollToTop() {
    const scroller = (heroRef.current?.closest('.screen-container') as HTMLElement | null)
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Scroll-spy: as each section reaches the sticky tab bar, move the active
  // underline to it. Tapping a tab scrolls that section up to the bar.
  const sectionRefs: Record<ProductTabId, React.RefObject<HTMLDivElement | null>> = {
    description: descSecRef,
    specs: specsSecRef,
    reviews: reviewsSecRef,
  }

  function goToSection(id: ProductTabId) {
    setActiveTab(id)
    // Lock the scroll-spy while the smooth scroll runs — otherwise the scroll
    // handler recomputes the active tab from intermediate positions and the
    // underline snaps back until the scroll settles.
    spyLockRef.current = true
    if (spyTimerRef.current) window.clearTimeout(spyTimerRef.current)
    spyTimerRef.current = window.setTimeout(() => {
      spyLockRef.current = false
    }, 600)
    const scroller = heroRef.current?.closest('.screen-container') as HTMLElement | null
    const el = sectionRefs[id].current
    if (!scroller || !el) return
    const tabsEl = scroller.querySelector('.product-tabs') as HTMLElement | null
    const offset = tabsEl ? tabsEl.getBoundingClientRect().height : 48
    const top =
      scroller.scrollTop + el.getBoundingClientRect().top - scroller.getBoundingClientRect().top - offset
    scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  useEffect(() => {
    const scroller = heroRef.current?.closest('.screen-container') as HTMLElement | null
    if (!scroller) return
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (spyLockRef.current) return
        const tabsEl = scroller!.querySelector('.product-tabs') as HTMLElement | null
        // The line just below the sticky tab bar — sections crossing it win.
        const probe = (tabsEl?.getBoundingClientRect().bottom ?? 0) + 1
        const order: ProductTabId[] = ['description', 'specs', 'reviews']
        let current: ProductTabId = 'description'
        for (const id of order) {
          const el = sectionRefs[id].current
          if (el && el.getBoundingClientRect().top <= probe) current = id
        }
        setActiveTab((prev) => (prev === current ? prev : current))
      })
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
    // Re-attach once product data loads and the hero/sections actually mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.data])

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
    // Re-attach once product data loads and the hero actually mounts.
  }, [live.data])

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
    // Re-attach once product data loads and the recs row actually mounts.
  }, [live.data])

  const product =
    live.data?.find((p) => p.id === productId) ??
    mockProducts.find((p) => p.id === productId) ??
    mockTires.find((p) => p.id === productId)

  // Cars come from the Lubeavto list endpoint with just 1 photo each.
  // Lazy-fetch the detail endpoint to backfill the full gallery.
  // MUST run before any early return so hook order stays stable across
  // renders (rules-of-hooks). Guarded by `enabled` so non-car / missing
  // products skip the network call entirely.
  const carPhotos = useAutoCarPhotos(product?.id, product?.categoryId === 'cars')

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

  // A real, buyable price is a positive number. A 0/undefined value (e.g.
  // "Ціна за запитом" services) routes to the quote flow instead of letting
  // the user check out a 0 ₴ order.
  const hasPrice = typeof product.price?.value === 'number' && product.price.value > 0
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
    // Phone-style push toast at the top instead of the bottom sheet.
    showCartToast({ title: product.title, image: product.image })
  }

  /** Express path — add to cart and jump straight to /checkout. Skips the
   *  AddedToCartSheet because the user is already committing to buy. */
  function handleBuyNow() {
    if (!product) return
    if (product.stock === 0) return
    // Quick buy — a single product, NOT added to the cart. Checkout opens in
    // "buy now" mode showing only this item.
    navigate(ROUTES.CHECKOUT, {
      state: {
        buyNow: {
          productId: product.id,
          title: product.title,
          subtitle: product.subtitle,
          image: product.image,
          price: product.price?.value,
          currency: product.price?.currency,
          qty,
          stock: product.stock,
        },
      },
    })
  }

  const galleryImages = (() => {
    const fromProduct = [product.image, ...(product.gallery ?? [])].filter(Boolean) as string[]
    if (product.categoryId === 'cars' && carPhotos && carPhotos.length > fromProduct.length) {
      return carPhotos
    }
    return fromProduct
  })()

  return (
    <>
      {/* Top bar — round back button + divider; same height across pages. */}
      <div className="product-page__bar">
        <button
          type="button"
          className="product-page__back"
          onClick={goBack}
          aria-label="Назад"
        >
          <Icon name="arrow_back" size={24} />
        </button>
      </div>

      <ScreenContainer withTopInset={false}>
        <div ref={heroRef} className="product-page__hero">
          {galleryImages.length > 0 ? (
            <ProductGallery
              images={galleryImages}
              alt={product.title}
              categoryId={product.categoryId}
              /* Cars use a 4:3 landscape ratio because Lubeavto delivers
                 wide source photos and they should show the whole car;
                 everything else is square. */
              aspectRatio={product.categoryId === 'cars' ? '4 / 3' : '1 / 1'}
              onSlideClick={(i) => setFullscreen(i)}
              className="product-page__gallery"
            />
          ) : (
            <PlaceholderImage
              size="1248 × 1664"
              caption={product.title}
              aspectRatio={product.categoryId === 'cars' ? '4 / 3' : '1 / 1'}
              className="product-page__hero-placeholder"
            />
          )}
          {/* Favorite heart — standard top-right corner of the photo. */}
          <div className="product-page__hero-fav">
            <FavoriteButton productId={product.id} />
          </div>
        </div>

        <div className="product-page__content">
          {/* Title — full width */}
          <div className="product-page__title-row">
            <h1 className="product-page__title">{product.title}</h1>
            {product.subtitle && (
              <p className="product-page__subtitle">{product.subtitle}</p>
            )}
          </div>

          {/* Rating + share in one row. */}
          <div className="product-page__rating-share">
            <div className="product-page__rating-row">
              <StarRating
                rating={getRatingFor(product.id).average}
                showValue
                count={getRatingFor(product.id).count}
                size={13}
              />
            </div>
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


          {/* Seller + stock + social proof */}
          <div className="product-page__trust">
            <SellerBadge sellerId={product.sellerId} />
            <StockIndicator productId={product.id} stock={product.stock} size="md" />
          </div>

          <SocialProof productId={product.id} variant="compact" />

          {/* Delivery estimate */}
          <div className="product-page__delivery">
            <DeliveryEstimate categoryId={product.categoryId} />
          </div>
        </div>

        {/* Tabbed scope — the sticky tabs pin only while this block (Опис /
            Характеристики / Відгуки) is on screen, then scroll away so the
            recommendations below get the top to themselves. */}
        <div className="product-page__tabbed">
        {/* Sticky section tabs — first child of the tabbed scope. */}
        <ProductTabs active={activeTab} onChange={goToSection} />

        {/* Опис — collapsible so the wall of text doesn't dominate. */}
        {product.description && (
          <div ref={descSecRef} className="product-page__section">
            <p
              className={`product-page__desc ${
                descOpen ? '' : 'product-page__desc--clamped'
              }`}
            >
              {product.description}
            </p>
            <button
              type="button"
              className="product-page__desc-toggle"
              onClick={() => setDescOpen((o) => !o)}
            >
              {descOpen ? 'Згорнути' : 'Детальніше'}
            </button>

            {product.badges && product.badges.length > 0 && (
              <div className="product-page__badges">
                {product.badges.map((badge) => (
                  <span key={badge} className="product-page__badge">{badge}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Placeholder photo strip — only when the product has NO real
            imagery at all. With real photos (live EFPF / Lubeavto) the
            gallery above already shows them, so blank "PHOTO TBD" tiles
            would just look unfinished. */}
        {galleryImages.length === 0 && (
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
        )}

        {/* Spec table */}
        {detailSpecs.length > 0 && (
          <div ref={specsSecRef} className="product-page__section">
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

        {/* Reviews + Q&A */}
        <div ref={reviewsSecRef}>
          <ReviewsSection productId={product.id} />
          <QASection productId={product.id} />
        </div>
        </div>

        {/* Tabbed recommendations — replaces the old separate BundleSection
            and "ВАС ТАКОЖ МОЖЕ ЗАЦІКАВИТИ" grid. Yandex-style pills. */}
        {(() => {
          const allCat = [...(live.data ?? []), ...mockProducts, ...mockTires].filter(
            (p) => p.categoryId === product.categoryId,
          )
          const dedup = new Map<string, typeof allCat[number]>()
          for (const p of allCat) if (!dedup.has(p.id)) dedup.set(p.id, p)
          const pool = [...dedup.values()]
          const sameCat = pool.filter((p) => p.id !== product.id && !viewedIds.has(p.id))
          // Hook for the sticky-CTA hide-on-recs scroll listener — give it
          // a real DOM node to observe.
          return (
            <div ref={recsSecondRowRef}>
              <RecsTabs current={product} sameCat={sameCat} bundlePool={pool} />
            </div>
          )
        })()}

        {/* Sticky CTA: two equal-width buttons + always-visible price.
            Cars get a completely different bar — reserve / consult / call —
            because a one-tap $56k checkout doesn't match how people buy
            vehicles in the real world (Tesla / Xiaomi pattern). */}
        <StickyCTA className={ctaHidden ? 'sticky-cta--hidden' : ''}>
          {product.categoryId === 'cars' ? (
            <div className="product-page__cta product-page__cta--car">
              <div className="product-page__cta-info" aria-hidden={ctaCompact}>
                <span className="product-page__cta-title">{product.title}</span>
                {product.price && (
                  <span className="product-page__cta-price">{formatPrice(product.price)}</span>
                )}
              </div>
              <div className="product-page__cta-row product-page__cta-row--primary">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => setReserveOpen(true)}
                >
                  ЗАБРОНЮВАТИ
                </Button>
              </div>
              <div className="product-page__cta-row product-page__cta-row--car-actions">
                <Button
                  variant="outline"
                  fullWidth
                  size="md"
                  onClick={() => navigate(`${REQUEST_PATHS.QUOTE}/${product.id}`)}
                >
                  КОНСУЛЬТАЦІЯ
                </Button>
                <a className="btn btn--outline btn--md btn--full" href={SALES_PHONE_TEL}>
                  ПОДЗВОНИТИ
                </a>
              </div>
            </div>
          ) : (
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
            {/* Express buy — primary CTA that adds + opens checkout in one
             *  tap. Hidden in compact (collapsed) mode to keep that bar
             *  minimal, and skipped for OOS / no-price items. */}
            {product.stock !== 0 && hasPrice && (
              <div className="product-page__cta-row product-page__cta-row--primary">
                <Button variant="primary" fullWidth size="lg" onClick={handleBuyNow}>
                  КУПИТИ ОДРАЗУ
                </Button>
              </div>
            )}
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
                  {added ? 'ДОДАНО' : 'В КОШИК'}
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
          )}
        </StickyCTA>

        {/* Back-to-top fab — only after user has scrolled past the hero.
            Positioned above the StickyCTA so it doesn't overlap. */}
        {showTopFab && (
          <button
            ref={fabRef}
            type="button"
            className="product-page__top-fab"
            onClick={scrollToTop}
            aria-label="Нагору"
          >
            <span className="product-page__top-fab-fill" aria-hidden="true" />
            <svg
              className="product-page__top-fab-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </ScreenContainer>

      {product.categoryId === 'cars' && (
        <CarReservationSheet
          open={reserveOpen}
          onClose={() => setReserveOpen(false)}
          car={product}
        />
      )}

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
