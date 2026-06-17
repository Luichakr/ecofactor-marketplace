import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { profile, useSettings } from '../../../features/profile/model/profileStore'

type Theme = 'dark' | 'light'
type ThemeMode = 'auto' | 'light' | 'dark'

interface ThemeContextValue {
  /** Resolved theme actually applied ('dark' | 'light'). */
  theme: Theme
  /** User preference, including 'auto' (follow the phone). */
  mode: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  mode: 'auto',
  setTheme: () => {},
  toggleTheme: () => {},
})

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/**
 * Drives the app theme from the user's preference in the profile store:
 *   • 'auto'  → follow the phone's colour scheme (prefers-color-scheme) and
 *               live-update if the OS theme flips while the app is open.
 *   • 'light' / 'dark' → explicit override.
 * The <html data-theme> is also seeded by an inline script in index.html so
 * the very first paint is already in the right theme (no flash).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const settings = useSettings()
  const mode = settings.theme as ThemeMode
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const theme: Theme = mode === 'auto' ? (systemDark ? 'dark' : 'light') : mode

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (next: ThemeMode) => profile.setSettings({ theme: next })
  const toggleTheme = () => profile.setSettings({ theme: theme === 'dark' ? 'light' : 'dark' })

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
