import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { useCartTotals } from '../../../features/cart/model/cartStore'
import './BottomNav.css'

export function BottomNav() {
  const { count } = useCartTotals()

  return (
    <nav className="bottom-nav">
      <NavLink
        to={ROUTES.MARKETPLACE}
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 10L12 3L21 10V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V10Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="bottom-nav__label">Маркет</span>
      </NavLink>

      <NavLink
        to={ROUTES.MENU}
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 7H20M4 12H20M4 17H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="bottom-nav__label">Меню</span>
      </NavLink>

      <NavLink
        to={ROUTES.FAVORITES}
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21L10.5 19.7C5.4 15 2 11.95 2 8.2C2 5.15 4.4 2.75 7.45 2.75C9.2 2.75 10.85 3.55 12 4.8C13.15 3.55 14.8 2.75 16.55 2.75C19.6 2.75 22 5.15 22 8.2C22 11.95 18.6 15 13.5 19.7L12 21Z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </span>
        <span className="bottom-nav__label">Обране</span>
      </NavLink>

      <NavLink
        to={ROUTES.PROFILE}
        className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
      >
        <span className="bottom-nav__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M4 20.5C4 17.5 7.6 16 12 16C16.4 16 20 17.5 20 20.5"
              stroke="currentColor"
              strokeWidth="1.2"
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
        <span className="bottom-nav__icon bottom-nav__icon--cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 7H19L17.5 17H6.5L5 7Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M9 7V5C9 3.9 10 3 11 3H13C14 3 15 3.9 15 5V7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          {count > 0 && <span className="bottom-nav__badge">{count}</span>}
        </span>
        <span className="bottom-nav__label">Кошик</span>
      </NavLink>
    </nav>
  )
}
