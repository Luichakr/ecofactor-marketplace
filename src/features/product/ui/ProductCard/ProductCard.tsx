import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice, formatOldPrice } from '../../../../entities/product/model/product.types'
import { productPath } from '../../../../shared/config/routes'
import { ProductImageSlider } from '../ProductImageSlider/ProductImageSlider'
import { getSwatches } from '../../lib/productColors'
import { displayRating } from '../../lib/productRating'
import { favorites, useIsFavorite } from '../../../favorites/model/favoritesStore'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import './ProductCard.css'

type Props = {
  product: MarketplaceProduct
  compact?: boolean
  /** Optional sibling pool — used by the quick-add sheet to enumerate
   *  available sizes/variants. Defaults to no siblings. */
  pool?: MarketplaceProduct[]
}

/**
 * Catalog grid card. No bookmark overlay here — per Zara reference the
 * bookmark icon lives only inside the product detail header. Catalog
 * cards keep only the quick-add "+" affordance.
 */
/** Split a title into display lines. For cables we break "Кабель" onto its
 *  own line so the connector spec ("Type 2 — Type 2", "GB/T", …) reads as a
 *  clear second line instead of a confusing orphan. */
function titleLines(title: string): string[] {
  const m = title.match(/^(Кабель)\s+(.+)$/i)
  return m ? [m[1], m[2]] : [title]
}

export function ProductCard({ product, compact = false, pool }: Props) {
  const navigate = useNavigate()
  const isFav = useIsFavorite(product.id)
  const lines = titleLines(product.title)
  const rating = displayRating(product)
  const swatches = getSwatches(product, pool)

  function go() {
    navigate(productPath(product.id))
  }

  function toggleFav(e: React.MouseEvent) {
    e.stopPropagation()
    favorites.toggle(product.id)
  }

  return (
    <div className={`product-card ${compact ? 'product-card--compact' : ''}`}>
      <div className="product-card__hit">
        <ProductImageSlider
          images={[product.image, ...(product.gallery ?? [])].filter(Boolean) as string[]}
          alt={product.title}
          categoryId={product.categoryId}
          onTap={go}
        />
        <button
          type="button"
          className={`product-card__fav ${isFav ? 'product-card__fav--active' : ''}`}
          onClick={toggleFav}
          aria-label={isFav ? 'Прибрати із закладок' : 'Додати в закладки'}
          aria-pressed={isFav}
        >
          <Icon name="favorite" filled={isFav} size={20} />
        </button>
      </div>

      <div className="product-card__body">
        <div className="product-card__rating" aria-label={`Рейтинг ${rating.average} з 5`}>
          <span className="product-card__stars">
            {[0, 1, 2, 3, 4].map((i) => (
              <Icon
                key={i}
                name="star"
                size={13}
                filled={i < Math.round(rating.average)}
              />
            ))}
          </span>
          <span className="product-card__rating-count">{rating.count}</span>
        </div>

        <button
          type="button"
          className="product-card__title-btn"
          onClick={go}
          aria-label={product.title}
        >
          <h3 className="product-card__title">
            {lines.map((l, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {l}
              </span>
            ))}
          </h3>
        </button>

        {swatches.length > 0 && (
          <div className="product-card__colors" aria-label={`Кольорів: ${swatches.length}`}>
            {swatches.map((s) => (
              <span
                key={s.hex}
                className="product-card__color"
                style={{ backgroundColor: s.hex }}
                title={s.name}
              />
            ))}
          </div>
        )}

        <div className="product-card__price-row">
          <button
            type="button"
            className="product-card__price-btn"
            onClick={go}
            aria-label="Переглянути товар"
          >
            {product.price?.oldValue ? (
              <p className="product-card__price product-card__price--discount">
                <span className="product-card__price-old">{formatOldPrice(product.price)}</span>
                <span className="product-card__price-new">{formatPrice(product.price)}</span>
              </p>
            ) : product.price?.value != null ? (
              <p className="product-card__price">{formatPrice(product.price)}</p>
            ) : (
              // No price from the feed — show a request-a-quote label instead
              // of a blank gap.
              <p className="product-card__price product-card__price--quote">Ціна за запитом</p>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
