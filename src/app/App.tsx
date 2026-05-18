import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './AppRouter'
import { ThemeProvider } from '../shared/lib/theme/ThemeContext'

// Vite sets import.meta.env.BASE_URL based on the build-time `base` config.
// On GitHub Pages we serve from `/ecofactor-marketplace/`, so the router
// must know that prefix. In dev it falls back to `/`.
const ROUTER_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={ROUTER_BASE || '/'}>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}
