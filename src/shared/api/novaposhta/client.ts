import type { NpApiResponse, NpSettlement, NpWarehouse } from './types'

/**
 * Nova Poshta API client.
 *
 * Auth: every request includes `apiKey` in the body. The key is read from
 * VITE_NOVA_POSHTA_API_KEY at build time (Vite exposes any `VITE_*` env
 * variable to the client bundle). Production should proxy via a backend.
 *
 * If no key is provided, requests will fail with "API key expired or empty"
 * and the UI falls back to mock data — see NovaPoshtaDelivery component.
 */

const API_URL = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = (import.meta.env.VITE_NOVA_POSHTA_API_KEY as string | undefined) ?? ''

async function npRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>,
): Promise<T[]> {
  if (!API_KEY) {
    throw new Error('NP_NO_API_KEY')
  }
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: API_KEY, modelName, calledMethod, methodProperties }),
  })
  if (!r.ok) throw new Error(`Nova Poshta API ${r.status}`)
  const data: NpApiResponse<T> = await r.json()
  if (!data.success) throw new Error(data.errors?.[0] ?? 'Nova Poshta API error')
  return data.data
}

/** Address.searchSettlements — fuzzy city search */
export function searchSettlements(query: string, limit = 10): Promise<NpSettlement[]> {
  const q = query.trim()
  if (q.length < 2) return Promise.resolve([])
  return npRequest<NpSettlement>('Address', 'searchSettlements', {
    CityName: q,
    Limit: String(limit),
  }).then((rows) => {
    // searchSettlements actually wraps results in `Addresses` field on some shapes;
    // try to flatten if shape differs.
    if (rows.length === 0) return rows
    const firstAny = rows[0] as unknown as { Addresses?: NpSettlement[] }
    if ('Addresses' in firstAny && Array.isArray(firstAny.Addresses)) {
      return (rows as unknown as { Addresses: NpSettlement[] }[]).flatMap((r) => r.Addresses)
    }
    return rows
  })
}

/** AddressGeneral.getWarehouses — list branches/postomats in a city */
export function getWarehouses(
  settlementRef: string,
  options: { findByString?: string; limit?: number; page?: number } = {},
): Promise<NpWarehouse[]> {
  return npRequest<NpWarehouse>('AddressGeneral', 'getWarehouses', {
    SettlementRef: settlementRef,
    FindByString: options.findByString ?? '',
    Limit: String(options.limit ?? 200),
    Page: String(options.page ?? 1),
  })
}

export const hasApiKey = (): boolean => Boolean(API_KEY)
