import type { MarketplaceSubcategory } from '../../../../entities/category/model/category.types'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import './SubcategoryTabs.css'

type Props = {
  subcategories: MarketplaceSubcategory[]
  active: string | null
  onChange: (subcategoryId: string | null) => void
  counts?: Record<string, number>
  /** 'text' (default) = pill tabs; 'tiles' = square icon tiles like home. */
  variant?: 'text' | 'tiles'
}

// Material Symbols glyph per subcategory id (tiles variant); fallback below.
const SUBCATEGORY_ICONS: Record<string, string> = {
  'mobile-charging-stations': 'ev_station',
  cables: 'cable',
  accessories: 'category',
  'solar-panels': 'solar_power',
  'hybrid-inverters': 'bolt',
  'accumulator-batteries': 'battery_charging_full',
  komplektuiuchi: 'handyman',
}
const FALLBACK_ICON = 'category'
const ALL_ICON = 'apps'

export function SubcategoryTabs({ subcategories, active, onChange, counts, variant = 'text' }: Props) {
  if (subcategories.length === 0) return null

  if (variant === 'tiles') {
    const tiles = [
      { id: null as string | null, title: 'Всі', icon: ALL_ICON },
      ...subcategories.map((s) => ({ id: s.id, title: s.title, icon: SUBCATEGORY_ICONS[s.id] ?? FALLBACK_ICON })),
    ]
    return (
      <div className="subcategory-tabs subcategory-tabs--tiles">
        {tiles.map((t) => (
          <button
            key={t.id ?? 'all'}
            type="button"
            className={`subcategory-tile ${active === t.id ? 'subcategory-tile--active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            <span className="subcategory-tile__icon">
              <Icon name={t.icon} filled={active === t.id} size={28} />
            </span>
            <span className="subcategory-tile__label">
              {t.title}
              {t.id && counts && counts[t.id] !== undefined && ` (${counts[t.id]})`}
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="subcategory-tabs">
      <button
        className={`subcategory-tabs__item ${active === null ? 'subcategory-tabs__item--active' : ''}`}
        onClick={() => onChange(null)}
      >
        ВСІ
      </button>
      {subcategories.map((s) => (
        <button
          key={s.id}
          className={`subcategory-tabs__item ${active === s.id ? 'subcategory-tabs__item--active' : ''}`}
          onClick={() => onChange(s.id)}
        >
          {s.title.toUpperCase()}
          {counts && counts[s.id] !== undefined && (
            <span className="subcategory-tabs__count">({counts[s.id]})</span>
          )}
        </button>
      ))}
    </div>
  )
}
