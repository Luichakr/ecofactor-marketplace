import './EmptyState.css'

type Variant = 'default' | 'favorites' | 'cart' | 'orders' | 'leads' | 'search'

type Props = {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  /** Picks the hero illustration. Each variant has a distinct outline icon
   *  so users immediately understand what context the empty screen is in
   *  (heart for favorites, basket for cart, package for orders, etc). */
  variant?: Variant
}

function HeroIcon({ variant }: { variant: Variant }) {
  switch (variant) {
    case 'favorites':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path
            d="M36 60s-22-13-22-30c0-8 6-14 14-14 4 0 8 2 8 5 0-3 4-5 8-5 8 0 14 6 14 14 0 17-22 30-22 30z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )
    case 'cart':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path d="M14 20H58L52 50H20L14 20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M26 20V14C26 11 28 8 31 8H41C44 8 46 11 46 14V20" stroke="currentColor" strokeWidth="2" />
          <circle cx="26" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="48" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'orders':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path d="M10 22L36 10L62 22V52L36 64L10 52V22Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M10 22L36 34L62 22M36 34V64" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'leads':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path d="M6 12L66 36L6 60L18 36L6 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M18 36H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'search':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2" />
          <path d="M50 50L62 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="30" stroke="currentColor" strokeWidth="2" />
          <path d="M36 24V36M36 48H36.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
  }
}

export function EmptyState({ title, description, action, variant = 'default' }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <HeroIcon variant={variant} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && (
        <button className="empty-state__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
