# Zara Redesign Plan

Reference batches: see [03-home/](03-home/), [04-menu-and-filter/](04-menu-and-filter/),
[05-product-card/](05-product-card/) for the original Zara screenshots and the
user-written descriptions (DESCRIPTION.txt next to images).

Stage A is the current focus. Other stages are next-up.

## Stage A — Home as editorial banner

**Goal**: replace tile grid with a vertical scroll of full-bleed photo banners
(one per top-level category). Each banner fills the viewport, has a single
overlaid serif label, and on tap navigates to `/catalog/<id>`. After all
category banners there's a transitional "The New / ПРОКРУТИТИ ВНИЗ" screen
and a footer with service links.

**Components**:
- `HomeBanner` — full-bleed image, dark gradient overlay at bottom for label
  legibility, serif label centered low. Wraps `<Link>` to `/catalog/<id>`.
- `HomeTransition` — white screen, serif "The New", small caps subtitle
  "ПРОКРУТИТИ ВНИЗ", thin vertical divider line.
- `HomeFooter` — newsletter teaser, PRIVACY POLICY | TERMS OF USE, etc.

**Photo source**: pick the first product image from each category via the
EFPF cache (`useEfpfProducts`). Until that loads, render a clean skeleton
block (no spinners — matches Zara's flat aesthetic).

**Note**: Zara's banners are fashion shoots; ours will be product close-ups.
That's fine — keeps the editorial feel without needing new photography.

## Stage B — Menu screen at `/menu`

**Goal**: when the user taps "МЕНЮ" in the bottom nav, open a dedicated menu
screen. Currently БottomNav has a "Каталог" item; replace with "Меню".

**Components**:
- `MenuSectionTabs` — horizontal serif tabs at top (МАРКЕТ / БРЕНДИ / ...),
  active item has a small dot under it.
- `MenuGroupBlock` — numbered group: `|01| ПІДБІРКИ` on left, clickable
  items on right (first item bold).
- Maybe `MenuVisualCard` — large photo card with overlay text + "VIEW
  GUIDES" button, used in special sections.

**Sections** (initial proposal, real content TBD by user):
- `|01| ПІДБІРКИ` — Нові, В наявності, Знижки, Топ продаж
- `|02| ВИРОБНИКИ` — ECOFACTOR, LuxPower, Deye, Pytes, OSDA, ...
- `|03| EV-ЗАРЯДКА` — Усі, Мобільні, Кабелі, Аксесуари
- `|04| СОНЯЧНА СТАНЦІЯ` — Усі, Панелі, Інвертори, Батареї, Комплектуючі
- `|05| ДОПОМОГА` — Замовити дзвінок, FAQ, Гарантія

## Stage C — Product Card v2

**Goal**: rewrite ProductPage to match Zara's product detail flow.

**Layout** (top → bottom):
1. **Floating header** — X close (left), bookmark + share + cart[N] (right).
   Overlays the hero image at first; turns opaque white on scroll.
2. **Hero image** — full-bleed, ~4:5 aspect, no padding.
3. **Optional action overlay** — small white pill bottom-left over the hero,
   e.g. "ПОРІВНЯТИ" or "ДИВИТИСЬ AR" with dotted icon. For ECOFACTOR could be
   "ПОРАХУВАТИ ЕКОНОМІЮ" or hidden by default.
4. **Title + price block** — title in small caps thin weight, price below
   same size, color swatches right (only if variants exist).
5. **Sticky bottom CTA** — black "ДОДАТИ" full-width.
6. **Related thumbnail strip** — horizontal scroll of mini product images.
7. **Tab strip** — "ОПИС  АТРИБУТИ  ДОСТАВКА" (active bold).
8. **Description** — plain text body, "Показати більше" expand link.
9. **Manufacturer code** — `MANUFACTURER | SKU` + copy icon.
10. **Additional photos** — full-bleed (back view, detail shots).
11. **Mid-scroll alternate CTA** — outlined "ДОДАТИ" + price on right.
12. **Accordions** — Композиція / Догляд / Доставка / Наявність. Tap → expand.
13. **Help link** — "ВАМ ПОТРІБНА ДОПОМОГА?"
14. **"Завершіть комплект"** — horizontal product strip.
15. **"Вас також може зацікавити"** — 2-3 col grid.
16. **Footer** — Privacy / Terms.

## Stage D — Filter overlay

**Goal**: turn the filter from a separate page into a translucent overlay
above the catalog. Numbered sections, dynamic count.

**Sections**:
- `|01| СОРТУВАННЯ` — Найдешевші, Найдорожчі, Нові, За назвою
- `|02| ВИРОБНИК` — checkbox list, expand
- `|03| ЦІНА` — range slider with two handles
- `|04| ПОТУЖНІСТЬ` — chip list (3.5 / 7 / 11 / 22 кВт)
- `|05| ТИП КОНЕКТОРА` — Type 2 / Type 1 / GB-T / Schuko
- `|06| ПІДКАТЕГОРІЯ` — same as catalog tabs (Мобільні / Кабелі / ...)

**Bottom bar**:
- "ПОКАЗАТИ N ТОВАРІВ" — primary, count updates live as user toggles.
  When 0: disabled state "0 ТОВАРІВ — ЗМІНІТЬ ФІЛЬТР".
- "ОЧИСТИТИ ФІЛЬТРИ" — secondary ghost link.

## Stage E — Bottom Nav v2 + Cart

**Goal**: align bottom nav with Zara (5 items: home / menu / search / account / cart[N]).
Add a basic cart screen.

**Items**:
1. Home icon → `/marketplace`
2. "МЕНЮ" text → `/menu` (new)
3. Search icon centered → `/search`
4. "АККАУНТ" text → `/profile`
5. Cart icon with count `[N]` → `/cart` (new)

**Active indicator**: tiny dot under the active item, no color change.

**Cart**: list of added items + qty/price, "ОФОРМИТИ ЗАМОВЛЕННЯ" CTA.
**Checkout**: delivery cards (HOME / STORE / DROP POINT), "ДАЛІ" + total on right.

---

## Constraints

- We don't have hero/lifestyle photos. Use product photos.
- No real cart logic yet — Stage E builds the UI shell with localStorage state.
- Translations: UI in Ukrainian throughout.
