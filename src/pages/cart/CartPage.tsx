import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { StickyCTA } from '../../shared/ui/StickyCTA/StickyCTA'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { ProductImage } from '../../features/product/ui/ProductImage/ProductImage'
import { RecommendStrip } from '../../features/cart/ui/RecommendStrip/RecommendStrip'
import { cart, useCart, useCartTotals } from '../../features/cart/model/cartStore'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { recommendForCart } from '../../shared/lib/recommend/recommend'
import { FavoriteButton } from '../../features/favorites/ui/FavoriteButton/FavoriteButton'
import { useFavorites } from '../../features/favorites/model/favoritesStore'
import { ROUTES } from '../../shared/config/routes'
import './CartPage.css'

function formatMoney(value: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA').format(value)
  const symbol = currency === 'UAH' ? '₴' : currency
  return `${formatted} ${symbol}`
}

export function CartPage() {
  const navigate = useNavigate()
  const items = useCart()
  const { count, currency } = useCartTotals()
  const live = useEfpfProducts()
  const favoriteIds = useFavorites()

  const [unchecked, setUnchecked] = useState<Set<string>>(new Set())
  const [gift, setGift] = useState(false)

  const allProducts = live.data ?? []
  const cartIds = useMemo(() => items.map((i) => i.productId), [items])

  const similar = useMemo(
    () => recommendForCart({ all: allProducts, cartItemProductIds: cartIds, mode: 'similar', limit: 3 }),
    [allProducts, cartIds],
  )
  const complementary = useMemo(
    () => recommendForCart({ all: allProducts, cartItemProductIds: cartIds, mode: 'complementary', limit: 6 }),
    [allProducts, cartIds],
  )

  const selectedItems = items.filter((it) => !unchecked.has(`${it.productId}__${it.variant ?? ''}`))
  const selectedCount = selectedItems.reduce((s, i) => s + i.qty, 0)
  const selectedSubtotal = selectedItems.reduce(
    (s, i) => (i.price !== undefined ? s + i.price * i.qty : s),
    0,
  )

  if (items.length === 0) {
    return (
      <>
        <Header title="КОШИК" showBack />
        <ScreenContainer withTopInset={false}>
          <EmptyState
            title="Кошик порожній"
            description="Додайте товари з каталогу — звідси можна швидко оформити доставку та оплату."
            action={{ label: 'До каталогу', onClick: () => navigate(ROUTES.CATALOG) }}
          />
        </ScreenContainer>
      </>
    )
  }

  function toggle(key: string) {
    setUnchecked((cur) => {
      const next = new Set(cur)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <>
      <Header title="КОШИК" showBack />
      <ScreenContainer withTopInset={false}>
        <div className="cart-page">
          <div className="cart-page__head">
            <span className="cart-page__head-title">
              КОШИК <span className="cart-page__head-num">| {count} |</span>
            </span>
            <button
              type="button"
              className="cart-page__head-tab"
              onClick={() => navigate(ROUTES.FAVORITES)}
            >
              ЗАКЛАДКИ <span className="cart-page__head-num">| {favoriteIds.length} |</span>
            </button>
          </div>

          <ul className="cart-page__list">
            {items.map((it) => {
              const key = `${it.productId}__${it.variant ?? ''}`
              const isChecked = !unchecked.has(key)
              return (
                <li key={key} className="cart-page__item">
                  <button
                    type="button"
                    className={`cart-page__checkbox ${isChecked ? 'cart-page__checkbox--checked' : ''}`}
                    onClick={() => toggle(key)}
                    aria-label={isChecked ? 'Зняти позначку' : 'Позначити'}
                  >
                    {isChecked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4.2 7L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    className="cart-page__image"
                    onClick={() => navigate(`/products/${it.productId}`)}
                  >
                    <ProductImage src={it.image} alt={it.title} />
                  </button>

                  <div className="cart-page__info">
                    <p className="cart-page__title">{it.title}</p>
                    {it.variant && <p className="cart-page__variant">{it.variant}</p>}
                    {it.price !== undefined && (
                      <p className="cart-page__price">
                        {formatMoney(it.price * it.qty, it.currency ?? 'UAH')}
                      </p>
                    )}

                    <div className="cart-page__actions">
                      <button
                        type="button"
                        className="cart-page__action"
                        onClick={() => cart.remove(it.productId, it.variant)}
                      >
                        УДАЛИТИ
                      </button>
                      <span aria-hidden="true">|</span>
                      <FavoriteButton productId={it.productId} bare size={14} />


                      <div className="cart-page__qty">
                        <button
                          type="button"
                          onClick={() => cart.setQty(it.productId, it.qty - 1, it.variant)}
                          aria-label="Зменшити"
                        >−</button>
                        <span>{it.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(it.productId, it.qty + 1, it.variant)}
                          aria-label="Збільшити"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Gift toggle */}
          <button
            type="button"
            className={`cart-page__gift ${gift ? 'cart-page__gift--on' : ''}`}
            onClick={() => setGift((g) => !g)}
          >
            <span className="cart-page__gift-label">Це замовлення в подарунок?</span>
            <span className="cart-page__gift-state">{gift ? 'ТАК' : 'НІ'}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Similar */}
          {similar.length > 0 && (
            <RecommendStrip title="ВАМ ТАКОЖ МОЖЕ СПОДОБАТИСЯ" products={similar} layout="grid" />
          )}

          {/* Complementary */}
          {complementary.length > 0 && (
            <RecommendStrip title="СУПУТНІ ТОВАРИ" products={complementary} layout="row" />
          )}
        </div>

        <StickyCTA>
          <div className="cart-page__bar">
            <Button
              variant="primary"
              size="lg"
              className="cart-page__bar-cta"
              onClick={() => navigate(ROUTES.CHECKOUT)}
              disabled={selectedCount === 0}
            >
              ДАЛІ ({selectedCount})
            </Button>
            <div className="cart-page__bar-side">
              <span className="cart-page__bar-total">
                {formatMoney(selectedSubtotal, currency)}
              </span>
              <span className="cart-page__bar-tax">* Включаючи податки</span>
            </div>
          </div>
        </StickyCTA>
      </ScreenContainer>
    </>
  )
}
