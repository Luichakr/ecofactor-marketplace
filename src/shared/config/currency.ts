/**
 * Currency policy. The marketplace is Ukraine-only for now, so every price
 * is displayed in UAH (₴). Some upstream feeds (Lubeavto cars) quote in USD,
 * so we convert to UAH at a fixed reference rate at the adapter boundary —
 * the rest of the app never sees a non-UAH price.
 *
 * The rate is intentionally a constant (no live FX feed): for a demo/test
 * store an exact mid-market rate isn't required, and a stable number keeps
 * prices reproducible. Update here when needed, or wire a feed later.
 */

/** Reference USD→UAH rate. ~Mid-2026 level; adjust as needed. */
export const USD_TO_UAH = 42

/** Convert a USD amount to a rounded UAH amount. */
export function usdToUah(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0
  // Round to the nearest 100 ₴ so converted car prices read as clean
  // figures (e.g. 1 256 000) rather than odd kopeck-level numbers.
  return Math.round((usd * USD_TO_UAH) / 100) * 100
}
