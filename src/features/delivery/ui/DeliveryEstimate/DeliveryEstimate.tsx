import { useState } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import {
  CITIES,
  estimateDelivery,
  getStoredCity,
  setStoredCity,
} from '../../../../data/deliveryRates'
import type { MarketplaceCategoryId } from '../../../../entities/category/model/category.types'
import './DeliveryEstimate.css'

type Props = {
  categoryId?: MarketplaceCategoryId
  compact?: boolean
}

export function DeliveryEstimate({ categoryId, compact = false }: Props) {
  const [cityRef, setCityRef] = useState<string>(() => getStoredCity())
  const [open, setOpen] = useState(false)

  const est = estimateDelivery(cityRef, categoryId)
  if (!est) return null

  const daysLabel =
    est.days === 1 ? 'завтра' : est.days === 2 ? 'за 2 дні' : `за ${est.days} днів`
  const priceLabel = est.price === null ? 'узгоджується' : `${est.price} ₴`

  function pick(ref: string) {
    setCityRef(ref)
    setStoredCity(ref)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className={`delivery-estimate ${compact ? 'delivery-estimate--compact' : ''}`}
        onClick={() => setOpen(true)}
      >
        <span className="delivery-estimate__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 7H17V17H3V7Z" stroke="currentColor" strokeWidth="1.2" />
            <path d="M17 11H21L23 14V17H17" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
        <span className="delivery-estimate__text">
          <span className="delivery-estimate__main">
            До <strong>{est.city.name}</strong> {daysLabel}, {priceLabel}
          </span>
          <span className="delivery-estimate__change">змінити місто</span>
        </span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="ОБРАТИ МІСТО" maxHeightPct={80}>
        <ul className="delivery-estimate__cities">
          {CITIES.map((c) => {
            const e = estimateDelivery(c.ref, categoryId)
            const price = e?.price === null ? 'узгоджується' : `${e?.price} ₴`
            return (
              <li key={c.ref}>
                <button
                  type="button"
                  className={`delivery-estimate__city ${cityRef === c.ref ? 'delivery-estimate__city--active' : ''}`}
                  onClick={() => pick(c.ref)}
                >
                  <span className="delivery-estimate__city-name">{c.name}</span>
                  <span className="delivery-estimate__city-meta">{c.days} дн · {price}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </>
  )
}
