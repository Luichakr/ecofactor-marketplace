import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ProductCard } from '../../../product/ui/ProductCard/ProductCard'
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState'
import './CatalogGrid.css'

type Props = {
  products: MarketplaceProduct[]
  columns?: 1 | 2 | 3
  onReset?: () => void
  /** When `landscape`, all card photos render with a 4:3 landscape ratio
   *  (instead of the default 3:4 portrait). Card layout itself stays
   *  vertical. Used by /catalog/cars so car listings show landscape stills
   *  while everything else keeps Zara-style portrait crops. */
  imageAspect?: 'portrait' | 'landscape'
}

export function CatalogGrid({
  products,
  columns = 2,
  onReset,
  imageAspect = 'portrait',
}: Props) {
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
    <div
      className={`catalog-grid catalog-grid--cols-${columns} ${
        imageAspect === 'landscape' ? 'catalog-grid--landscape' : ''
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} pool={products} />
      ))}
    </div>
  )
}
