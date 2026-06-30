/**
 * Hybrid backend service.
 *
 * If `VITE_API_BASE` is set, orders and listing submissions are POSTed to the
 * Cloudflare Worker (see `worker/`) which holds the Telegram token + Claude API
 * key server-side and runs real AI vision moderation.
 *
 * If it is NOT set (default / GitHub Pages today), everything falls back to a
 * client-side draft: orders ping Telegram directly (token from env, if any) and
 * listings are screened by the local keyword classifier. The verdict shape is
 * identical, so callers don't care which path ran.
 */
import { classifyListing } from '../../../features/listings/lib/moderation'
import type { ListingPromo, ListingStatus, ModerationVerdict } from '../../../features/listings/model/listingsStore'
import { hasTelegram, sendTelegramMessage, sendTelegramPhoto } from '../telegram/notify'

export const API_BASE = ((import.meta.env.VITE_API_BASE as string | undefined) ?? '').replace(/\/+$/, '')
export const hasBackend = Boolean(API_BASE)

/** True when an order/listing can actually reach a human (backend or token). */
export const canNotify = hasBackend || hasTelegram

// ─────────────────────────────────────────── Orders ───────────────────────

export type OrderSubmission = {
  order: {
    id: string
    number: string | number
    createdAt: string
    items: { title: string; qty: number; price: number; currency: string; variant?: string }[]
    total: number
    currency: string
    deliveryType: 'np' | 'home'
    deliveryCity: string
    deliveryBranch?: string
    deliveryAddress?: string
    deliveryPrice: number
  }
  customer: { name: string; phone: string }
  source?: string
}

function money(value: number, currency: string): string {
  const formatted = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(value))
  return `${formatted} ${currency === 'UAH' ? '₴' : currency}`
}

function formatOrderMessage(s: OrderSubmission): string {
  const { order, customer } = s
  const lines = order.items
    .map((it) => `• ${it.title} ×${it.qty} — ${money(it.price * it.qty, it.currency)}`)
    .join('\n')
  const delivery =
    order.deliveryType === 'np'
      ? `Нова Пошта — ${order.deliveryBranch ?? order.deliveryCity}`
      : `Курʼєр — ${order.deliveryCity}${order.deliveryAddress ? `, ${order.deliveryAddress}` : ''}`
  return (
    `🛒 <b>Нове замовлення #${order.number}</b>\n\n${lines}\n\n` +
    `<b>Разом: ${money(order.total, order.currency)}</b>\n` +
    `🚚 ${delivery}\n` +
    `👤 ${customer.name}${customer.phone ? `, ${customer.phone}` : ''}`
  )
}

/** Send an order to the manager (backend or direct Telegram). Never throws. */
export async function submitOrder(s: OrderSubmission): Promise<{ ok: boolean; id: string; telegram: boolean }> {
  if (hasBackend) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; telegram?: boolean }
      return { ok: res.ok && json.ok !== false, id: s.order.id, telegram: json.telegram !== false }
    } catch {
      // Backend unreachable — try the direct Telegram fallback before giving up.
    }
  }
  const telegram = await sendTelegramMessage(formatOrderMessage(s))
  return { ok: true, id: s.order.id, telegram }
}

// ─────────────────────────────────────────── Listings ─────────────────────

export type ListingSubmission = {
  listing: {
    id: string
    title: string
    description?: string
    price?: number
    currency: 'UAH'
    images: string[]
  }
  user?: { name?: string; phone?: string; userId?: string }
  /** Paid promotion bought for this listing, if any (mock). */
  promo?: ListingPromo
}

export type ListingDecision = { id: string; status: ListingStatus; moderation: ModerationVerdict }

function statusFromVerdict(v: ModerationVerdict): ListingStatus {
  return v.allowed && v.relevant && v.score >= 0.5 ? 'pending' : 'rejected'
}

const TIER_LABEL: Record<ListingPromo['tier'], string> = { bump: 'Підняття', top: 'ТОП', vip: 'VIP' }

function promoBlock(p: ListingPromo): string {
  const until = new Date(p.promoExpiresAt).toLocaleDateString('uk-UA')
  return (
    `💸 <b>ПЛАТНЕ ПРОСУВАННЯ</b>\n` +
    `Тариф: <b>${TIER_LABEL[p.tier]}</b> · ${p.durationDays === 0 ? 'разове' : p.durationDays + ' дн.'}\n` +
    `Сплачено: <b>${p.pricePaid} ₴</b> (тест)\n` +
    `Замовлення: <code>#${p.orderId}</code>\n` +
    `Діє до: ${until} (активується після схвалення)\n` +
    `────────────\n`
  )
}

function listingCaption(s: ListingSubmission, v: ModerationVerdict): string {
  const { listing, user } = s
  const price = listing.price != null ? money(listing.price, listing.currency) : 'Ціна за домовленістю'
  return (
    `${s.promo ? promoBlock(s.promo) : ''}` +
    `🆕 <b>Нове оголошення на перевірку</b>\n\n` +
    `<b>${listing.title}</b>\n` +
    `${listing.description ? `${listing.description}\n` : ''}` +
    `💰 ${price}\n` +
    `🤖 AI: ${v.category ?? 'енергетика'} · впевненість ${(v.score * 100).toFixed(0)}%\n` +
    `${v.reasons.map((r) => `• ${r}`).join('\n')}\n` +
    `${user?.name || user?.phone ? `👤 ${user?.name ?? ''} ${user?.phone ?? ''}`.trim() + '\n' : ''}` +
    `\n⚠️ Підтвердіть публікацію вручну.`
  )
}

/**
 * Submit a listing for moderation. Returns the decision (pending/rejected).
 * Backend mode: real AI vision verdict + manager Approve/Reject buttons.
 * Draft mode: local keyword verdict; pending listings are pushed to the
 * manager chat (photo + caption) for manual approval.
 */
export async function submitListing(s: ListingSubmission): Promise<ListingDecision> {
  if (hasBackend) {
    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      if (res.ok) {
        const json = (await res.json()) as { id: string; status: ListingStatus; verdict: ModerationVerdict }
        if (json?.verdict) {
          return { id: s.listing.id, status: json.status, moderation: { ...json.verdict, decidedBy: 'ai' } }
        }
      }
    } catch {
      // fall through to the local classifier
    }
  }

  // Draft / fallback path.
  const verdict = classifyListing({
    title: s.listing.title,
    description: s.listing.description,
    imagesCount: s.listing.images.length,
  })
  const status = statusFromVerdict(verdict)

  if (status === 'pending') {
    const cover = s.listing.images[0]
    const caption = listingCaption(s, verdict)
    if (cover) void sendTelegramPhoto(cover, caption)
    else void sendTelegramMessage(caption)
  }

  return { id: s.listing.id, status, moderation: verdict }
}

/** Poll the backend for a manager's decision. Returns null in draft mode. */
export async function getListingStatus(
  id: string,
): Promise<{ status: ListingStatus; moderation?: ModerationVerdict } | null> {
  if (!hasBackend) return null
  try {
    const res = await fetch(`${API_BASE}/listings/${encodeURIComponent(id)}`)
    if (!res.ok) return null
    const json = (await res.json()) as {
      status: ListingStatus | 'unknown'
      verdict?: ModerationVerdict
      moderatedAt?: string
    }
    if (!json || json.status === 'unknown') return null
    return { status: json.status, moderation: json.verdict }
  } catch {
    return null
  }
}
