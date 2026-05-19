import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useInactivityAutoScroll } from '../../shared/lib/hooks/useInactivityAutoScroll'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { PlaceholderImage } from '../../shared/ui/PlaceholderImage/PlaceholderImage'
import { NewsletterSheet } from '../../features/newsletter/ui/NewsletterSheet/NewsletterSheet'
import { SearchIconButton } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import evChargingMenu from '../../assets/menu/ev-charging.webp'
import solarMenu from '../../assets/menu/solar.webp'
import { catalogCategoryPath, REQUEST_PATHS } from '../../shared/config/routes'
import './MenuPage.css'

type SectionTab = {
  id: string
  label: string
}

const SECTION_TABS: SectionTab[] = [
  { id: 'charging', label: 'ЗАРЯДКИ' },
  { id: 'solar', label: 'СОНЦЕ' },
  { id: 'auto', label: 'АВТО' },
  { id: 'wheels', label: 'КОЛЕСА' },
  { id: 'about', label: 'ПРО НАС' },
]

type VisualCard = {
  id: string
  caption: string
  image?: string
  size?: string
  href?: string
}

type GroupItem = {
  label: string
  href?: string
  bold?: boolean
  tag?: string
}

type Group = {
  num: string
  title?: string
  items: GroupItem[]
}

type Section = {
  visual: VisualCard[]
  groups: Group[]
}

const evCat = catalogCategoryPath('ev-charging')
const solarCat = catalogCategoryPath('solar')

const SECTIONS: Record<string, Section> = {
  charging: {
    visual: [
      { id: 'ev-all', caption: 'EV-ЗАРЯДКА', image: evChargingMenu, href: evCat },
      { id: 'ev-mobile', caption: 'МОБІЛЬНІ', size: '720 × 960', href: `${evCat}?sub=mobile-charging-stations` },
      { id: 'ev-cables', caption: 'КАБЕЛІ', size: '720 × 960', href: `${evCat}?sub=cables` },
      { id: 'ev-acc', caption: 'АКСЕСУАРИ', size: '720 × 960', href: `${evCat}?sub=accessories` },
    ],
    groups: [
      {
        num: '01',
        title: 'ЗАРЯДНІ СТАНЦІЇ',
        items: [
          { label: 'Усі станції', href: evCat, bold: true },
          { label: 'Стаціонарні', href: `${evCat}?sub=stationary` },
          { label: 'Мобільні зарядки', href: `${evCat}?sub=mobile-charging-stations` },
        ],
      },
      {
        num: '02',
        title: 'КАБЕЛІ',
        items: [
          { label: 'Усі кабелі', href: `${evCat}?sub=cables`, bold: true },
          { label: 'Type 2', href: `${evCat}?sub=cables&type=type2` },
          { label: 'CCS / CHAdeMO', tag: 'SOON' },
        ],
      },
      {
        num: '03',
        title: 'АКСЕСУАРИ',
        items: [
          { label: 'Усі аксесуари', href: `${evCat}?sub=accessories`, bold: true },
          { label: 'Адаптери', href: `${evCat}?sub=accessories&type=adapters` },
          { label: 'Кріплення', href: `${evCat}?sub=accessories&type=mounts` },
        ],
      },
    ],
  },

  solar: {
    visual: [
      { id: 'solar-all', caption: 'СОНЯЧНА СТАНЦІЯ', image: solarMenu, href: solarCat },
      { id: 'solar-panels', caption: 'ПАНЕЛІ', size: '720 × 960', href: `${solarCat}?sub=solar-panels` },
      { id: 'solar-inv', caption: 'ІНВЕРТОРИ', size: '720 × 960', href: `${solarCat}?sub=hybrid-inverters` },
      { id: 'solar-bat', caption: 'АКУМУЛЯТОРИ', size: '720 × 960', href: `${solarCat}?sub=accumulator-batteries` },
    ],
    groups: [
      {
        num: '01',
        title: 'СОНЯЧНІ ПАНЕЛІ',
        items: [
          { label: 'Усі панелі', href: `${solarCat}?sub=solar-panels`, bold: true },
          { label: 'Монокристалічні', href: `${solarCat}?sub=solar-panels&type=mono` },
          { label: 'Полікристалічні', tag: 'SOON' },
        ],
      },
      {
        num: '02',
        title: 'ІНВЕРТОРИ',
        items: [
          { label: 'Гібридні', href: `${solarCat}?sub=hybrid-inverters`, bold: true },
          { label: 'Мережеві', tag: 'SOON' },
          { label: 'Автономні', tag: 'SOON' },
        ],
      },
      {
        num: '03',
        title: 'АКУМУЛЯТОРИ',
        items: [
          { label: 'Усі АКБ', href: `${solarCat}?sub=accumulator-batteries`, bold: true },
          { label: 'LiFePO4', href: `${solarCat}?sub=accumulator-batteries&type=lifepo4` },
        ],
      },
      {
        num: '04',
        title: 'КОМПЛЕКТУЮЧІ',
        items: [
          { label: 'Усі', href: `${solarCat}?sub=komplektuiuchi`, bold: true },
          { label: 'Кабелі та конектори', href: `${solarCat}?sub=komplektuiuchi&type=cables` },
          { label: 'Кріплення', href: `${solarCat}?sub=komplektuiuchi&type=mounts` },
        ],
      },
    ],
  },

  auto: {
    visual: [
      { id: 'auto-stock', caption: 'У НАЯВНОСТІ', size: '720 × 960', href: catalogCategoryPath('cars') },
      { id: 'auto-ev', caption: 'ЕЛЕКТРОМОБІЛІ', size: '720 × 960', href: `${catalogCategoryPath('cars')}?subcategory=cars-electric` },
      { id: 'auto-hybrid', caption: 'ГІБРИДИ', size: '720 × 960', href: `${catalogCategoryPath('cars')}?subcategory=cars-hybrid` },
      { id: 'auto-order', caption: 'ПІД ЗАМОВЛЕННЯ', size: '720 × 960' },
    ],
    groups: [
      {
        num: '01',
        title: 'АВТО',
        items: [
          { label: 'Усі авто в наявності', href: catalogCategoryPath('cars'), bold: true },
          { label: 'Електромобілі', href: `${catalogCategoryPath('cars')}?subcategory=cars-electric` },
          { label: 'Гібриди', href: `${catalogCategoryPath('cars')}?subcategory=cars-hybrid` },
          { label: 'Під замовлення', tag: 'SOON' },
        ],
      },
      {
        num: '02',
        title: 'СЕРВІС',
        items: [
          { label: 'Запис на автосервіс', href: REQUEST_PATHS.AUTOSERVICE, bold: true },
          { label: 'Замовити дзвінок', href: REQUEST_PATHS.CALLBACK },
        ],
      },
    ],
  },

  wheels: {
    visual: [
      { id: 'wheels-tires', caption: 'ШИНИ', size: '720 × 960', href: `${catalogCategoryPath('wheels')}?sub=tires` },
      { id: 'wheels-disks', caption: 'ДИСКИ', size: '720 × 960' },
      { id: 'wheels-mount', caption: 'КРІПЛЕННЯ', size: '720 × 960' },
      { id: 'wheels-hw', caption: 'КРІПИЛЬНІ', size: '720 × 960' },
    ],
    groups: [
      {
        num: '01',
        title: 'ШИНИ',
        items: [
          { label: 'Усі шини',    href: `${catalogCategoryPath('wheels')}?sub=tires`, bold: true },
          { label: 'Літні',       href: `${catalogCategoryPath('wheels')}?sub=tires&season=${encodeURIComponent('Літо')}` },
          { label: 'Зимові',      href: `${catalogCategoryPath('wheels')}?sub=tires&season=${encodeURIComponent('Зима')}` },
          { label: 'Всесезонні',  href: `${catalogCategoryPath('wheels')}?sub=tires&season=${encodeURIComponent('Всесезон')}` },
        ],
      },
      {
        num: '02',
        title: 'ДИСКИ',
        items: [
          { label: 'Усі диски', tag: 'SOON', bold: true },
          { label: 'Литі', tag: 'SOON' },
          { label: 'Ковані', tag: 'SOON' },
          { label: 'Штамповані', tag: 'SOON' },
        ],
      },
      {
        num: '03',
        title: 'КРІПЛЕННЯ',
        items: [
          { label: 'Болти', tag: 'SOON' },
          { label: 'Гайки', tag: 'SOON' },
          { label: 'Проставки', tag: 'SOON' },
          { label: 'Секретки', tag: 'SOON' },
        ],
      },
    ],
  },

  about: {
    visual: [
      { id: 'about-company', caption: 'КОМПАНІЯ', size: '720 × 960' },
      { id: 'about-warranty', caption: 'ГАРАНТІЯ', size: '720 × 960' },
      { id: 'about-delivery', caption: 'ДОСТАВКА', size: '720 × 960' },
      { id: 'about-contacts', caption: 'КОНТАКТИ', size: '720 × 960' },
    ],
    groups: [
      {
        num: '01',
        title: 'КОМПАНІЯ',
        items: [
          { label: 'Про ECOFACTOR', tag: 'SOON', bold: true },
          { label: 'Наша місія', tag: 'SOON' },
          { label: 'Команда', tag: 'SOON' },
        ],
      },
      {
        num: '02',
        title: 'СЕРВІС',
        items: [
          { label: 'Гарантія та повернення', href: REQUEST_PATHS.WARRANTY, bold: true },
          { label: 'Доставка', tag: 'SOON' },
          { label: 'Оплата', tag: 'SOON' },
          { label: 'FAQ', tag: 'SOON' },
        ],
      },
      {
        num: '03',
        title: 'ПІДТРИМКА',
        items: [
          { label: 'Усі заявки', href: REQUEST_PATHS.HUB, bold: true },
          { label: 'Замовити дзвінок', href: REQUEST_PATHS.CALLBACK },
          { label: 'Запит ціни', href: REQUEST_PATHS.QUOTE },
          { label: 'Запропонувати локацію', href: REQUEST_PATHS.LOCATION },
        ],
      },
      {
        num: '04',
        title: 'КОНТАКТИ',
        items: [
          { label: 'Telegram', tag: 'SOON' },
          { label: 'Viber', tag: 'SOON' },
          { label: 'Email', tag: 'SOON' },
        ],
      },
    ],
  },
}

export function MenuPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // Tab selection persists in the URL (?tab=wheels) so the menu remembers
  // where the user was when they come back from a catalog page or refresh.
  const tabFromUrl = searchParams.get('tab') ?? 'charging'
  const initialTab = SECTION_TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'charging'
  const [activeTab, setActiveTabState] = useState<string>(initialTab)
  const [visualRow, setVisualRow] = useState<HTMLElement | null>(null)
  const [newsletterOpen, setNewsletterOpen] = useState(false)

  function setActiveTab(id: string) {
    setActiveTabState(id)
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
    <ScreenContainer withTopInset className="menu-page">
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
  )
}
