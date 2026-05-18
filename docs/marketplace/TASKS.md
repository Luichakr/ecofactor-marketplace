# Tasks

## Stage 0 — Completed

- [x] React + TypeScript + Vite project scaffold
- [x] React Router setup
- [x] Design tokens from Figma
- [x] Global CSS
- [x] Universal category model
- [x] Universal product model with attributes
- [x] Mock data: 12 products (3 per category)
- [x] buildFacets.ts
- [x] filterProducts.ts
- [x] sortProducts.ts
- [x] AppShell + ScreenContainer
- [x] Header component
- [x] BottomNav (5 tabs)
- [x] Button, Card, Input, SearchInput, StatusBadge, EmptyState, FilterChip, StickyCTA
- [x] CategoryCard + CategoryGrid
- [x] ProductCard (universal)
- [x] ProductAttributeList
- [x] CatalogGrid + CatalogToolbar
- [x] DynamicFilters
- [x] MarketplaceHomePage
- [x] CatalogPage (universal, supports /catalog and /catalog/:categoryId)
- [x] ProductPage (universal)
- [x] FavoritesPage (placeholder)
- [x] RequestPage (form with success state)
- [x] SearchPage
- [x] FiltersPage
- [x] ProfilePage (placeholder)
- [x] NotFoundPage
- [x] WebView bridge stubs
- [x] CLAUDE.md
- [x] .claude/settings.json
- [x] 8 Claude Code skills
- [x] docs/marketplace (8 docs + DECISIONS + TASKS + CHANGELOG)
- [x] docs/figma (4 docs)
- [x] scripts/ai/preflight.sh

## Stage 0.1 — Completed

- [x] ESLint flat config (eslint.config.js)
- [x] .gitignore
- [x] requestPath helper + ProductPage CTA links pass product.id
- [x] catalogSearchParams.ts — URL filter parse/build utilities
- [x] CatalogPage rewritten to URL-based filter state (no local useState for filters)
- [x] FiltersPage reads/writes URL state; apply navigates back to catalog with params
- [x] DynamicFilters: min/max number inputs for number/range facets
- [x] filterProducts: handles boolean/number coercion from URL strings
- [x] Invalid category guard in CatalogPage
- [x] Remove hardcoded productCount from mockCategories; compute dynamically in CategoryGrid

## Stage 0.2 — Completed

- [x] `RangeFilterValue = { min?: number; max?: number }` — replaces `[number, number]` tuple; supports partial bounds
- [x] `SelectedFilters = Record<string, string[] | RangeFilterValue>` — booleans now stored as `string[]` (`'true'`/`'false'`)
- [x] `catalogSearchParams.ts` rewritten — supports partial `_min`-only or `_max`-only range params
- [x] `buildCatalogSearchParams` — emits `key_min`/`key_max` individually, no full-range requirement
- [x] `filterProducts.ts` rewritten for new types — partial range bounds, boolean-as-string[] matching
- [x] `getActiveFiltersCount.ts` — new helper, used in CatalogPage and FiltersPage
- [x] `routes.ts` — `filtersPath` accepts `{ categoryId?, searchParams? }` object; carries q/sort/filters through
- [x] `CatalogPage` — passes current `searchParams` to `filtersPath` so all params are preserved; chips skip number/range facets; chip deselect cleans up empty keys
- [x] `FiltersPage` — `buildFiltersPageParams` preserves `category` on every `setSearchParams`; `handleApply` strips category from query string and uses it for path only; invalid category shows `EmptyState`
- [x] `DynamicFilters` — clearing a range input removes only that bound; clearing both removes filter key entirely; no auto-fill of facet min/max
- [x] Docs updated: `03_DYNAMIC_FILTERS.md`, `02_DATA_MODEL.md`, `TASKS.md`, `CHANGELOG`, `DECISIONS.md`

## Stage 0.3 — Completed

- [x] Artifact cleanup: `node_modules/`, `dist/`, `.DS_Store`, `*.tsbuildinfo`, `.claude/settings.local.json` removed (run manually — Claude cannot execute `rm`)
- [x] `.gitignore` updated — added `__MACOSX/`
- [x] `preflight.sh` updated — excludes artifacts from file listing
- [x] `ScreenContainer` — added `withTopInset` prop (default `true`); splits top safe-area from bottom nav padding
- [x] All pages with Header — `withTopInset={false}`: CatalogPage, FiltersPage, ProductPage, RequestPage, SearchPage, FavoritesPage, ProfilePage, NotFoundPage
- [x] MarketplaceHomePage — keeps `withTopInset={true}` (no Header)
- [x] Vitest added; `npm run test` script added to package.json
- [x] `vite.config.ts` — updated to import from `vitest/config` for test config support
- [x] 3 test files: `catalogSearchParams.test.ts`, `filterProducts.test.ts`, `getActiveFiltersCount.test.ts` — 32 tests, all pass
- [x] `npm audit` — 2 moderate warnings for Vite/esbuild; fix requires Vite 8 (breaking); documented, not force-upgraded
- [x] Docs updated: TASKS.md, CHANGELOG_MARKETPLACE.md, DECISIONS.md, 04_WEBVIEW_INTEGRATION.md, 07_SECURITY_CHECKLIST.md, CLAUDE.md

## Stage 1 — Upcoming

- [ ] Refine App Shell visual appearance per Figma screenshots
- [ ] Improve hero section on MarketplaceHomePage
- [ ] Add accent gradient to category cards
- [ ] Improve BottomNav active state animation
