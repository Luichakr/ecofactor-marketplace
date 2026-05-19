import type { MarketplaceProduct } from '../entities/product/model/product.types'

/**
 * Reference tire catalog used as the "Колеса → Шини" fixture. Each SKU
 * is a real-world brand + model combo at a plausible Ukrainian retail
 * price, varied across seasons (літо / зима / всесезон) and three size
 * profiles so the catalog feels stocked while staying inspect-able.
 *
 * Keep this file the only source of truth for tire mocks — useEfpfProducts
 * merges it into the live EFPF feed.
 */

type Size = { width: number; profile: number; diameter: number; load: number; speed: string }

const SIZES: Size[] = [
  { width: 245, profile: 40, diameter: 18, load: 97,  speed: 'Y' },
  { width: 225, profile: 45, diameter: 17, load: 94,  speed: 'W' },
  { width: 215, profile: 60, diameter: 16, load: 95,  speed: 'H' },
]

type Spec = {
  brand: string
  model: string
  season: 'Літо' | 'Зима' | 'Всесезон'
  /** Suggested retail in UAH for the 245/40 R18 size — other sizes
   *  scale +/- 10% so the catalog has visible variation. */
  priceBase: number
  euLabel: { fuel: string; wet: string; noise: number }
}

const SPECS: Spec[] = [
  // ─── Summer ───────────────────────────────────────────────
  { brand: 'Michelin',     model: 'Pilot Sport 4',             season: 'Літо',     priceBase: 8_950, euLabel: { fuel: 'A', wet: 'A', noise: 71 } },
  { brand: 'Michelin',     model: 'Pilot Sport 5',             season: 'Літо',     priceBase: 9_650, euLabel: { fuel: 'A', wet: 'A', noise: 70 } },
  { brand: 'Continental',  model: 'SportContact 7',            season: 'Літо',     priceBase: 9_200, euLabel: { fuel: 'B', wet: 'A', noise: 72 } },
  { brand: 'Continental',  model: 'PremiumContact 6',          season: 'Літо',     priceBase: 7_400, euLabel: { fuel: 'B', wet: 'A', noise: 70 } },
  { brand: 'Bridgestone',  model: 'Potenza Sport',             season: 'Літо',     priceBase: 8_400, euLabel: { fuel: 'C', wet: 'A', noise: 72 } },
  { brand: 'Bridgestone',  model: 'Turanza T005',              season: 'Літо',     priceBase: 6_900, euLabel: { fuel: 'B', wet: 'A', noise: 70 } },
  { brand: 'Goodyear',     model: 'Eagle F1 Asymmetric 6',     season: 'Літо',     priceBase: 8_100, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Goodyear',     model: 'EfficientGrip Performance 2',season: 'Літо',    priceBase: 6_500, euLabel: { fuel: 'A', wet: 'B', noise: 69 } },
  { brand: 'Pirelli',      model: 'P Zero (PZ4)',              season: 'Літо',     priceBase: 9_650, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Pirelli',      model: 'Cinturato P7',              season: 'Літо',     priceBase: 7_350, euLabel: { fuel: 'B', wet: 'A', noise: 70 } },
  { brand: 'Hankook',      model: 'Ventus S1 Evo3',            season: 'Літо',     priceBase: 6_500, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Hankook',      model: 'Ventus Prime 4',            season: 'Літо',     priceBase: 5_400, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Yokohama',     model: 'Advan Sport V107',          season: 'Літо',     priceBase: 7_300, euLabel: { fuel: 'C', wet: 'A', noise: 72 } },
  { brand: 'Yokohama',     model: 'BluEarth-GT AE51',          season: 'Літо',     priceBase: 5_950, euLabel: { fuel: 'A', wet: 'B', noise: 70 } },
  { brand: 'Dunlop',       model: 'Sport Maxx RT2',            season: 'Літо',     priceBase: 6_800, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Dunlop',       model: 'SP Sport BluResponse',      season: 'Літо',     priceBase: 5_300, euLabel: { fuel: 'A', wet: 'B', noise: 69 } },
  { brand: 'Toyo',         model: 'Proxes Sport',              season: 'Літо',     priceBase: 6_200, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Falken',       model: 'Azenis FK510',              season: 'Літо',     priceBase: 5_650, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Kumho',        model: 'Ecsta PS71',                season: 'Літо',     priceBase: 4_950, euLabel: { fuel: 'C', wet: 'B', noise: 72 } },

  // ─── Winter ───────────────────────────────────────────────
  { brand: 'Michelin',     model: 'Alpin 6',                   season: 'Зима',     priceBase: 7_950, euLabel: { fuel: 'C', wet: 'B', noise: 70 } },
  { brand: 'Continental',  model: 'WinterContact TS 870',      season: 'Зима',     priceBase: 7_650, euLabel: { fuel: 'C', wet: 'B', noise: 71 } },
  { brand: 'Bridgestone',  model: 'Blizzak LM005',             season: 'Зима',     priceBase: 8_200, euLabel: { fuel: 'C', wet: 'A', noise: 72 } },
  { brand: 'Goodyear',     model: 'UltraGrip Performance +',   season: 'Зима',     priceBase: 7_400, euLabel: { fuel: 'C', wet: 'B', noise: 71 } },
  { brand: 'Pirelli',      model: 'Winter Sottozero 3',        season: 'Зима',     priceBase: 8_350, euLabel: { fuel: 'C', wet: 'B', noise: 72 } },
  { brand: 'Hankook',      model: 'Winter i*cept evo3',        season: 'Зима',     priceBase: 5_700, euLabel: { fuel: 'C', wet: 'B', noise: 71 } },
  { brand: 'Yokohama',     model: 'BluEarth*Winter V906',      season: 'Зима',     priceBase: 5_900, euLabel: { fuel: 'C', wet: 'B', noise: 72 } },
  { brand: 'Nokian Tyres', model: 'Hakkapeliitta R5',          season: 'Зима',     priceBase: 8_500, euLabel: { fuel: 'C', wet: 'A', noise: 70 } },
  { brand: 'Nokian Tyres', model: 'Snowproof 1',               season: 'Зима',     priceBase: 7_100, euLabel: { fuel: 'C', wet: 'B', noise: 71 } },
  { brand: 'Dunlop',       model: 'Winter Sport 5',            season: 'Зима',     priceBase: 6_400, euLabel: { fuel: 'C', wet: 'B', noise: 71 } },

  // ─── All-season ───────────────────────────────────────────
  { brand: 'Michelin',     model: 'CrossClimate 2',            season: 'Всесезон', priceBase: 7_700, euLabel: { fuel: 'B', wet: 'A', noise: 70 } },
  { brand: 'Continental',  model: 'AllSeasonContact 2',        season: 'Всесезон', priceBase: 6_900, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Goodyear',     model: 'Vector 4Seasons Gen-3',     season: 'Всесезон', priceBase: 6_700, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Pirelli',      model: 'Cinturato All Season SF2',  season: 'Всесезон', priceBase: 7_200, euLabel: { fuel: 'B', wet: 'B', noise: 70 } },
  { brand: 'Hankook',      model: 'Kinergy 4S2',               season: 'Всесезон', priceBase: 5_300, euLabel: { fuel: 'C', wet: 'B', noise: 71 } },
  { brand: 'Bridgestone',  model: 'Weather Control A005 EVO',  season: 'Всесезон', priceBase: 6_500, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
]

// Deterministic LCG so the catalog is stable across reloads but the
// discount distribution still feels organic.
function seededRand(seed: number): number {
  return ((seed * 9301 + 49297) % 233280) / 233280
}

const DISCOUNT_POOL = [10, 20, 30, 40, 50, 70]

/** Returns a discount percent (0..100) for a given SKU index. Roughly
 *  ~40 % of SKUs end up discounted. The value mirrors what the partner
 *  API will eventually return so the filter logic stays unchanged. */
function pickDiscount(idx: number): number {
  if (seededRand(idx + 1) < 0.55) return 0
  return DISCOUNT_POOL[Math.floor(seededRand(idx + 100) * DISCOUNT_POOL.length)]
}

function buildSku(spec: Spec, size: Size, idx: number): MarketplaceProduct {
  const sizeShort = `${size.width}/${size.profile} R${size.diameter}`
  const sizeFull = `${sizeShort} ${size.load}${size.speed}${size.width >= 235 ? ' XL' : ''}`
  const priceVariance = size.diameter === 18 ? 1 : size.diameter === 17 ? 0.92 : 0.78
  const fullPrice = Math.round(spec.priceBase * priceVariance / 50) * 50
  const discountPct = pickDiscount(idx)
  const finalPrice = discountPct > 0
    ? Math.round((fullPrice * (1 - discountPct / 100)) / 10) * 10
    : fullPrice
  const id = `tire-${String(idx + 1).padStart(3, '0')}`

  // Deterministic stock distribution: ~10% OOS, ~15% low-stock (1..5), rest in stock.
  const stockRoll = seededRand(idx + 17)
  const stock = stockRoll < 0.1
    ? 0
    : stockRoll < 0.25
      ? 1 + Math.floor(seededRand(idx + 31) * 5)
      : 12 + Math.floor(seededRand(idx + 41) * 80)

  // Rating: 3.7..4.9, count 12..420 — deterministic per SKU.
  const ratingAvg = 3.7 + seededRand(idx + 53) * 1.2
  const ratingCount = 12 + Math.floor(seededRand(idx + 61) * 408)

  // Social stats — only populate for ~40% of SKUs so the badge feels rare.
  const hasHotStats = seededRand(idx + 71) > 0.6
  const stats = hasHotStats
    ? {
        viewersNow: 5 + Math.floor(seededRand(idx + 79) * 22),
        monthlyPurchases: 10 + Math.floor(seededRand(idx + 83) * 90),
        weeklyPurchases: 3 + Math.floor(seededRand(idx + 89) * 18),
      }
    : undefined

  // Bundle: pair with the next 1..2 SKUs as "часто купують разом".
  const bundle = [
    `tire-${String(((idx + 1) % 50) + 1).padStart(3, '0')}`,
    `tire-${String(((idx + 2) % 50) + 1).padStart(3, '0')}`,
  ]

  const sellerId = idx % 3 === 0 ? 'tire-pro' : 'ecofactor-store'

  // Two coarse buckets: ДО 40% (0<x≤40) / ПОНАД 40% (>40).
  const discountBucket = discountPct === 0
    ? null
    : discountPct <= 40 ? 'ДО 40%' : 'ПОНАД 40%'

  return {
    id,
    categoryId: 'wheels',
    title: `${spec.brand} ${spec.model}`,
    subtitle: `${sizeFull} · ${spec.season}`,
    description:
      `${spec.season === 'Літо' ? 'Літня' : spec.season === 'Зима' ? 'Зимова' : 'Всесезонна'} ` +
      `шина ${spec.brand} ${spec.model} у розмірі ${sizeShort}. ` +
      `Індекс навантаження ${size.load}, швидкості ${size.speed}. ` +
      `Ціна вказана за одну шину; рекомендуємо замовляти комплектом із чотирьох.`,
    price: {
      value: finalPrice,
      oldValue: discountPct > 0 ? fullPrice : undefined,
      currency: 'UAH',
    },
    status: 'inStock',
    image: undefined,
    badges: [
      spec.season,
      ...(size.width >= 235 ? ['XL'] : []),
      ...(discountPct > 0 ? [`-${discountPct}%`] : []),
      'В наявності',
    ],
    createdAt: '2026-05-18',
    stock,
    sellerId,
    bundle,
    rating: { average: Math.round(ratingAvg * 10) / 10, count: ratingCount },
    stats,
    attributes: [
      { key: 'subcategory', label: 'Тип',          value: 'tires',          type: 'select', filterable: true, visibleInCard: false, visibleInDetails: false, priority: 1 },
      // Section ordering inside the filter sheet — see FilterPanel section list.
      // Width/Profile/Diameter share a composite "РОЗМІР" block (priority 2).
      { key: 'width',       label: 'Ширина',       value: size.width,       type: 'number', unit: 'мм', filterable: true, visibleInDetails: true, priority: 2 },
      { key: 'profile',     label: 'Профіль',      value: size.profile,     type: 'number', unit: '%',  filterable: true, visibleInDetails: true, priority: 2 },
      { key: 'diameter',    label: 'Діаметр',      value: size.diameter,    type: 'number', unit: '"',  filterable: true, visibleInCard: true, visibleInDetails: true, priority: 2 },
      { key: 'season',      label: 'Сезон',        value: spec.season,      type: 'select', filterable: true, visibleInCard: true,  visibleInDetails: true,  priority: 3 },
      // Filterable price attribute (mirrors product.price.value). Lets the
      // dynamic facet builder generate a range, which the slider consumes.
      { key: 'price',       label: 'Ціна',         value: finalPrice,       type: 'number', unit: '₴',  filterable: true, visibleInDetails: false, priority: 4 },
      { key: 'brand',       label: 'Бренд',        value: spec.brand,       type: 'select', filterable: true, visibleInCard: true,  visibleInDetails: true,  priority: 5 },
      ...(discountBucket
        ? [{ key: 'discountBucket', label: 'Знижка', value: discountBucket, type: 'select' as const, filterable: true, visibleInDetails: false, priority: 6 }]
        : []),
      { key: 'model',       label: 'Модель',       value: spec.model,       type: 'text',                       visibleInCard: true,  visibleInDetails: true,  priority: 7 },
      { key: 'loadIndex',   label: 'Індекс навант.', value: size.load,      type: 'number',             visibleInDetails: true, priority: 8 },
      { key: 'speedRating', label: 'Індекс швидк.', value: size.speed,      type: 'select',             visibleInDetails: true, priority: 9 },
      { key: 'reinforced',  label: 'Посилення',    value: size.width >= 235 ? 'XL' : 'Standard', type: 'select', visibleInDetails: true, priority: 10 },
      { key: 'fuelClass',   label: 'Економія',     value: spec.euLabel.fuel, type: 'select',            visibleInDetails: true, priority: 11 },
      { key: 'wetClass',    label: 'Зчеплення (мокре)', value: spec.euLabel.wet, type: 'select',        visibleInDetails: true, priority: 12 },
      { key: 'noise',       label: 'Шум',          value: spec.euLabel.noise, type: 'number', unit: 'дБ', visibleInDetails: true, priority: 13 },
      { key: 'origin',      label: 'Виробництво',  value: 'Європа',          type: 'select', visibleInDetails: true, priority: 14 },
    ],
  }
}

/**
 * Builds the catalog: each spec gets emitted in its hero size (245/40 R18)
 * by default, and a curated subset gets a second 17" variant so the
 * inventory has visible size variation without ballooning the list.
 */
function buildCatalog(): MarketplaceProduct[] {
  const out: MarketplaceProduct[] = []
  let idx = 0
  for (const spec of SPECS) {
    out.push(buildSku(spec, SIZES[0], idx++))
  }
  // Add an additional 17" variant for every third spec — yields ~12 extras.
  for (let i = 0; i < SPECS.length; i += 3) {
    out.push(buildSku(SPECS[i], SIZES[1], idx++))
  }
  return out
}

export const mockTires: MarketplaceProduct[] = buildCatalog()
