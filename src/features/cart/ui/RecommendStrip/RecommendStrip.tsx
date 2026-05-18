import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice } from '../../../../entities/product/model/product.types'
import { ProductImage } from '../../../product/ui/ProductImage/ProductImage'
import { cart } from '../../model/cartStore'
import { productPath } from '../../../../shared/config/routes'
import './RecommendStrip.css'

type Props = {
  title: string
  products: MarketplaceProduct[]
  /** "grid" (2 rows of 2) or "row" (horizontal scroll). Default "row". */
  layout?: 'grid' | 'row'
  /** Compact mini-card mode (taller layout) — used in cart bottom. */
  compact?: boolean
}

export function RecommendStrip({ title, products, layout = 'row', compact = false }: Props) {
  const navigate = useNavigate()
  if (products.length === 0) return null

  return (
    <section className={`reco-strip reco-strip--${layout} ${compact ? 'reco-strip--compact' : ''}`}>
      <h3 className="reco-strip__title">{title}</h3>
      <div className="reco-strip__list">
        {products.map((p) => (
          <article key={p.id} className="reco-strip__item">
            <button
              type="button"
              className="reco-strip__image-btn"
              onClick={() => navigate(productPath(p.id))}
              aria-label={p.title}
            >
              <ProductImage src={p.image} alt={p.title} categoryId={p.categoryId} />
            </button>
            <div className="reco-strip__info">
              {p.price && (
                <span className="reco-strip__price">{formatPrice(p.price)}</span>
              )}
              <button
                type="button"
                className="reco-strip__add"
                onClick={() =>
                  cart.add({
                    productId: p.id,
                    title: p.title,
                    subtitle: p.subtitle,
                    image: p.image,
                    price: p.price?.value,
                    currency: p.price?.currency,
                    qty: 1,
                  })
                }
                aria-label="Додати"
              >
                +
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
