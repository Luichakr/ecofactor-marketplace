import { describe, it, expect } from 'vitest'
import { getActiveFiltersCount } from '../getActiveFiltersCount'

describe('getActiveFiltersCount', () => {
  it('returns 0 for empty filters', () => {
    expect(getActiveFiltersCount({})).toBe(0)
  })

  it('returns 0 for empty string array', () => {
    expect(getActiveFiltersCount({ season: [] })).toBe(0)
  })

  it('counts non-empty string array as 1', () => {
    expect(getActiveFiltersCount({ season: ['Літо'] })).toBe(1)
  })

  it('counts range with min as 1', () => {
    expect(getActiveFiltersCount({ diameter: { min: 18 } })).toBe(1)
  })

  it('counts range with max as 1', () => {
    expect(getActiveFiltersCount({ diameter: { max: 20 } })).toBe(1)
  })

  it('counts range with both min and max as 1', () => {
    expect(getActiveFiltersCount({ diameter: { min: 18, max: 20 } })).toBe(1)
  })

  it('returns 0 for empty range object', () => {
    expect(getActiveFiltersCount({ diameter: {} })).toBe(0)
  })

  it('counts multiple active filters', () => {
    expect(
      getActiveFiltersCount({ season: ['Літо'], diameter: { min: 18 } }),
    ).toBe(2)
  })

  it('counts multiple string[] filters independently', () => {
    expect(
      getActiveFiltersCount({ season: ['Літо'], brand: ['Michelin', 'Continental'] }),
    ).toBe(2)
  })

  it('only counts active keys (mixes active and inactive)', () => {
    expect(
      getActiveFiltersCount({ season: [], brand: ['Michelin'], diameter: {} }),
    ).toBe(1)
  })
})
