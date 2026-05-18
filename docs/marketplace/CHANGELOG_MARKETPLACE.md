# Changelog

## Stage 0.3 — 2026-05-15

### Added

- Vitest: `npm install -D vitest`, `npm run test` script, `vite.config.ts` imports from `vitest/config`
- 3 test suites (32 tests): `catalogSearchParams.test.ts`, `filterProducts.test.ts`, `getActiveFiltersCount.test.ts`
- `withTopInset` prop on `ScreenContainer` (default `true`); pages with Header pass `withTopInset={false}`

### Changed

- `ScreenContainer.tsx/.css` — top safe-area moved to `screen-container--with-top-inset` modifier class; base class no longer has `padding-top`
- All pages with Header now use `<ScreenContainer withTopInset={false}>` — eliminates double top gap on iPhone/WebView
- `MarketplaceHomePage` keeps default `withTopInset={true}` since it has no Header
- `.gitignore` — added `__MACOSX/`
- `scripts/ai/preflight.sh` — file listing excludes node_modules, dist, .DS_Store, *.tsbuildinfo, settings.local.json, __MACOSX
- `vite.config.ts` — imports `defineConfig` from `vitest/config` for full test config type safety

### Security / Audit

- `npm audit` reports 2 moderate vulnerabilities in esbuild ≤0.24.2 (via Vite ≤6.4.1)
- Fix requires upgrade to Vite 8 (breaking change) — deferred to pre-production stage
- `npm audit fix --force` NOT run to avoid breaking the build

## Stage 0.2 — 2026-05-15

### Added

- `getActiveFiltersCount.ts` — dedicated helper for counting active filters, handles both `string[]` and `RangeFilterValue`

### Changed

- `catalog.types.ts` — `SelectedFilters` now uses `RangeFilterValue = { min?: number; max?: number }` instead of `[number, number]` tuple; boolean filters stored as `string[]` (`'true'`/`'false'`), removed `boolean` from union
- `catalogSearchParams.ts` — full rewrite: supports partial `_min`-only and `_max`-only URL params; `buildCatalogSearchParams` emits bounds independently
- `filterProducts.ts` — updated for new types: `RangeFilterValue` with partial bounds, boolean-as-string[] matching
- `routes.ts` — `filtersPath` now accepts `{ categoryId?, searchParams? }` object, preserves all catalog params when navigating to `/filters`
- `CatalogPage` — passes full `searchParams` to `filtersPath`; quick-filter chips skip `number`/`range` facets; deselecting last chip cleans up the key (no empty array left)
- `FiltersPage` — `buildFiltersPageParams` helper keeps `category` param alive on every state change; `handleApply` separates category (used for path) from query string; invalid category shows `EmptyState`
- `DynamicFilters` — range inputs: clearing a field removes only that bound; both fields empty → filter key deleted; no automatic facet-min/max injection

## Stage 0.1 — 2026-05-15

### Added

- `catalogSearchParams.ts` — URL-based filter state: `parseCatalogSearchParams` and `buildCatalogSearchParams`
- `eslint.config.js` — ESLint flat config with typescript-eslint, react-hooks, react-refresh
- `.gitignore`
- `requestPath(productId?)` helper in `routes.ts`
- Invalid category guard in `CatalogPage` — `/catalog/unknown` shows `EmptyState`
- Min/max number inputs in `DynamicFilters` for `number`/`range` facets
- `onFiltersClick` callback prop on `CatalogToolbar` (decoupled from routing)

### Changed

- `CatalogPage` — rewrote to derive all state from URL (`useSearchParams`) instead of `useState`; fixes `react-hooks/set-state-in-effect` lint error
- `FiltersPage` — rewrote to read URL state on open and write back on apply; navigates to catalog with full filter params
- `ProductPage` CTA buttons — now pass `product.id` to `requestPath` so request form pre-fills product
- `filterProducts.ts` — handles boolean/number values arriving as strings from URL params
- `mockCategories.ts` — removed hardcoded `productCount: 3`; count now computed dynamically from `mockProducts` in `CategoryGrid`
- `CategoryGrid` — accepts `products` prop and computes per-category count
- `CategoryCard` — accepts external `productCount` prop instead of reading from category

## Stage 0 — 2026-05-15

### Added

- React + TypeScript + Vite project foundation
- React Router 6 with 9 routes
- Design tokens (colors, typography, spacing, radius, shadows) from Figma analysis
- Universal data model: `MarketplaceCategory`, `MarketplaceProduct`, `ProductAttribute`
- Mock data: 12 products across 4 categories
- `buildFacets.ts` — dynamic filter generation from product attributes
- `filterProducts.ts` — universal filtering (search + attribute filters)
- `sortProducts.ts` — 5 sort options
- Shared components: AppShell, Header, BottomNav, Button, Card, Input, SearchInput, StatusBadge, EmptyState, FilterChip, StickyCTA
- Feature components: CategoryCard, CategoryGrid, ProductCard, ProductAttributeList, CatalogGrid, CatalogToolbar, DynamicFilters
- Pages: Marketplace, Catalog, Product, Favorites, Request, Search, Filters, Profile, NotFound
- Mobile App Shell: full-height, bottom nav, safe-area insets, desktop centered
- WebView bridge stubs: isInsideWebView, sendWebViewEvent, onNativeBack
- CLAUDE.md with project rules and key file index
- .claude/settings.json with security deny rules
- 8 Claude Code skills
- Full documentation in docs/marketplace and docs/figma
- scripts/ai/preflight.sh
