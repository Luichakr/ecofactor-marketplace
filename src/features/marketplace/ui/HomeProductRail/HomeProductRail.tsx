import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ProductCard } from '../../../product/ui/ProductCard/ProductCard'
import './HomeProductRail.css'

type Props = {
  /** Section heading — emoji encouraged (Monobank/Rozetka style). */
  title: string
  products: MarketplaceProduct[]
  /** Where the "УСІ" link lands. Omit to hide the link. */
  viewAllTo?: string
}

/**
 * One themed home collection: emoji heading + horizontal product rail.
 * Renders nothing when empty so feed-driven sections self-hide.
 */
export function HomeProductRail({ title, products, viewAllTo }: Props) {
  const navigate = useNavigate()
  if (products.length === 0) return null

  return (
    <section className="home-rail">
      <header className="home-rail__head">
        <h2 className="home-rail__title">{title}</h2>
        {viewAllTo && (
          <button
            type="button"
            className="home-rail__link"
            onClick={() => navigate(viewAllTo)}
          >
            УСІ
          </button>
        )}
      </header>
      <div className="home-rail__list">
        {products.map((p) => (
          <div key={p.id} className="home-rail__item">
            <ProductCard product={p} pool={products} />
          </div>
        ))}
      </div>
    </section>
  )
}
