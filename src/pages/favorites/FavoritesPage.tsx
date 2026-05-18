import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { Button } from '../../shared/ui/Button/Button'
import { ROUTES, productPath, autoCarPath } from '../../shared/config/routes'
import { useFavorites, favorites } from '../../features/favorites/model/favoritesStore'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { useAutoElectricInStock } from '../../features/auto/hooks/useAutoCars'
import { mockProducts } from '../../data/mockProducts'
import { useCart } from '../../features/cart/model/cartStore'
import { cart } from '../../features/cart/model/cartStore'
import { formatPrice } from '../../entities/product/model/product.types'
import './FavoritesPage.css'

/**
 * Combined bookmark + product card data, normalized across EFPF products
 * and Lubeavto auto lots so the grid can render them with one component.
 */
type BookmarkItem = {
  id: string
  href: string
  title: string
  image: string
  priceLabel: string
  /** When true the "ДОДАТИ" button navigates to a quote/request flow
   *  instead of dispatching to the cart store. */
  isAuto?: boolean
  rawProduct?: Parameters<typeof cart.add>[0]
}

const USER_NAME = 'SERGEY'

export function FavoritesPage() {
  const navigate = useNavigate()
  const ids = useFavorites()
  const cartItems = useCart()
  const live = useEfpfProducts()
  const auto = useAutoElectricInStock()

  const items = useMemo(() => buildItems(ids, live.data ?? mockProducts, auto.data), [ids, live.data, auto.data])
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)

  return (
    <ScreenContainer className="bookmarks-page" withTopInset={false}>
      {/* Top bar — X (close) on the left, ОПЦІЇ on the right */}
      <header className="bookmarks-page__topbar">
        <button
          type="button"
          className="bookmarks-page__close"
          aria-label="Закрити"
          onClick={() => navigate(-1)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="bookmarks-page__options" disabled>
          ОПЦІЇ
        </button>
      </header>

      {/* Tab row: КОШИК | N |     ЗАКЛАДКИ ⚑ */}
      <div className="bookmarks-page__tabs">
        <button
          type="button"
          className="bookmarks-page__tab"
          onClick={() => navigate(ROUTES.CART)}
        >
          КОШИК <span className="bookmarks-page__tab-num">| {cartCount} |</span>
        </button>
        <button
          type="button"
          className="bookmarks-page__tab bookmarks-page__tab--active"
        >
          ЗАКЛАДКИ
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 6h12v12L12 14.5L6 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Закладок поки немає"
          description="Зберігайте товари в закладки, щоб повернутися до них пізніше."
          action={{ label: 'До каталогу', onClick: () => navigate(ROUTES.CATALOG) }}
        />
      ) : (
        <>
          <h1 className="bookmarks-page__list-name">{USER_NAME}'S LIST</h1>

          <ul className="bookmarks-page__grid">
            {items.map((it) => (
              <li key={it.id} className="bookmark-card">
                <button
                  type="button"
                  className="bookmark-card__image"
                  onClick={() => navigate(it.href)}
                >
                  {it.image ? (
                    <img src={it.image} alt={it.title} loading="lazy" />
                  ) : (
                    <span className="bookmark-card__image-empty">PHOTO TBD</span>
                  )}
                </button>
                <div className="bookmark-card__head">
                  <p className="bookmark-card__title">{it.title}</p>
                  <button
                    type="button"
                    className="bookmark-card__bookmark"
                    onClick={() => favorites.toggle(it.id)}
                    aria-label="Видалити із закладок"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 6h12v12L12 14.5L6 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <p className="bookmark-card__price">{it.priceLabel}</p>
                <button
                  type="button"
                  className="bookmark-card__cta"
                  onClick={() => {
                    if (it.isAuto) {
                      navigate(it.href)
                    } else if (it.rawProduct) {
                      cart.add(it.rawProduct)
                    }
                  }}
                >
                  ДОДАТИ
                </button>
              </li>
            ))}
          </ul>

          <div className="bookmarks-page__footer">
            <Button variant="outline" fullWidth size="lg" disabled>СТВОРИТИ СПИСОК</Button>
            <Button variant="outline" fullWidth size="lg" disabled>ВИБРАТИ</Button>
          </div>
        </>
      )}
    </ScreenContainer>
  )
}

function buildItems(
  ids: string[],
  efpf: ReturnType<typeof useEfpfProducts>['data'] extends infer T ? NonNullable<T> : never,
  autoCars: ReturnType<typeof useAutoElectricInStock>['data'],
): BookmarkItem[] {
  const out: BookmarkItem[] = []
  for (const id of ids) {
    if (id.startsWith('auto:')) {
      const carId = id.slice(5)
      const car = autoCars.find((c) => c.id === carId)
      if (!car) continue
      out.push({
        id,
        href: autoCarPath(car.id),
        title: car.title,
        image: car.image,
        priceLabel: car.priceLabel,
        isAuto: true,
      })
    } else {
      const product = efpf.find((p) => p.id === id)
      if (!product) continue
      out.push({
        id,
        href: productPath(product.id),
        title: product.title,
        image: product.image ?? '',
        priceLabel: product.price ? formatPrice(product.price) : 'Запит ціни',
        rawProduct: {
          productId: product.id,
          title: product.title,
          subtitle: product.subtitle,
          image: product.image,
          price: product.price?.value,
          currency: product.price?.currency,
          qty: 1,
        },
      })
    }
  }
  return out
}
