import type { Listing, ListingPromo, PromoTier } from '../../listings/model/listingsStore'

/**
 * Paid promotion plans. Flat one-time mock fee (OLX/Craigslist model — no PPC).
 * Prices anchored to real Ukrainian marketplace pricing (bump ~50, top-7d ~59,
 * turbo ~100+). Middle tier is the default / "popular" choice.
 */
export type PromoPlan = {
  tier: PromoTier
  name: string
  /** Duration in days (0 = one-shot bump). */
  days: number
  /** Mock price, UAH. */
  price: number
  /** Badge rendered on the card while active ('top' | 'vip'); bump has none. */
  badge: 'top' | 'vip' | null
  /** Copy-only "more views" multiplier (not a real metric). */
  multiplier: string | null
  /** One-line benefit description (Ukrainian). */
  blurb: string
  /** Highlight as the recommended choice. */
  popular: boolean
}

export const PROMO_PLANS: PromoPlan[] = [
  {
    tier: 'bump',
    name: 'Підняття',
    days: 0,
    price: 49,
    badge: null,
    multiplier: null,
    blurb: 'Оновлює дату — оголошення стрибає на верх стрічки серед свіжих.',
    popular: false,
  },
  {
    tier: 'top',
    name: 'ТОП на 7 днів',
    days: 7,
    price: 149,
    badge: 'top',
    multiplier: '×16',
    blurb: 'Зелений бейдж ТОП + закріплення над звичайними оголошеннями 7 днів.',
    popular: true,
  },
  {
    tier: 'vip',
    name: 'VIP на 30 днів',
    days: 30,
    price: 399,
    badge: 'vip',
    multiplier: '×30',
    blurb: 'Золотий бейдж VIP + блок на головній і абсолютний верх — 30 днів.',
    popular: false,
  },
]

export function planByTier(tier: PromoTier): PromoPlan {
  return PROMO_PLANS.find((p) => p.tier === tier) ?? PROMO_PLANS[1]
}

export function formatUAH(value: number): string {
  return `${new Intl.NumberFormat('uk-UA').format(value)} ₴`
}

/** Mock receipt id, e.g. "A4F29". */
export function makeOrderId(): string {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)]
  return s
}

/** Build a fresh promo record from a plan at payment time. */
export function makePromo(plan: PromoPlan): ListingPromo {
  const now = Date.now()
  // A bump has no window in the OLX sense; give it ~2 days for ordering.
  const windowDays = plan.days === 0 ? 2 : plan.days
  return {
    tier: plan.tier,
    durationDays: plan.days,
    pricePaid: plan.price,
    orderId: makeOrderId(),
    purchasedAt: new Date(now).toISOString(),
    promoExpiresAt: new Date(now + windowDays * 24 * 60 * 60 * 1000).toISOString(),
    promoStatus: 'paid',
  }
}

function notExpired(p: ListingPromo): boolean {
  return new Date(p.promoExpiresAt).getTime() > Date.now()
}

/** Promo is purchased but waiting for moderation approval. */
export function isPromoPending(l: Listing): boolean {
  return !!l.promo && l.promo.promoStatus === 'paid' && notExpired(l.promo)
}

/** Promo is live (approved + within window). */
export function isPromoActive(l: Listing): boolean {
  return !!l.promo && l.promo.promoStatus === 'active' && notExpired(l.promo)
}

/** Badge to show on the card right now ('top' | 'vip'), or null. */
export function activeBadge(l: Listing): 'top' | 'vip' | null {
  if (!isPromoActive(l) || !l.promo) return null
  return l.promo.tier === 'vip' ? 'vip' : l.promo.tier === 'top' ? 'top' : null
}

export function promoDaysLeft(p: ListingPromo): number {
  const ms = new Date(p.promoExpiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

/** Sort for the owner's list: live promos first (VIP > ТОП), then by recency. */
export function sortByPromo(list: Listing[]): Listing[] {
  const rank = (l: Listing): number => {
    if (isPromoActive(l)) return l.promo!.tier === 'vip' ? 0 : l.promo!.tier === 'top' ? 1 : 2
    return 3
  }
  return [...list].sort((a, b) => {
    const r = rank(a) - rank(b)
    if (r !== 0) return r
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
