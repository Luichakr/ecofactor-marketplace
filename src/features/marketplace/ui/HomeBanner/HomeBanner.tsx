import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { catalogCategoryPath } from '../../../../shared/config/routes'
import './HomeBanner.css'

type Props = {
  categoryId: string
  label: string
  image?: string
  imageAlt?: string
  /**
   * Layout for the photo.
   *  - "studio"  (default): centered, object-fit: contain, light bg, dark label.
   *    Use for transparent product shots (most API images).
   *  - "fullBleed": object-fit: cover, no padding, label white over a soft dark gradient.
   *    Use for editorial photos with their own background.
   */
  variant?: 'studio' | 'fullBleed'
  /** Optional content slotted at the top of the banner (e.g. logo). */
  topSlot?: ReactNode
}

export function HomeBanner({
  categoryId,
  label,
  image,
  imageAlt,
  variant = 'studio',
  topSlot,
}: Props) {
  const navigate = useNavigate()

  return (
    <article className={`home-banner home-banner--${variant}`}>
      <button
        className="home-banner__hit"
        onClick={() => navigate(catalogCategoryPath(categoryId))}
        aria-label={label}
        type="button"
      >
        {image ? (
          <span className="home-banner__image-frame">
            <img className="home-banner__image" src={image} alt={imageAlt ?? label} />
          </span>
        ) : (
          <div className="home-banner__placeholder" />
        )}
        {variant === 'fullBleed' && <div className="home-banner__overlay" />}
        <h2 className="home-banner__label">{label}</h2>
      </button>

      {topSlot && <div className="home-banner__top-slot">{topSlot}</div>}
    </article>
  )
}
