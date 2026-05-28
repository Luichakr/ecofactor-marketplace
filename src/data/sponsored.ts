import { REQUEST_PATHS } from '../shared/config/routes'

export type SponsoredCard = {
  id: string
  /** Two-line headline. */
  title: string
  /** Optional supporting copy. */
  subtitle?: string
  /** What the user lands on. */
  href: string
  /** Source attribution shown bottom-right, e.g. "ecofactor.ua". */
  partner: string
  /** Optional background image (absolute URL or imported asset). */
  image?: string
}

/**
 * In-house sponsored placements shown as "РЕКЛАМА" slots inside the
 * editorial catalog. For the demo these point to our own request flows
 * (custom configurator + autoservice) so the slot is functional, not
 * a stub. Replace with partner CMS entries when real ads come online.
 */
export const SPONSORED_CARDS: SponsoredCard[] = [
  {
    id: 'sp-custom-station',
    title: 'НЕ ЗНАЙШЛИ ПОТРІБНУ СТАНЦІЮ?',
    subtitle: 'Зберемо під вас за 5 хвилин — наш конфігуратор підбере конектори, потужність і опції.',
    href: REQUEST_PATHS.CUSTOM_STATION,
    partner: 'ecofactor.ua',
  },
  {
    id: 'sp-autoservice',
    title: 'СЕРВІС TESLA / BYD / AUDI',
    subtitle: 'Знижка 10% на першу діагностику в нашому сервісі. Запис онлайн за 2 хв.',
    href: REQUEST_PATHS.AUTOSERVICE,
    partner: 'service.ecofactor.ua',
  },
]
