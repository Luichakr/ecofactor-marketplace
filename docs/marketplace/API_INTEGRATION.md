# EFPF API Integration

`ecofactor-product-feed` plugin v0.1.0 on `ecofactortech.com`. WooCommerce-backed JSON feed.

## Endpoints

| Method | URL | Auth | Notes |
|---|---|---|---|
| GET | `/wp-json/efpf/v1/ping` | none | health check |
| GET | `/wp-json/efpf/v1/products` | header | list, paginated |
| GET | `/wp-json/efpf/v1/products/{ID}` | header | single product or variation |

**Auth header**: `X-EFPF-API-Key: <key>` — do NOT commit the key to git.
Keep it in `.env.local` (gitignored).

## Query params for `/products`

| Param | Values | Default | Notes |
|---|---|---|---|
| `lang` | `ua`, ~~`uk`~~, `en`, `ru` | `ua` | **Important:** docs say `uk`, but live data is under `ua` (Polylang quirk). `uk`/`en`/`ru` return 0 items currently. |
| `type` | `simple`, `variable` | both | |
| `per_page` | 1-200 | 50 | |
| `page` | int | 1 | |
| `since` | ISO datetime | none | delta sync — only items modified after this time |
| `variations` | `ids` | full | return only variation IDs inline (compact mode) |
| `include_variations` | `1` | 0 | flatten variations as separate items in the list |

## Current store inventory (2026-05-15)

Total: **43 products**, all in `ua` language.

| Count | Category | Slug-ish |
|---|---|---|
| 10 | Гібридні інвертори | inverters |
| 8 | Сонячні панелі | solar-panels |
| 6 | Аксесуари | accessories (e.g. RFID cards) |
| 6 | Акумуляторні батареї | batteries |
| 6 | Мобільні зарядки | mobile-chargers (EV) |
| 4 | Комплектуючі | components |
| 3 | Кабелі | cables (EV charging) |

**Mismatch with our mocks**: `mockCategories.ts` lists cars / charging-stations / insurance / tires.
Real store sells solar + EV charging equipment. We need to decide whether to:
- Update mocks/CLAUDE.md to match reality (recommended for production)
- Keep mocks as universal-marketplace example (current state)

Price range: 60 ₴ (RFID card) → 332 334 ₴ (large inverter or battery).

## Response shape (single product, simple)

```json
{
  "id": 3387,
  "store_id": "ecofactortech.com",
  "type": "simple",  // or "variable"
  "parent_id": 0,
  "sku": "RFID card",
  "status": "publish",
  "name": "RFID-картка ECOFACTOR",
  "slug": "rfid-kartka-ecofactor",
  "permalink": "https://ecofactortech.com/ua/shop/product/...",
  "language": "ua",
  "translations": { "ua": { "id": 3387, "name": "...", "permalink": "..." } },
  "description": "<p>Пластикова картка зручна...</p>",       // HTML
  "short_description": "Картка дозволяє вмикати зарядку...",  // HTML
  "price": {
    "regular": "60",
    "sale": null,
    "current": "60",
    "currency": "UAH",
    "on_sale": false
  },
  "stock": {
    "status": "instock",
    "quantity": 183,
    "manage": true,
    "backorders": "no",
    "in_stock": true
  },
  "weight": "0.005",
  "dimensions": { "length": "8.6", "width": "5.3", "height": "0.07" },
  "categories": [{ "id": 253, "name": "Аксесуари", "slug": "accessories", "parent": 0 }],
  "tags": [],
  "attributes": [
    {
      "key": "pa_manufacturer",
      "name": "Виробник",
      "taxonomy": "pa_manufacturer",
      "visible": true,
      "variation": true,
      "options": [{ "slug": "ecofactor", "name": "ECOFACTOR" }]
    }
  ],
  "images": {
    "main": {
      "id": 3458,
      "full": "https://.../image.png",
      "medium": "https://.../image-300x225.png",
      "thumbnail": "https://.../image-150x150.png"
    },
    "gallery": []
  },
  "meta": { "_1c_uid": null, "_1c_last_sync": null, ... },
  "created_at": "2026-01-20T19:45:05+02:00",
  "modified_at": "2026-05-13T21:46:01+03:00"
}
```

Top-level list response wraps `items` plus `total`, `pages`, `page`, `per_page`, `count`, `generated_at`, `lang`, `store_id`.

**Variable products**: same shape, plus `attributes[].variation: true` flags which attribute drives variants
(e.g. cable power 7 kW vs 22 kW). Use `?include_variations=1` to flatten variations as separate items.

## ⚠ CORS — direct browser fetch blocked

The server includes `Access-Control-Allow-Origin: <reflected origin>`, but
`Access-Control-Allow-Headers` is set to:
```
Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type
```

`X-EFPF-API-Key` is **not** in that list, so the browser preflight fails and the
real GET is blocked. `Authorization: Bearer …` is rejected by the plugin too.

**Confirmed via DevTools**: `fetch('/ping')` works (no custom header → no preflight),
`fetch('/products')` with `X-EFPF-API-Key` throws `TypeError: Failed to fetch`.

### Options

1. **(Recommended for dev) Vite proxy** — `vite.config.ts` proxies `/api/efpf/*`
   → `https://ecofactortech.com/wp-json/efpf/v1/*` and injects the API key header
   server-side. The browser never sees the key. Works only in `npm run dev`.

2. **Backend / serverless proxy for prod** — same idea, deploy a small endpoint
   (Vercel function, Cloudflare Worker, or our own backend) that holds the key
   and forwards requests. Long-term right answer if we ship live data.

3. **Ask plugin author to add `X-EFPF-API-Key` to Access-Control-Allow-Headers**
   — simplest, but requires backend change on ecofactortech.com.

4. **Build-time fetch** — pull all products at build time, ship as static JSON.
   Works for low-frequency updates; cache must be rebuilt on each catalog change.

### Picked path for next step

Until the user picks, **nothing is wired yet**. The key in `.env.local.example`
is the placeholder. To proceed, run one of:

- `npm install` → fill `.env.local` → `npm run dev` (uses Vite proxy, see vite.config.ts)
- or leave mocks in place

## Adapter mapping (proposed)

EFPF item → our `MarketplaceProduct`:

| EFPF | Our model | Notes |
|---|---|---|
| `id` (number) | `id` (string) | stringify |
| `categories[0].slug` | `categoryId` | need category mapping table |
| `name` | `title` | |
| `short_description` (strip HTML) | `subtitle` | first sentence |
| `description` (strip or sanitize HTML) | `description` | render with `dangerouslySetInnerHTML` if rich content needed |
| `price.current` + `price.currency` | `price` | parse to number |
| `images.main.full` (or medium) | `image` | |
| `stock.status` | `status` | map `instock` → `inStock` etc. |
| `attributes[]` | `attributes[]` | map each — figure out which to mark `filterable`, `visibleInCard` |
| `modified_at` | `createdAt` | or keep both |

Category slug map (initial):
- `accessories` → new category "Аксесуари"
- `solar-panels` → new category "Сонячні панелі"
- `inverters` (or similar) → new category "Інвертори"
- ...

Need to update `mockCategories.ts` (or replace with a generated list from `/products`).
