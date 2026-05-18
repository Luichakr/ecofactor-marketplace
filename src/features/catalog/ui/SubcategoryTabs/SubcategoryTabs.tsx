import type { MarketplaceSubcategory } from '../../../../entities/category/model/category.types'
import './SubcategoryTabs.css'

type Props = {
  subcategories: MarketplaceSubcategory[]
  active: string | null
  onChange: (subcategoryId: string | null) => void
  counts?: Record<string, number>
}

export function SubcategoryTabs({ subcategories, active, onChange, counts }: Props) {
  if (subcategories.length === 0) return null

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
