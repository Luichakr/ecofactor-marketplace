import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useEfpfProducts } from '../../../catalog/hooks/useEfpfProducts'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { filterProducts } from '../../../catalog/lib/filterProducts'
import { productPath } from '../../../../shared/config/routes'
import {
  recentSearches,
  useRecentSearches,
  POPULAR_SEARCHES,
} from '../../model/recentSearchesStore'
import { formatPrice } from '../../../../entities/product/model/product.types'
import './SearchOverlay.css'

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const live = useEfpfProducts()
  const recent = useRecentSearches()
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      // Focus input on next frame to avoid mobile keyboard race.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const pool = useMemo(() => {
    const dedup = new Map<string, ReturnType<typeof allProductsMerge>[number]>()
    for (const p of allProductsMerge(live.data ?? [])) {
      if (!dedup.has(p.id)) dedup.set(p.id, p)
    }
    return [...dedup.values()]
  }, [live.data])

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    return filterProducts({ products: pool, categoryId: undefined, filters: {}, search: query }).slice(0, 20)
  }, [query, pool])

  function commitQuery() {
    const q = query.trim()
    if (q.length >= 2) recentSearches.add(q)
  }

  if (!open) return null

  return (
    <div className="search-overlay" role="dialog" aria-modal="true">
      <div className="search-overlay__bar">
        <span className="search-overlay__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.2" />
            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Шукати товари..."
          className="search-overlay__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={commitQuery}
        />
        <button className="search-overlay__close" onClick={onClose} aria-label="Закрити">
          ×
        </button>
      </div>

      <div className="search-overlay__body">
        {query.trim().length < 2 ? (
          <>
            {recent.length > 0 && (
              <Section title="НЕДАВНІ" action={<button type="button" className="search-overlay__link" onClick={() => recentSearches.clear()}>ОЧИСТИТИ</button>}>
                <ul className="search-overlay__list">
                  {recent.map((q) => (
                    <li key={q} className="search-overlay__chip-row">
                      <button
                        type="button"
                        className="search-overlay__chip-text"
                        onClick={() => setQuery(q)}
                      >
                        {q}
                      </button>
                      <button
                        type="button"
                        className="search-overlay__chip-x"
                        onClick={() => recentSearches.remove(q)}
                        aria-label="Видалити"
                      >×</button>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section title="ПОПУЛЯРНЕ">
              <div className="search-overlay__pills">
                {POPULAR_SEARCHES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="search-overlay__pill"
                    onClick={() => setQuery(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Section>
          </>
        ) : (
          <Section title={`РЕЗУЛЬТАТИ (${results.length})`}>
            {results.length === 0 ? (
              <p className="search-overlay__empty">Нічого не знайдено за «{query}».</p>
            ) : (
              <ul className="search-overlay__results">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={productPath(p.id)}
                      className="search-overlay__result"
                      onClick={() => {
                        commitQuery()
                        onClose()
                      }}
                    >
                      <div className="search-overlay__result-thumb" />
                      <div className="search-overlay__result-meta">
                        <p className="search-overlay__result-title">{p.title}</p>
                        {p.subtitle && (
                          <p className="search-overlay__result-sub">{p.subtitle}</p>
                        )}
                      </div>
                      {p.price && (
                        <span className="search-overlay__result-price">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="search-overlay__section">
      <div className="search-overlay__section-head">
        <h3 className="search-overlay__section-title">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function allProductsMerge(live: MarketplaceProduct[]) {
  // Universal feed (`useEfpfProducts`) already merges EFPF, mockTires, and
  // Lubeavto cars. Stop re-importing `mockProducts` here so the overlay
  // and the catalog see the exact same product set.
  return live
}
