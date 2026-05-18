# Marketplace Decisions

| Date | Decision | Reason | Status |
|---|---|---|---|
| 2026-05-15 | Marketplace is a universal product and service platform | Must support cars, charging stations, insurance, tires and future categories | Accepted |
| 2026-05-15 | Product card is universal | Different categories use same product detail structure with dynamic attributes | Accepted |
| 2026-05-15 | Catalog is universal | Categories share one catalog UI and one filtering system | Accepted |
| 2026-05-15 | Filters are generated from product attributes | Avoids manually rebuilding filters for every category | Accepted |
| 2026-05-15 | Figma used as visual style reference, not as Marketplace screen list | Marketplace is a new product; existing Figma belongs to current ECOFACTOR app | Accepted |
| 2026-05-15 | React + TypeScript + Vite for MVP | Fast development, simple deployment, good mobile web support | Accepted |
| 2026-05-15 | Mobile-first is primary target | Main usage is inside ECOFACTOR mobile app WebView | Accepted |
| 2026-05-15 | Plain CSS variables, no Tailwind or CSS Modules | Matches ТЗ requirement; avoids build complexity; tokens in tokens.css | Accepted |
| 2026-05-15 | Typography: Roboto | Extracted from Figma typography documentation (node 789:32263) | Accepted |
| 2026-05-15 | Dark theme as primary | Matches existing ECOFACTOR app visual style from Figma | Accepted |
| 2026-05-15 | Filters stored in URL params, not component state | Enables shareable URLs, back-button preservation, and FiltersPage ↔ CatalogPage sync | Accepted |
| 2026-05-15 | productCount removed from mockCategories, computed in CategoryGrid from mockProducts | Count must reflect actual data, not hardcoded value | Accepted |
| 2026-05-15 | Range filters use `{ min?: number; max?: number }` instead of `[number, number]` tuple | Partial bounds (only min or only max) must be representable and round-trip through URL | Accepted |
| 2026-05-15 | Boolean filters stored as `string[]` with `'true'`/`'false'` values | Unifies all non-range filters under one type; avoids a third union branch in `SelectedFilters` | Accepted |
| 2026-05-15 | `filtersPath` accepts full `searchParams` to carry catalog state into FiltersPage | Prevents losing q/sort/active filters when navigating to the filters screen | Accepted |
| 2026-05-15 | `ScreenContainer` gets `withTopInset` prop (default true); pages with Header pass false | Header already handles safe-area-top — ScreenContainer must not add it again | Accepted |
| 2026-05-15 | Vitest added for catalog/filter logic; no UI/component tests at this stage | Pure logic tests are fast and low-friction; React component tests need jsdom and add setup cost | Accepted |
| 2026-05-15 | Vite/esbuild moderate audit vulnerability deferred; no force-upgrade to Vite 8 | Vite 8 is a breaking major — upgrade requires controlled migration, not a hotfix | Accepted |
