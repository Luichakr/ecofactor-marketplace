import { useEffect, useState } from 'react'
import type { MarketplaceProduct } from '../../../entities/product/model/product.types'
import { fetchAllProducts } from '../../../shared/api/efpf/client'
import { adaptEfpfProducts } from '../../../shared/api/efpf/adapter'
import { mockProducts } from '../../../data/mockProducts'

type State = {
  data: MarketplaceProduct[] | null
  loading: boolean
  error: string | null
}

let cache: MarketplaceProduct[] | null = null
let inflight: Promise<MarketplaceProduct[]> | null = null

async function loadOnce(): Promise<MarketplaceProduct[]> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = (async () => {
    const items = await fetchAllProducts({ lang: 'ua', per_page: 200 })
    const adapted = adaptEfpfProducts(items)
    cache = adapted
    inflight = null
    return adapted
  })()
  return inflight
}

export function useEfpfProducts(): State {
  const [state, setState] = useState<State>(() => ({
    data: cache,
    loading: cache === null,
    error: null,
  }))

  useEffect(() => {
    if (cache) return
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    loadOnce()
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // EFPF API unreachable (e.g. missing key on a public Pages build).
        // Fall back to bundled mock so the catalog page is at least browsable.
        if (import.meta.env.DEV) console.warn('EFPF failed, falling back to mocks:', err)
        setState({ data: mockProducts, loading: false, error: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

/** Synchronous lookup by id from the in-memory cache. Returns undefined if
 *  the cache isn't populated yet — the caller should also use useEfpfProducts()
 *  to trigger loading. */
export function findCachedProduct(id: string): MarketplaceProduct | undefined {
  return cache?.find((p) => p.id === id)
}
