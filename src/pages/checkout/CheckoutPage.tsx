import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { StickyCTA } from '../../shared/ui/StickyCTA/StickyCTA'
import { Field } from '../../shared/ui/Field/Field'
import { Icon } from '../../shared/ui/Icon/Icon'
import { PhoneInput, phoneValueFromE164, type PhoneValue } from '../../shared/ui/PhoneInput/PhoneInput'
import type { NovaPoshtaSelection } from '../../shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'
import { NovaPoshtaPicker } from '../../shared/ui/NovaPoshtaPicker/NovaPoshtaPicker'
import { OrderItemCard } from '../../features/cart/ui/OrderItemCard/OrderItemCard'
import { cart, useCart, type CartItem } from '../../features/cart/model/cartStore'
import { orders, type Order } from '../../features/orders/model/ordersStore'
import { useAddresses, useCards } from '../../features/profile/model/profileStore'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { ROUTES, orderDetailPath } from '../../shared/config/routes'
import { getLaunchParams } from '../../shared/lib/webview/launchParams'
import { notifyTelegram } from '../../shared/lib/telegram/notify'
import novaPoshtaLogo from '../../assets/brands/nova-poshta.jpg'
import './CheckoutPage.css'

// Identity passed from the host app via the opening URL.
const launch = getLaunchParams()

// Survives a refresh of the buy-now checkout (navigation state is lost on reload).
const BUYNOW_KEY = 'ecofactor-buynow'

type DeliveryType = 'np' | 'home'

function formatMoney(value: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(value))
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
  const location = useLocation()
  const allCartItems = useCart()

  const navState = location.state as { selectedKeys?: string[]; buyNow?: CartItem } | null
  // "Buy now" — a single product passed straight from the product page,
  // independent of the cart. Persisted to sessionStorage so a page refresh on
  // this screen doesn't lose it (navigation state is gone after reload).
  const [buyNow] = useState<CartItem | null>(() => {
    const navBuyNow = navState?.buyNow ?? null
    try {
      if (navBuyNow) {
        sessionStorage.setItem(BUYNOW_KEY, JSON.stringify(navBuyNow))
        return navBuyNow
      }
      // A cart checkout (came with selectedKeys) must never inherit a stale
      // buy-now item — clear it.
      if (navState?.selectedKeys) {
        sessionStorage.removeItem(BUYNOW_KEY)
        return null
      }
      // Deep-link / refresh: restore the in-flight buy-now item if any.
      const raw = sessionStorage.getItem(BUYNOW_KEY)
      return raw ? (JSON.parse(raw) as CartItem) : null
    } catch {
      return navBuyNow
    }
  })
  const [buyNowQty, setBuyNowQty] = useState(buyNow?.qty ?? 1)

  const selectedKeys = navState?.selectedKeys ?? null
  const items = useMemo(() => {
    if (buyNow) return [{ ...buyNow, qty: buyNowQty }]
    if (!selectedKeys) return allCartItems
    const wanted = new Set(selectedKeys)
    const filtered = allCartItems.filter((it) => wanted.has(`${it.productId}__${it.variant ?? ''}`))
    return filtered.length > 0 ? filtered : allCartItems
  }, [buyNow, buyNowQty, allCartItems, selectedKeys])

  const subtotal = items.reduce((s, i) => (i.price !== undefined ? s + i.price * i.qty : s), 0)
  const currency = items.find((i) => i.currency)?.currency ?? 'UAH'

  const savedAddresses = useAddresses()
  const savedCards = useCards()
  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]
  const defaultCard = savedCards.find((c) => c.isDefault) ?? savedCards[0]

  const [done, setDone] = useState(false)
  const [reference] = useState(makeReference)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  // Відділення (Нова Пошта) by default, like the reference order screen.
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('np')
  const [npSelection, setNpSelection] = useState<NovaPoshtaSelection | undefined>()
  const [npPickerOpen, setNpPickerOpen] = useState(false)
  const [homeCity, setHomeCity] = useState(defaultAddress?.city ?? '')
  const [homeAddress, setHomeAddress] = useState(defaultAddress?.street ?? '')

  const [name, setName] = useState(launch.name ?? defaultAddress?.recipient ?? '')
  const [phone, setPhone] = useState<PhoneValue | undefined>(() => phoneValueFromE164(launch.phone))

  // Payment is card-only (no installments / credit in this marketplace).
  const activeCard = defaultCard ?? null

  const deliveryCost = deliveryType === 'home' ? 120 : 80
  const total = subtotal + deliveryCost

  const contactsOk =
    name.trim().length >= 2 && phone !== undefined && phone.digits.length >= 9

  const deliveryOk =
    contactsOk &&
    (deliveryType === 'np'
      ? Boolean(npSelection?.city && npSelection?.warehouse)
      : homeCity.trim().length >= 2 && homeAddress.trim().length >= 4)

  function npBranchLine(): { title: string; sub?: string } {
    if (npSelection?.city && npSelection?.warehouse) {
      const w = npSelection.warehouse
      const city = npSelection.city.MainDescription
      const isPostomat = w.TypeOfWarehouse === 'f9316480-5f2d-11e5-8d8d-0050568002cf'
      return {
        title: `${city}, ${isPostomat ? 'Поштомат' : 'Відділення'} №${w.Number}`,
        sub: w.ShortAddressDescription,
      }
    }
    return { title: 'Оберіть відділення', sub: 'Нова Пошта' }
  }

  function stepQty(productId: string, variant: string | undefined, qty: number, delta: number) {
    const next = qty + delta
    if (buyNow) {
      // Single quick-buy item: don't drop below 1; the trash at 1 cancels.
      if (next <= 0) navigate(-1)
      else setBuyNowQty(next)
      return
    }
    if (next <= 0) cart.remove(productId, variant)
    else cart.setQty(productId, next, variant)
  }

  function placeOrder() {
    if (placing || !deliveryOk) return
    setPlacing(true)
    const now = new Date().toISOString()
    const branchDesc = deliveryType === 'np' ? npSelection?.warehouse?.Description : homeAddress
    const city = deliveryType === 'np' ? npSelection?.city?.MainDescription ?? '' : homeCity
    const order: Order = {
      id: `o-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      number: reference.replace('-', ''),
      createdAt: now,
      // Demo — no real payment; order is placed and goes to processing.
      status: 'placed',
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
      deliveryBranch: branchDesc,
      deliveryPrice: deliveryCost,
      paymentLast4: activeCard?.last4,
    }
    orders.add(order)
    setCreatedOrderId(order.id)

    // Demo: notify the shop owner in Telegram (no real payment taken).
    const lines = items
      .map((it) => `• ${it.title} ×${it.qty} — ${formatMoney((it.price ?? 0) * it.qty, it.currency ?? 'UAH')}`)
      .join('\n')
    const deliveryText =
      deliveryType === 'np'
        ? `Нова Пошта — ${branchDesc ?? city}`
        : `Курʼєр — ${city}, ${homeAddress}`
    notifyTelegram(
      `🛒 <b>Нове замовлення #${order.number}</b>\n\n${lines}\n\n` +
        `<b>Разом: ${formatMoney(total, currency)}</b>\n` +
        `🚚 ${deliveryText}\n` +
        `👤 ${name}${phone?.e164 ? `, ${phone.e164}` : ''}`,
    )
    // Cart mode: clear the ordered items. Buy-now items were never in the
    // cart, so leave it untouched.
    if (!buyNow) for (const it of items) cart.remove(it.productId, it.variant)
    else {
      try { sessionStorage.removeItem(BUYNOW_KEY) } catch { /* ignore */ }
    }
    setDone(true)
  }

  if (items.length === 0 && !done) {
    return (
      <>
        <Header title="Ваше замовлення" showBack />
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

  if (done) {
    return (
      <>
        <Header title="Замовлення" />
        <ScreenContainer withTopInset={false}>
          <div className="checkout-page__success">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="1" />
              <path d="M17 28L25 36L40 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="checkout-page__success-title">Дякуємо! Замовлення прийнято</h2>
            <p className="checkout-page__success-desc">
              Ваше замовлення обробляється. Менеджер звʼяжеться з вами найближчим часом, щоб
              підтвердити наявність і узгодити доставку.
            </p>
            <div className="checkout-page__ref">
              <span className="checkout-page__ref-label">НОМЕР ЗАМОВЛЕННЯ</span>
              <span className="checkout-page__ref-value">#{reference}</span>
            </div>
            {createdOrderId && (
              <Button variant="primary" size="lg" fullWidth onClick={() => navigate(orderDetailPath(createdOrderId))}>
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

  const branch = npBranchLine()

  return (
    <>
      <Header title="Ваше замовлення" showBack />
      <ScreenContainer withTopInset={false} className="checkout-page">
        {/* ─── Items ─── */}
        <div className="checkout-page__cards">
          {items.map((it) => {
            const key = `${it.productId}__${it.variant ?? ''}`
            return (
              <OrderItemCard
                key={key}
                title={it.title}
                image={it.image}
                price={it.price}
                currency={it.currency}
                qty={it.qty}
                onStep={(delta) => stepQty(it.productId, it.variant, it.qty, delta)}
              />
            )
          })}
        </div>

        {/* ─── Payment (card only) ─── */}
        <h2 className="checkout-page__title">Спосіб оплати</h2>
        <div className="checkout-page__card co-pay">
          <span className="co-pay__icon"><Icon name="credit_card" size={24} /></span>
          <span className="co-pay__text">
            <span className="co-pay__name">Оплата карткою</span>
            <span className="co-pay__sub">
              {activeCard ? `•••• ${activeCard.last4}` : 'З вашої гривневої картки'}
            </span>
          </span>
        </div>

        {/* ─── Delivery ─── */}
        <h2 className="checkout-page__title">Доставка</h2>
        <div className="checkout-page__seg">
          <button
            type="button"
            className={`checkout-page__seg-btn ${deliveryType === 'np' ? 'checkout-page__seg-btn--active' : ''}`}
            onClick={() => setDeliveryType('np')}
          >
            Відділення
          </button>
          <button
            type="button"
            className={`checkout-page__seg-btn ${deliveryType === 'home' ? 'checkout-page__seg-btn--active' : ''}`}
            onClick={() => setDeliveryType('home')}
          >
            Кур'єр
          </button>
        </div>

        {deliveryType === 'np' ? (
          <button type="button" className="checkout-page__card co-row" onClick={() => setNpPickerOpen(true)}>
            <span className="co-row__logo">
              <img src={novaPoshtaLogo} alt="Нова Пошта" />
            </span>
            <span className="co-row__text">
              <span className="co-row__title">{branch.title}</span>
              {branch.sub && <span className="co-row__sub">{branch.sub}</span>}
            </span>
            <Icon name="chevron_right" size={22} />
          </button>
        ) : (
          <div className="checkout-page__form">
            <Field label="Місто" placeholder="Київ, Одеса…" required value={homeCity} onChange={(e) => setHomeCity(e.target.value)} />
            <Field label="Адреса" placeholder="Вулиця, будинок, кв." required value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} />
          </div>
        )}

        {/* ─── Recipient ─── */}
        <h2 className="checkout-page__title">Отримувач</h2>
        <div className="checkout-page__form">
          <Field label="Імʼя" placeholder="Прізвище та імʼя" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <PhoneInput label="Телефон" required value={phone} onChange={setPhone} />
        </div>

        <StickyCTA>
          <Button variant="primary" size="lg" fullWidth disabled={!deliveryOk || placing} onClick={placeOrder}>
            {placing ? 'ОФОРМЛЯЄМО…' : `Сплатити  ${formatMoney(total, currency)}`}
          </Button>
        </StickyCTA>
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
