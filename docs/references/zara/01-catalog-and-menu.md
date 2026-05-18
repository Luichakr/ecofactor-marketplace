# 01 — Catalog & Menu (first reference batch)

7 screenshots shared by user. Set the foundation for Stage 1 redesign.

## A. Catalog product grid — view modes

### View 1 (single column)
- One product per row, full-bleed image, aspect-ratio ~3:4 on light gray bg
- Title under image: all caps, very thin (regular weight), narrow letter-spacing
- Price below title, same caps style
- "+" icon right-aligned at end of title row (add to cart shortcut)
- Some products show 3 tiny color swatch squares under price
- Title truncates with ellipsis if too long

### View 2 (2 columns)
- Same image style, two per row, gap is minimal (~4-8px)
- "TESLA MODEL 3" / "RELAXED FIT INTERLOCK..." style truncation
- "+" icon shifted compact

### View 3 (3 columns)
- 3 per row, image gets smaller but maintains aspect ratio
- Crucially: ALL CARDS SAME HEIGHT — image aspect-ratio locked,
  title hidden (only price + "+"), or single-line clamp
- Bottom row shows multi-color variant icons (3 stacked t-shirts photo)

### Top header (catalog)
- Back arrow on left, no center title
- Right side: thin links "ВИД 2" "ФИЛЬТРЫ" "В МАГАЗИНЕ"
- Below header: thin horizontal scroll of tabs:
  "VIEW ALL  BASICS  T-SHIRTS  SHIRTS  POLO SHIRTS"
  - Active = black bold, inactive = thin gray
- Tabs are letter-spaced and ALL CAPS

## B. Top-level menu screen

### Wordmark
- Serif logo across the top: "MAN  KIDS  ZARA HOME  BEAUTY"
- Big serif (~24-28px), letter-spacing slightly negative
- Each item has a small dot indicator under (selected)

### Hero / featured row
- Horizontal scroll of photo tiles, each ~50% width
- Photo on top, label below in tiny caps:
  "THE NEW  ORIGINS  SHIRTS  WAYS..."
- No card frame, no border — just photo + caption

### Menu list (numbered sections)
Pattern: `|01|  NEW IN          [items list]`
- Left: section number `|01|` thin gray
- Middle: section label small caps "NEW IN"
- Right (or below): clickable sub-items, large caps "THE NEW", "WAYS TO WEAR", "AARON LEVINE X ZARA", "SWIMWEAR"

Sections seen:
- |01| NEW IN
- |02| ZARA ORIGINS [NEW]
- |03| ATHLETICZ / 26 1 18 1
- |04| COLLECTION  → VIEW ALL, BESTSELLERS, LINEN | LINEN BLEND, SUITS, T-SHIRTS, SHIRTS...

## C. Filters screen

- Numbered sections same pattern: `|01| SORT BY`, `|02| SIZE`, `|03| PRICE`, `|04| COLOUR`, `|05| TYPE OF PRODUCT`
- Sort options just listed as text: "ASCENDING PRICE / DESCENDING PRICE"
- Sizes: vertical text list "S / M / L / XL / XXL"
- Price: thin black slider with two thumbs, range below "45,90 PLN - 199,00 PLN"
- Colour: tiny color square + label "BEIGE", "BLACK", "BLUE", ...
- "ПОКАЗАТЬ БОЛЬШЕ" expand link at end of long lists
- Sticky bottom CTA: outlined "VER RESULTADOS" full-width

## D. Bottom nav

5 items, all minimal text-only or tiny line icons:
- Home (line icon)
- "МЕНЮ" (text, lowercase looks)
- Loading dot / search
- "АККАУНТ" (text)
- "[0]" cart count

No green/active color. Selected = full opacity, others = grayed out.

## Apply in our codebase

| Pattern | File |
|---|---|
| All-caps thin title, "+" right | `src/features/product/ui/ProductCard/ProductCard.tsx` |
| 1/2/3-column grid toggle | `src/features/catalog/ui/CatalogToolbar/CatalogToolbar.tsx`, `src/features/catalog/ui/CatalogGrid/CatalogGrid.css` |
| Numbered menu list | `src/pages/marketplace/MarketplaceHomePage.tsx` |
| Numbered filter sections | `src/pages/filters/FiltersPage.tsx` (TODO) |
| Serif wordmark | `src/shared/styles/tokens.css` (`--font-family-serif`) |
| Minimal bottom nav | `src/shared/ui/BottomNav/BottomNav.tsx` |
