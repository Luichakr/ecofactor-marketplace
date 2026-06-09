/**
 * Launch parameters — the contract the ECOFACTOR native app uses to hand
 * context to the marketplace WebView.
 *
 * PRIMARY (preferred, more secure — not in URL/logs/history): the native
 * shell injects a global object BEFORE the page bundle runs, e.g. via a
 * WKUserScript at .atDocumentStart / Android evaluateJavascript on
 * navigationStart:
 *
 *   window.ECOFACTOR_MARKET = {
 *     userId: '42',
 *     phone: '+380501234567',
 *     email: 'user@mail.com',
 *     name: 'Олексій',
 *     lang: 'uk',
 *     currency: 'UAH',
 *     token: '…',
 *   }
 *
 * FALLBACK: the same fields may also arrive as URL query params
 *   https://<host>/?user_id=42&phone=%2B380501234567&lang=uk
 *
 * Resolution order (highest wins): window global → URL → previously stored.
 * All fields are OPTIONAL — the marketplace works anonymously without them.
 * Cached in sessionStorage so values survive SPA route changes.
 */

declare global {
  interface Window {
    /** Injected by the native host before the bundle loads. snake_case or
     *  camelCase keys both accepted (see ALIASES). */
    ECOFACTOR_MARKET?: Record<string, unknown>
  }
}

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

/** Read from the native-injected `window.ECOFACTOR_MARKET` global, mapping
 *  alias keys and coercing everything to trimmed strings. */
function parseFromGlobal(): LaunchParams {
  if (typeof window === 'undefined' || !window.ECOFACTOR_MARKET) return {}
  const src = window.ECOFACTOR_MARKET
  const out: LaunchParams = {}
  for (const [key, names] of Object.entries(ALIASES) as [keyof LaunchParams, string[]][]) {
    for (const n of names) {
      const v = src[n]
      if (v != null && v !== '') {
        out[key] = String(v).trim()
        break
      }
    }
  }
  return out
}

let cached: LaunchParams | null = null

/** Resolve launch params. Priority (highest first):
 *  window global → URL query → previously stored (sessionStorage). */
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
  const fromGlobal = parseFromGlobal()
  const merged = { ...stored, ...fromUrl, ...fromGlobal }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    /* ignore */
  }
  cached = merged
  return merged
}
