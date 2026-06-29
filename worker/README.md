# ECOFACTOR Marketplace API (Cloudflare Worker)

Secure backend for the ECOFACTOR Marketplace static React app (GitHub Pages).
It holds the Telegram bot token and the Anthropic API key as **Wrangler secrets**
(never in git, never in the frontend bundle) and exposes a tiny HTTP API.

## What it does

1. **Orders** — formats an order as an HTML message, sends it to the manager's
   Telegram chat, and appends a durable copy to Cloudflare KV.
2. **Listing moderation** — runs Claude (vision + text) to verify that a
   user-submitted listing is an **energy-related** product (EV charging, solar,
   batteries, inverters, cables, power stations) and not prohibited. Approved
   listings are routed to the manager in Telegram with inline **Approve / Reject**
   buttons; rejected ones are stored silently.
3. **Status lookup** — the frontend polls a listing's moderation status.
4. **Telegram webhook** — handles the manager's button taps and records the
   decision back into KV.

The frontend only calls this Worker if `VITE_API_BASE` is set; otherwise it uses
a client-side fallback. So this repo is purely the server side.

---

## HTTP API

Base URL = your deployed Worker URL (e.g. `https://ecofactor-marketplace-api.<account>.workers.dev`).

### `POST /orders`
```jsonc
// request
{
  "order": {
    "id": "ord_123", "number": "1042", "createdAt": "2026-06-29T10:00:00Z",
    "items": [{ "title": "Зарядна станція", "qty": 1, "price": 12000, "currency": "UAH", "variant": "Type 2" }],
    "total": 12100, "currency": "UAH",
    "deliveryCity": "Київ", "deliveryBranch": "12", "deliveryType": "np", "deliveryPrice": 100
  },
  "customer": { "name": "Іван", "phone": "+380...." },
  "source": "marketplace-web"
}
// response
{ "ok": true, "id": "ord_123" }            // or { "ok": true, "id": "ord_123", "telegram": false } if TG send failed
```
The order is always written to KV (`order:<id>`) and the id pushed to
`orders:index` (a JSON array, capped to the last 1000), even if Telegram fails.

### `POST /listings`
```jsonc
// request — images are base64 data URLs
{
  "listing": { "id": "lst_1", "title": "...", "description": "...", "price": 999, "currency": "UAH",
               "images": ["data:image/jpeg;base64,...."] },
  "user": { "name": "...", "phone": "...", "userId": "..." }
}
// response
{ "id": "lst_1", "status": "pending" | "rejected", "verdict": { ...ModerationVerdict } }
```
Decision rule: `allowed && relevant && score >= 0.5` → `pending` (manager is
pinged with Approve/Reject buttons). Otherwise `rejected` (stored, no ping).
Stored at `listing:<id>` **without** image data (only the image count is kept).

### `GET /listings/:id`
```jsonc
{ "id": "lst_1", "status": "pending" | "approved" | "rejected" | "unknown", "verdict": { ... }, "moderatedAt": "..." }
```
Unknown id → `{ "id": "...", "status": "unknown" }` (404-safe, returns 200).

### `POST /telegram/webhook`
Receives Telegram `callback_query` updates from the Approve/Reject buttons.
Authenticated via the `X-Telegram-Bot-Api-Secret-Token` header (must equal
`WEBHOOK_SECRET`). Updates `listing:<id>.status`, answers the callback with a
toast, and edits the message to remove buttons + append the decision badge.
Always returns `200` quickly.

CORS: `OPTIONS` is handled; responses carry `Access-Control-Allow-Origin`
(from `ALLOWED_ORIGIN`, default `*`), methods `GET, POST, OPTIONS`, header
`content-type`.

---

## Setup & deploy

### 1. Install
```bash
cd worker
npm install
```

### 2. Log in to Cloudflare
```bash
npx wrangler login
```

### 3. Create the KV namespace
```bash
npx wrangler kv namespace create ECOFACTOR_KV
```
Copy the returned `id` and paste it into `wrangler.toml` in place of
`REPLACE_WITH_KV_ID`.

### 4. Set the secrets (never committed)
```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN     # from @BotFather
npx wrangler secret put ANTHROPIC_API_KEY      # from console.anthropic.com
npx wrangler secret put WEBHOOK_SECRET         # any long random string
# Optional — hide the manager chat id as a secret instead of the wrangler.toml var:
npx wrangler secret put TELEGRAM_MANAGER_CHAT_ID
```
> `TELEGRAM_MANAGER_CHAT_ID` already has a fallback var (`436984255`) in
> `wrangler.toml`. Set it as a secret/var to override.

### 5. (Optional) Tighten CORS
In `wrangler.toml`, set:
```toml
[vars]
ALLOWED_ORIGIN = "https://luichakr.github.io"
```

### 6. Deploy
```bash
npm run deploy
```
Note the deployed URL, e.g. `https://ecofactor-marketplace-api.<account>.workers.dev`.

### 7. Register the Telegram webhook
Use the **same** string for `WEBHOOK_SECRET` and the `secret_token` below:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<WORKER_URL>/telegram/webhook&secret_token=<WEBHOOK_SECRET>"
```
Verify:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

### 8. Point the frontend at the Worker
In the GitHub repo build env (e.g. GitHub Actions / Pages build settings), set:
```
VITE_API_BASE=<WORKER_URL>
```
Without it, the frontend uses its client-side fallback.

---

## Local development
```bash
cp .dev.vars.example .dev.vars   # fill in REAL values; .dev.vars is gitignored
npm run dev
```
`wrangler dev` loads `.dev.vars` automatically. For the Telegram webhook locally,
expose your dev server (e.g. `cloudflared tunnel`) and point `setWebhook` at it.

---

## Reading the order log from KV

List recent order ids:
```bash
npx wrangler kv key get --binding=ECOFACTOR_KV "orders:index"
```
Read one order:
```bash
npx wrangler kv key get --binding=ECOFACTOR_KV "order:<id>"
```
List all keys (orders + listings):
```bash
npx wrangler kv key list --binding=ECOFACTOR_KV
```
Read a listing verdict:
```bash
npx wrangler kv key get --binding=ECOFACTOR_KV "listing:<id>"
```

> Older Wrangler v3 uses `wrangler kv:key get` / `wrangler kv:namespace create`
> (with a colon). Newer versions accept the space form shown above. Use whichever
> your installed version supports.

---

## Security notes
- Secrets live only in Wrangler (`wrangler secret put`) / `.dev.vars` (gitignored).
- The webhook is authenticated by the secret-token header — set it via `setWebhook`.
- Tighten `ALLOWED_ORIGIN` to your GitHub Pages origin in production.
- Listing images are **not** persisted to KV (only the count), keeping storage
  small and avoiding storing user media server-side.
