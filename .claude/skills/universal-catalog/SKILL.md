# Universal Catalog Skill

Use this skill when working on the Marketplace catalog.

## Rules

- One catalog UI must support all categories
- Do not create separate catalog pages for cars, chargers, insurance or tires
- Category changes should affect data, filters and labels — not the whole layout
- Product cards must use the same `ProductCard` component for all categories
- Product attributes control what is shown in cards (`visibleInCard: true`) and details (`visibleInDetails: true`)
- `filterable: true` attributes become filters via `buildFacets`

## Key files

- `src/pages/catalog/CatalogPage.tsx` — universal catalog page
- `src/features/catalog/ui/CatalogGrid/` — grid rendering
- `src/features/catalog/ui/CatalogToolbar/` — sort + filter count
- `src/features/catalog/lib/buildFacets.ts` — dynamic filter generation
- `src/features/catalog/lib/filterProducts.ts` — filtering logic
- `src/features/catalog/lib/sortProducts.ts` — sort logic
- `src/features/product/ui/ProductCard/` — universal card

## Checklist

- Does `/catalog` show all products?
- Does `/catalog/:categoryId` show selected category?
- Does the same ProductCard work for all categories?
- Are filters generated from data?
- Is empty state handled?
- Is search handled?
- Is sorting handled?
