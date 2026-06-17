import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useInactivityAutoScroll } from '../../shared/lib/hooks/useInactivityAutoScroll'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Header } from '../../shared/ui/Header/Header'
import { PlaceholderImage } from '../../shared/ui/PlaceholderImage/PlaceholderImage'
import { NewsletterSheet } from '../../features/newsletter/ui/NewsletterSheet/NewsletterSheet'
import { SearchIconButton } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { ROUTES } from '../../shared/config/routes'
import { SECTION_TABS, SECTIONS } from './menuData'
import './MenuPage.css'

export function MenuPage() {
  const navigate = useNavigate()
  const { section: sectionParam } = useParams<{ section?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  // Single-section mode: reached as /menu/:section (e.g. from a home tile).
  // Shows just that section with a back button instead of the tab switcher;
  // back returns to wherever the user came from (breadcrumb-like).
  const singleSection = !!(sectionParam && SECTIONS[sectionParam])

  // Tab selection persists in the URL (?tab=...) so the menu remembers
  // where the user was when they come back from a catalog page or refresh.
  const tabFromUrl = searchParams.get('tab') ?? 'charging'
  const initialTab = SECTION_TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'charging'
  const [tabState, setTabState] = useState<string>(initialTab)
  const activeTab = singleSection ? (sectionParam as string) : tabState
  const [visualRow, setVisualRow] = useState<HTMLElement | null>(null)
  const [newsletterOpen, setNewsletterOpen] = useState(false)

  function setActiveTab(id: string) {
    setTabState(id)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', id)
        return next
      },
      { replace: true },
    )
  }

  const section = useMemo(() => SECTIONS[activeTab] ?? SECTIONS.charging, [activeTab])
  const sectionLabel = SECTION_TABS.find((t) => t.id === activeTab)?.label ?? 'МЕНЮ'

  useInactivityAutoScroll({
    scroller: visualRow,
    slideSelector: '.menu-page__visual-card',
    axis: 'x',
    inactivityMs: 60_000,
    advanceMs: 3_000,
  })

  function go(href?: string) {
    if (!href) return
    navigate(href)
  }

  return (
    <>
      {singleSection && (
        <Header title={sectionLabel} showBack backFallback={ROUTES.MARKETPLACE} rightSlot={<SearchIconButton />} />
      )}
      <ScreenContainer withTopInset={!singleSection} className="menu-page">
        {!singleSection && (
          <header className="menu-page__tabs">
            <div className="menu-page__tabs-scroll">
              {SECTION_TABS.map((t) => (
                <button
                  key={t.id}
                  className={`menu-page__tab ${activeTab === t.id ? 'menu-page__tab--active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <SearchIconButton className="menu-page__search" />
          </header>
        )}

      <section key={activeTab} className="menu-page__visual-row" ref={setVisualRow}>
        {section.visual.map((c) => (
          <button
            key={c.id}
            className="menu-page__visual-card"
            onClick={() => go(c.href)}
            disabled={!c.href}
            type="button"
          >
            {c.image ? (
              <span className="menu-page__visual-card-image">
                <img src={c.image} alt={c.caption} />
              </span>
            ) : (
              <PlaceholderImage caption={c.caption} size={c.size ?? '720 × 960'} aspectRatio="3 / 4" />
            )}
            <span className="menu-page__visual-card-label">{c.caption}</span>
          </button>
        ))}
      </section>

      <nav className="menu-page__groups">
        {section.groups.map((g) => (
          <div key={g.num} className="menu-page__group">
            <div className="menu-page__group-num">
              <span className="menu-page__group-num-text">|{g.num}|</span>
              {g.title && <span className="menu-page__group-title">{g.title}</span>}
            </div>
            <ul className="menu-page__group-items">
              {g.items.map((it, i) => (
                <li key={i}>
                  <button
                    className={`menu-page__group-item ${it.bold ? 'menu-page__group-item--bold' : ''}`}
                    onClick={() => go(it.href)}
                    disabled={!it.href}
                    type="button"
                  >
                    <span className="menu-page__group-item-label">{it.label}</span>
                    {it.tag && <span className="menu-page__group-item-tag">{it.tag}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <footer className="menu-page__footer">
        <button type="button" className="menu-page__newsletter" onClick={() => setNewsletterOpen(true)}>
          ПІДПИШІТЬСЯ НА НАШУ РОЗСИЛКУ
        </button>
        <p className="menu-page__footer-links">
          <span>PRIVACY POLICY</span>
          <span aria-hidden="true">/</span>
          <span>TERMS OF USE</span>
        </p>
      </footer>

        <NewsletterSheet open={newsletterOpen} onClose={() => setNewsletterOpen(false)} />
      </ScreenContainer>
    </>
  )
}
