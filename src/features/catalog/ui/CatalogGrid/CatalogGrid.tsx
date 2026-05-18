import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ProductCard } from '../../../product/ui/ProductCard/ProductCard'
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState'
import './CatalogGrid.css'

type Props = {
  products: MarketplaceProduct[]
  columns?: 1 | 2 | 3
  onReset?: () => void
}

export function CatalogGrid({ products, columns = 2, onReset }: Props) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Нічого не знайдено"
        description="Спробуйте змінити параметри пошуку або скинути фільтри"
        action={onReset ? { label: 'Скинути фільтри', onClick: onReset } : undefined}
      />
    )
  }

  return (
    <div className={`catalog-grid catalog-grid--cols-${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
