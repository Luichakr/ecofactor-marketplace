import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { StickyCTA } from '../../shared/ui/StickyCTA/StickyCTA'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { OrderItemCard } from '../../features/cart/ui/OrderItemCard/OrderItemCard'
import { RecommendStrip } from '../../features/cart/ui/RecommendStrip/RecommendStrip'
import { cart, useCart, useCartTotals } from '../../features/cart/model/cartStore'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
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

  const selectedItems = items.filter((it) => !unchecked.has(`${it.productId}__${it.variant ?? ''}`))
  const selectedCount = selectedItems.reduce((s, i) => s + i.qty, 0)
  const selectedSubtotal = selectedItems.reduce(
    (s, i) => (i.price !== undefined ? s + i.price * i.qty : s),
    0,
  )

  if (items.length === 0) {
    // Populate the empty-cart screen with two strips of suggestions —
    // favorites first (highest signal of intent), then a popular feed.
    // Keeps the user inside the shopping loop instead of bouncing.
    const favoriteProducts = allProducts.filter((p) => favoriteIds.includes(p.id)).slice(0, 6)
    const popular = allProducts
      .filter((p) => !favoriteIds.includes(p.id))
      .slice(0, 6)
    return (
      <>
        <Header title="КОШИК" showBack />
        <ScreenContainer withTopInset={false}>
          <EmptyState
            variant="cart"
            title="Кошик порожній"
            description="Додайте товари з каталогу — звідси можна швидко оформити доставку та оплату."
            action={{ label: 'До каталогу', onClick: () => navigate(ROUTES.CATALOG) }}
          />
          {favoriteProducts.length > 0 && (
            <RecommendStrip title="ВАШІ ЗАКЛАДКИ" products={favoriteProducts} />
          )}
          {popular.length > 0 && (
            <RecommendStrip title="ПОПУЛЯРНЕ ЗАРАЗ" products={popular} />
          )}
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
                <li key={key} className="cart-page__row">
                  <OrderItemCard
                    title={it.title}
                    image={it.image}
                    price={it.price}
                    currency={it.currency}
                    qty={it.qty}
                    onStep={(delta) => {
                      const next = it.qty + delta
                      if (next <= 0) cart.remove(it.productId, it.variant)
                      else cart.setQty(it.productId, next, it.variant)
                    }}
                    onTitleClick={() => navigate(`/products/${it.productId}`)}
                    overlay={
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
                    }
                  />
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
        </div>

        <StickyCTA>
          <div className="cart-page__bar">
            <Button
              variant="primary"
              size="lg"
              className="cart-page__bar-cta"
              onClick={() => {
                // Carry the exact set of selected line keys to checkout so a
                // user who unchecked an item is neither charged for it nor
                // loses it from the cart. Keys are productId__variant.
                const selectedKeys = selectedItems.map(
                  (it) => `${it.productId}__${it.variant ?? ''}`,
                )
                navigate(ROUTES.CHECKOUT, { state: { selectedKeys } })
              }}
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
