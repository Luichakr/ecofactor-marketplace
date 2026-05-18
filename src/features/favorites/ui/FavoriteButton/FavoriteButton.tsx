import { favorites, useIsFavorite } from '../../model/favoritesStore'
import { showBookmarkToast } from '../BookmarkToast/bus'
import './FavoriteButton.css'

type Props = {
  productId: string
  /** Optional extra class for absolute-positioning over a photo etc. */
  className?: string
  /** Icon size in px. Default 18. */
  size?: number
  /** Whether the button is visible without a background. Default false. */
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
    const wasActive = active
    favorites.toggle(productId)
    if (!wasActive) showBookmarkToast()
  }

  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'fav-btn--active' : ''} ${bare ? 'fav-btn--bare' : ''} ${className}`}
      onClick={handle}
      aria-label={active ? 'Видалити із закладок' : 'Додати в закладки'}
      aria-pressed={active}
    >
      {/* Bookmark icon — outer envelope is a square (top/left/right edges
       *  all equal), V-notch cuts inward from the bottom. */}
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}>
        <path
          d="M6 6h12v12L12 14.5L6 18Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
