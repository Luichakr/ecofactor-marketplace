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
              d="M6 6h12v12L12 14.5L6 18Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
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
