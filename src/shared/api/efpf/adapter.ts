import type { MarketplaceProduct, ProductAttribute, ProductStatus } from '../../../entities/product/model/product.types'
import type { MarketplaceCategoryId } from '../../../entities/category/model/category.types'
import type { EfpfProduct } from './types'

/**
 * EFPF category slug -> our top-level category id + subcategory id.
 * Subcategory id stays equal to the EFPF slug so it can be filtered
 * directly from URL params or chip strips.
 */
type Routing = {
  categoryId: MarketplaceCategoryId
  subcategoryId: string
  subcategoryTitle: string
}

const EFPF_CATEGORY_ROUTING: Record<string, Routing> = {
  // EV charging vertical
  'mobile-charging-stations': { categoryId: 'ev-charging', subcategoryId: 'mobile-charging-stations', subcategoryTitle: 'Мобільні зарядки' },
  'cables':                    { categoryId: 'ev-charging', subcategoryId: 'cables',                    subcategoryTitle: 'Кабелі' },
  'accessories':               { categoryId: 'ev-charging', subcategoryId: 'accessories',               subcategoryTitle: 'Аксесуари' },

  // Solar vertical
  'solar-panels':              { categoryId: 'solar', subcategoryId: 'solar-panels',          subcategoryTitle: 'Сонячні панелі' },
  'hybrid-inverters':          { categoryId: 'solar', subcategoryId: 'hybrid-inverters',      subcategoryTitle: 'Гібридні інвертори' },
  'accumulator-batteries':     { categoryId: 'solar', subcategoryId: 'accumulator-batteries', subcategoryTitle: 'Акумуляторні батареї' },
  'komplektuiuchi':            { categoryId: 'solar', subcategoryId: 'komplektuiuchi',        subcategoryTitle: 'Комплектуючі' },
}

function stripHtml(html: string): string {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim()
}

function mapStatus(stock: EfpfProduct['stock']): ProductStatus {
  return stock.in_stock ? 'inStock' : 'available'
}

function mapPriceCurrency(currency: string): 'UAH' | 'USD' | 'EUR' | 'PLN' {
  if (currency === 'UAH' || currency === 'USD' || currency === 'EUR' || currency === 'PLN') return currency
  return 'UAH'
}

function pickRouting(item: EfpfProduct): Routing | null {
  for (const c of item.categories) {
    const r = EFPF_CATEGORY_ROUTING[c.slug]
    if (r) return r
  }
  return null
}

function mapAttributes(item: EfpfProduct, routing: Routing): ProductAttribute[] {
  const out: ProductAttribute[] = []

  out.push({
    key: 'subcategory',
    label: 'Тип',
    // Store the subcategory id (matches mockCategories.subcategories[].id and
    // the `?sub=` URL param) so filter logic compares ids consistently.
    value: routing.subcategoryId,
    type: 'select',
    filterable: true,
    visibleInCard: false,
    visibleInDetails: true,
    priority: 1,
  })

  const manufacturer = item.attributes.find((a) => a.key === 'pa_manufacturer')
  if (manufacturer && manufacturer.options.length > 0) {
    out.push({
      key: 'manufacturer',
      label: 'Виробник',
      value: manufacturer.options.map((o) => o.name).join(', '),
      type: 'select',
      filterable: true,
      visibleInCard: false,
      visibleInDetails: true,
      priority: 2,
    })
  }

  const power = item.attributes.find((a) => a.key === 'pa_power')
  if (power && power.options.length > 0) {
    const values = power.options.map((o) => o.name)
    out.push({
      key: 'power',
      label: 'Потужність',
      value: values.length === 1 ? values[0] : values.join(' / '),
      type: 'select',
      filterable: true,
      visibleInCard: false,
      visibleInDetails: true,
      priority: 3,
    })
  }

  const port = item.attributes.find((a) => a.key === 'pa_port_type' || a.key === 'pa_plug_type')
  if (port && port.options.length > 0) {
    out.push({
      key: 'connector',
      label: 'Тип конектора',
      value: port.options.map((o) => o.name).join(', '),
      type: 'select',
      filterable: true,
      visibleInCard: false,
      visibleInDetails: true,
      priority: 4,
    })
  }

  const pinned = new Set(['pa_manufacturer', 'pa_power', 'pa_port_type', 'pa_plug_type'])
  let p = 10
  for (const a of item.attributes) {
    if (pinned.has(a.key) || !a.visible || a.options.length === 0) continue
    out.push({
      key: a.key,
      label: a.name,
      value: a.options.map((o) => o.name).join(', '),
      type: 'select',
      filterable: false,
      visibleInDetails: true,
      priority: p++,
    })
  }

  return out
}

/**
 * Adapt one EFPF product into a MarketplaceProduct. Returns null if the product
 * doesn't belong to a known top-level category.
 */
export function adaptEfpfProduct(item: EfpfProduct): MarketplaceProduct | null {
  const routing = pickRouting(item)
  if (!routing) return null

  const priceValue = item.price.current ? Number(item.price.current) : undefined
  const badges: string[] = []
  if (item.price.on_sale) badges.push('Знижка')

  return {
    id: `efpf-${item.id}`,
    categoryId: routing.categoryId,
    title: item.name,
    subtitle: stripHtml(item.short_description).slice(0, 120) || undefined,
    description: stripHtml(item.description) || undefined,
    price: priceValue !== undefined ? {
      value: priceValue,
      currency: mapPriceCurrency(item.price.currency),
    } : undefined,
    status: mapStatus(item.stock),
    image: item.images.main?.full,
    gallery: item.images.gallery.map((g) => g.full),
    badges: badges.length > 0 ? badges : undefined,
    attributes: mapAttributes(item, routing),
    createdAt: item.modified_at,
  }
}

export function adaptEfpfProducts(items: EfpfProduct[]): MarketplaceProduct[] {
  const out: MarketplaceProduct[] = []
  for (const it of items) {
    const adapted = adaptEfpfProduct(it)
    if (adapted) out.push(adapted)
  }
  return out
}
