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

// When ECOFACTOR native app sends user identity over the bridge, attach it
// to all subsequent PostHog events so a real human = a real profile.
onNativeAuth((payload) => {
  if (payload.userId) {
    identify(payload.userId, { email: payload.email, phone: payload.phone })
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
