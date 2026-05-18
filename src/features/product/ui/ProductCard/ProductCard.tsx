import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice } from '../../../../entities/product/model/product.types'
import { productPath } from '../../../../shared/config/routes'
import { ProductImage } from '../ProductImage/ProductImage'
import './ProductCard.css'

type Props = {
  product: MarketplaceProduct
  compact?: boolean
}

/**
 * Catalog grid card. No bookmark overlay here — per Zara reference the
 * bookmark icon lives only inside the product detail header. Catalog
 * cards keep only the quick-add "+" affordance.
 */
export function ProductCard({ product, compact = false }: Props) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className={`product-card ${compact ? 'product-card--compact' : ''}`}
      onClick={() => navigate(productPath(product.id))}
      aria-label={product.title}
    >
      <span className="product-card__hit">
        <ProductImage
          src={product.image}
          alt={product.title}
          categoryId={product.categoryId}
        />
      </span>

      <span className="product-card__body">
        <span className="product-card__head">
          <h3 className="product-card__title">{product.title}</h3>
          <span className="product-card__plus" aria-hidden="true">+</span>
        </span>
        {product.price && (
          <span className="product-card__price">{formatPrice(product.price)}</span>
        )}
      </span>
    </button>
  )
}
