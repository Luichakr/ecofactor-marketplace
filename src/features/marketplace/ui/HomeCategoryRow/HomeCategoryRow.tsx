import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import { ROUTES, catalogCategoryPath } from '../../../../shared/config/routes'
import './HomeCategoryRow.css'

type Tile = {
  id: string
  label: string
  icon: string
  to: string
}

// Single horizontal row of category shortcuts (Rozetka/Monobank style).
// First tile opens the full catalog; the rest jump into a category view.
const TILES: Tile[] = [
  { id: 'all', label: 'Всі категорії', icon: 'apps', to: ROUTES.CATALOG },
  { id: 'ev-charging', label: 'EV-зарядка', icon: 'ev_station', to: `${catalogCategoryPath('ev-charging')}?view=2` },
  { id: 'mobile', label: 'Мобільні', icon: 'bolt', to: `${catalogCategoryPath('ev-charging')}?view=2&sub=mobile-charging-stations` },
  { id: 'cables', label: 'Кабелі', icon: 'cable', to: `${catalogCategoryPath('ev-charging')}?view=2&sub=cables` },
  { id: 'solar', label: 'Сонце', icon: 'solar_power', to: `${catalogCategoryPath('solar')}?view=2` },
  { id: 'panels', label: 'Панелі', icon: 'grid_view', to: `${catalogCategoryPath('solar')}?view=2&sub=solar-panels` },
  { id: 'inverters', label: 'Інвертори', icon: 'electrical_services', to: `${catalogCategoryPath('solar')}?view=2&sub=hybrid-inverters` },
  { id: 'batteries', label: 'Батареї', icon: 'battery_charging_full', to: `${catalogCategoryPath('solar')}?view=2&sub=accumulator-batteries` },
]

export function HomeCategoryRow() {
  const navigate = useNavigate()

  return (
    <div className="home-cat-row">
      {TILES.map((t) => (
        <button
          key={t.id}
          type="button"
          className="home-cat-row__tile"
          onClick={() => navigate(t.to)}
        >
          <span className="home-cat-row__icon">
            <Icon name={t.icon} size={28} />
          </span>
          <span className="home-cat-row__label">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
