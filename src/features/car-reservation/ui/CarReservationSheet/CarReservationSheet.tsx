import { useState } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { Button } from '../../../../shared/ui/Button/Button'
import { Field } from '../../../../shared/ui/Field/Field'
import { PhoneInput, type PhoneValue } from '../../../../shared/ui/PhoneInput/PhoneInput'
import { leads } from '../../../leads/model/leadsStore'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { formatPrice } from '../../../../entities/product/model/product.types'
import './CarReservationSheet.css'

type Props = {
  open: boolean
  onClose: () => void
  car: MarketplaceProduct
}

const DEPOSIT_USD = 500

/**
 * Reservation flow for /catalog/cars — same pattern as Tesla / Xiaomi EV
 * configurators. The user puts down a small refundable deposit to hold
 * the car; if they bail, money comes back. For the demo this just files
 * a lead via leadsStore — payment infrastructure isn't wired.
 */
export function CarReservationSheet({ open, onClose, car }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [agreed, setAgreed] = useState(true)
  const [sent, setSent] = useState(false)

  const canSubmit = name.trim().length >= 2 && phone && phone.digits.length >= 9 && agreed && !sent

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    leads.add({
      type: 'reservation',
      name,
      phone: phone?.e164,
      productId: car.id,
      payload: {
        depositUsd: DEPOSIT_USD,
        carTitle: car.title,
        carPrice: car.price?.value,
      },
    })
    setSent(true)
    window.setTimeout(() => {
      onClose()
      setSent(false)
      setName('')
      setPhone(undefined)
    }, 1400)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="БРОНЮВАННЯ" maxHeightPct={88}>
      <form className="car-reservation" onSubmit={submit}>
        <section className="car-reservation__car">
          <p className="car-reservation__car-title">{car.title}</p>
          {car.price && (
            <p className="car-reservation__car-price">{formatPrice(car.price)}</p>
          )}
        </section>

        <section className="car-reservation__deposit">
          <span className="car-reservation__deposit-label">ЗАВДАТОК</span>
          <span className="car-reservation__deposit-amount">${DEPOSIT_USD}</span>
          <p className="car-reservation__deposit-hint">
            100% повертається. Авто резервується на 14 днів — за цей час менеджер
            узгодить умови та доставку. Якщо передумаєте — повертаємо завдаток.
          </p>
        </section>

        <section className="car-reservation__perks">
          <div className="car-reservation__perk">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 8L12 3L21 8V17L12 22L3 17V8Z" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span>Авто за вами на 14 днів</span>
          </div>
          <div className="car-reservation__perk">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L9 18L21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Повне повернення завдатку</span>
          </div>
          <div className="car-reservation__perk">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 5H20V17H13L8 21V17H4V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <span>Менеджер передзвонить протягом години</span>
          </div>
        </section>

        <section className="car-reservation__form">
          <Field
            label="Імʼя"
            placeholder="Як до вас звертатися"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
          />
          <PhoneInput label="Телефон" required value={phone} onChange={setPhone} />
          <label className="car-reservation__agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>Погоджуюсь з умовами бронювання та обробкою персональних даних</span>
          </label>
        </section>

        <Button variant="primary" size="lg" fullWidth type="submit" disabled={!canSubmit}>
          {sent ? 'ЗАБРОНЬОВАНО ✓' : `ЗАБРОНЮВАТИ ЗА $${DEPOSIT_USD}`}
        </Button>
      </form>
    </BottomSheet>
  )
}
