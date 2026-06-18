import type { MarketplaceProduct } from '../../../entities/product/model/product.types'
import { catalogCategoryPath, ROUTES } from '../../../shared/config/routes'

export type HomeSection = {
  id: string
  title: string
  products: MarketplaceProduct[]
  viewAllTo?: string
}

const MAX = 10

function subOf(p: MarketplaceProduct): string | undefined {
  const a = p.attributes.find((x) => x.key === 'subcategory')
  return typeof a?.value === 'string' ? a.value : undefined
}

function byRating(a: MarketplaceProduct, b: MarketplaceProduct): number {
  return (b.rating?.average ?? 0) - (a.rating?.average ?? 0)
}

/**
 * Build the Monobank-style stack of themed home collections, entirely from
 * ECOFACTOR verticals (EV-зарядка + Сонячні станції). Every section is
 * feed-driven and self-hides when empty, so the home page only ever shows
 * collections we actually have stock for.
 */
export function buildHomeSections(all: MarketplaceProduct[]): HomeSection[] {
  const ev = all.filter((p) => p.categoryId === 'ev-charging')
  const solar = all.filter((p) => p.categoryId === 'solar')
  const evSub = (sub: string) => ev.filter((p) => subOf(p) === sub)
  const solarSub = (sub: string) => solar.filter((p) => subOf(p) === sub)

  const evLink = (sub?: string) =>
    `${catalogCategoryPath('ev-charging')}?view=2${sub ? `&sub=${sub}` : ''}`
  const solarLink = (sub?: string) =>
    `${catalogCategoryPath('solar')}?view=2${sub ? `&sub=${sub}` : ''}`

  const specs: HomeSection[] = [
    {
      id: 'hits',
      title: 'Хіти продажів',
      products: [...all].sort(byRating).slice(0, MAX),
      viewAllTo: `${ROUTES.CATALOG}/all`,
    },
    {
      id: 'mobile',
      title: 'Мобільні зарядки в дорогу',
      products: evSub('mobile-charging-stations').slice(0, MAX),
      viewAllTo: evLink('mobile-charging-stations'),
    },
    {
      id: 'sale',
      title: 'Знижки тижня',
      products: all.filter((p) => p.price?.oldValue).slice(0, MAX),
      viewAllTo: `${ROUTES.CATALOG}/all`,
    },
    {
      id: 'cables',
      title: 'Кабелі Type 2',
      products: evSub('cables').slice(0, MAX),
      viewAllTo: evLink('cables'),
    },
    {
      id: 'backup',
      title: 'Резерв для дому',
      products: solarSub('accumulator-batteries').slice(0, MAX),
      viewAllTo: solarLink('accumulator-batteries'),
    },
    {
      id: 'panels',
      title: 'Сонячні панелі',
      products: solarSub('solar-panels').slice(0, MAX),
      viewAllTo: solarLink('solar-panels'),
    },
    {
      id: 'inverters',
      title: 'Інвертори та гібриди',
      products: solarSub('hybrid-inverters').slice(0, MAX),
      viewAllTo: solarLink('hybrid-inverters'),
    },
    {
      id: 'accessories',
      title: 'Аксесуари для зарядки',
      products: evSub('accessories').slice(0, MAX),
      viewAllTo: evLink('accessories'),
    },
  ]

  // Keep only sections with at least 2 products so a rail never looks empty.
  return specs.filter((s) => s.products.length >= 2)
}
