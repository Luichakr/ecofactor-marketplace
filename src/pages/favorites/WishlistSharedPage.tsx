import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { Button } from '../../shared/ui/Button/Button'
import { CatalogGrid } from '../../features/catalog/ui/CatalogGrid/CatalogGrid'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { mockProducts } from '../../data/mockProducts'
import { mockTires } from '../../data/mockTires'
import { favorites } from '../../features/favorites/model/favoritesStore'
import { ROUTES } from '../../shared/config/routes'

function decode(hash: string): string[] {
  try {
    const json = atob(hash)
    const ids = JSON.parse(json)
    return Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function WishlistSharedPage() {
  const { hash } = useParams<{ hash: string }>()
  const navigate = useNavigate()
  const live = useEfpfProducts()
  const ids = hash ? decode(hash) : []

  const all = [...(live.data ?? []), ...mockProducts, ...mockTires]
  const map = new Map(all.map((p) => [p.id, p]))
  const products = ids.map((id) => map.get(id)).filter((p): p is NonNullable<typeof p> => !!p)

  function addAllToFavorites() {
    for (const id of ids) favorites.add(id)
    navigate(ROUTES.FAVORITES)
  }

  return (
    <>
      <Header title="СПИСОК БАЖАНЬ" showBack onBack={() => navigate(-1)} />
      <ScreenContainer withTopInset={false}>
        {products.length === 0 ? (
          <EmptyState variant="favorites" title="Список порожній" description="Можливо, посилання застаріло." />
        ) : (
          <>
            <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <Button variant="outline" fullWidth size="lg" onClick={addAllToFavorites}>
                ДОДАТИ ВСЕ В МОЇ ЗАКЛАДКИ
              </Button>
            </div>
            <CatalogGrid products={products} columns={2} />
          </>
        )}
      </ScreenContainer>
    </>
  )
}
