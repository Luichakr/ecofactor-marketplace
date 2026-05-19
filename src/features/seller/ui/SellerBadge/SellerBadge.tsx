import { useState } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { StarRating } from '../../../../shared/ui/StarRating/StarRating'
import { getSeller } from '../../../../data/mockSellers'
import './SellerBadge.css'

export function SellerBadge({ sellerId }: { sellerId?: string }) {
  const seller = getSeller(sellerId)
  const [open, setOpen] = useState(false)

  const years = Math.max(1, new Date().getFullYear() - new Date(seller.joinedAt).getFullYear())

  return (
    <>
      <button type="button" className="seller-badge" onClick={() => setOpen(true)}>
        <span className="seller-badge__avatar">
          {seller.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
        </span>
        <span className="seller-badge__main">
          <span className="seller-badge__name">
            {seller.name}
            {seller.verified && (
              <svg className="seller-badge__check" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-label="Перевірений">
                <path d="M5 13L10 18L20 7" stroke="#1f9d55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="seller-badge__meta">
            <StarRating rating={seller.rating} size={11} />
            <span className="seller-badge__count">({seller.reviewsCount.toLocaleString('uk-UA')})</span>
          </span>
        </span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="ПРОДАВЕЦЬ" maxHeightPct={70}>
        <div className="seller-badge__sheet">
          <div className="seller-badge__sheet-head">
            <span className="seller-badge__avatar seller-badge__avatar--lg">
              {seller.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <div>
              <p className="seller-badge__sheet-name">{seller.name}</p>
              <StarRating rating={seller.rating} size={14} showValue count={seller.reviewsCount} />
            </div>
          </div>
          {seller.description && <p className="seller-badge__desc">{seller.description}</p>}
          <div className="seller-badge__stats">
            <div>
              <span className="seller-badge__stat-val">{years}</span>
              <span className="seller-badge__stat-label">РОКІВ НА РИНКУ</span>
            </div>
            <div>
              <span className="seller-badge__stat-val">{seller.productsCount}</span>
              <span className="seller-badge__stat-label">ТОВАРІВ</span>
            </div>
            <div>
              <span className="seller-badge__stat-val">{seller.rating.toFixed(1)}</span>
              <span className="seller-badge__stat-label">РЕЙТИНГ</span>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
