import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './AppRouter'
import { ThemeProvider } from '../shared/lib/theme/ThemeContext'

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}
