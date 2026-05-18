# 02 — Product card detail (second reference batch)

Screenshots: 4 product detail variations + 1 "view 1" 3-column grid.

## A. Product detail — top of scroll

### Header (transparent)
- Left: large X close icon
- Right: 3 thin SVG icons in a row — bookmark (save), share-arrow (upload), bag with [0] count
- No title in header — title appears in body below
- Background transparent over hero image

### Hero photo
- Full-width, no padding, no border
- ~3:4 aspect ratio, shows model wearing product
- Floating CTA bottom-left: white pill button "ПРИМЕРИТЬ МАКИЯЖ" with small dotted-circle icon
  (only for products with AR try-on)

### Product info (below image)
- Left: title in regular sentence-case caps "SEOUL RUNNING T-SHIRT" (small, 13-14px)
- Below title: price "89.90 PLN" same size and weight
- Right: 2 color swatches (small squares with border, one filled, one outlined = selected)

### Sticky CTA
- Full-width black rectangle "ДОБАВИТЬ" (or outlined version with price on right)
- Two variants:
  - Top-of-scroll: solid black "ДОБАВИТЬ" full-width
  - Mid-scroll: outlined "ДОБАВИТЬ" with "89.90 PLN" on right side

### Related row (below CTA, horizontal scroll)
- 10+ tiny thumbnail photos of related products
- About 36-44px tall, light gray bg, hugged together no gaps
- Tappable, switches main product

## B. Product detail — tabs and description

### Tabs row (small, top of scroll)
- "ОПИСАНИЕ ТОВАРА   ЦВЕТ   МЕРКИ" — all caps, very thin
- Active = bold, inactive = gray

### Description text
- Regular sentence case (not caps): "Regular fit cotton T-shirt."
- Bullet list with dashes: "- Round neck.", "- Short sleeves.", "- Contrast logo and graphic..."
- Truncated with "Показать больше" underlined link
- Below: color code "ECRU / BEIGE | 6224/352/075" + copy icon

### Second image (back view)
- Same full-width, no padding, scrolls below description

## C. Product detail — bottom (accordions + related)

### Accordion sections
- Vertical list, full-width, divided by thin lines:
  - "COMPOSITION, CARE & ORIGIN          +"
  - "SHIPPING, EXCHANGES AND RETURNS    +"
  - "НАЛИЧИЕ ТОВАРА В МАГАЗИНЕ          +"
- Each row: label left (small caps), "+" right, ~48-56px tall

### Help link
- "ВАМ НУЖНА ПОМОЩЬ?" — small caps label, no chevron, link style

### "ЗАВЕРШИТЕ СВОЙ ОБРАЗ" (complete the look)
- Section title small caps left-aligned
- Horizontal scrollable row of 4-5 related products
- Each: small square image, price below, "+" below price
- No title under image — only price

### "ВАС ТАКЖЕ МОЖЕТ ЗАИНТЕРЕСОВАТЬ" (also interesting)
- Section title small caps
- 3-column grid (could be 2 or 3) of products
- Each: image + price + "+" — NO title at all

### Footer
- Tiny links "PRIVACY POLICY  /  TERMS OF USE"

## D. View 1 (3-column grid mode in catalog)

- 3 products per row, gap minimal (~4px)
- ALL IMAGES SAME HEIGHT (aspect-ratio locked)
- Below each image: ONLY price + "+" — no title (in this dense view)
- Some products show small color square row under price
- Sections separate visually by an extra blank row

## Apply in our codebase

| Pattern | Where |
|---|---|
| Sticky CTA with outlined variant + price on right | `src/shared/ui/StickyCTA/StickyCTA.tsx`, `src/pages/product/ProductPage.tsx` |
| Hero image full-width, transparent header | `src/pages/product/ProductPage.css`, `src/shared/ui/Header/Header.tsx` (transparent variant) |
| Color swatches | New component, e.g. `src/features/product/ui/ColorSwatches/` |
| Accordion sections | New shared component `src/shared/ui/Accordion/` |
| Horizontal related row | Maybe reuse `CategoryGrid` style |
| 3-column grid: hide title, show price + "+" only | `src/features/catalog/ui/CatalogGrid/CatalogGrid.css` (already has cols-3 class, hide title) |
| Skeleton silhouette when image missing | `src/features/product/ui/ProductImage/` (new) |
