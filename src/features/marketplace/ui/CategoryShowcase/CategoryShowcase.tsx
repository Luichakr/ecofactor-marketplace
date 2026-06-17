import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import { SECTION_TABS, SECTIONS } from '../../../../pages/menu/menuData'
import '../../../../pages/menu/MenuPage.css'
import './CategoryShowcase.css'

/**
 * Tabbed category showcase shown at the top of the home screen — the same
 * tabs + visual tiles as the /menu page (Зарядки / Сонце / Про нас), brought
 * up front so categories are the first thing the user sees. Reuses the
 * menu-page styles; only the tabs + visual row (no long group lists).
 */
export function CategoryShowcase() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>(SECTION_TABS[0].id)
  const section = useMemo(() => SECTIONS[activeTab] ?? SECTIONS.charging, [activeTab])

  return (
    <div className="category-showcase">
      <header className="menu-page__tabs category-showcase__tabs">
        <div className="menu-page__tabs-scroll">
          {SECTION_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`menu-page__tab ${activeTab === t.id ? 'menu-page__tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <section key={activeTab} className="menu-page__visual-row category-showcase__row">
        {section.visual.map((c) => (
          <button
            key={c.id}
            type="button"
            className="menu-page__visual-card"
            onClick={() => c.href && navigate(c.href)}
            disabled={!c.href}
          >
            {c.image ? (
              <span className="menu-page__visual-card-image">
                <img src={c.image} alt={c.caption} />
              </span>
            ) : (
              <PlaceholderImage caption={c.caption} size={c.size ?? '720 × 960'} aspectRatio="1 / 1" />
            )}
            <span className="menu-page__visual-card-label">{c.caption}</span>
          </button>
        ))}
      </section>
    </div>
  )
}
