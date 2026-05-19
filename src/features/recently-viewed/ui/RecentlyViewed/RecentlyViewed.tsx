import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEfpfProducts } from '../../../catalog/hooks/useEfpfProducts'
import { mockProducts } from '../../../../data/mockProducts'
import { mockTires } from '../../../../data/mockTires'
import { formatPrice } from '../../../../entities/product/model/product.types'
import { productPath } from '../../../../shared/config/routes'
import './RecentlyViewed.css'

const KEY = 'mp:viewedProducts'

function readViewed(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch { return [] }
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const live = useEfpfProducts()
  const ids = useMemo(() => readViewed(), [])

  const items = useMemo(() => {
    if (ids.length === 0) return []
    const all = [...(live.data ?? []), ...mockProducts, ...mockTires]
    const byId = new Map(all.map((p) => [p.id, p]))
    return ids
      .filter((id) => id !== excludeId)
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .slice(0, 10)
  }, [ids, live.data, excludeId])

  if (items.length < 3) return null

  return (
    <section className="recently-viewed">
      <h2 className="recently-viewed__title">ВИ НЕДАВНО ДИВИЛИСЯ</h2>
      <div className="recently-viewed__strip">
        {items.map((p) => (
          <Link key={p.id} to={productPath(p.id)} className="recently-viewed__card">
            <div className="recently-viewed__thumb" />
            <p className="recently-viewed__name">{p.title}</p>
            {p.price && <p className="recently-viewed__price">{formatPrice(p.price)}</p>}
          </Link>
        ))}
      </div>
    </section>
  )
}
