import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { Button } from '../../shared/ui/Button/Button'
import { ROUTES, productPath } from '../../shared/config/routes'
import { PlaceholderImage } from '../../shared/ui/PlaceholderImage/PlaceholderImage'
import { useFavorites, favorites } from '../../features/favorites/model/favoritesStore'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { mockProducts } from '../../data/mockProducts'
import { useCart } from '../../features/cart/model/cartStore'
import { cart } from '../../features/cart/model/cartStore'
import { formatPrice } from '../../entities/product/model/product.types'
import { priceWatch, usePriceWatch } from '../../features/price-watch/model/priceWatchStore'
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
  const items = useMemo(() => buildItems(ids, live.data ?? mockProducts), [ids, live.data])
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)

  return (
    <ScreenContainer className="bookmarks-page" withTopInset={false}>
      {/* Top bar — X (close) on the left, ПОДІЛИТИСЯ on the right */}
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
        <button
          type="button"
          className="bookmarks-page__options"
          disabled={ids.length === 0}
          onClick={() => {
            const hash = btoa(JSON.stringify(ids))
            const url = `${window.location.origin}/wishlist/shared/${hash}`
            const share = (navigator as Navigator & { share?: (data: { title?: string; url?: string }) => Promise<void> }).share
            if (typeof share === 'function') {
              share({ title: 'Мої закладки', url }).catch(() => {})
            } else {
              navigator.clipboard?.writeText(url)
              alert('Посилання скопійовано')
            }
          }}
        >
          ПОДІЛИТИСЯ
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
                    <PlaceholderImage size="1248 × 1664" aspectRatio="3 / 4" caption={it.title} />
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
                <PriceCell item={it} />
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

function PriceCell({ item }: { item: BookmarkItem }) {
  usePriceWatch() // subscribe to store
  const current = item.rawProduct?.price
  const watched = priceWatch.isWatched(item.id)
  const snapshot = priceWatch.getSnapshot(item.id)
  const drop = current && snapshot && snapshot > current
    ? Math.round(((snapshot - current) / snapshot) * 100)
    : 0
  return (
    <div className="bookmark-card__price-row">
      <p className="bookmark-card__price">{item.priceLabel}</p>
      {drop > 0 && <span className="bookmark-card__drop">−{drop}%</span>}
      {current && (
        <button
          type="button"
          className={`bookmark-card__watch ${watched ? 'bookmark-card__watch--on' : ''}`}
          onClick={() => priceWatch.toggle(item.id, current)}
          aria-label={watched ? 'Скасувати сповіщення про знижку' : 'Сповістити про знижку'}
          title={watched ? 'Слідкуємо за ціною' : 'Сповістити про знижку'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 16V11C6 7.7 8.7 5 12 5C15.3 5 18 7.7 18 11V16M4 16H20M10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={watched ? 'currentColor' : 'none'}
            />
          </svg>
        </button>
      )}
    </div>
  )
}

function buildItems(
  ids: string[],
  efpf: ReturnType<typeof useEfpfProducts>['data'] extends infer T ? NonNullable<T> : never,
): BookmarkItem[] {
  const out: BookmarkItem[] = []
  for (const rawId of ids) {
    // Legacy: auto:<carId> from before the auto migration — strip the prefix
    // and look up in the unified feed.
    const id = rawId.startsWith('auto:') ? rawId.slice(5) : rawId
    {
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
