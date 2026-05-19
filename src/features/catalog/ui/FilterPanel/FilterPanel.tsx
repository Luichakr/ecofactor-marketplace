import { useMemo, useState } from 'react'
import type { MarketplaceCategoryId } from '../../../../entities/category/model/category.types'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { buildFacets } from '../../lib/buildFacets'
import { filterProducts } from '../../lib/filterProducts'
import { getActiveFiltersCount } from '../../lib/getActiveFiltersCount'
import {
  type FacetDefinition,
  type RangeFilterValue,
  type SelectedFilters,
  type SortOption,
} from '../../model/catalog.types'
import { Button } from '../../../../shared/ui/Button/Button'
import './FilterPanel.css'

const COLLAPSED_OPTION_LIMIT = 6

/**
 * Optional composite-section config. Multiple facet keys render together
 * under one section heading instead of as individual sections. Defined
 * inline so the data model stays category-agnostic; adding a new composite
 * (e.g. disks → diameter+et+pcd+dia under "РОЗМІР") is a one-line addition.
 */
const COMPOSITE_SECTIONS: { title: string; keys: string[] }[] = [
  { title: 'РОЗМІР', keys: ['width', 'profile', 'diameter'] },
  { title: 'ПАРАМЕТРИ ДИСКА', keys: ['et', 'pcd', 'dia', 'bolts'] },
]

type Props = {
  products: MarketplaceProduct[]
  categoryId?: MarketplaceCategoryId | null
  /** Currently active subcategory value (e.g. 'tires', 'disks'). Used to
   *  scope facet generation so options reflect the visible result set. */
  subcategoryValue?: string | null
  search: string
  sort: SortOption
  filters: SelectedFilters
  onSortChange: (sort: SortOption) => void
  onFiltersChange: (filters: SelectedFilters) => void
  onApply: () => void
  onReset: () => void
}

export function FilterPanel({
  products,
  categoryId,
  subcategoryValue,
  search,
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: Props) {
  const facets = useMemo(
    () => buildFacets(products, categoryId ?? undefined, subcategoryValue ?? undefined),
    [products, categoryId, subcategoryValue],
  )

  const matchCount = useMemo(() => {
    let pool = categoryId ? products.filter((p) => p.categoryId === categoryId) : products
    if (subcategoryValue) {
      pool = pool.filter((p) =>
        p.attributes.some((a) => a.key === 'subcategory' && a.value === subcategoryValue),
      )
    }
    return filterProducts({ products: pool, categoryId: undefined, filters, search }).length
  }, [products, categoryId, subcategoryValue, filters, search])

  const activeCount = getActiveFiltersCount(filters)

  function toggleOption(key: string, value: string) {
    const current = (filters[key] as string[] | undefined) ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    const merged = { ...filters }
    if (next.length === 0) delete merged[key]
    else merged[key] = next
    onFiltersChange(merged)
  }

  function setRange(key: string, range: RangeFilterValue) {
    const merged = { ...filters }
    if (range.min === undefined && range.max === undefined) delete merged[key]
    else merged[key] = range
    onFiltersChange(merged)
  }

  // Plan the section layout. Composite sections pull their facets out of
  // the pool first; whatever remains is rendered one-section-per-facet in
  // priority order.
  const sections = useMemo(() => {
    const byKey = new Map<string, FacetDefinition>(facets.map((f) => [f.key, f]))
    const consumed = new Set<string>()
    const out: { kind: 'composite' | 'single'; title: string; facets: FacetDefinition[] }[] = []

    for (const cfg of COMPOSITE_SECTIONS) {
      const matched = cfg.keys
        .map((k) => byKey.get(k))
        .filter((f): f is FacetDefinition => !!f)
      if (matched.length === 0) continue
      for (const f of matched) consumed.add(f.key)
      out.push({ kind: 'composite', title: cfg.title, facets: matched })
    }

    for (const f of facets) {
      if (consumed.has(f.key)) continue
      out.push({ kind: 'single', title: f.label.toUpperCase(), facets: [f] })
    }
    return out
  }, [facets])

  let n = 1
  const num = () => String(n++).padStart(2, '0')

  return (
    <div className="filter-panel">
      {sections.map((section, idx) => (
        <FilterSection key={`${section.title}-${idx}`} num={num()} title={section.title}>
          {section.kind === 'composite' ? (
            <CompositeRangeBlock
              facets={section.facets}
              values={Object.fromEntries(
                section.facets.map((f) => [f.key, filters[f.key] as RangeFilterValue | undefined]),
              )}
              onChange={setRange}
            />
          ) : (
            <FacetControl
              facet={section.facets[0]}
              value={filters[section.facets[0].key]}
              onToggleOption={(v) => toggleOption(section.facets[0].key, v)}
              onRangeChange={(r) => setRange(section.facets[0].key, r)}
            />
          )}
        </FilterSection>
      ))}

      {sections.length === 0 && (
        <p className="filter-panel__empty">
          У цій категорії поки немає атрибутів для фільтрування.
        </p>
      )}

      <div className="filter-panel__cta">
        <Button variant="primary" fullWidth size="lg" onClick={onApply}>
          ПОКАЗАТИ {matchCount} ТОВАРІВ
        </Button>
        {activeCount > 0 && (
          <button type="button" className="filter-panel__reset" onClick={onReset}>
            СКИНУТИ ФІЛЬТРИ
          </button>
        )}
      </div>
    </div>
  )
}

/** Picks the right control for a facet's data type. */
function FacetControl({
  facet,
  value,
  onToggleOption,
  onRangeChange,
}: {
  facet: FacetDefinition
  value: SelectedFilters[string] | undefined
  onToggleOption: (value: string) => void
  onRangeChange: (range: RangeFilterValue) => void
}) {
  if (facet.type === 'number' || facet.type === 'range') {
    return (
      <RangeSlider
        facet={facet}
        value={value as RangeFilterValue | undefined}
        onChange={onRangeChange}
      />
    )
  }
  return (
    <OptionList
      facet={facet}
      selected={(value as string[] | undefined) ?? []}
      onToggle={onToggleOption}
    />
  )
}

function FilterSection({
  num,
  title,
  children,
}: {
  num: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="filter-section">
      <div className="filter-section__head">
        <span className="filter-section__num">|{num}|</span>
        <span className="filter-section__title">{title}</span>
      </div>
      <div className="filter-section__body">{children}</div>
    </section>
  )
}

function OptionRow({
  label,
  active,
  onClick,
  count,
}: {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      className={`filter-option ${active ? 'filter-option--active' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {typeof count === 'number' && <span className="filter-option__count">{count}</span>}
    </button>
  )
}

function OptionList({
  facet,
  selected,
  onToggle,
}: {
  facet: FacetDefinition
  selected: string[]
  onToggle: (value: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const options = facet.options ?? []
  const visible = expanded ? options : options.slice(0, COLLAPSED_OPTION_LIMIT)
  return (
    <>
      {visible.map((opt) => (
        <OptionRow
          key={String(opt.value)}
          label={opt.label}
          count={opt.count}
          active={selected.includes(String(opt.value))}
          onClick={() => onToggle(String(opt.value))}
        />
      ))}
      {options.length > COLLAPSED_OPTION_LIMIT && (
        <button
          type="button"
          className="filter-option filter-option--more"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'ПОКАЗАТИ МЕНШЕ' : 'ПОКАЗАТИ БІЛЬШЕ'}
        </button>
      )}
    </>
  )
}

/** Composite block — multiple range facets stacked, each with a label. */
function CompositeRangeBlock({
  facets,
  values,
  onChange,
}: {
  facets: FacetDefinition[]
  values: Record<string, RangeFilterValue | undefined>
  onChange: (key: string, next: RangeFilterValue) => void
}) {
  return (
    <div className="size-block">
      {facets.map((facet) => (
        <div key={facet.key} className="size-block__row">
          <span className="size-block__label">{facet.label}</span>
          <RangeInputs
            facet={facet}
            value={values[facet.key]}
            onChange={(r) => onChange(facet.key, r)}
          />
        </div>
      ))}
    </div>
  )
}

function RangeInputs({
  facet,
  value,
  onChange,
}: {
  facet: FacetDefinition
  value: RangeFilterValue | undefined
  onChange: (next: RangeFilterValue) => void
}) {
  const min = facet.min ?? 0
  const max = facet.max ?? 100
  return (
    <div className="filter-range">
      <div className="filter-range__inputs">
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(min)}
          value={value?.min ?? ''}
          onChange={(e) =>
            onChange({
              min: e.target.value ? Number(e.target.value) : undefined,
              max: value?.max,
            })
          }
          className="filter-range__num"
        />
        <span className="filter-range__dash">—</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={String(max)}
          value={value?.max ?? ''}
          onChange={(e) =>
            onChange({
              min: value?.min,
              max: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="filter-range__num"
        />
      </div>
    </div>
  )
}

/** Dual-thumb visual slider with caption. Used for any standalone range. */
function RangeSlider({
  facet,
  value,
  onChange,
}: {
  facet: FacetDefinition
  value: RangeFilterValue | undefined
  onChange: (next: RangeFilterValue) => void
}) {
  const min = Math.floor(facet.min ?? 0)
  const max = Math.ceil(facet.max ?? 100)
  const span = Math.max(1, max - min)
  const currentMin = value?.min ?? min
  const currentMax = value?.max ?? max
  const leftPct = ((currentMin - min) / span) * 100
  const rightPct = 100 - ((currentMax - min) / span) * 100

  function handleMin(raw: number) {
    const clamped = Math.min(raw, currentMax)
    onChange({
      min: clamped === min ? undefined : clamped,
      max: currentMax === max ? undefined : currentMax,
    })
  }
  function handleMax(raw: number) {
    const clamped = Math.max(raw, currentMin)
    onChange({
      min: currentMin === min ? undefined : currentMin,
      max: clamped === max ? undefined : clamped,
    })
  }

  const unit = facet.unit ? ` ${facet.unit}` : ''

  return (
    <div className="price-slider">
      <div className="price-slider__rail">
        <div className="price-slider__fill" style={{ left: `${leftPct}%`, right: `${rightPct}%` }} />
        <input
          type="range"
          className="price-slider__thumb"
          min={min}
          max={max}
          value={currentMin}
          onChange={(e) => handleMin(Number(e.target.value))}
        />
        <input
          type="range"
          className="price-slider__thumb"
          min={min}
          max={max}
          value={currentMax}
          onChange={(e) => handleMax(Number(e.target.value))}
        />
      </div>
      <div className="price-slider__hint">
        {currentMin}{unit} — {currentMax}{unit}
      </div>
    </div>
  )
}
