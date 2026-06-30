import './PromoBadge.css'

/**
 * Promoted-listing badge, overlaid top-left on the cover photo.
 * ТОП = green (brand), VIP = gold gradient. Bump has no badge.
 */
export function PromoBadge({ type }: { type: 'top' | 'vip' }) {
  return (
    <span className={`promo-badge promo-badge--${type}`}>
      {type === 'vip' ? '★ VIP' : '▲ ТОП'}
    </span>
  )
}
