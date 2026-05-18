# Marketplace Style Guide

How to build new Marketplace screens in the ECOFACTOR app style.

## Layout rules

- Always wrap in `<AppShell>` + `<ScreenContainer>` (handles safe-area, bottom nav padding)
- Use `<Header>` for screen titles with optional back button
- Bottom: always add enough padding to not overlap bottom nav
- Max width: 430px (mobile frame)
- Desktop: centered mobile frame with subtle box-shadow

## Category card rules

- Icon in accent-soft background circle (52×52px)
- Title: Subtitle1
- Subtitle: Caption, muted, 2-line clamp
- Min height: 140px
- Border: `--color-border`, radius: `--radius-lg`
- Hover/active: slight scale + accent dim overlay

## Product card rules

- Image: 16:9 aspect ratio, object-cover
- Badges: overlaid on image, dark background
- Title: Subtitle2 (14px Medium)
- Status badge: top-right of title row
- Show max 3 attributes from `visibleInCard: true` ones
- Price: accent color, SemiBold
- Tap feedback: slight scale + surface-elevated background

## Catalog rules

- One CatalogPage for all categories
- Quick filter chips in horizontal scroll row
- Toolbar: count on left, filters button + sort select on right
- Grid: single column, full-width cards with gap-3
- Empty state: centered with reset action

## Filter rules

- Full-page FiltersPage
- Grouped by attribute key
- Options as pill-shaped toggle buttons
- Active option: accent background + border
- "Застосувати" CTA at bottom, sticky
- "Скинути" in header right slot when filters active

## CTA rules

- Use `<StickyCTA>` for product pages and landing CTAs
- Primary CTA: full-width green button
- Secondary CTA: full-width outline button
- Both at bottom of content, gradient background

## Navigation rules

- 5 tabs: Маркет, Каталог, Обране, Заявка, Профіль
- Active tab: accent color
- Tab labels: 10px, Medium

## Typography rules

- Screen titles in Header: Subtitle1 (16px Medium)
- Section headings: Subtitle1 or Subtitle2
- Body text: Body2 (14px Regular) for most content
- Prices: Subtitle2 SemiBold, accent color
- Labels/meta: Caption (12px), muted color

## Ukrainian language rules

- All UI text in Ukrainian
- Common strings:
  - "Усі товари" — all products
  - "Переглянути всі" — see all
  - "Залишити заявку" — submit request
  - "Звʼязатися з менеджером" — contact manager
  - "Нічого не знайдено" — nothing found
  - "Скинути фільтри" — reset filters

## WebView rules

- `viewport-fit=cover` in index.html ✅
- `env(safe-area-inset-top/bottom)` in CSS ✅
- Touch targets minimum 44px ✅
- No hover-only interactions ✅
