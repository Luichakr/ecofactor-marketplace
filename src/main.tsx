import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/styles/global.css'
import { App } from './app/App'
import { identify, initAnalytics, setSuperProps } from './shared/lib/analytics/analytics'
import { isInsideWebView, onNativeAuth } from './shared/lib/webview/webviewBridge'
import { getLaunchParams } from './shared/lib/webview/launchParams'

initAnalytics()

// Read the identity/context the host app passed in the opening URL
// (?user_id=…&lang=uk&currency=UAH&phone=…). Persisted for the session.
const launch = getLaunchParams()

setSuperProps({
  app: 'ecofactor-marketplace',
  surface: isInsideWebView() ? 'webview' : 'web',
  ...(launch.lang ? { lang: launch.lang } : {}),
  ...(launch.currency ? { currency: launch.currency } : {}),
})

// Identify by the URL-supplied user id immediately (covers the common
// case where the host opens us with ?user_id=…). Only the stable id goes
// to analytics — never raw phone/email (GDPR; see analytics.ts).
if (launch.userId) {
  identify(launch.userId)
}

// Also honour the postMessage bridge path if the native app prefers it.
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
