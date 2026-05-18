export type WebViewEventType =
  | 'marketplace:ready'
  | 'marketplace:navigate'
  | 'marketplace:request_created'
  | 'marketplace:product_viewed'
  | 'native:back'
  | 'native:auth_token'

export type WebViewEvent = {
  type: WebViewEventType
  payload?: Record<string, unknown>
}

// Injected by native iOS/Android app
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        ecofactorBridge?: {
          postMessage: (event: WebViewEvent) => void
        }
      }
    }
    ecofactorAndroid?: {
      postMessage: (eventJson: string) => void
    }
  }
}
