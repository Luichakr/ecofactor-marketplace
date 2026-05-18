# Dynamic Filters

## How filters work

Filters are **generated from product data** — not written manually per category.

## Attribute flags

| Flag | Meaning |
|---|---|
| `filterable: true` | Include this attribute as a filter facet |
| `visibleInCard: true` | Show this attribute in the product list card |
| `visibleInDetails: true` | Show this attribute in the product detail page |
| `priority` | Sort order in filter panel and attribute list (lower = first) |

## buildFacets algorithm

`src/features/catalog/lib/buildFacets.ts`

```
Input: products[], categoryId?
Output: FacetDefinition[]
```

Steps:
1. Filter products by `categoryId` (if provided)
2. Walk all `product.attributes`
3. Skip attributes where `filterable !== true`
4. Group by `attribute.key`
5. For `select`/`multiSelect`/`boolean`: count value occurrences → FacetOption[]
6. For `number`/`range`: find min and max values
7. Sort all facets by `priority`

## FacetDefinition

```ts
type FacetDefinition = {
  key: string
  label: string
  type: ProductAttributeType
  unit?: string
  options?: FacetOption[]  // for select/multiSelect/boolean
  min?: number             // for number/range
  max?: number             // for number/range
  priority?: number
}
```

## SelectedFilters type model

```ts
type RangeFilterValue = {
  min?: number
  max?: number
}

type SelectedFilterValue = string[] | RangeFilterValue

type SelectedFilters = Record<string, SelectedFilterValue>
```

- `select`/`multiSelect` → `string[]` of selected values
- `boolean` → `string[]` with values `'true'` or `'false'` (no separate boolean type)
- `number`/`range` → `RangeFilterValue` with optional `min` and/or `max`

## filterProducts algorithm

`src/features/catalog/lib/filterProducts.ts`

- Filter by categoryId
- Filter by search query (title, subtitle, description, any attribute value)
- For each active filter key: check if product attribute value matches
  - `string[]`: product value must be in selected list; booleans match via `String(value)` → `'true'`/`'false'`
  - `RangeFilterValue`: if `min` exists → `attrValue >= min`; if `max` exists → `attrValue <= max`; partial bounds work

## getActiveFiltersCount helper

`src/features/catalog/lib/getActiveFiltersCount.ts`

- `string[]` with `length > 0` counts as 1 active filter
- `RangeFilterValue` with `min` or `max` defined counts as 1 active filter
- Empty array / empty object / undefined = not active

## URL filter state

`src/features/catalog/lib/catalogSearchParams.ts`

Filters are persisted in URL query params so they survive navigation and can be shared:

| Param | Type | Example |
|---|---|---|
| `q` | string | `?q=Tesla` |
| `sort` | SortOption | `?sort=priceAsc` |
| `<key>` | string[] (multi) | `?season=Літо&season=Зима` |
| `<key>_min` | range lower bound | `?diameter_min=18` |
| `<key>_max` | range upper bound | `?diameter_max=20` |
| `<key>_min` + `<key>_max` | full range | `?diameter_min=18&diameter_max=20` |

Partial ranges are fully supported — only `_min` or only `_max` is valid.

`parseCatalogSearchParams(URLSearchParams)` → `{ search, sort, filters }`
`buildCatalogSearchParams({ search, sort, filters })` → `URLSearchParams`

## DynamicFilters

`src/features/catalog/ui/DynamicFilters/DynamicFilters.tsx`

- `select`/`multiSelect`/`boolean` facets: clickable chip buttons with count badges
  - Deselecting the last chip removes the key from filters entirely (no empty array left)
  - Boolean options stored as `'true'`/`'false'` strings
- `number`/`range` facets: min and max number inputs
  - Clearing a field removes that bound only; clearing both removes the filter key entirely
  - No auto-fill of facet min/max — empty input = no constraint on that bound

## `/catalog` → `/filters` navigation

`CatalogPage` passes the full current `searchParams` + `categoryId` to `filtersPath`:

```ts
filtersPath({ categoryId, searchParams })
// /catalog/tires?q=michelin&sort=priceAsc&season=Літо&diameter_min=18
// → /filters?category=tires&q=michelin&sort=priceAsc&season=Літо&diameter_min=18
```

## `/filters` preserves category

`FiltersPage` uses `buildFiltersPageParams` which always re-injects `category` into `setSearchParams`:

```
/filters?category=tires → select season=Літо → /filters?category=tires&season=Літо
```

## `/filters` apply returns to correct catalog

`handleApply` uses `category` for the path, strips it from query params:

```
/filters?category=tires&season=Літо&diameter_min=18
→ /catalog/tires?season=Літо&diameter_min=18
```

## Per-category filter examples

No manual code needed. These work automatically from attribute definitions:

**Cars** → brand, year, mileage, range, bodyType, driveType, color, location
**Charging stations** → brand, power, connectorType, phase, installationType, usageType, smartFeatures
**Insurance** → provider, coverageType, duration, region, forBusiness, supportIncluded
**Tires** → brand, season, width, profile, diameter, speedIndex, vehicleType
