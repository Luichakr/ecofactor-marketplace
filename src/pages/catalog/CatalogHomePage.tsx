import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Icon } from '../../shared/ui/Icon/Icon'
import { useSearchTrigger } from '../../features/search/ui/SearchTrigger/SearchTrigger'
import { mockCategories } from '../../data/mockCategories'
import { ROUTES, catalogCategoryPath } from '../../shared/config/routes'
import './CatalogHomePage.css'

const PARENT_ICON: Record<string, string> = {
  'ev-charging': 'ev_station',
  solar: 'solar_power',
}

const SUB_ICON: Record<string, string> = {
  'mobile-charging-stations': 'bolt',
  cables: 'cable',
  accessories: 'category',
  'solar-panels': 'grid_view',
  'hybrid-inverters': 'electrical_services',
  'accumulator-batteries': 'battery_charging_full',
  komplektuiuchi: 'handyman',
}

type Tile = { id: string; label: string; icon: string; to: string }

// Flatten parents + their subcategories into one tile grid so the landing
// reads like the Monobank/Rozetka catalog even though we run only a couple
// of verticals.
function buildTiles(): Tile[] {
  const tiles: Tile[] = []
  for (const c of mockCategories) {
    tiles.push({
      id: c.id,
      label: c.title,
      icon: PARENT_ICON[c.id] ?? 'category',
      to: `${catalogCategoryPath(c.id)}?view=2`,
    })
    for (const s of c.subcategories ?? []) {
      tiles.push({
        id: `${c.id}-${s.id}`,
        label: s.title,
        icon: SUB_ICON[s.id] ?? 'category',
        to: `${catalogCategoryPath(c.id)}?view=2&sub=${s.id}`,
      })
    }
  }
  return tiles
}

/**
 * Catalog landing ("Каталог товарів") — the screen behind the home
 * 4-squares button. Standard ECOFACTOR shell (green Header + ScreenContainer),
 * a search bar, and a grid of colourful category tiles (reference layout).
 */
export function CatalogHomePage() {
  const navigate = useNavigate()
  const { open: openSearch } = useSearchTrigger()
  const tiles = buildTiles()

  return (
    <>
      <Header title="Каталог товарів" showBack backFallback={ROUTES.MARKETPLACE} />
      <ScreenContainer withTopInset={false} className="catalog-home">
        <button type="button" className="catalog-home__search" onClick={openSearch}>
          <Icon name="search" size={20} />
          <span>Пошук</span>
        </button>

        <div className="catalog-home__tiles">
          {tiles.map((t) => (
            <button
              key={t.id}
              type="button"
              className="catalog-home__tile"
              onClick={() => navigate(t.to)}
            >
              <span className="catalog-home__tile-icon" aria-hidden="true">
                <Icon name={t.icon} size={28} />
              </span>
              <span className="catalog-home__tile-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="catalog-home__bottom-space" />
      </ScreenContainer>
    </>
  )
}
