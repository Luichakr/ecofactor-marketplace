import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import { ROUTES } from '../../../../shared/config/routes'
import './HomePromoSlider.css'

type Slide = {
  id: string
  title: string
  subtitle?: string
  /** Material Symbol glyph shown on the right side of the banner. */
  icon: string
  href: string
  /** CSS gradient for the slide background. */
  gradient: string
}

// Promo slides — real ECOFACTOR offers (free maintenance for Ukrainians,
// installments, free delivery) styled Monobank/Rozetka-like.
const SLIDES: Slide[] = [
  {
    id: 'service',
    title: 'Безкоштовне\nобслуговування станцій',
    subtitle: 'Для всіх водіїв в Україні',
    icon: 'handyman',
    href: `${ROUTES.CATALOG}/ev-charging?view=2`,
    gradient: 'linear-gradient(135deg, #008033 0%, #10b452 100%)',
  },
  {
    id: 'installments',
    title: 'Розстрочка 0%\nна зарядні станції',
    subtitle: 'А доставка по Україні — безкоштовна!',
    icon: 'ev_station',
    href: ROUTES.CATALOG,
    gradient: 'linear-gradient(135deg, #5b5bd6 0%, #8b5cf6 100%)',
  },
  {
    id: 'backup',
    title: 'Резерв для дому\nна випадок відключень',
    subtitle: 'Сонячні станції та батареї 24/7',
    icon: 'battery_charging_full',
    href: `${ROUTES.CATALOG}/solar?view=2`,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
]

export function HomePromoSlider() {
  const navigate = useNavigate()
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function onScroll() {
    const rail = railRef.current
    if (!rail) return
    const i = Math.round(rail.scrollLeft / rail.clientWidth)
    if (i !== active) setActive(i)
  }

  return (
    <div className="promo-slider">
      <div className="promo-slider__rail" ref={railRef} onScroll={onScroll}>
        {SLIDES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="promo-slider__slide"
            style={{ background: s.gradient }}
            onClick={() => navigate(s.href)}
          >
            <span className="promo-slider__text">
              <span className="promo-slider__title">{s.title}</span>
              {s.subtitle && <span className="promo-slider__subtitle">{s.subtitle}</span>}
            </span>
            <span className="promo-slider__icon" aria-hidden="true">
              <Icon name={s.icon} size={56} />
            </span>
          </button>
        ))}
      </div>

      <div className="promo-slider__dots" aria-hidden="true">
        {SLIDES.map((s, i) => (
          <span
            key={s.id}
            className={`promo-slider__dot ${i === active ? 'promo-slider__dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
