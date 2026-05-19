import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import {
  orders,
  useOrders,
  ORDER_STATUS_LABELS,
  ORDER_PROGRESS_STEPS,
  isCancellable,
  isReturnable,
  type Order,
} from '../../features/orders/model/ordersStore'
import { cart } from '../../features/cart/model/cartStore'
import { ROUTES, productPath, returnOpenPath } from '../../shared/config/routes'
import './OrderDetailPage.css'

function formatMoney(v: number, c: string) {
  const sym = c === 'UAH' ? '₴' : c
  return `${new Intl.NumberFormat('uk-UA').format(v)} ${sym}`
}
function dateUA(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const all = useOrders()
  const order = all.find((o) => o.id === orderId)
  // Update countdown every 10s for cancel window.
  const [, force] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 10_000)
    return () => window.clearInterval(id)
  }, [])

  if (!order) {
    return (
      <>
        <Header title="ЗАМОВЛЕННЯ" showBack onBack={() => navigate(ROUTES.ORDERS)} />
        <ScreenContainer withTopInset={false}>
          <EmptyState title="Замовлення не знайдено" description="Можливо, посилання застаріло." />
        </ScreenContainer>
      </>
    )
  }

  function reorder() {
    if (!order) return
    for (const it of order.items) {
      cart.add({
        productId: it.productId,
        title: it.title,
        subtitle: it.subtitle,
        image: it.image,
        price: it.price,
        currency: it.currency,
        variant: it.variant,
        qty: it.qty,
      })
    }
    navigate(ROUTES.CART)
  }

  const cancellable = isCancellable(order)
  const returnable = isReturnable(order)

  return (
    <>
      <Header title={`№ ${order.number}`} showBack onBack={() => navigate(ROUTES.ORDERS)} />
      <ScreenContainer withTopInset={false}>
        <div className="order-detail">
          <ProgressStepper order={order} />

          <Section title="ТОВАРИ">
            <div className="order-detail__items">
              {order.items.map((it) => (
                <Link
                  key={`${it.productId}-${it.variant ?? ''}`}
                  to={productPath(it.productId)}
                  className="order-detail__item"
                >
                  <div className="order-detail__item-img" />
                  <div className="order-detail__item-meta">
                    <p className="order-detail__item-title">{it.title}</p>
                    {it.variant && <p className="order-detail__item-variant">{it.variant}</p>}
                    <p className="order-detail__item-qty">× {it.qty}</p>
                  </div>
                  <span className="order-detail__item-price">
                    {formatMoney(it.price * it.qty, it.currency)}
                  </span>
                </Link>
              ))}
            </div>
          </Section>

          <Section title="ДОСТАВКА">
            <KV k="Місто" v={order.deliveryCity} />
            {order.deliveryBranch && <KV k="Відділення" v={order.deliveryBranch} />}
            <KV k="Вартість" v={formatMoney(order.deliveryPrice, order.currency)} />
            {order.trackingNumber && <KV k="Трек-номер" v={order.trackingNumber} mono />}
            {order.estimatedArrival && (
              <KV k="Очікувана доставка" v={dateUA(order.estimatedArrival)} />
            )}
          </Section>

          <Section title="ОПЛАТА">
            <KV k="Спосіб" v={order.paymentLast4 ? `Картка •••• ${order.paymentLast4}` : '—'} />
            <KV k="Сума товарів" v={formatMoney(order.total - order.deliveryPrice, order.currency)} />
            <KV k="Доставка" v={formatMoney(order.deliveryPrice, order.currency)} />
            <KV k="Разом" v={formatMoney(order.total, order.currency)} highlight />
          </Section>

          <Section title="ДОКУМЕНТИ">
            <DocRow label="Електронний чек (PDF)" href={order.invoiceUrl} />
            <DocRow label="Накладна Нової Пошти" href={'#'} />
          </Section>

          <div className="order-detail__actions">
            {order.status === 'shipped' && order.trackingNumber && (
              <a
                className="order-detail__btn order-detail__btn--secondary"
                href={`https://novaposhta.ua/tracking?cargo_number=${order.trackingNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                ВІДСТЕЖИТИ НА НП
              </a>
            )}
            {cancellable && (
              <button
                type="button"
                className="order-detail__btn order-detail__btn--danger"
                onClick={() => {
                  if (window.confirm('Скасувати замовлення?')) orders.cancel(order.id)
                }}
              >
                СКАСУВАТИ ЗАМОВЛЕННЯ
              </button>
            )}
            {returnable && (
              <Link to={returnOpenPath(order.id)} className="order-detail__btn order-detail__btn--secondary">
                ОФОРМИТИ ПОВЕРНЕННЯ
              </Link>
            )}
            <button type="button" className="order-detail__btn order-detail__btn--primary" onClick={reorder}>
              ПОВТОРИТИ ЗАМОВЛЕННЯ
            </button>
          </div>
        </div>
      </ScreenContainer>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="order-detail__section">
      <h2 className="order-detail__section-title">{title}</h2>
      <div className="order-detail__section-body">{children}</div>
    </section>
  )
}

function KV({ k, v, mono = false, highlight = false }: { k: string; v: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className={`order-detail__kv ${highlight ? 'order-detail__kv--highlight' : ''}`}>
      <span className="order-detail__kv-key">{k}</span>
      <span className={`order-detail__kv-val ${mono ? 'order-detail__kv-val--mono' : ''}`}>{v}</span>
    </div>
  )
}

function DocRow({ label, href }: { label: string; href?: string }) {
  return (
    <a className="order-detail__doc" href={href ?? '#'}>
      <span>{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 3V15M12 15L7 10M12 15L17 10M5 21H19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

function ProgressStepper({ order }: { order: Order }) {
  if (['cancelled', 'returned'].includes(order.status)) {
    return (
      <div className="order-detail__stepper order-detail__stepper--terminal">
        <span>{ORDER_STATUS_LABELS[order.status]}</span>
      </div>
    )
  }
  const currentIdx = ORDER_PROGRESS_STEPS.indexOf(order.status as never)
  return (
    <ol className="order-detail__stepper">
      {ORDER_PROGRESS_STEPS.map((s, i) => {
        const done = i <= currentIdx
        return (
          <li key={s} className={`order-detail__step ${done ? 'order-detail__step--done' : ''}`}>
            <span className="order-detail__step-dot" />
            <span className="order-detail__step-label">{ORDER_STATUS_LABELS[s]}</span>
          </li>
        )
      })}
    </ol>
  )
}
