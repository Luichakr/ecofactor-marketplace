import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockProducts } from '../../data/mockProducts'
import { formatPrice } from '../../entities/product/model/product.types'
import { ProductAttributeList } from '../../features/product/ui/ProductAttributeList/ProductAttributeList'
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
import { NovaPoshtaDelivery, type NovaPoshtaSelection } from '../../shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'
import { FavoriteButton } from '../../features/favorites/ui/FavoriteButton/FavoriteButton'
import { REQUEST_PATHS, ROUTES } from '../../shared/config/routes'
import './ProductPage.css'

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
    mockProducts.find((p) => p.id === productId)

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
  const isQuoteOnly = !hasPrice
  void delivery // delivery selection is captured in state; sent to backend at checkout

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

  return (
    <>
      <Header title={product.title} showBack />
      <ScreenContainer withTopInset={false}>
        <ProductGallery
          images={[product.image, ...(product.gallery ?? [])].filter(Boolean) as string[]}
          alt={product.title}
          categoryId={product.categoryId}
          aspectRatio="4 / 3"
          onSlideClick={(i) => setFullscreen(i)}
          className="product-page__gallery"
        />

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

          {/* Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="product-page__badges">
              {product.badges.map((badge) => (
                <span key={badge} className="product-page__badge">{badge}</span>
              ))}
            </div>
          )}

          {/* Price */}
          {product.price && (
            <div className="product-page__price">
              {formatPrice(product.price)}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="product-page__desc">{product.description}</p>
          )}

          {/* Attributes */}
          <h2 className="product-page__section-title">Характеристики</h2>
          <ProductAttributeList attributes={product.attributes} showDetails />

          {/* Quantity + Nova Poshta (only for products with a public price) */}
          {hasPrice && (
            <>
              <h2 className="product-page__section-title">Кількість</h2>
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

              <h2 className="product-page__section-title">Доставка</h2>
              <NovaPoshtaDelivery value={delivery} onChange={setDelivery} />
            </>
          )}
        </div>

        {/* Sticky CTA */}
        <StickyCTA>
          {hasPrice ? (
            <>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleAddToCart}
              >
                {added ? '✓ ДОДАНО ДО КОШИКА' : 'ДОДАТИ ДО КОШИКА'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => navigate(REQUEST_PATHS.CALLBACK)}
              >
                Замовити дзвінок
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
                Запит ціни
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => navigate(REQUEST_PATHS.CALLBACK)}
              >
                Замовити дзвінок
              </Button>
            </>
          )}
        </StickyCTA>
        {/* isQuoteOnly path matches !hasPrice */}
        {/* eslint-disable-next-line @typescript-eslint/no-unused-expressions */}
        {isQuoteOnly}
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
        images={[product.image, ...(product.gallery ?? [])].filter(Boolean) as string[]}
        initialIndex={fullscreen ?? 0}
        alt={product.title}
        categoryId={product.categoryId}
        onClose={() => setFullscreen(null)}
      />
    </>
  )
}
