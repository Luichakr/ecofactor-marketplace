import { useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockUser } from '../../data/mockUser'
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
import { getLaunchParams } from '../../shared/lib/webview/launchParams'
import { Icon } from '../../shared/ui/Icon/Icon'
import './ProfilePage.css'

// Identity from the host app (window.ECOFACTOR_MARKET / URL). Falls back to
// the mock user when running standalone on the web.
const launch = getLaunchParams()
const displayName = launch.name || mockUser.name
const displayPhone = launch.phone || mockUser.phone
const displayEmail = launch.email || mockUser.email
const displayInitials = (launch.name || mockUser.name)
  .split(' ')
  .map((w) => w[0])
  .slice(0, 2)
  .join('')
  .toUpperCase()

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
      ? 'var(--color-success)'
      : status === 'cancelled' || status === 'returned'
        ? 'var(--color-error)'
        : status === 'shipped'
          ? 'var(--color-info)'
          : 'var(--color-text-muted)'
  return <span className="profile-page__dot" style={{ background: color }} aria-hidden="true" />
}

const ICONS = {
  orders: <Icon name="package_2" size={22} />,
  favorites: <Icon name="favorite" size={22} />,
  address: <Icon name="location_on" size={22} />,
  card: <Icon name="credit_card" size={22} />,
  settings: <Icon name="settings" size={22} />,
  support: <Icon name="support_agent" size={22} />,
  chevron: <Icon name="chevron_right" size={20} />,
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
              <span className="profile-page__avatar-initials">{displayInitials}</span>
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
            <p className="profile-page__name">{displayName}</p>
            <p className="profile-page__phone">{displayPhone}</p>
            {displayEmail && <p className="profile-page__email">{displayEmail}</p>}
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
            <Icon name="chat_bubble" size={22} />
          </button>
        </div>

        {/* Quick stats — orders count, favorites count, active deliveries.
            Each tile navigates into the matching list (orders with status
            filter, favorites grid). */}
        <div className="profile-page__stats">
          <Stat label="Замовлень" value={orders.length} onClick={() => navigate(ROUTES.ORDERS)} />
          <Stat label="Активні" value={activeOrders.length} onClick={() => navigate(`${ROUTES.ORDERS}?status=active`)} />
          <Stat label="Закладки" value={favorites.length} onClick={() => navigate(ROUTES.FAVORITES)} />
        </div>

        {/* Active deliveries call-out */}
        {activeOrders.length > 0 && (
          <ProfileSection title="В дорозі" linkTo={ROUTES.ORDERS}>
            {activeOrders.slice(0, 2).map((o) => (
              <OrderPreview key={o.id} order={o} />
            ))}
          </ProfileSection>
        )}

        {/* Recent orders */}
        {recent.length > 0 && (
          <ProfileSection title="Останні замовлення" linkLabel="Всі" linkTo={ROUTES.ORDERS}>
            {recent.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ProfileSection>
        )}

        {/* Menu — grouped into labeled sections (Yandex-style) so a long
            list of rows reads as 3 small scannable groups. */}
        <div className="profile-page__menu-group-label">Покупки</div>
        <div className="profile-page__menu">
          <MenuRow to={ROUTES.ORDERS} icon={ICONS.orders} label="Мої замовлення" badge={String(orders.length)} />
          <MenuRow to={ROUTES.FAVORITES} icon={ICONS.favorites} label="Закладки" badge={String(favorites.length)} />
        </div>

        <div className="profile-page__menu-group-label">Аккаунт</div>
        <div className="profile-page__menu">
          <MenuRow to={ROUTES.ADDRESSES} icon={ICONS.address} label="Адреси доставки" sub={addresses[0] ? `${addresses[0].city} · ${addresses[0].branch ?? ''}` : 'Не задано'} />
          <MenuRow to={ROUTES.PAYMENT_METHODS} icon={ICONS.card} label="Платіжні картки" sub={cards[0] ? `•••• ${cards[0].last4}` : 'Не додано'} />
          <MenuRow to={ROUTES.SETTINGS} icon={ICONS.settings} label="Налаштування" />
        </div>

        <div className="profile-page__menu-group-label">Підтримка</div>
        <div className="profile-page__menu">
          <MenuRow to={`${ROUTES.REQUEST}/callback`} icon={ICONS.support} label="Підтримка" />
        </div>

        {/* Legal footer — moved here from the (unused) home footer. */}
        <footer className="profile-page__legal">
          <p className="profile-page__legal-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Політика конфіденційності</a>
            <span aria-hidden="true">·</span>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Умови використання</a>
          </p>
          <p className="profile-page__legal-small">Управління конфіденційністю</p>
        </footer>
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
  linkLabel = 'Всі',
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
