import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice } from '../../../../entities/product/model/product.types'
import { productPath } from '../../../../shared/config/routes'
import { ProductImage } from '../ProductImage/ProductImage'
import { FavoriteButton } from '../../../favorites/ui/FavoriteButton/FavoriteButton'
import './ProductCard.css'

type Props = {
  product: MarketplaceProduct
  compact?: boolean
}

export function ProductCard({ product, compact = false }: Props) {
  const navigate = useNavigate()

  return (
    <div className={`product-card ${compact ? 'product-card--compact' : ''}`}>
      <button
        type="button"
        className="product-card__hit"
        onClick={() => navigate(productPath(product.id))}
        aria-label={product.title}
      >
        <ProductImage
          src={product.image}
          alt={product.title}
          categoryId={product.categoryId}
        />
      </button>

      <FavoriteButton productId={product.id} className="product-card__fav" />

      <button
        type="button"
        className="product-card__body"
        onClick={() => navigate(productPath(product.id))}
      >
        <div className="product-card__head">
          <h3 className="product-card__title">{product.title}</h3>
          <span className="product-card__plus" aria-hidden="true">+</span>
        </div>
        {product.price && (
          <p className="product-card__price">{formatPrice(product.price)}</p>
        )}
      </button>
    </div>
  )
}
