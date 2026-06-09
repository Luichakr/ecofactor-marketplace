/**
 * Single source of truth for ECOFACTOR contact details surfaced in the UI
 * (call buttons, support, etc). Override the sales phone per environment
 * via VITE_SALES_PHONE without touching components.
 *
 * Replace the placeholder below with the real public sales line before
 * production traffic.
 */

/** E.164 sales phone used by "Подзвонити" CTAs. */
export const SALES_PHONE =
  (import.meta.env.VITE_SALES_PHONE as string | undefined) ?? '+380443334455'

/** `tel:` href form. */
export const SALES_PHONE_TEL = `tel:${SALES_PHONE.replace(/\s/g, '')}`
