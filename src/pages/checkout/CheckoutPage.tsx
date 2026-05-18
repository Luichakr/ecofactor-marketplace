import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { StickyCTA } from '../../shared/ui/StickyCTA/StickyCTA'
import { Field } from '../../shared/ui/Field/Field'
import { PhoneInput, type PhoneValue } from '../../shared/ui/PhoneInput/PhoneInput'
import type { NovaPoshtaSelection } from '../../shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'
import { NovaPoshtaPicker } from '../../shared/ui/NovaPoshtaPicker/NovaPoshtaPicker'
import { ProductImage } from '../../features/product/ui/ProductImage/ProductImage'
import { DeliveryMethodCard } from '../../features/checkout/ui/DeliveryMethodCard/DeliveryMethodCard'
import { PaymentMethodGrid, type PaymentMethod } from '../../features/checkout/ui/PaymentMethodGrid/PaymentMethodGrid'
import { cart, useCart, useCartTotals } from '../../features/cart/model/cartStore'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { ROUTES } from '../../shared/config/routes'
import './CheckoutPage.css'

type DeliveryType = 'home' | 'pickup' | 'np' | null
type Step = 'delivery' | 'summary' | 'payment' | 'success'

const PICKUP_ADDRESS = 'Атамана Головатого, 113, Одеса'

const PAYMENT_OPTIONS: PaymentMethod[] = [
  { id: 'card', label: 'КАРТКА', hint: 'Visa / MasterCard' },
  { id: 'apple', label: 'APPLE PAY' },
  { id: 'gpay', label: 'GOOGLE PAY' },
  { id: 'privat', label: 'PRIVAT24', hint: 'ПриватБанк' },
  { id: 'mono', label: 'MONOBANK', hint: 'Розстрочка / частинами' },
  { id: 'cod', label: 'ПРИ ОТРИМАННІ', hint: 'Готівка / картка' },
  { id: 'invoice', label: 'РАХУНОК', hint: 'Для бізнесу' },
  { id: 'crypto', label: 'КРИПТО', hint: 'USDT / BTC' },
]

function formatMoney(value: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA').format(value)
  const symbol = currency === 'UAH' ? '₴' : currency
  return `${formatted} ${symbol}`
}

function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `${s}-${Math.floor(Math.random() * 10)}`
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCart()
  const { count, subtotal, currency } = useCartTotals()

  const [step, setStep] = useState<Step>('delivery')
  const [reference] = useState(makeReference)

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null)
  const [npSelection, setNpSelection] = useState<NovaPoshtaSelection | undefined>()
  const [npPickerOpen, setNpPickerOpen] = useState(false)
  const [homeCity, setHomeCity] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [homeComment, setHomeComment] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')

  const [payment, setPayment] = useState<PaymentMethod['id']>('card')

  const deliveryCost = useMemo(() => {
    if (deliveryType === 'pickup') return 0
    if (deliveryType === 'home') return 120
    if (deliveryType === 'np') return 80
    return 0
  }, [deliveryType])

  const total = subtotal + deliveryCost

  if (items.length === 0 && step !== 'success') {
    return (
      <>
        <Header title="ОФОРМЛЕННЯ" showBack />
        <ScreenContainer withTopInset={false}>
          <EmptyState
            title="Кошик порожній"
            description="Спочатку додайте товари"
            action={{ label: 'До каталогу', onClick: () => navigate(ROUTES.CATALOG) }}
          />
        </ScreenContainer>
      </>
    )
  }

  const emailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const contactsOk =
    name.trim().length >= 2 &&
    phone !== undefined && phone.digits.length >= 9 &&
    emailValid

  const deliveryOk = (() => {
    if (!contactsOk) return false
    if (deliveryType === 'pickup') return true
    if (deliveryType === 'np') return Boolean(npSelection?.city && npSelection?.warehouse)
    if (deliveryType === 'home') return homeCity.trim().length >= 2 && homeAddress.trim().length >= 4
    return false
  })()

  const deliveryLabel = (() => {
    if (deliveryType === 'pickup') return `Самовивіз · ${PICKUP_ADDRESS}`
    if (deliveryType === 'home') return `Кур'єр · ${homeCity}, ${homeAddress}`
    if (npSelection?.city && npSelection?.warehouse) {
      const w = npSelection.warehouse
      const city = npSelection.city.MainDescription
      const isPostomat = w.TypeOfWarehouse === 'f9316480-5f2d-11e5-8d8d-0050568002cf'
      return `Нова Пошта · ${city}, ${isPostomat ? 'Поштомат' : 'Відділення'} №${w.Number}`
    }
    return 'Нова Пошта'
  })()

  const paymentLabel = PAYMENT_OPTIONS.find((p) => p.id === payment)?.label ?? '—'

  if (step === 'success') {
    return (
      <>
        <Header title="ЗАМОВЛЕННЯ" />
        <ScreenContainer withTopInset={false}>
          <div className="checkout-page__success">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="1" />
              <path d="M17 28L25 36L40 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="checkout-page__success-title">Замовлення оформлено</h2>
            <p className="checkout-page__success-desc">
              Менеджер підтвердить наявність та узгодить дату доставки протягом години.
            </p>
            <div className="checkout-page__ref">
              <span className="checkout-page__ref-label">НОМЕР ЗАМОВЛЕННЯ</span>
              <span className="checkout-page__ref-value">#{reference}</span>
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate(ROUTES.MARKETPLACE)}>
              На головну
            </Button>
          </div>
        </ScreenContainer>
      </>
    )
  }

  const stepInfo: Record<Exclude<Step, 'success'>, { title: string; index: number }> = {
    delivery: { title: 'ДОСТАВКА', index: 1 },
    summary: { title: 'ПІДТВЕРДЖЕННЯ', index: 2 },
    payment: { title: 'ОПЛАТА', index: 3 },
  }

  return (
    <>
      <Header
        title={`${stepInfo[step].title} · ${stepInfo[step].index}/3`}
        showBack
      />
      <ScreenContainer withTopInset={false}>
        <div className="checkout-page__thumbs">
          {items.slice(0, 6).map((it) => (
            <div key={`${it.productId}__${it.variant ?? ''}`} className="checkout-page__thumb">
              <ProductImage src={it.image} alt={it.title} />
            </div>
          ))}
          {items.length > 6 && (
            <div className="checkout-page__thumb checkout-page__thumb--more">+{items.length - 6}</div>
          )}
        </div>

        {step === 'delivery' && (
          <section className="checkout-page__section">
            <h2 className="checkout-page__step-title">{count} доставка</h2>

            <div className="checkout-page__delivery-list">
              <DeliveryMethodCard
                title="САМОВИВІЗ"
                subtitle={PICKUP_ADDRESS}
                price="БЕЗКОШТОВНО"
                details="Сьогодні-завтра після підтвердження"
                selected={deliveryType === 'pickup'}
                onSelect={() => setDeliveryType('pickup')}
              />
              <DeliveryMethodCard
                title="НОВА ПОШТА"
                subtitle={
                  npSelection?.city && npSelection?.warehouse
                    ? `${npSelection.city.MainDescription} · ${npSelection.warehouse.TypeOfWarehouse === 'f9316480-5f2d-11e5-8d8d-0050568002cf' ? 'Поштомат' : 'Відділення'} №${npSelection.warehouse.Number}`
                    : 'Відділення або поштомат'
                }
                price="ВІД 80 ₴"
                details={npSelection?.warehouse?.ShortAddressDescription ?? '1-3 дні'}
                selected={deliveryType === 'np'}
                onSelect={() => {
                  // Tapping the NP card always opens the picker.
                  // After confirming a branch we mark the delivery as selected.
                  setNpPickerOpen(true)
                }}
              />
              <DeliveryMethodCard
                title="КУРʼЄР"
                subtitle="Доставка на адресу"
                price="120 ₴"
                details="1-2 дні (Київ / Одеса / Львів)"
                selected={deliveryType === 'home'}
                onSelect={() => setDeliveryType('home')}
              />
            </div>

            {/* Details for the selected delivery method */}
            {deliveryType === 'home' && (
              <div className="checkout-page__form">
                <Field
                  label="Місто"
                  placeholder="Київ, Одеса..."
                  required
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                />
                <Field
                  label="Адреса"
                  placeholder="Вулиця, будинок, кв."
                  required
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                />
                <Field
                  as="textarea"
                  label="Коментар до доставки"
                  placeholder="Дзвонити заздалегідь, домофон..."
                  rows={2}
                  value={homeComment}
                  onChange={(e) => setHomeComment(e.target.value)}
                />
              </div>
            )}

            {deliveryType === 'pickup' && (
              <div className="checkout-page__pickup-note">
                <p className="checkout-page__pickup-line">Наш салон</p>
                <p className="checkout-page__pickup-addr">{PICKUP_ADDRESS}</p>
                <p className="checkout-page__pickup-line">Пн-Пт 9:00-19:00 · Сб 10:00-16:00</p>
              </div>
            )}

            <h3 className="checkout-page__group-title">КОНТАКТНІ ДАНІ</h3>
            <div className="checkout-page__form">
              <Field
                label="Імʼя"
                placeholder="Прізвище та імʼя"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <PhoneInput label="Телефон" required value={phone} onChange={setPhone} />
              <Field
                label="Email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                error={email && !emailValid ? 'Перевірте формат email' : undefined}
                helper="Необовʼязково — для квитанції"
              />
            </div>

            <StickyCTA>
              <div className="checkout-page__bar">
                <Button
                  variant="primary"
                  size="lg"
                  className="checkout-page__bar-cta"
                  disabled={!deliveryOk}
                  onClick={() => setStep('summary')}
                >
                  ДАЛІ
                </Button>
                <div className="checkout-page__bar-side">
                  <span className="checkout-page__bar-side-label">ВІДПРАВКА</span>
                  <span className="checkout-page__bar-side-value">
                    {deliveryCost > 0 ? formatMoney(deliveryCost, currency) : 'БЕЗКОШТОВНО'}
                  </span>
                </div>
              </div>
            </StickyCTA>
          </section>
        )}

        {step === 'summary' && (
          <section className="checkout-page__section">
            <h2 className="checkout-page__step-title">{count} {count === 1 ? 'позиція' : 'позицій'}</h2>

            <ul className="checkout-page__items">
              {items.map((it) => (
                <li key={`${it.productId}__${it.variant ?? ''}`} className="checkout-page__item">
                  <span className="checkout-page__item-title">
                    {it.title}
                    <span className="checkout-page__item-qty"> × {it.qty}</span>
                  </span>
                  {it.price !== undefined && (
                    <span className="checkout-page__item-price">
                      {formatMoney(it.price * it.qty, it.currency ?? 'UAH')}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="checkout-page__summary-row">
              <span>Сума товарів</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="checkout-page__summary-row">
              <span>Доставка</span>
              <span>{deliveryCost > 0 ? formatMoney(deliveryCost, currency) : 'безкоштовно'}</span>
            </div>
            <div className="checkout-page__summary-row checkout-page__summary-row--big">
              <span>Разом</span>
              <span>{formatMoney(total, currency)}</span>
            </div>

            <h3 className="checkout-page__group-title">ДОСТАВКА</h3>
            <div className="checkout-page__chosen">
              <span className="checkout-page__chosen-label">{deliveryLabel}</span>
              <button
                type="button"
                className="checkout-page__chosen-edit"
                onClick={() => setStep('delivery')}
              >
                Змінити
              </button>
            </div>

            <h3 className="checkout-page__group-title">ОТРИМУВАЧ</h3>
            <div className="checkout-page__chosen">
              <span className="checkout-page__chosen-label">{name}, {phone?.e164 ?? ''}</span>
              <button
                type="button"
                className="checkout-page__chosen-edit"
                onClick={() => setStep('delivery')}
              >
                Змінити
              </button>
            </div>

            <StickyCTA>
              <div className="checkout-page__bar">
                <Button
                  variant="primary"
                  size="lg"
                  className="checkout-page__bar-cta"
                  onClick={() => setStep('payment')}
                >
                  ДО ОПЛАТИ
                </Button>
                <div className="checkout-page__bar-side">
                  <span className="checkout-page__bar-side-label">РАЗОМ</span>
                  <span className="checkout-page__bar-side-value">{formatMoney(total, currency)}</span>
                </div>
              </div>
            </StickyCTA>
          </section>
        )}

        {step === 'payment' && (
          <section className="checkout-page__section">
            <h2 className="checkout-page__step-title">ОБЕРІТЬ СПОСІБ ОПЛАТИ</h2>
            <PaymentMethodGrid options={PAYMENT_OPTIONS} value={payment} onChange={setPayment} />

            <p className="checkout-page__payment-summary-hint">
              {payment === 'card' && 'Безпечна оплата онлайн при оформленні замовлення.'}
              {payment === 'apple' && 'Швидка оплата через Apple Pay.'}
              {payment === 'gpay' && 'Швидка оплата через Google Pay.'}
              {payment === 'privat' && 'Оплата через ПриватБанк / Privat24.'}
              {payment === 'mono' && 'Розстрочка або оплата частинами через Monobank.'}
              {payment === 'cod' && 'Оплата готівкою або карткою при отриманні.'}
              {payment === 'invoice' && 'Менеджер виставить рахунок-фактуру для безготівкової оплати.'}
              {payment === 'crypto' && 'Менеджер надішле адресу гаманця для USDT або BTC.'}
            </p>

            <StickyCTA>
              <div className="checkout-page__bar">
                <Button
                  variant="primary"
                  size="lg"
                  className="checkout-page__bar-cta"
                  onClick={() => {
                    cart.clear()
                    setStep('success')
                  }}
                >
                  ПІДТВЕРДИТИ · {paymentLabel}
                </Button>
                <div className="checkout-page__bar-side">
                  <span className="checkout-page__bar-side-value">{formatMoney(total, currency)}</span>
                </div>
              </div>
            </StickyCTA>
          </section>
        )}
      </ScreenContainer>

      <NovaPoshtaPicker
        open={npPickerOpen}
        initial={npSelection}
        onCancel={() => setNpPickerOpen(false)}
        onConfirm={(sel) => {
          setNpSelection(sel)
          setDeliveryType('np')
          setNpPickerOpen(false)
        }}
      />
    </>
  )
}
