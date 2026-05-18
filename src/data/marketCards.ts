import { catalogCategoryPath, REQUEST_PATHS, ROUTES } from '../shared/config/routes'
import evChargingPhoto from '../assets/menu/ev-charging.webp'
import solarPhoto from '../assets/menu/solar.webp'
import autoservicePhoto from '../assets/menu/autoservice.webp'
import servicePhoto from '../assets/menu/service.webp'

export type MarketCard = {
  id: string
  caption: string
  /** Real photo if available, otherwise a placeholder with `size` is rendered. */
  image?: string
  size?: string
  href?: string
}

/**
 * 6 entry tiles shown on Marketplace home (carousel) and Menu (horizontal row).
 */
export const MARKET_CARDS: MarketCard[] = [
  { id: 'new', caption: 'НОВИНКИ', size: '1248 × 2304', href: ROUTES.ARKANOID },
  { id: 'ev-charging', caption: 'EV-ЗАРЯДКА', image: evChargingPhoto, href: catalogCategoryPath('ev-charging') },
  { id: 'solar', caption: 'СОНЯЧНА СТАНЦІЯ', image: solarPhoto, href: catalogCategoryPath('solar') },
  { id: 'autoservice', caption: 'АВТОСЕРВІС', image: autoservicePhoto, href: REQUEST_PATHS.AUTOSERVICE },
  { id: 'service', caption: 'СЕРВІС', image: servicePhoto, href: REQUEST_PATHS.INSTALLATION },
  { id: 'guide', caption: 'ГАЙД', size: '1248 × 2304' },
]
