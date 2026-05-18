import type { EfpfListResponse, EfpfProduct } from './types'

const BASE = (import.meta.env.VITE_EFPF_API_BASE as string | undefined)
  ?? 'https://ecofactortech.com/wp-json/efpf/v1'

/**
 * EFPF allows the key as `?api_key=...` in the URL or as `X-EFPF-API-Key`
 * header. We use the query form so cross-origin browser requests don't
 * trigger a CORS preflight that the server rejects (its
 * Access-Control-Allow-Headers list does not include X-EFPF-API-Key).
 */
function efpfKey(): string {
  return (import.meta.env.VITE_EFPF_API_KEY as string | undefined)?.trim() ?? ''
}

export type ListParams = {
  lang?: string
  type?: 'simple' | 'variable'
  per_page?: number
  page?: number
  since?: string
  include_variations?: boolean
}

function buildUrl(path: string, params: Record<string, string | number | boolean | undefined>) {
  const u = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '' || v === false) continue
    u.searchParams.set(k, String(v === true ? 1 : v))
  }
  const key = efpfKey()
  if (key) u.searchParams.set('api_key', key)
  return u
}

export async function fetchProducts(params: ListParams = {}): Promise<EfpfListResponse> {
  const u = buildUrl('/products', {
    lang: params.lang ?? 'ua',
    type: params.type,
    per_page: params.per_page ?? 100,
    page: params.page ?? 1,
    since: params.since,
    include_variations: params.include_variations,
  })
  const r = await fetch(u, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`EFPF /products failed: ${r.status}`)
  return r.json()
}

export async function fetchProduct(id: number | string, lang = 'ua'): Promise<EfpfProduct> {
  const u = buildUrl(`/products/${id}`, { lang })
  const r = await fetch(u, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`EFPF /products/${id} failed: ${r.status}`)
  return r.json()
}

export async function fetchAllProducts(params: ListParams = {}): Promise<EfpfProduct[]> {
  const out: EfpfProduct[] = []
  let page = 1
  while (true) {
    const data = await fetchProducts({ ...params, page, per_page: params.per_page ?? 200 })
    out.push(...data.items)
    if (page >= data.pages || data.pages === 0) break
    page++
  }
  return out
}
