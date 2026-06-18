import type { ReactNode } from 'react'
import { ProductImage } from '../../../product/ui/ProductImage/ProductImage'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import './OrderItemCard.css'

type Props = {
  title: string
  image?: string
  /** Per-unit price; the card shows price × qty. */
  price?: number
  currency?: string
  qty: number
  /** Quantity delta. At qty 1 the left button is a trash (delta -1 removes). */
  onStep: (delta: number) => void
  /** Optional overlay (e.g. a cart selection checkbox) in the top-left corner. */
  overlay?: ReactNode
  onTitleClick?: () => void
}

function formatMoney(value: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(value))
  return `${formatted} ${currency === 'UAH' ? '₴' : currency}`
}

/**
 * Shared order/cart product card: info on the left (title, seller, price,
 * qty stepper), photo flush to the right edge of the card. Used by both the
 * cart and the checkout so items read identically everywhere.
 */
export function OrderItemCard({ title, image, price, currency = 'UAH', qty, onStep, overlay, onTitleClick }: Props) {
  return (
    <article className={`co-item ${overlay ? 'co-item--with-overlay' : ''}`}>
      {overlay && <div className="co-item__overlay">{overlay}</div>}

      <div className="co-item__info">
        <h3 className="co-item__title" onClick={onTitleClick} role={onTitleClick ? 'button' : undefined}>
          {title}
        </h3>
        <span className="co-item__seller">
          <Icon name="storefront" size={15} /> ECOFACTOR
        </span>
        {price !== undefined && (
          <span className="co-item__price">{formatMoney(price * qty, currency)}</span>
        )}

        <div className="co-item__stepper">
          <button
            type="button"
            className="co-item__step"
            onClick={() => onStep(-1)}
            aria-label={qty <= 1 ? 'Видалити' : 'Зменшити'}
          >
            <Icon name={qty <= 1 ? 'delete' : 'remove'} size={20} />
          </button>
          <span className="co-item__qty">{qty}</span>
          <button type="button" className="co-item__step" onClick={() => onStep(1)} aria-label="Додати">
            <Icon name="add" size={20} />
          </button>
        </div>
      </div>

      <span className="co-item__img">
        <ProductImage src={image} alt={title} />
      </span>
    </article>
  )
}
