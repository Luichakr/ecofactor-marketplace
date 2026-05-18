import { favorites, useIsFavorite } from '../../model/favoritesStore'
import './FavoriteButton.css'

type Props = {
  productId: string
  /** Optional extra class for absolute-positioning over a photo etc. */
  className?: string
  /** Icon size in px. Default 18. */
  size?: number
  /** Whether the button is visible without a background. Default true. */
  bare?: boolean
  /** Stop click propagation so card-click doesn't fire. Default true. */
  stopPropagation?: boolean
}

export function FavoriteButton({
  productId,
  className = '',
  size = 18,
  bare = false,
  stopPropagation = true,
}: Props) {
  const active = useIsFavorite(productId)

  function handle(e: React.MouseEvent) {
    if (stopPropagation) {
      e.stopPropagation()
      e.preventDefault()
    }
    favorites.toggle(productId)
  }

  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'fav-btn--active' : ''} ${bare ? 'fav-btn--bare' : ''} ${className}`}
      onClick={handle}
      aria-label={active ? 'Видалити з обраного' : 'Додати в обране'}
      aria-pressed={active}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}>
        <path
          d="M3 6.5C3 4 4.9 2 7.4 2C8.9 2 10.4 2.7 11.4 3.9L12 4.6L12.6 3.9C13.6 2.7 15.1 2 16.6 2C19.1 2 21 4 21 6.5C21 10.4 17.1 13.9 12 19C6.9 13.9 3 10.4 3 6.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
