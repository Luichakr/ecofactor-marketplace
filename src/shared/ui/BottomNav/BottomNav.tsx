import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { useCartTotals } from '../../../features/cart/model/cartStore'
import { closeMarketplace } from '../../lib/webview/webviewBridge'
import './BottomNav.css'

/**
 * Floating frosted-glass bottom nav modeled after the partner Flutter app:
 *
 *   ┌──────────────────────────────────┐   ⃝
 *   │  ⌂   ☰   ♡   ⚲                  │  🛒
 *   └──────────────────────────────────┘
 *
 * Four navigation items live inside a pill with backdrop-filter blur so the
 * page content shows through. The cart sits outside as its own round FAB
 * (its badge stays prominent — never lost in the row of icons).
 *
 * Active item: vibrant brand green (#22c55e), readable on both dark and
 * light frosted backgrounds. Inactive items use the surrounding text colour.
 */
export function BottomNav() {
  const { count } = useCartTotals()

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__pill">
        <button
          type="button"
          className="bottom-nav__item bottom-nav__item--button"
          onClick={closeMarketplace}
          aria-label="Повернутись до зарядки"
        >
          <span className="bottom-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {/* EV charging station: body + screen + bolt + cable arm */}
              <path d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M5 21h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <rect x="7.3" y="5.4" width="4.4" height="3.3" rx="0.6" stroke="currentColor" strokeWidth="1.1" />
              <path d="M10.1 11l-2.2 3.9h2.1l-.6 2.9 2.9-4.1h-2l1-2.6z" fill="currentColor" />
              <path d="M14 9h1.7c.7 0 1.3.6 1.3 1.3V16a1.5 1.5 0 0 0 3 0v-4.6l-1.3-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="bottom-nav__label">Зарядка</span>
        </button>

        <NavLink
          to={ROUTES.MARKETPLACE}
          end
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10L12 3L21 10V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V10Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="bottom-nav__label">Маркет</span>
        </NavLink>

        <NavLink
          to={ROUTES.FAVORITES}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s-7-4.5-7-10.5C5 7.5 7.5 5 10.5 5c1.5 0 3 .8 1.5 2 1.5-1.2 3-2 4.5-2C19.5 5 22 7.5 22 10.5 22 16.5 12 21 12 21z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          <span className="bottom-nav__label">Закладки</span>
        </NavLink>

        <NavLink
          to={ROUTES.PROFILE}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M4 20.5C4 17.5 7.6 16 12 16C16.4 16 20 17.5 20 20.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="bottom-nav__label">Аккаунт</span>
        </NavLink>

        <NavLink
          to={ROUTES.CART}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 7H19L17.5 17H6.5L5 7Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M9 7V5C9 3.9 10 3 11 3H13C14 3 15 3.9 15 5V7" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            {count > 0 && <span className="bottom-nav__badge">{count}</span>}
          </span>
          <span className="bottom-nav__label">Кошик</span>
        </NavLink>
      </div>
    </nav>
  )
}
