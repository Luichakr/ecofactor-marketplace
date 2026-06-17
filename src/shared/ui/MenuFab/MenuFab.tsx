import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import './MenuFab.css'

/**
 * Temporary floating "Меню" button — a round FAB above the bottom nav on the
 * right. Hidden on the menu itself and on pages that already own the
 * bottom-right corner (product page has its scroll-to-top FAB; product/cart/
 * checkout carry a sticky CTA the FAB would collide with).
 */
const HIDE_ON = [ROUTES.MENU, '/products/', '/cart', '/checkout']

export function MenuFab() {
  const { pathname } = useLocation()
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null

  return (
    <Link to={ROUTES.MENU} className="menu-fab" aria-label="Меню">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 7H20M4 12H20M4 17H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Link>
  )
}
