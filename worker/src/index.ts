/**
 * ECOFACTOR Marketplace API — Cloudflare Worker
 * ------------------------------------------------
 * Secure backend for the static React frontend (GitHub Pages).
 *
 * Responsibilities:
 *   1. POST /orders            — relay an order to the Telegram manager + log to KV.
 *   2. POST /listings          — AI-moderate a user listing (Claude vision + text),
 *                                store verdict in KV, and route approved ones to the
 *                                manager with inline Approve/Reject buttons.
 *   3. GET  /listings/:id      — read a listing's moderation status.
 *   4. POST /telegram/webhook  — handle the manager's Approve/Reject button taps.
 *
 * No external npm dependencies — only the Workers runtime `fetch` + KV.
 * All secrets are injected via Wrangler secrets/vars (see README + wrangler.toml).
 */

// ----------------------------------------------------------------------------
// Environment bindings (configured in wrangler.toml / via `wrangler secret put`)
// ----------------------------------------------------------------------------

export interface Env {
  /** KV namespace binding for orders + listing verdicts. */
  ECOFACTOR_KV: KVNamespace;

  /** Telegram bot token (secret). */
  TELEGRAM_BOT_TOKEN: string;
  /** Telegram chat id of the manager (secret or var). Falls back below. */
  TELEGRAM_MANAGER_CHAT_ID?: string;
  /** Anthropic API key (secret). */
  ANTHROPIC_API_KEY: string;
  /** Shared secret used to authenticate the Telegram webhook (secret). */
  WEBHOOK_SECRET?: string;

  /** Allowed CORS origin (var). Defaults to '*'. */
  ALLOWED_ORIGIN?: string;
}

// Fallback manager chat id (overridable by env). Documented in README.
const DEFAULT_MANAGER_CHAT_ID = '436984255';

// Anthropic model used for moderation (cheap + supports vision).
const MODERATION_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Cap for the orders index list.
const ORDERS_INDEX_MAX = 1000;

// ----------------------------------------------------------------------------
// Domain types (mirror the frontend contract)
// ----------------------------------------------------------------------------

interface OrderItem {
  title: string;
  qty: number;
  price: number;
  currency: string;
  variant?: string;
}

interface Order {
  id: string;
  number: string | number;
  createdAt: string;
  items: OrderItem[];
  total: number;
  currency: string;
  deliveryCity: string;
  deliveryBranch?: string;
  deliveryType: 'np' | 'home';
  deliveryAddress?: string;
  deliveryPrice: number;
}

interface OrderCustomer {
  name: string;
  phone: string;
}

interface OrdersRequest {
  order: Order;
  customer: OrderCustomer;
  source?: string;
}

interface Listing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  currency: string;
  images: string[]; // data URLs
}

interface ListingUser {
  name?: string;
  phone?: string;
  userId?: string | number;
}

interface ListingsRequest {
  listing: Listing;
  user?: ListingUser;
}

interface ModerationVerdict {
  relevant: boolean;
  allowed: boolean;
  category: string;
  score: number;
  reasons: string[];
  imageSummary: string;
}

type ListingStatus = 'pending' | 'approved' | 'rejected' | 'unknown';

interface StoredListing {
  id: string;
  status: ListingStatus;
  verdict: ModerationVerdict;
  /** Listing metadata WITHOUT image data — only the image count is kept. */
  listing: Omit<Listing, 'images'> & { imageCount: number };
  user?: ListingUser;
  receivedAt: string;
  moderatedAt?: string;
}

// ----------------------------------------------------------------------------
// Worker entry point
// ----------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();

    // CORS preflight — answer immediately.
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      // --- Routing -------------------------------------------------------
      if (method === 'POST' && pathname === '/orders') {
        return await handleOrders(request, env, ctx);
      }

      if (method === 'POST' && pathname === '/listings') {
        return await handleListings(request, env, ctx);
      }

      const listingMatch = pathname.match(/^\/listings\/([^/]+)$/);
      if (method === 'GET' && listingMatch) {
        return await handleGetListing(decodeURIComponent(listingMatch[1]), env);
      }

      if (method === 'POST' && pathname === '/telegram/webhook') {
        return await handleTelegramWebhook(request, env, ctx);
      }

      // Simple health check.
      if (method === 'GET' && (pathname === '/' || pathname === '/health')) {
        return json({ ok: true, service: 'ecofactor-marketplace-api' }, env);
      }

      return json({ ok: false, error: 'not_found' }, env, 404);
    } catch (err) {
      // Never leak internals; log for the operator.
      console.error('Unhandled error:', err);
      return json({ ok: false, error: 'internal_error' }, env, 500);
    }
  },
};

// ----------------------------------------------------------------------------
// 1) POST /orders
// ----------------------------------------------------------------------------

async function handleOrders(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  let body: OrdersRequest;
  try {
    body = (await request.json()) as OrdersRequest;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, env, 400);
  }

  const order = body?.order;
  const customer = body?.customer;
  if (!order || !order.id || !customer) {
    return json({ ok: false, error: 'invalid_payload' }, env, 400);
  }

  // Persist to KV first (durable log), even if Telegram fails afterwards.
  const receivedAt = new Date().toISOString();
  const record = { ...body, receivedAt };

  // Store the order and update the capped index. Awaited so we never lose data.
  await env.ECOFACTOR_KV.put(`order:${order.id}`, JSON.stringify(record));
  await pushToIndex(env, 'orders:index', order.id, ORDERS_INDEX_MAX);

  // Send the formatted message to the manager.
  const text = formatOrderMessage(order, customer, body.source);
  let telegramOk = false;
  try {
    const res = await tgSendMessage(env, {
      chat_id: managerChatId(env),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    telegramOk = res.ok;
    if (!res.ok) console.error('Telegram sendMessage failed:', await safeText(res.response));
  } catch (err) {
    telegramOk = false;
    console.error('Telegram sendMessage threw:', err);
  }

  if (telegramOk) {
    return json({ ok: true, id: order.id }, env);
  }
  return json({ ok: true, id: order.id, telegram: false }, env);
}

/** Build a clean HTML order message for Telegram. */
function formatOrderMessage(order: Order, customer: OrderCustomer, source?: string): string {
  const lines: string[] = [];
  lines.push(`🛒 <b>Нове замовлення №${esc(String(order.number))}</b>`);
  lines.push('');

  for (const item of order.items ?? []) {
    const variant = item.variant ? ` (${esc(item.variant)})` : '';
    const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
    lines.push(
      `• ${esc(item.title)}${variant} ×${esc(String(item.qty))} = ${formatMoney(lineTotal, item.currency)}`
    );
  }

  lines.push('');
  lines.push(`💰 <b>Разом: ${formatMoney(order.total, order.currency)}</b>`);

  // Delivery block.
  if (order.deliveryType === 'home') {
    lines.push(`🚚 Доставка: кур'єр${order.deliveryAddress ? `, ${esc(order.deliveryAddress)}` : ''}`);
  } else {
    const branch = order.deliveryBranch ? `, відділення ${esc(order.deliveryBranch)}` : '';
    lines.push(`🚚 Доставка: Нова Пошта${branch}`);
  }
  if (order.deliveryCity) lines.push(`🏙 Місто: ${esc(order.deliveryCity)}`);
  if (order.deliveryPrice != null) {
    lines.push(`📦 Вартість доставки: ${formatMoney(order.deliveryPrice, order.currency)}`);
  }

  lines.push('');
  lines.push(`👤 Отримувач: ${esc(customer.name)}`);
  lines.push(`📞 Телефон: ${esc(customer.phone)}`);

  if (source) lines.push(`\n<i>Джерело: ${esc(source)}</i>`);

  return lines.join('\n');
}

// ----------------------------------------------------------------------------
// 2) POST /listings — AI moderation
// ----------------------------------------------------------------------------

async function handleListings(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: ListingsRequest;
  try {
    body = (await request.json()) as ListingsRequest;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, env, 400);
  }

  const listing = body?.listing;
  if (!listing || !listing.id) {
    return json({ ok: false, error: 'invalid_payload' }, env, 400);
  }

  const images = Array.isArray(listing.images) ? listing.images : [];

  // --- Run AI moderation ------------------------------------------------
  const verdict = await moderateListing(env, listing, images);

  // --- Decision ---------------------------------------------------------
  const passes = verdict.allowed === true && verdict.relevant === true && verdict.score >= 0.5;
  const status: ListingStatus = passes ? 'pending' : 'rejected';

  // --- Store in KV (images stripped, only count kept) -------------------
  const receivedAt = new Date().toISOString();
  const stored: StoredListing = {
    id: listing.id,
    status,
    verdict,
    listing: {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      imageCount: images.length,
    },
    user: body.user,
    receivedAt,
  };
  await env.ECOFACTOR_KV.put(`listing:${listing.id}`, JSON.stringify(stored));

  // --- Route approved-for-review listings to the manager ----------------
  if (status === 'pending') {
    // Send to Telegram. Do not block the response on full media-group upload —
    // but the first photo (with buttons) is important, so we await it.
    try {
      await sendListingToManager(env, listing, verdict, images, ctx);
    } catch (err) {
      console.error('Failed to notify manager about listing:', err);
      // The verdict is already stored; the frontend still gets status=pending.
    }
  }

  return json({ id: listing.id, status, verdict }, env);
}

// Energy lexicon for the no-AI keyword fallback (mirrors the frontend).
const KW_STRONG = [
  'зарядн', 'зарядк', 'ev ', 'ev-', 'електромобіл', 'електрокар', 'wallbox', 'evse',
  'type 1', 'type1', 'type 2', 'type2', 'ccs', 'chademo', 'gb/t', 'charger', 'charging',
  'сонячн', 'фотоелемент', 'фотомодул', 'фотовольта', 'solar', 'інвертор', 'inverter',
  'дбж', 'ups', 'mppt', 'акумулятор', 'акб', 'lifepo', 'літієв', 'lithium', 'повербанк',
  'павербанк', 'powerbank', 'power bank', 'power station', 'портативна станці',
  'портативна електростан', 'електростанці', 'генератор', 'вітрогенератор', 'вітряк',
  'тепловий насос', 'зарядна станці', 'конектор', 'коннектор',
];
const KW_SUPPORT = [
  'енерг', 'електро', 'квт', 'kw', 'kwh', 'ват', 'watt', 'вольт', 'ампер', '220в', '380в',
  'розетк', 'потужн', 'трифазн', 'однофазн', 'станці',
];
const KW_BANNED = [
  'зброя', 'зброї', 'пістолет', 'набої', 'патрон', 'боєприпас', 'наркотик', 'канабіс',
  'марихуан', 'кокаїн', 'порно', 'інтим', 'еротик', 'viagra', 'weapon', 'firearm', 'ammo',
  'cocaine', 'porn', 'drugs', 'підроблен документ', 'фальшив',
];

/** Server-side keyword classifier used when AI vision is unavailable/failed. */
function keywordVerdict(listing: Listing): ModerationVerdict {
  const text = ` ${listing.title ?? ''} ${listing.description ?? ''} `.toLowerCase();
  if (KW_BANNED.some((b) => text.includes(b))) {
    return {
      relevant: false,
      allowed: false,
      category: 'unknown',
      score: 0,
      reasons: ['Виявлено ознаки забороненої категорії товару.'],
      imageSummary: '',
    };
  }
  const strong = KW_STRONG.filter((t) => text.includes(t));
  const support = KW_SUPPORT.filter((t) => text.includes(t));
  const relevant = strong.length >= 1 || support.length >= 2;
  const score = relevant
    ? Math.min(1, 0.55 + 0.12 * strong.length + 0.05 * support.length)
    : Math.min(0.45, 0.1 * (strong.length * 2 + support.length));
  const reasons = relevant
    ? [
        `Знайдено ознаки енергетичної категорії: ${[...new Set([...strong, ...support])].slice(0, 6).join(', ')}.`,
        'AI-зір вимкнено — фото перевіряє менеджер перед публікацією.',
      ]
    : [
        'Не знайдено ознак енергетики (EV-зарядки, сонячних панелей, акумуляторів, інверторів тощо).',
        'Дозволені лише товари, повʼязані з енергетикою.',
      ];
  return {
    relevant,
    allowed: true,
    category: relevant ? 'енергетика' : 'unknown',
    score: Number(score.toFixed(2)),
    reasons,
    imageSummary: '',
  };
}

/**
 * Moderate a listing. Uses the Anthropic Messages API (Claude vision + text)
 * when ANTHROPIC_API_KEY is set; otherwise (or on any API/parse failure) falls
 * back to the server-side keyword classifier so on-topic listings still reach
 * the manager for review rather than being blanket-rejected.
 */
async function moderateListing(env: Env, listing: Listing, images: string[]): Promise<ModerationVerdict> {
  const fallback = keywordVerdict(listing);

  if (!env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set — using keyword fallback moderation.');
    return fallback;
  }

  // Build the multimodal user content: text first, then each image block.
  const content: Array<Record<string, unknown>> = [];

  const priceText = listing.price != null ? `${listing.price} ${listing.currency}` : 'не вказана';
  const textPart =
    `Назва: ${listing.title ?? ''}\n` +
    `Опис: ${listing.description ?? '(немає)'}\n` +
    `Ціна: ${priceText}\n` +
    `Кількість фото: ${images.length}`;
  content.push({ type: 'text', text: textPart });

  // Attach up to a sane number of images to keep token cost bounded.
  const MAX_IMAGES = 4;
  for (const dataUrl of images.slice(0, MAX_IMAGES)) {
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) continue;
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: parsed.mediaType,
        data: parsed.base64,
      },
    });
  }

  const system =
    'Ти — суворий модератор маркетплейсу ECOFACTOR, який торгує ВИКЛЮЧНО енергетичними ' +
    'товарами: зарядні станції та кабелі для електромобілів, сонячні панелі та інвертори, ' +
    'акумулятори/батареї, портативні зарядні станції (power station), супутнє енергетичне ' +
    'обладнання. Твоє завдання — вирішити, чи це оголошення (і текст, І те, що реально ' +
    'зображено на фото) є дозволеним до продажу енергетичним товаром, і чи не є воно ' +
    'забороненим (зброя, наркотики, контент для дорослих, підробки тощо). ' +
    'Якщо на фото зображено НЕ енергетичний товар (наприклад одяг, їжа, тварини, авто без ' +
    'зарядного обладнання) — це НЕ релевантно. ' +
    'Відповідай ВИКЛЮЧНО строгим JSON-обʼєктом без жодного іншого тексту, без markdown, ' +
    'без коментарів, у такій схемі: ' +
    '{"relevant": boolean, "allowed": boolean, "category": string, "score": number (0..1), ' +
    '"reasons": string[] (українською), "imageSummary": string (українською, що видно на фото)}.';

  const requestBody = {
    model: MODERATION_MODEL,
    max_tokens: 512,
    system,
    messages: [{ role: 'user', content }],
  };

  let raw: string;
  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      console.error('Anthropic API error:', res.status, await safeText(res));
      return fallback;
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    raw = (data.content ?? [])
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text as string)
      .join('\n')
      .trim();
  } catch (err) {
    console.error('Anthropic API call failed:', err);
    return fallback;
  }

  return parseVerdict(raw, fallback);
}

/** Defensively parse the model's JSON output (strips code fences, etc). */
function parseVerdict(raw: string, fallback: ModerationVerdict): ModerationVerdict {
  if (!raw) return fallback;

  // Strip ```json ... ``` or ``` ... ``` fences.
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) text = fence[1].trim();

  // If there is leading/trailing prose, extract the first {...} block.
  if (!(text.startsWith('{') && text.endsWith('}'))) {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      text = text.slice(first, last + 1);
    }
  }

  try {
    const parsed = JSON.parse(text) as Partial<ModerationVerdict>;
    const score = clamp01(Number(parsed.score));
    return {
      relevant: Boolean(parsed.relevant),
      allowed: Boolean(parsed.allowed),
      category: typeof parsed.category === 'string' ? parsed.category : 'unknown',
      score: Number.isFinite(score) ? score : 0,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      imageSummary: typeof parsed.imageSummary === 'string' ? parsed.imageSummary : '',
    };
  } catch (err) {
    console.error('Failed to parse moderation verdict:', err, 'raw=', raw);
    return fallback;
  }
}

/**
 * Send an approved-for-review listing to the manager chat:
 *   - first photo via sendPhoto + inline Approve/Reject keyboard (buttons here),
 *   - optionally the remaining photos via sendMediaGroup (best-effort).
 * If there are no valid images, fall back to a text message with the keyboard.
 */
async function sendListingToManager(
  env: Env,
  listing: Listing,
  verdict: ModerationVerdict,
  images: string[],
  ctx: ExecutionContext
): Promise<void> {
  const chatId = managerChatId(env);
  const caption = formatListingCaption(listing, verdict);
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Опублікувати', callback_data: `approve:${listing.id}` },
        { text: '❌ Відхилити', callback_data: `reject:${listing.id}` },
      ],
    ],
  };

  const parsedImages = images.map(parseDataUrl).filter((p): p is ParsedDataUrl => p !== null);

  if (parsedImages.length === 0) {
    // No usable image — send a text message with the keyboard.
    await tgSendMessage(env, {
      chat_id: chatId,
      text: caption,
      parse_mode: 'HTML',
      reply_markup: keyboard,
      disable_web_page_preview: true,
    });
    return;
  }

  // First photo carries the caption + inline buttons.
  await tgSendPhoto(env, {
    chatId,
    photo: parsedImages[0],
    caption,
    parseMode: 'HTML',
    replyMarkup: keyboard,
  });

  // Remaining photos as a media group (best-effort, fire-and-forget).
  if (parsedImages.length > 1) {
    const rest = parsedImages.slice(1, 10); // Telegram media group max 10.
    ctx.waitUntil(
      tgSendMediaGroup(env, chatId, rest).catch((err) =>
        console.error('sendMediaGroup failed:', err)
      )
    );
  }
}

/** HTML caption for a listing under review. */
function formatListingCaption(listing: Listing, verdict: ModerationVerdict): string {
  const lines: string[] = [];
  lines.push(`🆕 <b>Нове оголошення на модерацію</b>`);
  lines.push(`<b>${esc(listing.title ?? '')}</b>`);
  if (listing.price != null) lines.push(`💵 Ціна: ${formatMoney(listing.price, listing.currency)}`);
  if (listing.description) lines.push(`📝 ${esc(truncate(listing.description, 400))}`);
  lines.push('');
  lines.push(`🤖 AI-перевірка:`);
  lines.push(`• Категорія: ${esc(verdict.category)}`);
  lines.push(`• Впевненість: ${(verdict.score * 100).toFixed(0)}%`);
  if (verdict.reasons.length) {
    lines.push(`• Причини: ${esc(verdict.reasons.join('; '))}`);
  }
  if (verdict.imageSummary) {
    lines.push(`• На фото: ${esc(truncate(verdict.imageSummary, 200))}`);
  }
  return lines.join('\n');
}

// ----------------------------------------------------------------------------
// 3) GET /listings/:id
// ----------------------------------------------------------------------------

async function handleGetListing(id: string, env: Env): Promise<Response> {
  const stored = await readListing(env, id);
  if (!stored) {
    return json({ id, status: 'unknown' as ListingStatus }, env);
  }
  return json(
    {
      id: stored.id,
      status: stored.status,
      verdict: stored.verdict,
      moderatedAt: stored.moderatedAt,
    },
    env
  );
}

// ----------------------------------------------------------------------------
// 4) POST /telegram/webhook
// ----------------------------------------------------------------------------

async function handleTelegramWebhook(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Verify the request is from Telegram via the secret-token header.
  // (Telegram echoes the `secret_token` set in setWebhook on every update.)
  if (env.WEBHOOK_SECRET) {
    const headerToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (headerToken !== env.WEBHOOK_SECRET) {
      // Reject silently with 200 so Telegram does not retry, but do nothing.
      console.warn('Webhook secret mismatch — ignoring update.');
      return new Response('ok', { status: 200 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new Response('ok', { status: 200 });
  }

  const cb = update.callback_query;
  if (!cb || !cb.data) {
    // Not a callback we handle — ack quickly.
    return new Response('ok', { status: 200 });
  }

  // Process the decision in the background so we can return 200 immediately.
  ctx.waitUntil(processCallback(env, cb).catch((err) => console.error('processCallback failed:', err)));

  return new Response('ok', { status: 200 });
}

/** Apply an Approve/Reject decision from a callback button. */
async function processCallback(env: Env, cb: NonNullable<TelegramUpdate['callback_query']>): Promise<void> {
  const data = cb.data ?? '';
  const m = data.match(/^(approve|reject):(.+)$/);
  if (!m) {
    await tgAnswerCallback(env, cb.id, 'Невідома дія');
    return;
  }

  const action = m[1] as 'approve' | 'reject';
  const id = m[2];

  const stored = await readListing(env, id);
  const newStatus: ListingStatus = action === 'approve' ? 'approved' : 'rejected';
  const moderatedAt = new Date().toISOString();

  if (stored) {
    stored.status = newStatus;
    stored.moderatedAt = moderatedAt;
    await env.ECOFACTOR_KV.put(`listing:${id}`, JSON.stringify(stored));
  } else {
    // Listing not found in KV — still record the decision minimally.
    console.warn(`Callback for unknown listing ${id}; recording minimal record.`);
    await env.ECOFACTOR_KV.put(
      `listing:${id}`,
      JSON.stringify({ id, status: newStatus, moderatedAt })
    );
  }

  // Toast for the manager.
  const toast = action === 'approve' ? 'Опубліковано' : 'Відхилено';
  await tgAnswerCallback(env, cb.id, toast);

  // Update the original message: remove buttons + append the decision badge.
  const msg = cb.message;
  if (msg) {
    const badge =
      action === 'approve'
        ? '\n\n✅ Опубліковано менеджером'
        : '\n\n❌ Відхилено менеджером';

    if (typeof msg.caption === 'string') {
      // Photo message — edit the caption (clears the keyboard too).
      await tgEditMessageCaption(env, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        caption: appendBadge(msg.caption, badge),
        parse_mode: 'HTML',
      });
    } else if (typeof msg.text === 'string') {
      await tgEditMessageText(env, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        text: appendBadge(msg.text, badge),
        parse_mode: 'HTML',
      });
    } else {
      // Just strip the keyboard if we can't edit content.
      await tgEditReplyMarkup(env, { chat_id: msg.chat.id, message_id: msg.message_id });
    }
  }
}

/** Append a decision badge, escaping the original (plain) text safely. */
function appendBadge(original: string, badge: string): string {
  // Original came from Telegram as the rendered text; re-escaping avoids
  // breaking HTML parse mode if it contained reserved characters.
  return esc(original) + badge;
}

// ----------------------------------------------------------------------------
// KV helpers
// ----------------------------------------------------------------------------

async function readListing(env: Env, id: string): Promise<StoredListing | null> {
  const raw = await env.ECOFACTOR_KV.get(`listing:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredListing;
  } catch {
    return null;
  }
}

/** Push an id onto a JSON-array list key, capped to `max` most-recent entries. */
async function pushToIndex(env: Env, key: string, id: string, max: number): Promise<void> {
  const raw = await env.ECOFACTOR_KV.get(key);
  let list: string[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed as string[];
    } catch {
      list = [];
    }
  }
  list.push(id);
  if (list.length > max) list = list.slice(list.length - max);
  await env.ECOFACTOR_KV.put(key, JSON.stringify(list));
}

// ----------------------------------------------------------------------------
// Telegram API helpers
// ----------------------------------------------------------------------------

interface TelegramUpdate {
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      message_id: number;
      chat: { id: number | string };
      text?: string;
      caption?: string;
    };
  };
}

function tgBase(env: Env): string {
  return `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;
}

function managerChatId(env: Env): string {
  return env.TELEGRAM_MANAGER_CHAT_ID || DEFAULT_MANAGER_CHAT_ID;
}

/** sendMessage — returns {ok, response} so callers can decide on failure. */
async function tgSendMessage(
  env: Env,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; response: Response }> {
  const res = await fetch(`${tgBase(env)}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, response: res };
}

/** sendPhoto via multipart/form-data (photo as a Blob from the data URL). */
async function tgSendPhoto(
  env: Env,
  opts: {
    chatId: string;
    photo: ParsedDataUrl;
    caption: string;
    parseMode?: string;
    replyMarkup?: unknown;
  }
): Promise<void> {
  const form = new FormData();
  form.append('chat_id', opts.chatId);
  form.append('caption', opts.caption);
  if (opts.parseMode) form.append('parse_mode', opts.parseMode);
  if (opts.replyMarkup) form.append('reply_markup', JSON.stringify(opts.replyMarkup));

  const blob = base64ToBlob(opts.photo.base64, opts.photo.mediaType);
  form.append('photo', blob, `photo.${extForMedia(opts.photo.mediaType)}`);

  const res = await fetch(`${tgBase(env)}/sendPhoto`, { method: 'POST', body: form });
  if (!res.ok) console.error('sendPhoto failed:', res.status, await safeText(res));
}

/** sendMediaGroup for additional photos (no captions/buttons here). */
async function tgSendMediaGroup(env: Env, chatId: string, photos: ParsedDataUrl[]): Promise<void> {
  if (photos.length === 0) return;

  const form = new FormData();
  form.append('chat_id', chatId);

  const media = photos.map((p, i) => {
    const name = `photo${i}`;
    const blob = base64ToBlob(p.base64, p.mediaType);
    form.append(name, blob, `${name}.${extForMedia(p.mediaType)}`);
    return { type: 'photo', media: `attach://${name}` };
  });
  form.append('media', JSON.stringify(media));

  const res = await fetch(`${tgBase(env)}/sendMediaGroup`, { method: 'POST', body: form });
  if (!res.ok) console.error('sendMediaGroup failed:', res.status, await safeText(res));
}

async function tgAnswerCallback(env: Env, callbackQueryId: string, text: string): Promise<void> {
  await fetch(`${tgBase(env)}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  }).catch((err) => console.error('answerCallbackQuery failed:', err));
}

async function tgEditMessageCaption(env: Env, payload: Record<string, unknown>): Promise<void> {
  await tgEdit(env, 'editMessageCaption', payload);
}

async function tgEditMessageText(env: Env, payload: Record<string, unknown>): Promise<void> {
  await tgEdit(env, 'editMessageText', payload);
}

/** editMessageReplyMarkup with no keyboard → removes the buttons. */
async function tgEditReplyMarkup(env: Env, payload: Record<string, unknown>): Promise<void> {
  await tgEdit(env, 'editMessageReplyMarkup', payload);
}

async function tgEdit(env: Env, methodName: string, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${tgBase(env)}/${methodName}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error(`${methodName} failed:`, res.status, await safeText(res));
}

// ----------------------------------------------------------------------------
// Generic helpers
// ----------------------------------------------------------------------------

interface ParsedDataUrl {
  mediaType: string;
  base64: string;
}

/** Parse a `data:<media>;base64,<data>` URL. Returns null if not base64 data URL. */
function parseDataUrl(input: unknown): ParsedDataUrl | null {
  if (typeof input !== 'string') return null;
  const m = input.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!m) return null;
  const mediaType = m[1] || 'image/jpeg';
  const isBase64 = Boolean(m[2]);
  const data = m[3] ?? '';
  if (!isBase64) return null; // we only handle base64 image payloads
  return { mediaType, base64: data };
}

/** Decode a base64 string into a Blob (Workers runtime has atob + Blob). */
function base64ToBlob(base64: string, mediaType: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mediaType });
}

function extForMedia(mediaType: string): string {
  if (mediaType.includes('png')) return 'png';
  if (mediaType.includes('webp')) return 'webp';
  if (mediaType.includes('gif')) return 'gif';
  return 'jpg';
}

/** HTML-escape for Telegram HTML parse mode. */
function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatMoney(amount: number, currency: string): string {
  const n = Number(amount) || 0;
  // Keep it simple + locale-stable for WebView; group thousands with spaces.
  const formatted = n.toLocaleString('uk-UA', { maximumFractionDigits: 2 });
  return `${formatted} ${currency ?? ''}`.trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '<no body>';
  }
}

// ----------------------------------------------------------------------------
// CORS + JSON response helpers
// ----------------------------------------------------------------------------

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body: unknown, env: Env, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(env),
    },
  });
}
