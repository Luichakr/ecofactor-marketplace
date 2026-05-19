import './StarRating.css'

type Props = {
  rating: number
  size?: number
  showValue?: boolean
  count?: number
}

export function StarRating({ rating, size = 14, showValue = false, count }: Props) {
  const r = Math.max(0, Math.min(5, rating))
  return (
    <span className="star-rating" aria-label={`Рейтинг ${r.toFixed(1)} з 5`}>
      <span className="star-rating__stars" style={{ fontSize: size }}>
        <span className="star-rating__empty">★★★★★</span>
        <span className="star-rating__filled" style={{ width: `${(r / 5) * 100}%` }}>
          ★★★★★
        </span>
      </span>
      {showValue && <span className="star-rating__value">{r.toFixed(1)}</span>}
      {typeof count === 'number' && <span className="star-rating__count">({count})</span>}
    </span>
  )
}
