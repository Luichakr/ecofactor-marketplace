# Dynamic Filters Skill

Use this skill when building or changing Marketplace filters.

## Goal

Filters should be generated from product attributes. No manual per-category filter code.

## Attribute flags

- `filterable: true` — include in filter panel
- `visibleInCard: true` — show in product list cards
- `visibleInDetails: true` — show in product detail page
- `priority` — sort order (lower = first)

## Facet logic (buildFacets.ts)

1. Filter products by selected categoryId
2. Collect attributes where `filterable: true`
3. Group by `key`
4. For `select`/`multiSelect`/`boolean`: count option occurrences → `FacetOption[]`
5. For `number`/`range`: compute min/max
6. Sort facets by `priority`
7. Return `FacetDefinition[]`

## Rules

- Do not hardcode category-specific filter UI
- Do not write separate filter components for each category
- Visual filter component (`DynamicFilters`) must be universal
- Filter options should show counts

## Key files

- `src/features/catalog/lib/buildFacets.ts`
- `src/features/catalog/lib/filterProducts.ts`
- `src/features/catalog/ui/DynamicFilters/DynamicFilters.tsx`
- `src/pages/filters/FiltersPage.tsx`
