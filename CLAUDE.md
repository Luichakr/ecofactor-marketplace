# CLAUDE.md

## Project

This is the ECOFACTOR Marketplace web app.

It is a standalone web-first universal Marketplace designed to be opened inside the existing ECOFACTOR mobile application through WebView/WKWebView.

The project is built from scratch using React + TypeScript + Vite.

## Marketplace concept

Marketplace is not only about cars.

It is a universal platform for different ECOFACTOR product and service categories:

- Cars (Автомобілі)
- Charging stations (Зарядні станції)
- Insurance (Страхування)
- Tires (Шини)

Future categories should be possible without rewriting the whole UI.

## Data model rules

- Use universal Category model (`src/entities/category/model/category.types.ts`)
- Use universal Product model (`src/entities/product/model/product.types.ts`)
- Use universal ProductAttribute model
- Use one universal catalog (`CatalogPage`) — not separate pages per category
- Use one universal product card (`ProductCard`) — not separate cards per category
- Generate filters from product attributes via `buildFacets.ts`
- Do not create category-specific catalog pages unless explicitly requested
- Do not create category-specific filter components unless explicitly requested

## Figma

Figma file: `bqiaZBYTrRQv0KSChoJ3Pq`

Figma is used as a visual style reference for the existing ECOFACTOR mobile app.

**Important:** Do not implement all Figma screens as Marketplace screens.

Use Figma to extract:
- colors, typography, spacing, card style, button style
- bottom navigation style, app shell style, input style
- visual rhythm

Design tokens are in `src/shared/styles/tokens.css`.

Typography system (Roboto):
- H1: 24px / 32px / Medium
- Subtitle1: 16px / 24px / Medium
- Subtitle2: 14px / 20px / Medium
- Body1: 16px / 24px / Regular
- Body2: 14px / 20px / Regular
- Caption: 12px / 16px / Regular, tracking 0.4px
- Button: 14px / 20px / SemiBold, tracking 0.4px

## Core rules

- Mobile-first always
- Desktop is secondary — shown as mobile frame centered on screen
- The UI should feel like a native mobile app
- Match ECOFACTOR app style from Figma
- Create Marketplace screens as a new product, not copies of the existing app
- Ukrainian is the default UI language
- Keep WebView compatibility in mind (viewport-fit=cover, safe-area, touch targets 44px+)
- Use shared components, do not duplicate UI per screen
- Do not store secrets in frontend code
- Do not read or print `.env` files
- Do not add unnecessary dependencies
- Do not do massive rewrites
- Split big tasks into small stages
- Update `docs/marketplace/DECISIONS.md` when making architectural decisions
- Update `docs/figma/*` when style decisions are extracted from Figma

## Tech stack

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- CSS variables and component-level CSS files (no CSS Modules, no Tailwind)

## Project structure

```
src/
  app/           # App entry, AppRouter, AppLayout
  pages/         # Route-level pages
  entities/      # Data types (category, product)
  features/      # Feature components (catalog, marketplace, product)
  shared/        # Reusable UI, config, utils, styles, webview bridge
  data/          # Mock data
```

## Key files

| Purpose | File |
|---------|------|
| Routing | `src/app/AppRouter.tsx` |
| App Shell | `src/shared/ui/AppShell/AppShell.tsx` |
| Bottom Nav | `src/shared/ui/BottomNav/BottomNav.tsx` |
| Design tokens | `src/shared/styles/tokens.css` |
| Category types | `src/entities/category/model/category.types.ts` |
| Product types | `src/entities/product/model/product.types.ts` |
| Mock categories | `src/data/mockCategories.ts` |
| Mock products | `src/data/mockProducts.ts` |
| buildFacets | `src/features/catalog/lib/buildFacets.ts` |
| filterProducts | `src/features/catalog/lib/filterProducts.ts` |
| sortProducts | `src/features/catalog/lib/sortProducts.ts` |
| catalogSearchParams | `src/features/catalog/lib/catalogSearchParams.ts` |
| getActiveFiltersCount | `src/features/catalog/lib/getActiveFiltersCount.ts` |
| Filter types | `src/features/catalog/model/catalog.types.ts` |
| WebView bridge | `src/shared/lib/webview/webviewBridge.ts` |

## Filter model

- Range filters: `RangeFilterValue = { min?: number; max?: number }` — partial bounds supported
- Boolean filters: stored as `string[]` with values `'true'` / `'false'`
- Select/multiSelect: `string[]`
- URL format: `?season=Літо&diameter_min=18&diameter_max=20`
- `category` param is always preserved in `/filters` URL
- `/catalog` → `/filters` passes full searchParams via `filtersPath({ categoryId, searchParams })`

## Project artifacts

The following files must NOT be committed to git or included in a clean archive:

```
node_modules/
dist/
.DS_Store
*.tsbuildinfo
.claude/settings.local.json
```

These are already listed in `.gitignore`.

## Safe-area rule

- `Header` handles `padding-top: env(safe-area-inset-top)`
- `ScreenContainer` has `withTopInset` prop (default `true`)
- Pages that render a `Header` must pass `withTopInset={false}` to `ScreenContainer`
- Pages without a `Header` (e.g. `/marketplace`) use the default

## Validation

Before finishing a coding task, run:

```bash
npm run build
npm run lint
npm run test
```

## Roadmap summary

- Stage 0 ✅ — universal marketplace technical foundation
- Stage 0.1 ✅ — ESLint, .gitignore, URL filter state, requestPath fix, dynamic productCount
- Stage 0.2 ✅ — filter flow fix, RangeFilterValue model, partial ranges, category preservation in /filters
- Stage 0.3 ✅ — artifact cleanup, safe-area fix, Vitest tests (32 tests), preflight improved
- Stage 1 — improve mobile App Shell per Figma style
- Stage 2 — refine Marketplace home screen
- Stage 3 — complete universal catalog
- Stage 4 — complete dynamic filters (range sliders, multi-select)
- Stage 5 — complete universal product card
- Stage 6 — request flow with validation
- Stage 7 — favorites with persistence
- Stage 8 — API adapter layer
- Stage 9 — connect real data
- Stage 10 — WebView/native bridge
- Stage 11 — QA on iPhone/Android viewports
- Stage 12 — production deploy
