import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import './MenuFab.css'

/**
 * Temporary floating "Меню" button.
 *
 * The bottom-nav slot that used to open the menu now returns the user to the
 * ECOFACTOR app ("Зарядка"). Until we decide where the menu entry should
 * permanently live, it rides as a round FAB stacked just above the support
 * chat button on the right edge.
 */
export function MenuFab() {
  const { pathname } = useLocation()
  // No point showing it while already on the menu.
  if (pathname.startsWith(ROUTES.MENU)) return null

  return (
    <Link to={ROUTES.MENU} className="menu-fab" aria-label="Меню">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 7H20M4 12H20M4 17H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Link>
  )
}
