import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { ROUTES } from '../../shared/config/routes'
import { useFavorites, favorites } from '../../features/favorites/model/favoritesStore'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { mockProducts } from '../../data/mockProducts'
import { CatalogGrid } from '../../features/catalog/ui/CatalogGrid/CatalogGrid'

export function FavoritesPage() {
  const navigate = useNavigate()
  const ids = useFavorites()
  const live = useEfpfProducts()

  const source = live.data ?? mockProducts
  const items = ids
    .map((id) => source.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <>
      <Header title="Обране" />
      <ScreenContainer withTopInset={false}>
        {items.length === 0 ? (
          <EmptyState
            title="Обраного ще немає"
            description="Зберігайте товари в обране, щоб повернутися до них пізніше"
            action={{ label: 'Перейти до каталогу', onClick: () => navigate(ROUTES.CATALOG) }}
          />
        ) : (
          <CatalogGrid products={items} onReset={() => favorites.clear()} />
        )}
      </ScreenContainer>
    </>
  )
}
