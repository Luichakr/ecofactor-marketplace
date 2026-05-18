# Data Model

## MarketplaceCategory

```ts
type MarketplaceCategory = {
  id: MarketplaceCategoryId  // 'cars' | 'charging-stations' | 'insurance' | 'tires'
  title: string
  subtitle: string
  icon: string
  description?: string
  // productCount is NOT stored here — computed dynamically from mockProducts in CategoryGrid
}
```

## MarketplaceProduct

```ts
type MarketplaceProduct = {
  id: string
  categoryId: MarketplaceCategoryId
  title: string
  subtitle?: string
  description?: string
  price?: ProductPrice
  status?: ProductStatus
  image?: string
  gallery?: string[]
  badges?: string[]
  attributes: ProductAttribute[]
  createdAt?: string
}
```

## ProductAttribute

The key design decision: all category-specific data lives in `attributes[]`.

```ts
type ProductAttribute = {
  key: string          // e.g. 'brand', 'power', 'season'
  label: string        // Ukrainian UI label
  value: ProductAttributeValue
  type: ProductAttributeType
  unit?: string        // e.g. 'кВт', 'км', 'дюйм'
  filterable?: boolean  // include in dynamic filters
  visibleInCard?: boolean   // show in product list card
  visibleInDetails?: boolean // show in product detail page
  priority?: number    // sort order (lower = first)
}
```

## Why attributes are universal

Instead of:
```ts
type CarProduct = { brand: string; year: number; mileage: number; ... }
type TireProduct = { brand: string; season: string; width: number; ... }
```

We use:
```ts
type MarketplaceProduct = { attributes: ProductAttribute[] }
```

This means:
- Adding a new category = adding new mock products with new attribute keys
- No new TypeScript types needed
- No new filter components needed
- No new product card variants needed

## Adding a new category

1. Add the category ID to `MarketplaceCategoryId` union
2. Add the category to `mockCategories.ts`
3. Add products to `mockProducts.ts` with appropriate `attributes`
4. The catalog, filters, and product card work automatically
