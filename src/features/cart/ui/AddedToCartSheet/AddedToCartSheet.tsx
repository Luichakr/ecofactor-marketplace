import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice } from '../../../../entities/product/model/product.types'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { ProductImage } from '../../../product/ui/ProductImage/ProductImage'
import { RecommendStrip } from '../RecommendStrip/RecommendStrip'
import { recommendFor } from '../../../../shared/lib/recommend/recommend'
import { ROUTES } from '../../../../shared/config/routes'
import './AddedToCartSheet.css'

type Props = {
  open: boolean
  onClose: () => void
  product: MarketplaceProduct | null
  allProducts: MarketplaceProduct[]
  qty?: number
  variant?: string
}

export function AddedToCartSheet({ open, onClose, product, allProducts, qty = 1, variant }: Props) {
  const navigate = useNavigate()

  const recommendations = useMemo(() => {
    if (!product) return []
    const ids = new Set([product.id])
    const sub = product.attributes.find((a) => a.key === 'subcategory')
    const subValue = typeof sub?.value === 'string' ? sub.value : undefined
    return recommendFor({
      all: allProducts,
      cartProductIds: ids,
      cartCategories: new Set([product.categoryId]),
      cartSubcategories: new Set(subValue ? [subValue] : []),
      mode: 'similar',
      limit: 6,
    })
  }, [allProducts, product])

  if (!product) return null

  function viewCart() {
    onClose()
    navigate(ROUTES.CART)
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Додано до кошика"
      titleAside={
        <button type="button" className="added-sheet__view" onClick={viewCart}>
          Переглянути
        </button>
      }
      maxHeightPct={88}
    >
      <div className="added-sheet">
        {/* Added item preview */}
        <article className="added-sheet__item">
          <div className="added-sheet__image">
            <ProductImage src={product.image} alt={product.title} categoryId={product.categoryId} />
          </div>
          <div className="added-sheet__info">
            <p className="added-sheet__title">{product.title}</p>
            {variant && <p className="added-sheet__variant">{variant}</p>}
            <p className="added-sheet__qty">× {qty}</p>
            {product.price && (
              <p className="added-sheet__price">{formatPrice(product.price)}</p>
            )}
          </div>
        </article>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <RecommendStrip
            title="ВАС ТАКОЖ МОЖЕ ЗАЦІКАВИТИ"
            products={recommendations}
            layout="row"
          />
        )}

        <div className="added-sheet__actions">
          <button type="button" className="added-sheet__primary" onClick={viewCart}>
            ПЕРЕГЛЯНУТИ КОШИК
          </button>
          <button type="button" className="added-sheet__secondary" onClick={onClose}>
            Продовжити покупки
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
