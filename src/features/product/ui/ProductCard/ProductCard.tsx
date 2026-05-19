import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice, formatOldPrice } from '../../../../entities/product/model/product.types'
import { productPath } from '../../../../shared/config/routes'
import { ProductImage } from '../ProductImage/ProductImage'
import { quickAdd } from '../../../quick-add/model/quickAddStore'
import { StockIndicator } from '../StockIndicator/StockIndicator'
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
export function ProductCard({ product, compact = false, pool }: Props) {
  const navigate = useNavigate()

  function go() {
    navigate(productPath(product.id))
  }

  function openQuickAdd(e: React.MouseEvent) {
    e.stopPropagation()
    quickAdd.open(product, pool ?? [])
  }

  return (
    <div className={`product-card ${compact ? 'product-card--compact' : ''}`}>
      <button
        type="button"
        className="product-card__hit"
        onClick={go}
        aria-label={product.title}
      >
        <ProductImage
          src={product.image}
          alt={product.title}
          categoryId={product.categoryId}
        />
      </button>

      <div className="product-card__body">
        <div className="product-card__head">
          <button
            type="button"
            className="product-card__title-btn"
            onClick={go}
            aria-label={product.title}
          >
            <h3 className="product-card__title">{product.title}</h3>
          </button>
          <button
            type="button"
            className="product-card__plus"
            onClick={openQuickAdd}
            disabled={product.stock === 0}
            aria-label={product.stock === 0 ? 'Немає в наявності' : 'Швидке додавання'}
            style={product.stock === 0 ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
          >+</button>
        </div>
        {product.price && (
          <button
            type="button"
            className="product-card__price-btn"
            onClick={go}
            aria-label="Переглянути товар"
          >
            {product.price.oldValue ? (
              <p className="product-card__price product-card__price--discount">
                <span className="product-card__price-old">{formatOldPrice(product.price)}</span>
                <span className="product-card__price-new">{formatPrice(product.price)}</span>
              </p>
            ) : (
              <p className="product-card__price">{formatPrice(product.price)}</p>
            )}
          </button>
        )}
        {(product.stock === 0 || (typeof product.stock === 'number' && product.stock <= 5)) && (
          <div className="product-card__stock-row">
            <StockIndicator productId={product.id} stock={product.stock} size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}
