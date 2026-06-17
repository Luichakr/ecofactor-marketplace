import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ROUTES } from '../../config/routes'
import { useCartTotals } from '../../../features/cart/model/cartStore'
import { closeMarketplace } from '../../lib/webview/webviewBridge'
import { Icon } from '../Icon/Icon'
import './BottomNav.css'

/**
 * Single unified floating bar. "Зарядка" is the first item (a hand-off back to
 * the host ECOFACTOR charging app) followed by the four in-app routes. An
 * animated highlight slides to the active tab, and the whole bar shrinks —
 * narrower and shorter — while scrolling down, restoring on scroll-up.
 */
const PILL_LINKS = [
  { to: ROUTES.MARKETPLACE, end: true, icon: 'storefront', label: 'Маркет' },
  { to: ROUTES.FAVORITES, end: false, icon: 'favorite', label: 'Закладки' },
  { to: ROUTES.PROFILE, end: false, icon: 'person', label: 'Аккаунт' },
  { to: ROUTES.CART, end: false, icon: 'shopping_cart', label: 'Кошик' },
] as const

// Total slots in the pill = Зарядка + the route links. Equal-width flex items.
const SLOTS = PILL_LINKS.length + 1
// Horizontal padding inside the pill (must match .bottom-nav__pill padding).
const PAD = 6

function isMatch(pathname: string, to: string, end: boolean): boolean {
  return end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
}

export function BottomNav() {
  const { count } = useCartTotals()
  const { pathname } = useLocation()
  const [compact, setCompact] = useState(false)

  const activeIndex = PILL_LINKS.findIndex((l) => isMatch(pathname, l.to, l.end))
  // DOM slot of the active tab (Зарядка occupies slot 0).
  const slot = activeIndex + 1
  // Indicator geometry as a function of the pill width only — percentages mean
  // it tracks the bar's width animation in lockstep (no separate JS-driven
  // transform that could lag/desync). The `left` only changes when the active
  // tab changes, so the slide animation fires on tab switch, not on resize.
  const indicatorStyle = {
    left: `calc(${PAD}px + (100% - ${PAD * 2}px) * ${slot} / ${SLOTS})`,
    width: `calc((100% - ${PAD * 2}px) / ${SLOTS})`,
    opacity: activeIndex >= 0 ? 1 : 0,
  }

  // Shrink on scroll-down, restore on scroll-up. Scrolling happens inside the
  // page's .screen-container, so listen in the capture phase from the document.
  const lastYRef = useRef(0)
  useEffect(() => {
    let ticking = false
    function onScroll(e: Event) {
      const t = e.target as HTMLElement | null
      if (!t || typeof t.scrollTop !== 'number') return
      if (ticking) return
      ticking = true
      const y = t.scrollTop
      requestAnimationFrame(() => {
        const dy = y - lastYRef.current
        if (y < 24) setCompact(false)
        else if (dy > 6) setCompact(true)
        else if (dy < -6) setCompact(false)
        lastYRef.current = y
        ticking = false
      })
    }
    document.addEventListener('scroll', onScroll, true)
    return () => document.removeEventListener('scroll', onScroll, true)
  }, [])

  useEffect(() => {
    setCompact(false)
    lastYRef.current = 0
  }, [pathname])

  return (
    <nav className={`bottom-nav ${compact ? 'bottom-nav--compact' : ''}`}>
      <div className="bottom-nav__pill">
        <span className="bottom-nav__indicator" aria-hidden="true" style={indicatorStyle} />

        {/* Зарядка — returns to the host charging app (action, not a tab). */}
        <button
          type="button"
          className="bottom-nav__item bottom-nav__item--charge"
          onClick={closeMarketplace}
        >
          <span className="bottom-nav__icon">
            <Icon name="ev_station" size={24} />
          </span>
          <span className="bottom-nav__label">Зарядка</span>
        </button>

        {PILL_LINKS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          >
            <span className="bottom-nav__icon">
              <Icon name={it.icon} size={24} />
              {it.to === ROUTES.CART && count > 0 && (
                <span className="bottom-nav__badge">{count}</span>
              )}
            </span>
            <span className="bottom-nav__label">{it.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
