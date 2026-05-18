import { useNavigate } from 'react-router-dom'
import type { MarketplaceCategory } from '../../../../entities/category/model/category.types'
import { catalogCategoryPath } from '../../../../shared/config/routes'
import './CategoryCard.css'

const ICONS: Record<string, React.ReactNode> = {
  car: (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
      <path d="M8 20H24M8 20V24H10V22H22V24H24V20M8 20L10 13H22L24 20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 17H13M19 17H21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="11" cy="22" r="1.2" fill="currentColor" />
      <circle cx="21" cy="22" r="1.2" fill="currentColor" />
    </svg>
  ),
  charger: (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
      <rect x="8" y="6" width="16" height="22" stroke="currentColor" strokeWidth="1" />
      <path d="M12 14L14 10L16 14H14.5L15.5 18L12.5 14H14Z" fill="currentColor" />
      <path d="M11 24H21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  shield: (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
      <path d="M16 4L6 8V16C6 21.5 10.4 26.7 16 28C21.6 26.7 26 21.5 26 16V8L16 4Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M12 16L14.5 18.5L20 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  tire: (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1" />
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1" />
      <path d="M16 6V10M16 22V26M6 16H10M22 16H26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  panel: (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="16" stroke="currentColor" strokeWidth="1" />
      <path d="M4 11H28M4 16H28M12 6V22M20 6V22" stroke="currentColor" strokeWidth="1" />
      <path d="M14 26H18M16 22V26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
}

type Props = {
  category: MarketplaceCategory
  productCount?: number
}

export function CategoryCard({ category, productCount }: Props) {
  const navigate = useNavigate()

  return (
    <button
      className="category-card"
      onClick={() => navigate(catalogCategoryPath(category.id))}
    >
      <span className="category-card__image">
        {ICONS[category.icon] ?? ICONS.car}
      </span>
      <span className="category-card__label">{category.title}</span>
      {productCount !== undefined && (
        <span className="category-card__count">{productCount}</span>
      )}
    </button>
  )
}
