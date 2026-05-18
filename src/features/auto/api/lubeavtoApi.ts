/**
 * Lubeavto Partner API client.
 *
 * Calls Lubeavto directly from the browser with the Bearer token baked in
 * at build time via VITE_LUBEAVTO_API_TOKEN. The token IS visible in the
 * production JS bundle — this is the same trade-off as our bidbiders setup.
 * Move behind a Cloudflare Worker / Vercel function when the project leaves
 * the internal-testing stage.
 */

const BASE = (import.meta.env.VITE_LUBEAVTO_API_BASE as string | undefined)
  ?? 'https://api-lubeavto-partner.azurewebsites.net'

function authHeaders(): Record<string, string> {
  const token = (import.meta.env.VITE_LUBEAVTO_API_TOKEN as string | undefined)?.trim() ?? ''
  if (!token) return {}
  return { Authorization: /^Bearer\s+/i.test(token) ? token : `Bearer ${token}` }
}

type ApiName = { name?: string | null }
type ApiPhoto = {
  link?: string | null
  url?: string | null
  src?: string | null
  original?: string | null
  preview?: string | null
  image?: string | null
}

type ApiComplectation = {
  mileage?: number | null
  fuelType?: string | null
  engineVolume?: number | null
  year?: number | null
  transmission?: string | null
  driveType?: string | null
  hasKey?: boolean | null
  isDamaged?: boolean | null
  hasCustomStatus?: boolean | null
  bodyType?: string | null
}

export type ApiLubeavtoCar = {
  id?: number | string | null
  mark?: string | ApiName | null
  model?: string | ApiName | null
  vin?: string | null
  description?: string | null
  price?: number | null
  mileage?: number | null
  fuelType?: string | null
  engineVolume?: number | null
  year?: number | null
  transmission?: string | null
  driveType?: string | null
  isAvailable?: boolean | null
  isSold?: boolean | null
  publishDate?: string | null
  country?: string | null
  city?: string | ApiName | null
  region?: string | ApiName | null
  mainPhoto?: string | ApiPhoto | null
  photos?: Array<string | ApiPhoto> | null
  images?: Array<string | ApiPhoto> | null
  gallery?: Array<string | ApiPhoto> | null
  photo?: string | ApiPhoto | null
  color?: string | ApiName | null
  carComplectation?: ApiComplectation | null
}

type ApiListResponse = {
  data?: ApiLubeavtoCar[]
  pageNumber?: number
  pageSize?: number
  totalRecords?: number
}

export type AutoCard = {
  id: string
  title: string
  make: string
  model: string
  year: number
  vin: string
  fuel: string
  fuelRaw: string
  transmission: string
  drive: string
  mileageKm: number
  mileageLabel: string
  priceUsd: number
  priceLabel: string
  image: string
  images: string[]
  location: string
  isAvailable: boolean
  isSold: boolean
  isElectric: boolean
  isHybrid: boolean
}

function toName(value: string | ApiName | null | undefined): string {
  if (typeof value === 'string') return value.trim()
  if (value && typeof value.name === 'string') return value.name.trim()
  return ''
}

function toImageUrl(value: string | ApiPhoto | null | undefined): string {
  if (typeof value === 'string') return value.trim()
  if (value) {
    const maybe = value.link ?? value.url ?? value.src ?? value.original ?? value.preview ?? value.image
    if (typeof maybe === 'string') return maybe.trim()
  }
  return ''
}

function isValidHttp(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function collectImages(car: ApiLubeavtoCar): string[] {
  const sources = [car.mainPhoto, car.photo, car.photos, car.images, car.gallery]
  const urls: string[] = []
  for (const s of sources) {
    if (Array.isArray(s)) {
      for (const item of s) {
        const u = toImageUrl(item as string | ApiPhoto | null | undefined)
        if (isValidHttp(u)) urls.push(u)
      }
    } else {
      const u = toImageUrl(s as string | ApiPhoto | null | undefined)
      if (isValidHttp(u)) urls.push(u)
    }
  }
  return Array.from(new Set(urls))
}

function mileageKm(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 0
  return raw < 10000 ? Math.round(raw * 1000) : Math.round(raw)
}

function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function formatKm(km: number): string {
  return `${km.toLocaleString('uk-UA')} км`
}

/**
 * Normalize fuel string into an English uppercase token and flags.
 * Covers: english, ukrainian, polish, russian variants.
 */
function classifyFuel(raw: string): { label: string; isElectric: boolean; isHybrid: boolean } {
  const v = (raw || '').trim().toLowerCase()
  const isHybrid = /hybrid|гибрид|гібрид|hybryd|phev|hev|plug-?in/.test(v)
  const isElectric = !isHybrid && /electro|electric|elect\b|elektr|електр|электр|\bev\b|\bbev\b/.test(v)
  let label = (raw || '').trim().toUpperCase()
  if (isElectric) label = 'ELECTRIC'
  else if (isHybrid) label = 'HYBRID'
  else if (!label) label = '—'
  else if (label === 'GAS') label = 'GASOLINE'
  return { label, isElectric, isHybrid }
}

export function normalizeCar(car: ApiLubeavtoCar): AutoCard | null {
  const rawId = car.id
  if (rawId === null || rawId === undefined) return null

  const id = String(rawId)
  const make = toName(car.mark) || 'Unknown'
  const model = toName(car.model) || ''
  const compl = car.carComplectation ?? {}
  const year = Number(car.year ?? compl.year ?? 0) || 0
  const title = [year || null, make, model].filter(Boolean).join(' ').trim()

  const fuelRaw = String(car.fuelType ?? compl.fuelType ?? '').trim()
  const fuel = classifyFuel(fuelRaw)

  const km = mileageKm(Number(car.mileage ?? compl.mileage ?? 0))
  const price = Math.max(0, Number(car.price ?? 0))

  const images = collectImages(car)
  const image = images[0] ?? ''

  const location = [
    toName(car.city) || car.country || '',
    toName(car.region) || '',
  ].filter(Boolean).join(', ') || '—'

  const rawTrans = String(car.transmission ?? compl.transmission ?? '').trim().toUpperCase()
  const transmission = !rawTrans || rawTrans === '0' ? '—' : rawTrans
  const rawDrive = String(car.driveType ?? compl.driveType ?? '').trim().toUpperCase()
  const drive = !rawDrive || rawDrive === '0'
    ? '—'
    : rawDrive === 'FRONT' ? 'FWD'
    : rawDrive === 'REAR' ? 'RWD'
    : rawDrive === 'ALL' || rawDrive === 'FULL' ? 'AWD'
    : rawDrive

  return {
    id,
    title: title || `${make} ${model}`.trim(),
    make,
    model,
    year,
    vin: String(car.vin ?? '').trim(),
    fuel: fuel.label,
    fuelRaw,
    transmission,
    drive,
    mileageKm: km,
    mileageLabel: km > 0 ? formatKm(km) : '—',
    priceUsd: price,
    priceLabel: price > 0 ? formatUsd(price) : 'TBD',
    image,
    images,
    location,
    isAvailable: car.isAvailable === true,
    isSold: car.isSold === true,
    isElectric: fuel.isElectric && !fuel.isHybrid,
    isHybrid: fuel.isHybrid,
  }
}

type FetchOpts = {
  path: '/api/v0/cars' | '/api/v0/cars/in-route'
  pageSize?: number
  maxPages?: number
}

async function fetchAllPages({ path, pageSize = 500, maxPages = 20 }: FetchOpts): Promise<ApiLubeavtoCar[]> {
  const url = (page: number) => `${BASE}${path}?pageNumber=${page}&pageSize=${pageSize}`

  const headers = authHeaders()
  const first = await fetch(url(1), { cache: 'no-store', headers })
  if (!first.ok) {
    throw new Error(`Lubeavto ${path} HTTP ${first.status}`)
  }
  const firstJson = (await first.json()) as ApiListResponse
  const all: ApiLubeavtoCar[] = [...(firstJson.data ?? [])]
  const total = Number(firstJson.totalRecords ?? all.length)
  if (!Number.isFinite(total) || total <= all.length) return all

  const totalPages = Math.min(maxPages, Math.ceil(total / pageSize))
  if (totalPages < 2) return all

  const requests: Promise<ApiListResponse>[] = []
  for (let p = 2; p <= totalPages; p += 1) {
    requests.push(fetch(url(p), { cache: 'no-store', headers }).then((r) => r.json() as Promise<ApiListResponse>))
  }
  const pages = await Promise.all(requests)
  for (const page of pages) {
    if (page?.data) all.push(...page.data)
  }
  return all
}

/**
 * Fetch one car by id. Tries the in-route detail endpoint first
 * (richer payload, more photos), then falls back to the catalog list scan.
 */
export async function fetchAutoCarById(id: string): Promise<AutoCard | null> {
  const safeId = encodeURIComponent(id)
  for (const path of [`/api/v0/cars/${safeId}`, `/api/v0/cars/in-route/${safeId}`]) {
    const r = await fetch(`${BASE}${path}`, { cache: 'no-store', headers: authHeaders() })
    if (r.ok) {
      const raw = (await r.json()) as ApiLubeavtoCar
      const norm = normalizeCar(raw)
      if (norm) return norm
    }
  }
  return null
}

/**
 * Fetch full Lubeavto catalog (catalog + in-route) and return only cars
 * that are in stock AND have hybrid or electric drivetrain.
 */
export async function fetchAutoElectricInStock(): Promise<AutoCard[]> {
  const [catalog, transit] = await Promise.all([
    fetchAllPages({ path: '/api/v0/cars' }),
    fetchAllPages({ path: '/api/v0/cars/in-route' }).catch(() => [] as ApiLubeavtoCar[]),
  ])

  const seen = new Set<string>()
  const out: AutoCard[] = []
  for (const raw of [...catalog, ...transit]) {
    const card = normalizeCar(raw)
    if (!card) continue
    if (seen.has(card.id)) continue
    if (!card.isAvailable || card.isSold) continue
    if (!(card.isElectric || card.isHybrid)) continue
    seen.add(card.id)
    out.push(card)
  }

  // electric first, then hybrid; within each, newest year then lower mileage
  out.sort((a, b) => {
    if (a.isElectric !== b.isElectric) return a.isElectric ? -1 : 1
    if (a.year !== b.year) return b.year - a.year
    return a.mileageKm - b.mileageKm
  })

  return out
}
