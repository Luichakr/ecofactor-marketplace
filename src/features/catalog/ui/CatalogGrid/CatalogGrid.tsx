import { Fragment } from 'react'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ProductCard } from '../../../product/ui/ProductCard/ProductCard'
import { EmptyState } from '../../../../shared/ui/EmptyState/EmptyState'
import { SponsoredSlot } from '../SponsoredSlot/SponsoredSlot'
import { SPONSORED_CARDS } from '../../../../data/sponsored'
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

  /** Inject a sponsored "РЕКЛАМА" row every N product cards. The slot
   *  spans the full grid width (grid-column: 1 / -1) so it doesn't break
   *  the 2/3-column rhythm. Cycles through SPONSORED_CARDS so the same
   *  ad doesn't repeat on long scrolls. */
  const AD_EVERY = 8

  return (
    <div
      className={`catalog-grid catalog-grid--cols-${columns} ${
        imageAspect === 'landscape' ? 'catalog-grid--landscape' : ''
      }`}
    >
      {products.map((product, i) => {
        const adIndex = Math.floor(i / AD_EVERY) - 1
        const showAd = i > 0 && i % AD_EVERY === 0 && SPONSORED_CARDS[adIndex % SPONSORED_CARDS.length]
        return (
          <Fragment key={product.id}>
            {showAd && (
              <div className="catalog-grid__ad">
                <SponsoredSlot card={SPONSORED_CARDS[adIndex % SPONSORED_CARDS.length]} />
              </div>
            )}
            <ProductCard product={product} pool={products} />
          </Fragment>
        )
      })}
    </div>
  )
}
