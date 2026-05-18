# Nova Poshta Integration

Nova Poshta is Ukraine's largest courier company. The marketplace uses
their public API to let customers pick a delivery branch or postomat
during the order flow.

## Endpoints used

| Method | Model | Purpose |
|---|---|---|
| `searchSettlements` | `Address` | City/settlement autocomplete |
| `getWarehouses` | `AddressGeneral` | List branches / postomats in a city |

Full reference: https://developers.novaposhta.ua/documentation

## Auth

Every call needs `apiKey` in the JSON body. Register at
https://novaposhta.ua → Personal cabinet → Settings → Security → "API
keys" → create a new one. Free tier: 1000 requests / hour.

The key is stored in `.env.local` as `VITE_NOVA_POSHTA_API_KEY`. Vite
exposes any `VITE_*` env variable to the client bundle, so the key ends
up in the JS shipped to the browser. **For production, proxy these
requests through a backend** so the key never reaches the client. For
the prototype it's acceptable since these are read-only methods that
don't expose customer data.

## Fallback behavior

When `VITE_NOVA_POSHTA_API_KEY` is empty (or the API call fails — CORS,
rate limit, expired key), the `NovaPoshtaDelivery` component falls back
to mock data covering 5 cities (Київ, Одеса, Львів, Харків, Дніпро)
with a handful of branches and postomats each. A yellow banner inside
the component warns: "ДЕМО: відображено мок-дані".

## CORS

Nova Poshta serves `Access-Control-Allow-Origin: *` on their public API
endpoint (`https://api.novaposhta.ua/v2.0/json/`), so direct browser
fetches work without a proxy.

## File map

| Path | Purpose |
|---|---|
| `src/shared/api/novaposhta/types.ts` | TypeScript types for settlements + warehouses |
| `src/shared/api/novaposhta/client.ts` | Fetch wrapper with apiKey injection |
| `src/shared/api/novaposhta/mockData.ts` | Fallback cities + warehouses |
| `src/shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery.tsx` | UI component (city autocomplete + warehouse picker) |

## Component API

```tsx
import { NovaPoshtaDelivery, type NovaPoshtaSelection } from '@/shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'

const [delivery, setDelivery] = useState<NovaPoshtaSelection | undefined>()

<NovaPoshtaDelivery value={delivery} onChange={setDelivery} required />
```

`NovaPoshtaSelection` shape:

```ts
{
  city: NpSettlement | null      // { Ref, MainDescription, Area, ... }
  warehouse: NpWarehouse | null  // { Ref, Number, Description, TypeOfWarehouse, ... }
  branchType: 'any' | 'branch' | 'postomat'
}
```

The component is already wired into `QuoteForm` (section `|04| ДОСТАВКА`)
as an optional preference. Wire it into the future cart / checkout the
same way — drop the component, store the selection in state, send the
`city.Ref` + `warehouse.Ref` to the backend.

## Production checklist

- [ ] Move the API key to a backend proxy (e.g. Vite dev: `/api/np/*`).
- [ ] Cache `searchSettlements` results in memory (city names rarely change).
- [ ] Add `getCities` for cities without ZIP (fallback for older addresses).
- [ ] Optionally call `Common.getCargoTypes` and `Common.getServiceTypes` for
      shipping cost calculation.
