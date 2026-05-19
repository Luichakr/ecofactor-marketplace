import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import {
  useOrders,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '../../features/orders/model/ordersStore'
import { ROUTES, orderDetailPath } from '../../shared/config/routes'
import './OrdersPage.css'

type Filter = 'all' | 'active' | 'delivered' | 'cancelled'

const ACTIVE_STATUSES: OrderStatus[] = ['placed', 'paid', 'packing', 'shipped']

function formatMoney(v: number, c: string) {
  const sym = c === 'UAH' ? '₴' : c
  return `${new Intl.NumberFormat('uk-UA').format(v)} ${sym}`
}
function dateUA(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function OrdersPage() {
  const navigate = useNavigate()
  const orders = useOrders()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = orders.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'active') return ACTIVE_STATUSES.includes(o.status)
    if (filter === 'delivered') return o.status === 'delivered'
    if (filter === 'cancelled') return o.status === 'cancelled' || o.status === 'returned'
    return true
  })

  return (
    <>
      <Header title="МОЇ ЗАМОВЛЕННЯ" showBack onBack={() => navigate(ROUTES.PROFILE)} />
      <ScreenContainer withTopInset={false}>
        <div className="orders-page__tabs">
          {(['all', 'active', 'delivered', 'cancelled'] as Filter[]).map((t) => (
            <button
              key={t}
              className={`orders-page__tab ${filter === t ? 'orders-page__tab--active' : ''}`}
              onClick={() => setFilter(t)}
              type="button"
            >
              {{ all: 'УСІ', active: 'АКТИВНІ', delivered: 'ОТРИМАНІ', cancelled: 'СКАСОВАНІ' }[t]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Замовлень поки немає"
            description="Тут з'являться всі ваші покупки — від оформлення до доставки."
          />
        ) : (
          <div className="orders-page__list">
            {filtered.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </ScreenContainer>
    </>
  )
}

function OrderCard({ order }: { order: Order }) {
  const itemsLine = order.items
    .slice(0, 2)
    .map((i) => `${i.title}${i.qty > 1 ? ` × ${i.qty}` : ''}`)
    .join(' • ') + (order.items.length > 2 ? ` +${order.items.length - 2}` : '')

  const eta = order.estimatedArrival ? `Очікується: ${dateUA(order.estimatedArrival)}` : null

  return (
    <Link to={orderDetailPath(order.id)} className="orders-page__card">
      <div className="orders-page__card-head">
        <span className="orders-page__card-num">№ {order.number}</span>
        <span className="orders-page__card-date">{dateUA(order.createdAt)}</span>
      </div>
      <p className="orders-page__card-items">{itemsLine}</p>
      <div className="orders-page__card-foot">
        <span className="orders-page__card-status">{ORDER_STATUS_LABELS[order.status]}</span>
        <span className="orders-page__card-total">{formatMoney(order.total, order.currency)}</span>
      </div>
      {eta && <p className="orders-page__card-eta">{eta}</p>}
    </Link>
  )
}
