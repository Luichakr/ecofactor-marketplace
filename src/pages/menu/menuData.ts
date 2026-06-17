import evChargingMenu from '../../assets/menu/ev-charging.webp'
import solarMenu from '../../assets/menu/solar.webp'
import { catalogCategoryPath, REQUEST_PATHS } from '../../shared/config/routes'

export type SectionTab = {
  id: string
  label: string
}

// Тabs shown above the showcase. 'wheels' (Колеса) removed — not sold yet.
export const SECTION_TABS: SectionTab[] = [
  { id: 'charging', label: 'ЗАРЯДКИ' },
  { id: 'solar', label: 'СОНЦЕ' },
  { id: 'about', label: 'ПРО НАС' },
]

export type VisualCard = {
  id: string
  caption: string
  image?: string
  /** Material Symbols glyph — rendered as an icon tile when there's no image. */
  icon?: string
  size?: string
  href?: string
}

export type GroupItem = {
  label: string
  href?: string
  bold?: boolean
  tag?: string
}

export type Group = {
  num: string
  title?: string
  items: GroupItem[]
}

export type Section = {
  visual: VisualCard[]
  groups: Group[]
}

const evCat = catalogCategoryPath('ev-charging')
const solarCat = catalogCategoryPath('solar')

export const SECTIONS: Record<string, Section> = {
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
          { label: 'Стаціонарні', tag: 'SOON' },
          { label: 'Мобільні зарядки', href: `${evCat}?sub=mobile-charging-stations` },
        ],
      },
      {
        num: '02',
        title: 'КАБЕЛІ',
        items: [
          { label: 'Усі кабелі', href: `${evCat}?sub=cables`, bold: true },
          { label: 'Type 2', tag: 'SOON' },
          { label: 'CCS / CHAdeMO', tag: 'SOON' },
        ],
      },
      {
        num: '03',
        title: 'АКСЕСУАРИ',
        items: [
          { label: 'Усі аксесуари', href: `${evCat}?sub=accessories`, bold: true },
          { label: 'Адаптери', tag: 'SOON' },
          { label: 'Кріплення', tag: 'SOON' },
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
          { label: 'Монокристалічні', tag: 'SOON' },
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
          { label: 'LiFePO4', tag: 'SOON' },
        ],
      },
      {
        num: '04',
        title: 'КОМПЛЕКТУЮЧІ',
        items: [
          { label: 'Усі', href: `${solarCat}?sub=komplektuiuchi`, bold: true },
          { label: 'Кабелі та конектори', tag: 'SOON' },
          { label: 'Кріплення', tag: 'SOON' },
        ],
      },
    ],
  },

  about: {
    visual: [
      { id: 'about-company', caption: 'КОМПАНІЯ', icon: 'apartment' },
      { id: 'about-warranty', caption: 'ГАРАНТІЯ', icon: 'verified_user' },
      { id: 'about-delivery', caption: 'ДОСТАВКА', icon: 'local_shipping' },
      { id: 'about-contacts', caption: 'КОНТАКТИ', icon: 'call' },
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
