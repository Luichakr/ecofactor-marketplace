import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice, formatOldPrice } from '../../../../entities/product/model/product.types'
import { productPath } from '../../../../shared/config/routes'
import { ProductImage } from '../ProductImage/ProductImage'
import { getSwatches } from '../../lib/productColors'
import { displayRating } from '../../lib/productRating'
import { favorites, useIsFavorite } from '../../../favorites/model/favoritesStore'
import { cart, useCart } from '../../../cart/model/cartStore'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import './ProductRow.css'

type Props = {
  product: MarketplaceProduct
  pool?: MarketplaceProduct[]
}

/**
 * Amazon-style catalog list row: square photo on the left, details stacked
 * on the right (title, rating, colours, price). Used by catalog view 1.
 */
export function ProductRow({ product, pool }: Props) {
  const navigate = useNavigate()
  const isFav = useIsFavorite(product.id)
  const rating = displayRating(product)
  const swatches = getSwatches(product, pool)
  const cartItems = useCart()
  const qty = cartItems.find((i) => i.productId === product.id && !i.variant)?.qty ?? 0

  function go() {
    navigate(productPath(product.id))
  }

  function toggleFav(e: React.MouseEvent) {
    e.stopPropagation()
    favorites.toggle(product.id)
  }

  function addToCart(e: React.MouseEvent) {
    e.stopPropagation()
    cart.add({
      productId: product.id,
      title: product.title,
      subtitle: product.subtitle,
      image: product.image,
      price: product.price?.value,
      currency: product.price?.currency,
      stock: product.stock,
      qty: 1,
    })
  }

  function decQty(e: React.MouseEvent) {
    e.stopPropagation()
    if (qty <= 1) cart.remove(product.id)
    else cart.setQty(product.id, qty - 1)
  }

  return (
    <article className="product-row" onClick={go}>
      <div className="product-row__media">
        <span className="product-row__img">
          <ProductImage src={product.image} alt={product.title} categoryId={product.categoryId} />
        </span>
        <button
          type="button"
          className={`product-row__fav ${isFav ? 'product-row__fav--active' : ''}`}
          onClick={toggleFav}
          aria-label={isFav ? 'Прибрати із закладок' : 'Додати в закладки'}
          aria-pressed={isFav}
        >
          <Icon name="favorite" filled={isFav} size={20} />
        </button>
      </div>

      <div className="product-row__info">
        <h3 className="product-row__title">{product.title}</h3>

        <div className="product-row__rating" aria-label={`Рейтинг ${rating.average} з 5`}>
          <span className="product-row__stars">
            {[0, 1, 2, 3, 4].map((i) => (
              <Icon key={i} name="star" size={13} filled={i < Math.round(rating.average)} />
            ))}
          </span>
          <span className="product-row__rating-count">({rating.count})</span>
        </div>

        {swatches.length > 0 && (
          <div className="product-row__colors" aria-label={`Кольорів: ${swatches.length}`}>
            {swatches.map((s) => (
              <span
                key={s.hex}
                className="product-row__color"
                style={{ backgroundColor: s.hex }}
                title={s.name}
              />
            ))}
          </div>
        )}

        {product.price && (
          <div className="product-row__price-line">
            {product.price.oldValue && (
              <span className="product-row__price-old">{formatOldPrice(product.price)}</span>
            )}
            <span className="product-row__price">{formatPrice(product.price)}</span>
          </div>
        )}

        {product.stock === 0 ? (
          <button type="button" className="product-row__cta" disabled>
            Немає в наявності
          </button>
        ) : qty === 0 ? (
          <button type="button" className="product-row__cta" onClick={addToCart}>
            <Icon name="shopping_cart" size={18} />
            <span>У кошик</span>
          </button>
        ) : (
          <div className="product-row__stepper">
            <button
              type="button"
              className="product-row__step"
              onClick={decQty}
              aria-label={qty === 1 ? 'Видалити з кошика' : 'Зменшити кількість'}
            >
              <Icon name={qty === 1 ? 'delete' : 'remove'} size={20} />
            </button>
            <span className="product-row__step-count">{qty} в кошику</span>
            <button
              type="button"
              className="product-row__step"
              onClick={addToCart}
              aria-label="Додати ще"
            >
              <Icon name="add" size={20} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
