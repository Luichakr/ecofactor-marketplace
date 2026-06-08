/**
 * fetch() with a hard timeout. Plain fetch never rejects on a stalled
 * socket — the promise just hangs until the browser's default socket
 * timeout (minutes on mobile/WebView), which leaves loading spinners
 * spinning forever. This wraps fetch in an AbortController so a slow
 * server fails fast and the caller's catch/fallback runs.
 *
 * Default 12s — generous enough for a cold WordPress/Azure response on
 * 3G, short enough that the user isn't staring at a dead spinner.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 12000,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
