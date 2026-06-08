import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/styles/global.css'
import { App } from './app/App'
import { identify, initAnalytics, setSuperProps } from './shared/lib/analytics/analytics'
import { isInsideWebView, onNativeAuth } from './shared/lib/webview/webviewBridge'

initAnalytics()
setSuperProps({
  app: 'ecofactor-marketplace',
  surface: isInsideWebView() ? 'webview' : 'web',
})

// When ECOFACTOR native app sends user identity over the bridge, attach the
// stable userId to subsequent PostHog events. We intentionally do NOT send
// raw email/phone as person properties — shipping PII to a US analytics
// vendor without an explicit consent flow is a GDPR risk for public testing.
// Re-add identifiable props behind a consent gate when that's built.
onNativeAuth((payload) => {
  if (payload.userId) {
    identify(payload.userId)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
