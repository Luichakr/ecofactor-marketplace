import { useNavigate } from 'react-router-dom'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import type { SponsoredCard } from '../../../../data/sponsored'
import './SponsoredSlot.css'

type Props = { card: SponsoredCard }

/**
 * Full-width "РЕКЛАМА" placement — modeled after Yandex Market's inline
 * sponsored card. Left thumbnail + right copy column + small "РЕКЛАМА"
 * label and partner domain in the corners. Whole surface is tappable.
 */
export function SponsoredSlot({ card }: Props) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="sponsored-slot"
      onClick={() => navigate(card.href)}
    >
      <span className="sponsored-slot__label">РЕКЛАМА</span>
      <span className="sponsored-slot__info" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 11V17M12 7.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>

      <div className="sponsored-slot__media">
        {card.image ? (
          <img src={card.image} alt="" loading="lazy" />
        ) : (
          <PlaceholderImage size="" aspectRatio="1 / 1" />
        )}
      </div>

      <div className="sponsored-slot__body">
        <h3 className="sponsored-slot__title">{card.title}</h3>
        {card.subtitle && <p className="sponsored-slot__subtitle">{card.subtitle}</p>}
        <span className="sponsored-slot__partner">{card.partner} ›</span>
      </div>
    </button>
  )
}
