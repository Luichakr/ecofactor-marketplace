import { useState, useMemo } from 'react'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { filterProducts } from '../../features/catalog/lib/filterProducts'
import { CatalogGrid } from '../../features/catalog/ui/CatalogGrid/CatalogGrid'
import { SearchInput } from '../../shared/ui/SearchInput/SearchInput'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import './SearchPage.css'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const live = useEfpfProducts()

  const results = useMemo(() => {
    if (!query.trim()) return []
    return filterProducts({ products: live.data ?? [], filters: {}, search: query })
  }, [query, live.data])

  return (
    <>
      <Header title="Пошук" />
      <ScreenContainer withTopInset={false}>
        <div className="search-page__input">
          <SearchInput
            placeholder="Введіть назву товару або бренд..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            autoFocus
          />
        </div>
        {query.trim() && (
          <div className="search-page__count">
            Знайдено: {results.length}
          </div>
        )}
        {query.trim() && (
          <CatalogGrid products={results} onReset={() => setQuery('')} />
        )}
        {!query.trim() && (
          <div className="search-page__hint">
            Почніть вводити для пошуку товарів
          </div>
        )}
      </ScreenContainer>
    </>
  )
}
