import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ProductRow } from '../../../product/ui/ProductRow/ProductRow'
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState'
import './CatalogList.css'

type Props = {
  products: MarketplaceProduct[]
  onReset?: () => void
}

/** Amazon-style catalog list (view 1): one product per full-width row. */
export function CatalogList({ products, onReset }: Props) {
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
    <div className="catalog-list">
      {products.map((p) => (
        <ProductRow key={p.id} product={p} pool={products} />
      ))}
    </div>
  )
}
