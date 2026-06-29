# Deploy — Cloudflare (leechan.xyz)

The marketplace runs as two pieces, both on Cloudflare:

| Piece | What | Where |
|-------|------|-------|
| **Frontend** | the React app (static) | Cloudflare **Pages** → `https://leechan.xyz` |
| **Backend** | the secure API (Telegram token, AI moderation, KV order log) | Cloudflare **Worker** (`worker/`) → e.g. `https://api.leechan.xyz` |

The frontend talks to the Worker only when `VITE_API_BASE` is set at build time.
Secrets (Telegram bot token, Anthropic key) live **only in the Worker** — never in
the frontend bundle.

> One-time tool: `npm i -g wrangler` then `wrangler login`.

---

## 1) Backend — the Worker

```bash
cd worker
npm install

# a) KV namespace for orders + listing verdicts (run once)
wrangler kv namespace create ECOFACTOR_KV
#   → copy the printed id into worker/wrangler.toml (replace REPLACE_WITH_KV_ID)

# b) Secrets (never committed). The token is also in worker/.dev.vars for local dev.
wrangler secret put TELEGRAM_BOT_TOKEN        # paste the bot token
wrangler secret put WEBHOOK_SECRET            # paste the value from worker/.dev.vars
wrangler secret put ANTHROPIC_API_KEY         # OPTIONAL — enables real AI vision.
#   Without it, moderation uses the keyword fallback (on-topic → manager review).
# TELEGRAM_MANAGER_CHAT_ID is set in wrangler.toml [vars]; override as a secret if you prefer.

# c) Deploy
npm run deploy          # → prints the worker URL: https://ecofactor-marketplace-api.<acct>.workers.dev
```

**Custom domain (recommended):** Cloudflare dashboard → Workers → your worker →
Settings → Domains & Routes → add `api.leechan.xyz`. Then the API base is
`https://api.leechan.xyz`.

**Telegram webhook** (so the manager's ✅/❌ buttons work) — set it once to your
worker URL + the webhook secret:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://api.leechan.xyz/telegram/webhook&secret_token=<WEBHOOK_SECRET>"
```

**Manager chat:** the manager must press **Start** in the bot once (so the bot may
DM them). The chat id is `436984255` by default — change `TELEGRAM_MANAGER_CHAT_ID`
if orders/listings should go elsewhere (a group: add the bot, use the group's id).

Read the durable order log any time:
```bash
wrangler kv key get orders:index --binding ECOFACTOR_KV     # list of order ids
wrangler kv key get "order:<id>" --binding ECOFACTOR_KV     # one order
```

---

## 2) Frontend — Cloudflare Pages

Build points the app at the Worker via `VITE_API_BASE`:

```bash
cd ..                       # repo root
VITE_API_BASE=https://api.leechan.xyz npm run build
wrangler pages deploy dist --project-name ecofactor-marketplace
```

Then in the dashboard → Pages → the project → Custom domains → add **leechan.xyz**
(and `www` if wanted). DNS records are created automatically when the domain is on
Cloudflare.

If you wire Pages to the Git repo instead of `wrangler pages deploy`:
- Build command: `npm run build`
- Output dir: `dist`
- Environment variable: `VITE_API_BASE = https://api.leechan.xyz`

SPA deep links work via `public/_redirects` (`/* /index.html 200`), already included.

---

## Draft mode (no Worker yet)

If `VITE_API_BASE` is **not** set, the app still works:
- Orders are saved on-device (`mp:orders`, with a downloadable journal on `/orders`)
  and pinged to Telegram **only if** `VITE_TELEGRAM_BOT_TOKEN` is set at build —
  which leaks the token in the public bundle, so prefer the Worker.
- Listings are screened by the in-browser keyword classifier; on-topic ones are
  pushed to the manager chat for manual approval.

The Worker path is strictly better (token stays server-side, real AI vision,
durable KV log, Approve/Reject buttons), so set `VITE_API_BASE` for production.

---

## Notes

- **Rotate the bot token** (`@BotFather → /revoke`) — it was shared in chat. Update
  the `TELEGRAM_BOT_TOKEN` secret + `worker/.dev.vars` afterwards.
- The old GitHub Pages workflow (`.github/workflows/`) is no longer the deploy
  target — disable it if present so it doesn't publish a stale build.
- Tighten `ALLOWED_ORIGIN` in `worker/wrangler.toml` to `https://leechan.xyz`
  (already set) once the domain is live.
