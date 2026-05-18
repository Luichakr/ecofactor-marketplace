import type { ReactNode } from 'react'
import './DeliveryMethodCard.css'

type Props = {
  title: string
  subtitle?: string
  /** Right-side label, e.g. "БЕЗКОШТОВНО" or "120 ₴". */
  price: string
  /** When provided, rendered below the subtitle as additional details. */
  details?: ReactNode
  selected: boolean
  onSelect: () => void
}

/**
 * Card-style picker for a delivery method. Inactive cards have a thin
 * border; selected one gets a thick black outline (Zara pattern).
 */
export function DeliveryMethodCard({
  title,
  subtitle,
  price,
  details,
  selected,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      className={`delivery-card ${selected ? 'delivery-card--selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="delivery-card__head">
        <span className="delivery-card__title">{title}</span>
        <span className="delivery-card__price">{price}</span>
      </div>
      {subtitle && <p className="delivery-card__subtitle">{subtitle}</p>}
      {details && <div className="delivery-card__details">{details}</div>}
    </button>
  )
}
