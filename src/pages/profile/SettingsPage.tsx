import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { ROUTES } from '../../shared/config/routes'
import { profile, useSettings } from '../../features/profile/model/profileStore'
import { useTheme } from '../../shared/lib/theme/ThemeContext'
import './SimpleProfileList.css'
import './SettingsPage.css'

export function SettingsPage() {
  const navigate = useNavigate()
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

  return (
    <>
      <Header title="НАЛАШТУВАННЯ" showBack onBack={() => navigate(ROUTES.PROFILE)} />
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
            <button type="button" className="settings-page__link">Видалити історію переглядів</button>
            <button type="button" className="settings-page__link">Видалити обліковий запис</button>
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
