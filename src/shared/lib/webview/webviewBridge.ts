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
