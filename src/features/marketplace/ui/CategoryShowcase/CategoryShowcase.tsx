import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import { ROUTES, catalogCategoryPath } from '../../../../shared/config/routes'
import { SECTIONS } from '../../../../pages/menu/menuData'
import '../../../../pages/menu/MenuPage.css'
import './CategoryShowcase.css'

type Tile = {
  id: string
  label: string
  to: string
  image?: string
  icon?: ReactNode
}

// Home category tiles. The first three open their menu section (back button);
// the fourth jumps straight to the favorites page.
const TILES: Tile[] = [
  { id: 'charging', label: 'EV-зарядка', to: `${catalogCategoryPath('ev-charging')}?view=2`, image: SECTIONS.charging.visual[0]?.image },
  { id: 'solar', label: 'Сонце', to: '/menu/solar', image: SECTIONS.solar.visual[0]?.image },
  { id: 'about', label: 'Про нас', to: '/menu/about' },
  { id: 'favorites', label: 'Закладки', to: ROUTES.FAVORITES, icon: <Icon name="favorite" size={40} /> },
]

export function CategoryShowcase() {
  const navigate = useNavigate()

  return (
    <div className="category-showcase">
      <section className="menu-page__visual-row category-showcase__row">
        {TILES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="menu-page__visual-card"
            onClick={() => navigate(t.to)}
          >
            {t.image ? (
              <span className="menu-page__visual-card-image">
                <img src={t.image} alt={t.label} />
              </span>
            ) : t.icon ? (
              <span className="menu-page__visual-card-image category-showcase__icon-tile">
                {t.icon}
              </span>
            ) : (
              <PlaceholderImage caption={t.label} size="720 × 960" aspectRatio="1 / 1" />
            )}
            <span className="menu-page__visual-card-label">{t.label}</span>
          </button>
        ))}
      </section>
    </div>
  )
}
