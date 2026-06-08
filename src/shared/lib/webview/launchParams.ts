/**
 * Launch parameters — the contract the ECOFACTOR native app uses to hand
 * context to the marketplace WebView via the opening URL query string.
 *
 * Example:
 *   https://<host>/?user_id=42&phone=%2B380501234567&lang=uk&currency=UAH
 *
 * All params are OPTIONAL. The marketplace works fully without them (anon
 * session); they just personalise the experience.
 *
 * Parsed once at boot and cached in sessionStorage so the values survive
 * client-side route changes (the SPA rewrites the URL on navigation).
 */

export type LaunchParams = {
  /** Stable user id from the host app. Used as the analytics identity. */
  userId?: string
  /** E.164 phone, e.g. "+380501234567". Prefilled into request/checkout forms. */
  phone?: string
  /** Email, prefilled where a form asks for it. */
  email?: string
  /** Display name, prefilled into the recipient field. */
  name?: string
  /** UI language code: uk | en | pl | ru. Currently the UI is Ukrainian;
   *  the value is stored for the upcoming i18n switch. */
  lang?: string
  /** Preferred display currency: UAH | USD | EUR | PLN. */
  currency?: string
  /** Opaque auth/session token, forwarded to the backend when one exists. */
  token?: string
}

const STORAGE_KEY = 'mp:launchParams'

// Accept both snake_case (host-app convention) and camelCase aliases.
const ALIASES: Record<keyof LaunchParams, string[]> = {
  userId: ['user_id', 'userId', 'uid'],
  phone: ['phone', 'tel', 'msisdn'],
  email: ['email'],
  name: ['name', 'user_name', 'username'],
  lang: ['lang', 'locale', 'language'],
  currency: ['currency', 'cur'],
  token: ['token', 'access_token', 'auth_token'],
}

function parseFromSearch(search: string): LaunchParams {
  const sp = new URLSearchParams(search)
  const out: LaunchParams = {}
  for (const [key, names] of Object.entries(ALIASES) as [keyof LaunchParams, string[]][]) {
    for (const n of names) {
      const v = sp.get(n)
      if (v != null && v !== '') {
        out[key] = v.trim()
        break
      }
    }
  }
  return out
}

let cached: LaunchParams | null = null

/** Read launch params: first from the current URL, then merged with any
 *  previously-stored set (so a deep refresh that lost the query string
 *  still keeps identity). URL always wins over storage. */
export function getLaunchParams(): LaunchParams {
  if (cached) return cached
  let stored: LaunchParams = {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) stored = JSON.parse(raw) as LaunchParams
  } catch {
    /* sessionStorage disabled */
  }
  const fromUrl = typeof window !== 'undefined' ? parseFromSearch(window.location.search) : {}
  const merged = { ...stored, ...fromUrl }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    /* ignore */
  }
  cached = merged
  return merged
}
