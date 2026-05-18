# Architecture

## Tech stack

- **React 18** — UI
- **TypeScript 5** — type safety
- **Vite 5** — build tool and dev server
- **React Router 6** — client-side routing
- **CSS variables + component CSS** — styling (no Tailwind, no CSS Modules, no heavy UI libs)

## Project structure

```
src/
  app/           # BrowserRouter, AppRouter (Routes), AppLayout (Outlet + BottomNav)
  pages/         # Route-level components, one folder per route
  entities/      # Core data types
    category/    # MarketplaceCategory, MarketplaceCategoryId
    product/     # MarketplaceProduct, ProductAttribute, formatPrice
  features/      # Feature-sliced UI and logic
    catalog/     # CatalogGrid, CatalogToolbar, DynamicFilters, buildFacets, filterProducts, sortProducts
    marketplace/ # CategoryCard, CategoryGrid
    product/     # ProductCard, ProductAttributeList
  shared/        # Reusable primitives
    config/      # routes.ts
    lib/webview/ # webviewBridge.ts, webviewTypes.ts
    styles/      # tokens.css, global.css
    ui/          # AppShell, Header, BottomNav, Button, Card, Input, SearchInput, ...
  data/          # mockCategories.ts, mockProducts.ts, mockUser.ts
  main.tsx       # Entry point
```

## Routing

| Path | Component |
|---|---|
| `/` | → redirect to `/marketplace` |
| `/marketplace` | MarketplaceHomePage |
| `/catalog` | CatalogPage (all products) |
| `/catalog/:categoryId` | CatalogPage (filtered by category) |
| `/products/:productId` | ProductPage (universal) |
| `/favorites` | FavoritesPage |
| `/request` | RequestPage |
| `/search` | SearchPage |
| `/filters` | FiltersPage |
| `/profile` | ProfilePage |
| `*` | NotFoundPage |

## Data flow

1. `mockProducts` is the data source (Stage 0)
2. `buildFacets(products, categoryId)` → `FacetDefinition[]`
3. `filterProducts({ products, categoryId, filters, search })` → filtered list
4. `sortProducts(list, sortOption)` → sorted list
5. `CatalogGrid` renders `ProductCard` for each item

## Stage 0 constraints

- No backend
- No real API calls
- No authentication
- No persistence
- No secrets
