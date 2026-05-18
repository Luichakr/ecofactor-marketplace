import type { FacetDefinition, RangeFilterValue, SelectedFilters } from '../../model/catalog.types'
import './DynamicFilters.css'

type Props = {
  facets: FacetDefinition[]
  selected: SelectedFilters
  onChange: (filters: SelectedFilters) => void
}

export function DynamicFilters({ facets, selected, onChange }: Props) {
  if (facets.length === 0) return null

  function toggleOption(key: string, value: string) {
    const current = (selected[key] as string[] | undefined) ?? []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    if (updated.length === 0) {
      const next = { ...selected }
      delete next[key]
      onChange(next)
    } else {
      onChange({ ...selected, [key]: updated })
    }
  }

  function isOptionSelected(key: string, value: string): boolean {
    const current = selected[key]
    if (!current || !Array.isArray(current)) return false
    return (current as string[]).includes(value)
  }

  function getRangeMin(key: string): string {
    const val = selected[key]
    if (val && !Array.isArray(val)) return (val as RangeFilterValue).min?.toString() ?? ''
    return ''
  }

  function getRangeMax(key: string): string {
    const val = selected[key]
    if (val && !Array.isArray(val)) return (val as RangeFilterValue).max?.toString() ?? ''
    return ''
  }

  function handleRangeMin(key: string, raw: string) {
    const existing = selected[key] as RangeFilterValue | undefined
    const currentMax = existing?.max

    if (raw === '') {
      // Clear min — keep max if it exists, otherwise remove filter
      if (currentMax !== undefined) {
        onChange({ ...selected, [key]: { max: currentMax } })
      } else {
        const next = { ...selected }
        delete next[key]
        onChange(next)
      }
      return
    }

    const min = Number(raw)
    if (isNaN(min)) return
    const range: RangeFilterValue = { min }
    if (currentMax !== undefined) range.max = currentMax
    onChange({ ...selected, [key]: range })
  }

  function handleRangeMax(key: string, raw: string) {
    const existing = selected[key] as RangeFilterValue | undefined
    const currentMin = existing?.min

    if (raw === '') {
      // Clear max — keep min if it exists, otherwise remove filter
      if (currentMin !== undefined) {
        onChange({ ...selected, [key]: { min: currentMin } })
      } else {
        const next = { ...selected }
        delete next[key]
        onChange(next)
      }
      return
    }

    const max = Number(raw)
    if (isNaN(max)) return
    const range: RangeFilterValue = { max }
    if (currentMin !== undefined) range.min = currentMin
    onChange({ ...selected, [key]: range })
  }

  return (
    <div className="dynamic-filters">
      {facets.map((facet) => (
        <div key={facet.key} className="dynamic-filters__group">
          <h4 className="dynamic-filters__label">
            {facet.label}
            {facet.unit ? ` (${facet.unit})` : ''}
          </h4>

          {(facet.type === 'select' || facet.type === 'multiSelect' || facet.type === 'boolean') &&
            facet.options && (
              <div className="dynamic-filters__options">
                {facet.options.map((option) => (
                  <button
                    key={String(option.value)}
                    className={`dynamic-filters__option ${isOptionSelected(facet.key, String(option.value)) ? 'dynamic-filters__option--active' : ''}`}
                    onClick={() => toggleOption(facet.key, String(option.value))}
                  >
                    {option.label}
                    <span className="dynamic-filters__option-count">{option.count}</span>
                  </button>
                ))}
              </div>
            )}

          {(facet.type === 'number' || facet.type === 'range') &&
            facet.min !== undefined &&
            facet.max !== undefined && (
              <div className="dynamic-filters__range-inputs">
                <input
                  type="number"
                  className="dynamic-filters__range-input"
                  placeholder={String(facet.min)}
                  value={getRangeMin(facet.key)}
                  min={facet.min}
                  max={facet.max}
                  onChange={(e) => handleRangeMin(facet.key, e.target.value)}
                />
                <span className="dynamic-filters__range-sep">—</span>
                <input
                  type="number"
                  className="dynamic-filters__range-input"
                  placeholder={String(facet.max)}
                  value={getRangeMax(facet.key)}
                  min={facet.min}
                  max={facet.max}
                  onChange={(e) => handleRangeMax(facet.key, e.target.value)}
                />
              </div>
            )}
        </div>
      ))}
    </div>
  )
}
