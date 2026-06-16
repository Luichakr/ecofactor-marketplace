import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { useCartTotals } from '../../../features/cart/model/cartStore'
import { closeMarketplace } from '../../lib/webview/webviewBridge'
import { Icon } from '../Icon/Icon'
import './BottomNav.css'

/**
 * Floating bottom nav. "Зарядка" is a standalone round button on the LEFT —
 * a hand-off back to the host ECOFACTOR charging app (the marketplace runs
 * embedded in its WebView). It sits apart from the pill to read as "leave
 * the shop", not a shop tab. The pill holds the four in-app routes.
 */
export function BottomNav() {
  const { count } = useCartTotals()

  const links = [
    { to: ROUTES.MARKETPLACE, end: true, icon: 'storefront', label: 'Маркет' },
    { to: ROUTES.FAVORITES, end: false, icon: 'favorite', label: 'Закладки' },
    { to: ROUTES.PROFILE, end: false, icon: 'person', label: 'Аккаунт' },
  ] as const

  return (
    <nav className="bottom-nav">
      {/* Зарядка — separate round segment; returns to the host charging app. */}
      <button type="button" className="bottom-nav__charge" onClick={closeMarketplace}>
        <span className="bottom-nav__icon">
          <Icon name="ev_station" size={24} />
        </span>
        <span className="bottom-nav__label">Зарядка</span>
      </button>

      <div className="bottom-nav__pill">
        {links.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          >
            <span className="bottom-nav__icon">
              <Icon name={it.icon} size={24} />
            </span>
            <span className="bottom-nav__label">{it.label}</span>
          </NavLink>
        ))}

        <NavLink
          to={ROUTES.CART}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <Icon name="shopping_cart" size={24} />
            {count > 0 && <span className="bottom-nav__badge">{count}</span>}
          </span>
          <span className="bottom-nav__label">Кошик</span>
        </NavLink>
      </div>
    </nav>
  )
}
