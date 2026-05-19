import { describe, it, expect } from 'vitest'
import { filterProducts } from '../filterProducts'
import { mockProducts } from '../../../../data/mockProducts'

describe('filterProducts — tires', () => {
  it('filters by season=Літо', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: 'wheels',
      filters: { season: ['Літо'] },
      search: '',
    })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((p) => {
      const season = p.attributes.find((a) => a.key === 'season')
      expect(String(season?.value)).toBe('Літо')
    })
  })

  it('filters by diameter_min=18 (partial range)', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: 'wheels',
      filters: { diameter: { min: 18 } },
      search: '',
    })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((p) => {
      const dia = p.attributes.find((a) => a.key === 'diameter')
      expect(Number(dia?.value)).toBeGreaterThanOrEqual(18)
    })
  })

  it('filters by diameter_max=17 (partial range)', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: 'wheels',
      filters: { diameter: { max: 17 } },
      search: '',
    })
    result.forEach((p) => {
      const dia = p.attributes.find((a) => a.key === 'diameter')
      expect(Number(dia?.value)).toBeLessThanOrEqual(17)
    })
  })

  it('filters by diameter full range [16,18]', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: 'wheels',
      filters: { diameter: { min: 16, max: 18 } },
      search: '',
    })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((p) => {
      const dia = Number(p.attributes.find((a) => a.key === 'diameter')?.value)
      expect(dia).toBeGreaterThanOrEqual(16)
      expect(dia).toBeLessThanOrEqual(18)
    })
  })
})

describe('filterProducts — charging-stations boolean', () => {
  it('filters smartFeatures=true', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: 'ev-charging',
      filters: { smartFeatures: ['true'] },
      search: '',
    })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((p) => {
      const sf = p.attributes.find((a) => a.key === 'smartFeatures')
      expect(String(sf?.value)).toBe('true')
    })
  })
})

// Insurance fixtures removed — no matching marketplace category. The
// boolean-filter contract is still covered by smartFeatures above.

describe('filterProducts — category isolation', () => {
  it('only returns products for the given category', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: 'wheels',
      filters: {},
      search: '',
    })
    result.forEach((p) => expect(p.categoryId).toBe('wheels'))
  })

  it('returns all products when no categoryId', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: undefined,
      filters: {},
      search: '',
    })
    expect(result.length).toBe(mockProducts.length)
  })
})

describe('filterProducts — text search', () => {
  it('finds by title keyword', () => {
    const result = filterProducts({
      products: mockProducts,
      categoryId: undefined,
      filters: {},
      search: 'michelin',
    })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((p) =>
      expect(p.title.toLowerCase()).toContain('michelin'),
    )
  })
})
