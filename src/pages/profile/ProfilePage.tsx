import { useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockUser } from '../../data/mockUser'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { ROUTES, orderDetailPath } from '../../shared/config/routes'
import {
  useOrders,
  ORDER_STATUS_LABELS,
  type Order,
} from '../../features/orders/model/ordersStore'
import { useAddresses, useCards } from '../../features/profile/model/profileStore'
import { useFavorites } from '../../features/favorites/model/favoritesStore'
import { openSupport } from '../../features/support/ui/SupportLauncher/SupportLauncher'
import './ProfilePage.css'

function dateUA(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(value: number, currency: string): string {
  const sym = currency === 'UAH' ? '₴' : currency
  return `${new Intl.NumberFormat('uk-UA').format(value)} ${sym}`
}

function StatusDot({ status }: { status: Order['status'] }) {
  const color =
    status === 'delivered'
      ? '#1f9d55'
      : status === 'cancelled' || status === 'returned'
        ? '#b00020'
        : status === 'shipped'
          ? '#1f7ac9'
          : '#7a7a7a'
  return <span className="profile-page__dot" style={{ background: color }} aria-hidden="true" />
}

const ICONS = {
  orders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 8L12 3L21 8V17L12 22L3 17V8Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M3 8L12 13L21 8M12 13V22" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  ),
  favorites: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 6h12v12L12 14.5L6 18Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  ),
  address: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 22S5 14 5 9C5 5.7 8 3 12 3S19 5.7 19 9C19 14 12 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  card: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" stroke="currentColor" strokeWidth="1" />
      <path d="M3 10H21M7 15H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  ),
  support: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 5H20V17H13L8 21V17H4V5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const AVATAR_KEY = 'mp:avatar'

export function ProfilePage() {
  const navigate = useNavigate()
  const orders = useOrders()
  const addresses = useAddresses()
  const cards = useCards()
  const favorites = useFavorites()

  // Avatar — hydrated from localStorage on mount. Stored as a data: URL so
  // it survives reloads without a backend. ~200KB-ish quota is fine for one
  // photo; oversized images get downscaled before save.
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [avatar, setAvatar] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    try { return window.localStorage.getItem(AVATAR_KEY) } catch { return null }
  })

  function pickAvatar() {
    fileRef.current?.click()
  }

  function onAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Downscale to 256px so the data URL stays small (~30-60KB).
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 256
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      // Cover-crop: fill the square with the centre of the source.
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      const data = canvas.toDataURL('image/jpeg', 0.82)
      try { window.localStorage.setItem(AVATAR_KEY, data) } catch {}
      setAvatar(data)
      URL.revokeObjectURL(url)
    }
    img.src = url
    // Reset input so the same file can be picked again later.
    e.target.value = ''
  }

  function removeAvatar() {
    try { window.localStorage.removeItem(AVATAR_KEY) } catch {}
    setAvatar(null)
  }

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled', 'returned'].includes(o.status))
  const recent = orders.slice(0, 3)

  return (
    <>
      <Header title="АККАУНТ" />
      <ScreenContainer withTopInset={false}>
        {/* User card */}
        <div className="profile-page__user">
          <button
            type="button"
            className="profile-page__avatar"
            onClick={pickAvatar}
            aria-label={avatar ? 'Змінити аватар' : 'Завантажити аватар'}
          >
            {avatar ? (
              <img src={avatar} alt="" className="profile-page__avatar-img" />
            ) : (
              <span className="profile-page__avatar-initials">{mockUser.avatarInitials}</span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onAvatarFile}
            style={{ display: 'none' }}
          />
          <div className="profile-page__user-info">
            <p className="profile-page__name">{mockUser.name}</p>
            <p className="profile-page__phone">{mockUser.phone}</p>
            {mockUser.email && <p className="profile-page__email">{mockUser.email}</p>}
            {avatar && (
              <button type="button" className="profile-page__avatar-remove" onClick={removeAvatar}>
                Прибрати фото
              </button>
            )}
          </div>
          {/* Chat shortcut — replaces the floating SupportLauncher FAB on
              this page so we don't show two entry points to support. */}
          <button
            type="button"
            className="profile-page__chat"
            onClick={openSupport}
            aria-label="Відкрити чат з підтримкою"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 5H20V17H13L8 21V17H4V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Quick stats — orders count, favorites count, active deliveries.
            Each tile navigates into the matching list (orders with status
            filter, favorites grid). */}
        <div className="profile-page__stats">
          <Stat label="ЗАМОВЛЕНЬ" value={orders.length} onClick={() => navigate(ROUTES.ORDERS)} />
          <Stat label="АКТИВНІ" value={activeOrders.length} highlight onClick={() => navigate(`${ROUTES.ORDERS}?status=active`)} />
          <Stat label="ЗАКЛАДКИ" value={favorites.length} onClick={() => navigate(ROUTES.FAVORITES)} />
        </div>

        {/* Active deliveries call-out */}
        {activeOrders.length > 0 && (
          <ProfileSection title="В ДОРОЗІ" linkTo={ROUTES.ORDERS}>
            {activeOrders.slice(0, 2).map((o) => (
              <OrderPreview key={o.id} order={o} />
            ))}
          </ProfileSection>
        )}

        {/* Recent orders */}
        {recent.length > 0 && (
          <ProfileSection title="ОСТАННІ ЗАМОВЛЕННЯ" linkLabel="ВСІ" linkTo={ROUTES.ORDERS}>
            {recent.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ProfileSection>
        )}

        {/* Menu — grouped into labeled sections (Yandex-style) so a long
            list of rows reads as 3 small scannable groups. */}
        <div className="profile-page__menu-group-label">ПОКУПКИ</div>
        <div className="profile-page__menu">
          <MenuRow to={ROUTES.ORDERS} icon={ICONS.orders} label="МОЇ ЗАМОВЛЕННЯ" badge={String(orders.length)} />
          <MenuRow to={ROUTES.FAVORITES} icon={ICONS.favorites} label="ЗАКЛАДКИ" badge={String(favorites.length)} />
        </div>

        <div className="profile-page__menu-group-label">АККАУНТ</div>
        <div className="profile-page__menu">
          <MenuRow to={ROUTES.ADDRESSES} icon={ICONS.address} label="АДРЕСИ ДОСТАВКИ" sub={addresses[0] ? `${addresses[0].city} · ${addresses[0].branch ?? ''}` : 'Не задано'} />
          <MenuRow to={ROUTES.PAYMENT_METHODS} icon={ICONS.card} label="ПЛАТІЖНІ КАРТКИ" sub={cards[0] ? `•••• ${cards[0].last4}` : 'Не додано'} />
          <MenuRow to={ROUTES.SETTINGS} icon={ICONS.settings} label="НАЛАШТУВАННЯ" />
        </div>

        <div className="profile-page__menu-group-label">ПІДТРИМКА</div>
        <div className="profile-page__menu">
          <MenuRow to={`${ROUTES.REQUEST}/callback`} icon={ICONS.support} label="ПІДТРИМКА" />
        </div>
      </ScreenContainer>
    </>
  )
}

function Stat({
  label,
  value,
  highlight = false,
  onClick,
}: {
  label: string
  value: number
  highlight?: boolean
  onClick?: () => void
}) {
  const className = `profile-page__stat ${highlight ? 'profile-page__stat--highlight' : ''}`
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        <span className="profile-page__stat-value">{value}</span>
        <span className="profile-page__stat-label">{label}</span>
      </button>
    )
  }
  return (
    <div className={className}>
      <span className="profile-page__stat-value">{value}</span>
      <span className="profile-page__stat-label">{label}</span>
    </div>
  )
}

function ProfileSection({
  title,
  linkTo,
  linkLabel = 'ВСІ',
  children,
}: {
  title: string
  linkTo?: string
  linkLabel?: string
  children: ReactNode
}) {
  return (
    <section className="profile-page__section">
      <div className="profile-page__section-head">
        <h2 className="profile-page__section-title">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="profile-page__section-link">
            {linkLabel}
          </Link>
        )}
      </div>
      <div className="profile-page__section-body">{children}</div>
    </section>
  )
}

function OrderPreview({ order }: { order: Order }) {
  const eta = order.estimatedArrival ? dateUA(order.estimatedArrival) : 'найближчим часом'
  return (
    <Link to={orderDetailPath(order.id)} className="profile-page__active-card">
      <div className="profile-page__active-head">
        <StatusDot status={order.status} />
        <span className="profile-page__active-status">{ORDER_STATUS_LABELS[order.status]}</span>
        <span className="profile-page__active-id">№ {order.number}</span>
      </div>
      <p className="profile-page__active-eta">Очікувана доставка: {eta}</p>
      <p className="profile-page__active-tracking">
        {order.deliveryCity}{order.deliveryBranch ? `, ${order.deliveryBranch}` : ''} · {order.trackingNumber ?? '—'}
      </p>
    </Link>
  )
}

function OrderRow({ order }: { order: Order }) {
  return (
    <Link to={orderDetailPath(order.id)} className="profile-page__order-row">
      <div className="profile-page__order-left">
        <span className="profile-page__order-number">№ {order.number}</span>
        <span className="profile-page__order-date">{dateUA(order.createdAt)}</span>
      </div>
      <div className="profile-page__order-mid">
        <StatusDot status={order.status} />
        <span className="profile-page__order-status">{ORDER_STATUS_LABELS[order.status]}</span>
      </div>
      <div className="profile-page__order-right">
        <span className="profile-page__order-total">{formatMoney(order.total, order.currency)}</span>
        {ICONS.chevron}
      </div>
    </Link>
  )
}

function MenuRow({
  to,
  icon,
  label,
  sub,
  badge,
}: {
  to: string
  icon: ReactNode
  label: string
  sub?: string
  badge?: string
}) {
  return (
    <Link to={to} className="profile-page__menu-item">
      <span className="profile-page__menu-icon">{icon}</span>
      <span className="profile-page__menu-text">
        <span className="profile-page__menu-label">{label}</span>
        {sub && <span className="profile-page__menu-sub">{sub}</span>}
      </span>
      {badge && <span className="profile-page__menu-badge">{badge}</span>}
      {ICONS.chevron}
    </Link>
  )
}
