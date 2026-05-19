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
import { orders, type Order } from '../../features/orders/model/ordersStore'
import { useAddresses, useCards } from '../../features/profile/model/profileStore'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { ROUTES, orderDetailPath } from '../../shared/config/routes'
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

  // Saved address/card store — preselect defaults so the form arrives
  // already partially filled for returning users. The user can still edit
  // every field manually below.
  const savedAddresses = useAddresses()
  const savedCards = useCards()
  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]
  const defaultCard = savedCards.find((c) => c.isDefault) ?? savedCards[0]

  const [step, setStep] = useState<Step>('delivery')
  const [reference] = useState(makeReference)
  // Persisted on confirm so the success screen can deep-link into the
  // freshly-created order detail page.
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null)
  const [npSelection, setNpSelection] = useState<NovaPoshtaSelection | undefined>()
  const [npPickerOpen, setNpPickerOpen] = useState(false)
  const [homeCity, setHomeCity] = useState(defaultAddress?.city ?? '')
  const [homeAddress, setHomeAddress] = useState(defaultAddress?.street ?? '')
  const [homeComment, setHomeComment] = useState('')

  const [name, setName] = useState(defaultAddress?.recipient ?? '')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')

  const [payment, setPayment] = useState<PaymentMethod['id']>('card')
  // When the default card exists we surface it in the payment summary so the
  // user sees "•••• 4242" rather than a blank line. They can still pick a
  // different payment method.
  const [usedCardId, setUsedCardId] = useState<string | null>(defaultCard?.id ?? null)
  const activeCard = savedCards.find((c) => c.id === usedCardId) ?? null

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
            {createdOrderId && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(orderDetailPath(createdOrderId))}
              >
                ПЕРЕГЛЯНУТИ ЗАМОВЛЕННЯ
              </Button>
            )}
            <Button variant="outline" size="lg" fullWidth onClick={() => navigate(ROUTES.MARKETPLACE)}>
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
                {/* Saved-address picker — quick switch between known addresses
                    instead of typing the same city/street again. */}
                {savedAddresses.length > 0 && (
                  <div className="checkout-page__saved-list">
                    <span className="checkout-page__saved-label">Збережені адреси</span>
                    <div className="checkout-page__saved-row">
                      {savedAddresses.map((a) => {
                        const active = homeCity === a.city && homeAddress === (a.street ?? '')
                        return (
                          <button
                            key={a.id}
                            type="button"
                            className={`checkout-page__saved-chip ${active ? 'checkout-page__saved-chip--active' : ''}`}
                            onClick={() => {
                              setHomeCity(a.city)
                              setHomeAddress(a.street ?? a.branch ?? '')
                              if (a.recipient && !name) setName(a.recipient)
                            }}
                          >
                            <span className="checkout-page__saved-chip-type">{a.label}</span>
                            <span className="checkout-page__saved-chip-meta">
                              {a.city}{a.street ? `, ${a.street}` : ''}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
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

            {/* Saved-card quick picker — only when the user already has cards
                and they picked the "card" payment method. Selecting a saved
                card just bookmarks which one will be used; the actual flow
                stays the same demo-mode stub. */}
            {payment === 'card' && savedCards.length > 0 && (
              <div className="checkout-page__saved-list">
                <span className="checkout-page__saved-label">Збережені картки</span>
                <div className="checkout-page__saved-row">
                  {savedCards.map((c) => {
                    const active = usedCardId === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`checkout-page__saved-chip ${active ? 'checkout-page__saved-chip--active' : ''}`}
                        onClick={() => setUsedCardId(c.id)}
                      >
                        <span className="checkout-page__saved-chip-type">{c.brand.toUpperCase()}</span>
                        <span className="checkout-page__saved-chip-meta">•••• {c.last4} · {c.expiry}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

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
                    // Persist the order before clearing the cart so the
                    // user can immediately see it under /orders and we
                    // never lose items if cart.clear() ran while orders.add()
                    // failed.
                    const now = new Date().toISOString()
                    const branch =
                      deliveryType === 'np'
                        ? npSelection?.warehouse?.Description
                        : deliveryType === 'pickup'
                          ? PICKUP_ADDRESS
                          : homeAddress
                    const city =
                      deliveryType === 'np'
                        ? npSelection?.city?.MainDescription ?? ''
                        : deliveryType === 'pickup'
                          ? 'Одеса'
                          : homeCity
                    const order: Order = {
                      id: `o-${Date.now()}`,
                      number: reference.replace('-', ''),
                      createdAt: now,
                      status: payment === 'cod' ? 'placed' : 'paid',
                      paidAt: payment === 'cod' ? undefined : now,
                      items: items.map((it) => ({
                        productId: it.productId,
                        title: it.title,
                        subtitle: it.subtitle,
                        image: it.image,
                        qty: it.qty,
                        price: it.price ?? 0,
                        currency: it.currency ?? 'UAH',
                        variant: it.variant,
                      })),
                      total,
                      currency,
                      deliveryCity: city,
                      deliveryBranch: branch,
                      deliveryPrice: deliveryCost,
                      paymentLast4: payment === 'card' ? activeCard?.last4 : undefined,
                    }
                    orders.add(order)
                    setCreatedOrderId(order.id)
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
