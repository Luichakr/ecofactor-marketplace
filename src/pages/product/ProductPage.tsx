import { useState } from 'react'
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
import { NovaPoshtaDelivery, type NovaPoshtaSelection } from '../../shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'
import { FavoriteButton } from '../../features/favorites/ui/FavoriteButton/FavoriteButton'
import { REQUEST_PATHS, ROUTES } from '../../shared/config/routes'
import './ProductPage.css'

/** Six placeholder tiles to match the Zara reference rhythm until upstream
 *  catalogs (EFPF, local mock) start returning richer galleries. */
const PHOTO_PLACEHOLDERS = [
  { size: '1248 × 1664', ratio: '3 / 4' },
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

  const product =
    live.data?.find((p) => p.id === productId) ??
    mockProducts.find((p) => p.id === productId) ??
    mockTires.find((p) => p.id === productId)

  if (live.loading && !product) {
    return (
      <>
        <Header title="Завантаження" showBack />
        <ScreenContainer withTopInset={false}>
          <div className="product-page__not-found">
            <p>Завантаження…</p>
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
    cart.add({
      productId: product.id,
      title: product.title,
      subtitle: product.subtitle,
      image: product.image,
      price: product.price?.value,
      currency: product.price?.currency,
      qty,
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
          <div className="product-page__hero-placeholder">
            <span className="product-page__photo-tag">PHOTO TBD</span>
            <span className="product-page__photo-size">1248 × 1664</span>
          </div>
        )}

        <div className="product-page__content">
          {/* Title row */}
          <div className="product-page__title-row">
            <div>
              <h1 className="product-page__title">{product.title}</h1>
              {product.subtitle && (
                <p className="product-page__subtitle">{product.subtitle}</p>
              )}
            </div>
            <div className="product-page__title-actions">
              {product.status && <StatusBadge status={product.status} />}
              <FavoriteButton productId={product.id} />
            </div>
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
            <div
              key={i}
              className="product-page__photo-tile"
              style={{ aspectRatio: p.ratio }}
            >
              <span className="product-page__photo-tag">PHOTO TBD</span>
              <span className="product-page__photo-size">{p.size}</span>
            </div>
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

          {hasPrice && (
            <ExpandableSection title="КІЛЬКІСТЬ">
              <div className="product-page__qty">
                <button
                  type="button"
                  className="product-page__qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Зменшити"
                  disabled={qty <= 1}
                >−</button>
                <span className="product-page__qty-value">{qty}</span>
                <button
                  type="button"
                  className="product-page__qty-btn"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="Збільшити"
                >+</button>
              </div>
            </ExpandableSection>
          )}
        </div>

        {/* Sticky CTA: two equal-width buttons + always-visible price */}
        <StickyCTA>
          <div className="product-page__cta">
            <div className="product-page__cta-row">
              {hasPrice ? (
                <>
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    {added ? '✓ ДОДАНО' : 'ДОДАТИ'}
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    onClick={() => navigate(REQUEST_PATHS.CALLBACK)}
                  >
                    ДЗВІНОК
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={() => navigate(`${REQUEST_PATHS.QUOTE}/${product.id}`)}
                  >
                    ЗАПИТАТИ
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    onClick={() => navigate(REQUEST_PATHS.CALLBACK)}
                  >
                    ДЗВІНОК
                  </Button>
                </>
              )}
            </div>
            {product.price && (
              <div className="product-page__cta-price">{formatPrice(product.price)}</div>
            )}
          </div>
        </StickyCTA>
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
