import type { MarketplaceProduct } from '../../../entities/product/model/product.types'

// Map common UA/EN colour names → swatch hex. Lower-cased lookup.
const COLOR_HEX: Record<string, string> = {
  'білий': '#f2f2f2',
  'white': '#f2f2f2',
  'чорний': '#1c1c1e',
  'black': '#1c1c1e',
  'сірий': '#9a9a9a',
  'сірий графіт': '#5a5a5a',
  'графіт': '#5a5a5a',
  'grey': '#9a9a9a',
  'gray': '#9a9a9a',
  'сріблястий': '#c9ccce',
  'silver': '#c9ccce',
  'синій': '#2f5bd1',
  'blue': '#2f5bd1',
  'блакитний': '#5aa9e6',
  'червоний': '#e0322b',
  'red': '#e0322b',
  'зелений': '#10b452',
  'green': '#10b452',
  'жовтий': '#f2c200',
  'yellow': '#f2c200',
  'помаранчевий': '#f5811f',
  'оранжевий': '#f5811f',
  'orange': '#f5811f',
  'золотий': '#d4af37',
  'gold': '#d4af37',
  'рожевий': '#e88aa8',
  'pink': '#e88aa8',
  'бежевий': '#d9c9a8',
}

export type Swatch = { name: string; hex: string }

function toHex(name: string): string | null {
  return COLOR_HEX[name.trim().toLowerCase()] ?? null
}

function colorsOf(p: MarketplaceProduct): string[] {
  const attr = p.attributes.find((a) => a.key === 'color' || a.key === 'colors')
  if (!attr) return []
  if (Array.isArray(attr.value)) return attr.value.map(String)
  if (typeof attr.value === 'string') return [attr.value]
  return []
}

/**
 * Colour swatches for a card. Combines the product's own colour with any
 * sibling colour variants from the pool (same title/subtitle, different
 * colour) — mirroring the Monobank card where one model shows all colours.
 * Returns [] when no known colours, so the swatch row self-hides.
 */
export function getSwatches(product: MarketplaceProduct, pool?: MarketplaceProduct[]): Swatch[] {
  const names = new Set<string>(colorsOf(product))

  if (pool) {
    const key = (p: MarketplaceProduct) => `${p.categoryId}|${(p.subtitle ?? p.title).toLowerCase()}`
    const mine = key(product)
    for (const sib of pool) {
      if (key(sib) === mine) colorsOf(sib).forEach((c) => names.add(c))
    }
  }

  const out: Swatch[] = []
  for (const name of names) {
    const hex = toHex(name)
    if (hex && !out.some((s) => s.hex === hex)) out.push({ name, hex })
  }
  return out.slice(0, 4)
}
