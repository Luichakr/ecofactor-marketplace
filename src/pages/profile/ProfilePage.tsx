import type { ReactNode } from 'react'
import { mockUser } from '../../data/mockUser'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { useTheme } from '../../shared/lib/theme/ThemeContext'
import './ProfilePage.css'

const ICONS: Record<string, ReactNode> = {
  requests: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="14" height="18" stroke="currentColor" strokeWidth="1" />
      <path d="M8 8H16M8 12H16M8 16H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  favorites: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20L10.7 18.8C6.4 14.9 3.5 12.4 3.5 9.3C3.5 6.7 5.5 4.7 8.1 4.7C9.6 4.7 11 5.4 12 6.5C13 5.4 14.4 4.7 15.9 4.7C18.5 4.7 20.5 6.7 20.5 9.3C20.5 12.4 17.6 14.9 13.3 18.8L12 20Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.5 5L17 4L17 7.5L20 9L18.5 12L20 15L17 16.5L17 20L13.5 19L12 22L10.5 19L7 20L7 16.5L4 15L5.5 12L4 9L7 7.5L7 4L10.5 5L12 2Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  support: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5H20V17H13L8 21V17H4V5Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 14.5C18.8 15.5 17.2 16 15.5 16C11.4 16 8 12.6 8 8.5C8 6.8 8.5 5.2 9.5 4C5.8 4.7 3 8 3 12C3 16.4 6.6 20 11 20C15 20 18.3 17.2 20 14.5Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1" />
      <path
        d="M12 2V4M12 20V22M22 12H20M4 12H2M19 5L17.5 6.5M6.5 17.5L5 19M19 19L17.5 17.5M6.5 6.5L5 5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  ),
}

const MENU_ITEMS = [
  { key: 'requests', label: 'Мої заявки' },
  { key: 'favorites', label: 'Закладки' },
  { key: 'settings', label: 'Налаштування' },
  { key: 'support', label: 'Підтримка' },
]

export function ProfilePage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <Header title="Профіль" />
      <ScreenContainer withTopInset={false}>
        <div className="profile-page__user">
          <div className="profile-page__avatar">{mockUser.avatarInitials}</div>
          <div className="profile-page__user-info">
            <p className="profile-page__name">{mockUser.name}</p>
            <p className="profile-page__phone">{mockUser.phone}</p>
          </div>
        </div>

        <div className="profile-page__menu">
          {MENU_ITEMS.map((item) => (
            <button key={item.key} className="profile-page__menu-item">
              <span className="profile-page__menu-icon">{ICONS[item.key]}</span>
              <span className="profile-page__menu-label">{item.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}

          <div className="profile-page__menu-item profile-page__menu-item--theme">
            <span className="profile-page__menu-icon">
              {theme === 'dark' ? ICONS.moon : ICONS.sun}
            </span>
            <span className="profile-page__menu-label">
              {theme === 'dark' ? 'Темна тема' : 'Світла тема'}
            </span>
            <label className="profile-page__toggle" aria-label="Переключити тему">
              <input
                type="checkbox"
                checked={theme === 'light'}
                onChange={toggleTheme}
                className="profile-page__toggle-input"
              />
              <span className="profile-page__toggle-track">
                <span className="profile-page__toggle-thumb" />
              </span>
            </label>
          </div>
        </div>

        <div className="profile-page__stage-note">
          <p>Профіль — placeholder для Stage 0</p>
          <p>Авторизація буде у майбутньому stage</p>
        </div>
      </ScreenContainer>
    </>
  )
}
