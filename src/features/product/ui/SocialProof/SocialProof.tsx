import './SocialProof.css'

type Props = {
  productId: string
  variant?: 'compact' | 'full'
}

/**
 * Synthesises social-proof badges from a product id so the same product
 * always shows the same numbers. Real-time counters can replace this seed
 * without touching the call-site.
 */
export function SocialProof({ productId, variant = 'full' }: Props) {
  const seed = productId.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const viewers = 3 + (seed % 80)
  const monthly = 8 + (seed % 60)
  const weekly = 2 + (seed % 25)

  if (variant === 'compact') {
    if (weekly < 10) return null
    return (
      <span className="social-proof social-proof--compact">
        <FlameIcon /> {weekly} куплено за тиждень
      </span>
    )
  }

  return (
    <div className="social-proof">
      {viewers >= 5 && (
        <span className="social-proof__line">
          <EyeIcon /> {viewers} людей дивляться зараз
        </span>
      )}
      {monthly >= 10 && (
        <span className="social-proof__line">
          <BoxIcon /> {monthly} продано за останній місяць
        </span>
      )}
    </div>
  )
}

function FlameIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3C12 7 7 8 7 13C7 16.866 9.686 19 12 19C14.314 19 17 16.866 17 13C17 11 16 9.5 14.5 8C14 11 12 11 12 8C12 6 13 4.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12C4 7 7.5 5 12 5S20 7 22 12C20 17 16.5 19 12 19S4 17 2 12Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8L12 3L21 8V17L12 22L3 17V8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M3 8L12 13L21 8M12 13V22" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
