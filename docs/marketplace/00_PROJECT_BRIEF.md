# ECOFACTOR Marketplace — Project Brief

## What is being built

A standalone universal web Marketplace for ECOFACTOR — a platform for multiple product and service categories.

This is NOT a copy of the existing ECOFACTOR mobile app. It is a **new product** built inside the same ecosystem, opened via WebView.

## Categories

| ID | Title | Description |
|---|---|---|
| cars | Автомобілі | Electric vehicles, hybrids, and custom orders |
| charging-stations | Зарядні станції | Home and commercial charging solutions |
| insurance | Страхування | Policies and protection for vehicles and business |
| tires | Шини | Seasonal tires, selection by parameters |

More categories can be added in the future without UI rewrites.

## Figma

Figma file `bqiaZBYTrRQv0KSChoJ3Pq` contains the **existing ECOFACTOR app design** — not Marketplace screens.

Used only as a **visual style reference** to extract:
- Colors, typography, spacing, radius
- App shell, header, bottom nav, cards, buttons

The Marketplace is a new product built in the same visual style.

## Stage 0 goal

Create the technical foundation — not the final product. The foundation includes:
- React + TypeScript + Vite project structure
- Universal data model
- Universal catalog and product card
- Dynamic filters generated from product attributes
- Mobile App Shell with bottom navigation
- WebView-ready setup (safe-area, viewport)
- Mock data (12 products across 4 categories)
- Design tokens from Figma
- Documentation, CLAUDE.md, skills for future Claude Code sessions
