import type { WebViewEvent } from './webviewTypes'

export function isInsideWebView(): boolean {
  return (
    Boolean(window.webkit?.messageHandlers?.ecofactorBridge) ||
    Boolean(window.ecofactorAndroid)
  )
}

export function sendWebViewEvent(event: WebViewEvent): void {
  if (!isInsideWebView()) return

  // iOS WKWebView
  if (window.webkit?.messageHandlers?.ecofactorBridge) {
    window.webkit.messageHandlers.ecofactorBridge.postMessage(event)
    return
  }

  // Android WebView
  if (window.ecofactorAndroid) {
    window.ecofactorAndroid.postMessage(JSON.stringify(event))
  }
}

type NativeAuthPayload = { userId?: string; email?: string; phone?: string }

/**
 * Listen for the ECOFACTOR native app sending the logged-in user's identity
 * over the WebView bridge. Native side fires {type:'native:auth_token', payload}.
 * Returns an unsubscribe function.
 */
export function onNativeAuth(callback: (payload: NativeAuthPayload) => void): () => void {
  function handler(e: MessageEvent) {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      if (data?.type === 'native:auth_token' && data?.payload) {
        callback(data.payload as NativeAuthPayload)
      }
    } catch {
      // ignore
    }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}

/**
 * The URL the native shell watches for to close the marketplace WebView.
 * Navigating the page here is the agreed "return to app" signal — the
 * native side intercepts the request, cancels it, and dismisses the view.
 * Overridable via VITE_RETURN_URL for staging.
 */
export const RETURN_URL =
  (import.meta.env.VITE_RETURN_URL as string | undefined) ??
  'https://network.ecofactor.eu/market-place/close'

/**
 * Closes the marketplace and returns the user to the host app. Also fires
 * a bridge event first (in case the native side prefers postMessage), then
 * navigates to RETURN_URL as the canonical signal.
 */
export function closeMarketplace(): void {
  sendWebViewEvent({ type: 'marketplace:close' })
  window.location.href = RETURN_URL
}

export function onNativeBack(callback: () => void): () => void {
  // Android hardware back button via postMessage from native side
  function handler(e: MessageEvent) {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      if (data?.type === 'native:back') {
        callback()
      }
    } catch {
      // ignore
    }
  }

  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
