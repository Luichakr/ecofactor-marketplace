# Marketplace Architect Skill

Use this skill when planning or changing the ECOFACTOR Marketplace architecture.

## Context

The project is a standalone universal web Marketplace opened inside the existing ECOFACTOR mobile app through WebView/WKWebView.

Marketplace supports multiple categories:
- Cars (Автомобілі)
- Charging stations (Зарядні станції)
- Insurance (Страхування)
- Tires (Шини)
- Future categories

## Rules

- Mobile-first always
- Keep WebView compatibility (viewport-fit=cover, safe-area, 44px touch targets)
- Keep App Shell simple: header + scroll content + bottom nav
- Use universal product model with `attributes[]`
- Use universal catalog (one CatalogPage for all categories)
- Use universal product card (one ProductCard for all categories)
- Generate filters from `filterable: true` product attributes
- Separate pages, features, shared UI, data, and WebView bridge
- Do not mix native bridge logic into UI components
- Mock data first, API later
- Do not add backend unless explicitly requested
- Update `docs/marketplace/DECISIONS.md` for architecture decisions
