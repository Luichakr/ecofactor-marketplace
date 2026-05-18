import type { MarketplaceProduct } from '../entities/product/model/product.types'

/**
 * Twelve canonical tire SKUs used as the reference catalog for the
 * Колеса → Шини rubric. Same size profile (245/40 R18 97Y XL) across all
 * twelve so the visual layout stays uniform — only the brand/model and
 * price differ. Treat this as the "etalon" we align every other product
 * surface against.
 *
 * Why a separate file: keeps mockProducts.ts focused on legacy verticals
 * and avoids merge conflicts as we iterate on the tire UX.
 */

type TireSpec = {
  brand: string
  model: string
  /** Wholesale Ukrainian retail estimate in UAH. */
  priceUah: number
  /** Three EU label fields: fuel efficiency, wet grip, noise (dB). */
  euLabel: { fuel: string; wet: string; noise: number }
}

const TIRES: TireSpec[] = [
  { brand: 'Michelin',     model: 'Pilot Sport 4',            priceUah: 8_950, euLabel: { fuel: 'A', wet: 'A', noise: 71 } },
  { brand: 'Continental',  model: 'SportContact 7',           priceUah: 9_200, euLabel: { fuel: 'B', wet: 'A', noise: 72 } },
  { brand: 'Bridgestone',  model: 'Potenza Sport',            priceUah: 8_400, euLabel: { fuel: 'C', wet: 'A', noise: 72 } },
  { brand: 'Goodyear',     model: 'Eagle F1 Asymmetric 6',    priceUah: 8_100, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Pirelli',      model: 'P Zero (PZ4)',             priceUah: 9_650, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Hankook',      model: 'Ventus S1 Evo3',           priceUah: 6_500, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Yokohama',     model: 'Advan Sport V107',         priceUah: 7_300, euLabel: { fuel: 'C', wet: 'A', noise: 72 } },
  { brand: 'Nokian Tyres', model: 'PowerProof 1',             priceUah: 7_100, euLabel: { fuel: 'B', wet: 'A', noise: 71 } },
  { brand: 'Dunlop',       model: 'Sport Maxx RT2',           priceUah: 6_800, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Toyo',         model: 'Proxes Sport',             priceUah: 6_200, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Falken',       model: 'Azenis FK510',             priceUah: 5_650, euLabel: { fuel: 'C', wet: 'A', noise: 71 } },
  { brand: 'Kumho',        model: 'Ecsta PS71',               priceUah: 4_950, euLabel: { fuel: 'C', wet: 'B', noise: 72 } },
]

// Fixed tire dimensions used across all SKUs in this reference set.
const WIDTH = 245
const PROFILE = 40
const DIAMETER = 18
const LOAD_INDEX = 97
const SPEED_RATING = 'Y'

export const mockTires: MarketplaceProduct[] = TIRES.map((t, i) => {
  const idNumber = String(i + 1).padStart(2, '0')
  const sizeShort = `${WIDTH}/${PROFILE} R${DIAMETER}`
  const sizeFull = `${sizeShort} ${LOAD_INDEX}${SPEED_RATING} XL`
  return {
    id: `tire-${idNumber}`,
    categoryId: 'wheels',
    title: `${t.brand} ${t.model}`,
    subtitle: `${sizeFull} · Літо`,
    description:
      `Літня шина ${t.brand} ${t.model} у розмірі ${sizeShort}. ` +
      `Індекс навантаження ${LOAD_INDEX}, індекс швидкості ${SPEED_RATING} (до 300 км/год), посилена бокова стінка XL. ` +
      `Призначена для динамічної їзди на сухому та мокрому покритті, підходить для седанів і кросоверів середнього класу. ` +
      `Ціна вказана за одну шину; рекомендуємо замовляти комплектом із чотирьох.`,
    price: { value: t.priceUah, currency: 'UAH' },
    status: 'inStock',
    // Image left undefined on purpose — UI will render the 3:4 placeholder
    // tile with brand+size, matching the rest of the reference product.
    image: undefined,
    badges: ['Літня', 'XL', 'В наявності'],
    createdAt: '2026-05-18',
    attributes: [
      { key: 'subcategory', label: 'Тип',          value: 'tires',            type: 'select', filterable: true, visibleInCard: false, visibleInDetails: false, priority: 1 },
      { key: 'brand',       label: 'Бренд',        value: t.brand,            type: 'select', filterable: true, visibleInCard: true,  visibleInDetails: true,  priority: 2 },
      { key: 'model',       label: 'Модель',       value: t.model,            type: 'text',                       visibleInCard: true,  visibleInDetails: true,  priority: 3 },
      { key: 'season',      label: 'Сезон',        value: 'Літо',             type: 'select', filterable: true, visibleInCard: true,  visibleInDetails: true,  priority: 4 },
      { key: 'width',       label: 'Ширина',       value: WIDTH,              type: 'number', unit: 'мм', filterable: true, visibleInCard: false, visibleInDetails: true, priority: 5 },
      { key: 'profile',     label: 'Профіль',      value: PROFILE,            type: 'number', unit: '%',  filterable: true, visibleInCard: false, visibleInDetails: true, priority: 6 },
      { key: 'diameter',    label: 'Діаметр',      value: DIAMETER,           type: 'number', unit: '"',  filterable: true, visibleInCard: true,  visibleInDetails: true, priority: 7 },
      { key: 'loadIndex',   label: 'Індекс навант.', value: LOAD_INDEX,       type: 'number',             visibleInDetails: true, priority: 8 },
      { key: 'speedRating', label: 'Індекс швидк.', value: SPEED_RATING,      type: 'select',             visibleInDetails: true, priority: 9 },
      { key: 'reinforced',  label: 'Посилення',    value: 'XL',               type: 'select',             visibleInDetails: true, priority: 10 },
      { key: 'fuelClass',   label: 'Економія',     value: t.euLabel.fuel,     type: 'select',             visibleInDetails: true, priority: 11 },
      { key: 'wetClass',    label: 'Зчеплення (мокре)', value: t.euLabel.wet, type: 'select',             visibleInDetails: true, priority: 12 },
      { key: 'noise',       label: 'Шум',          value: t.euLabel.noise,    type: 'number', unit: 'дБ', visibleInDetails: true, priority: 13 },
      { key: 'origin',      label: 'Виробництво',  value: 'Європа',           type: 'select', filterable: true, visibleInDetails: true, priority: 14 },
    ],
  }
})
