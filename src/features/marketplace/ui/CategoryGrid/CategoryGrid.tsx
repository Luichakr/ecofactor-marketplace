import type { MarketplaceCategory } from '../../../../entities/category/model/category.types'
import { CategoryCard } from '../CategoryCard/CategoryCard'
import './CategoryGrid.css'

type Props = {
  categories: MarketplaceCategory[]
  productCounts?: Record<string, number>
}

export function CategoryGrid({ categories, productCounts }: Props) {
  return (
    <div className="category-grid">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          productCount={productCounts?.[cat.id]}
        />
      ))}
    </div>
  )
}
