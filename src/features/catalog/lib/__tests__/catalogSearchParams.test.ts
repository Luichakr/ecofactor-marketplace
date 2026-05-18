import { describe, it, expect } from 'vitest'
import { parseCatalogSearchParams, buildCatalogSearchParams } from '../catalogSearchParams'
import type { RangeFilterValue } from '../../model/catalog.types'

function sp(query: string) {
  return new URLSearchParams(query)
}

describe('parseCatalogSearchParams', () => {
  it('parses select filter and full range', () => {
    const result = parseCatalogSearchParams(sp('season=%D0%9B%D1%96%D1%82%D0%BE&diameter_min=18&diameter_max=20'))
    expect(result.filters.season).toEqual(['Літо'])
    expect(result.filters.diameter).toEqual({ min: 18, max: 20 })
  })

  it('parses min-only range', () => {
    const result = parseCatalogSearchParams(sp('diameter_min=18'))
    expect(result.filters.diameter).toEqual({ min: 18 })
    expect((result.filters.diameter as RangeFilterValue).max).toBeUndefined()
  })

  it('parses max-only range', () => {
    const result = parseCatalogSearchParams(sp('diameter_max=20'))
    expect(result.filters.diameter).toEqual({ max: 20 })
    expect((result.filters.diameter as RangeFilterValue).min).toBeUndefined()
  })

  it('parses boolean stored as string value', () => {
    const result = parseCatalogSearchParams(sp('smartFeatures=true'))
    expect(result.filters.smartFeatures).toEqual(['true'])
  })

  it('parses multi-value select', () => {
    const result = parseCatalogSearchParams(sp('season=%D0%9B%D1%96%D1%82%D0%BE&season=%D0%97%D0%B8%D0%BC%D0%B0'))
    expect(result.filters.season).toEqual(['Літо', 'Зима'])
  })

  it('parses search and sort', () => {
    const result = parseCatalogSearchParams(sp('q=michelin&sort=priceAsc'))
    expect(result.search).toBe('michelin')
    expect(result.sort).toBe('priceAsc')
  })

  it('defaults sort to recommended for unknown value', () => {
    const result = parseCatalogSearchParams(sp('sort=invalid'))
    expect(result.sort).toBe('recommended')
  })

  it('ignores category, q, sort as filter keys', () => {
    const result = parseCatalogSearchParams(sp('category=tires&q=test&sort=priceAsc'))
    expect(result.filters.category).toBeUndefined()
    expect(result.filters.q).toBeUndefined()
    expect(result.filters.sort).toBeUndefined()
  })
})

describe('buildCatalogSearchParams', () => {
  it('builds params for search + sort + filters', () => {
    const sp = buildCatalogSearchParams({
      search: 'michelin',
      sort: 'priceAsc',
      filters: {
        season: ['Літо'],
        diameter: { min: 18 },
      },
    })
    expect(sp.get('q')).toBe('michelin')
    expect(sp.get('sort')).toBe('priceAsc')
    expect(sp.getAll('season')).toEqual(['Літо'])
    expect(sp.get('diameter_min')).toBe('18')
    expect(sp.get('diameter_max')).toBeNull()
  })

  it('omits sort when recommended', () => {
    const sp = buildCatalogSearchParams({ search: '', sort: 'recommended', filters: {} })
    expect(sp.get('sort')).toBeNull()
  })

  it('omits empty string[] filter', () => {
    const sp = buildCatalogSearchParams({ search: '', sort: 'recommended', filters: { season: [] } })
    expect(sp.get('season')).toBeNull()
  })

  it('emits both bounds when both set', () => {
    const sp = buildCatalogSearchParams({
      search: '',
      sort: 'recommended',
      filters: { diameter: { min: 16, max: 20 } },
    })
    expect(sp.get('diameter_min')).toBe('16')
    expect(sp.get('diameter_max')).toBe('20')
  })

  it('emits only max when min absent', () => {
    const sp = buildCatalogSearchParams({
      search: '',
      sort: 'recommended',
      filters: { diameter: { max: 20 } },
    })
    expect(sp.get('diameter_min')).toBeNull()
    expect(sp.get('diameter_max')).toBe('20')
  })
})
