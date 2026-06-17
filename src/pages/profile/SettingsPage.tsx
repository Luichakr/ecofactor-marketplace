import { useEffect } from 'react'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { ROUTES } from '../../shared/config/routes'
import { profile, useSettings } from '../../features/profile/model/profileStore'
import { useTheme } from '../../shared/lib/theme/ThemeContext'
import './SimpleProfileList.css'
import './SettingsPage.css'

export function SettingsPage() {
  const settings = useSettings()
  const { setTheme } = useTheme()

  // Sync the theme from settings store on mount and whenever it changes.
  useEffect(() => {
    if (settings.theme === 'auto') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(dark ? 'dark' : 'light')
    } else {
      setTheme(settings.theme)
    }
  }, [settings.theme, setTheme])

  // Wipe browsing-history keys, then reload so the in-memory stores reset.
  function clearHistory() {
    if (!window.confirm('Видалити історію переглядів і нещодавні пошуки?')) return
    try {
      localStorage.removeItem('mp:viewedProducts')
      localStorage.removeItem('mp:recentSearches')
    } catch { /* storage disabled */ }
    window.location.reload()
  }

  // "Delete my data" — clears every marketplace-owned key (orders, cart,
  // favorites, addresses, cards, leads, chat, avatar, etc). No server-side
  // account exists yet, so this is a full local reset.
  function clearAllData() {
    if (!window.confirm('Видалити всі ваші локальні дані? Замовлення, кошик, закладки та збережені дані буде стерто. Цю дію не можна скасувати.')) return
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && (k.startsWith('mp:') || k.startsWith('ecofactor-'))) keys.push(k)
      }
      keys.forEach((k) => localStorage.removeItem(k))
    } catch { /* storage disabled */ }
    window.location.href = ROUTES.MARKETPLACE
    window.location.reload()
  }

  return (
    <>
      <Header title="НАЛАШТУВАННЯ" showBack backFallback={ROUTES.PROFILE} />
      <ScreenContainer withTopInset={false}>
        <div className="settings-page">
          <Group title="ТЕМА">
            <Segment
              value={settings.theme}
              options={[
                { value: 'auto', label: 'АВТО' },
                { value: 'light', label: 'СВІТЛА' },
                { value: 'dark', label: 'ТЕМНА' },
              ]}
              onChange={(v) => profile.setSettings({ theme: v as 'auto' | 'light' | 'dark' })}
            />
          </Group>

          <Group title="ОДИНИЦІ ВИМІРУ">
            <Segment
              value={settings.units}
              options={[
                { value: 'metric', label: 'МЕТРИЧНІ' },
                { value: 'imperial', label: 'ІМПЕРСЬКІ' },
              ]}
              onChange={(v) => profile.setSettings({ units: v as 'metric' | 'imperial' })}
            />
            <p className="settings-page__hint">
              {settings.units === 'metric' ? 'км, кг, °C' : 'милі, фунти, °F'}
            </p>
          </Group>

          <Group title="СПОВІЩЕННЯ">
            <Toggle
              label="Email"
              value={settings.notifyEmail}
              onChange={(v) => profile.setSettings({ notifyEmail: v })}
            />
            <Toggle
              label="Push"
              value={settings.notifyPush}
              onChange={(v) => profile.setSettings({ notifyPush: v })}
            />
            <Toggle
              label="SMS"
              value={settings.notifySms}
              onChange={(v) => profile.setSettings({ notifySms: v })}
            />
          </Group>

          <Group title="ПРИВАТНІСТЬ">
            <button type="button" className="settings-page__link" onClick={clearHistory}>
              Видалити історію переглядів
            </button>
            <button type="button" className="settings-page__link" onClick={clearAllData}>
              Видалити мої дані
            </button>
          </Group>

          <p className="settings-page__version">ECOFACTOR Marketplace · v0.4</p>
        </div>
      </ScreenContainer>
    </>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="settings-page__group">
      <h2 className="settings-page__group-title">{title}</h2>
      <div className="settings-page__group-body">{children}</div>
    </section>
  )
}

function Segment({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="settings-page__segment">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`settings-page__seg ${value === o.value ? 'settings-page__seg--active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="settings-page__toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="settings-page__toggle-cb"
      />
    </label>
  )
}
