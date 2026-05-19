import type { MarketplaceCategoryId } from '../entities/category/model/category.types'

export type City = {
  ref: string
  name: string
  /** Days from order placement until arrival at the Nova Poshta branch. */
  days: number
  /** Base parcel rate (UAH). Modified per category weight class below. */
  basePrice: number
}

/** Top UA cities — enough to cover most browsing. */
export const CITIES: City[] = [
  { ref: 'kiev', name: 'Київ', days: 1, basePrice: 79 },
  { ref: 'kharkiv', name: 'Харків', days: 2, basePrice: 89 },
  { ref: 'odesa', name: 'Одеса', days: 2, basePrice: 89 },
  { ref: 'dnipro', name: 'Дніпро', days: 2, basePrice: 89 },
  { ref: 'lviv', name: 'Львів', days: 2, basePrice: 99 },
  { ref: 'zaporizhia', name: 'Запоріжжя', days: 3, basePrice: 99 },
  { ref: 'vinnytsia', name: 'Вінниця', days: 2, basePrice: 89 },
  { ref: 'poltava', name: 'Полтава', days: 2, basePrice: 89 },
  { ref: 'mykolaiv', name: 'Миколаїв', days: 3, basePrice: 99 },
  { ref: 'cherkasy', name: 'Черкаси', days: 2, basePrice: 89 },
  { ref: 'chernivtsi', name: 'Чернівці', days: 3, basePrice: 109 },
  { ref: 'rivne', name: 'Рівне', days: 3, basePrice: 99 },
  { ref: 'ternopil', name: 'Тернопіль', days: 3, basePrice: 99 },
  { ref: 'uzhhorod', name: 'Ужгород', days: 4, basePrice: 119 },
  { ref: 'lutsk', name: 'Луцьк', days: 3, basePrice: 99 },
]

/** Per-category surcharge multipliers. Tires/charging stations are bulky. */
const CATEGORY_MULTIPLIER: Partial<Record<MarketplaceCategoryId, number>> = {
  wheels: 2.4,
  'ev-charging': 1.6,
  solar: 2.8,
  cars: 0,
}

export type DeliveryEstimate = {
  city: City
  price: number | null
  days: number
}

/** Returns expected delivery cost/time for a category to a given city. */
export function estimateDelivery(
  cityRef: string,
  categoryId?: MarketplaceCategoryId,
): DeliveryEstimate | null {
  const city = CITIES.find((c) => c.ref === cityRef)
  if (!city) return null
  const m = categoryId ? CATEGORY_MULTIPLIER[categoryId] ?? 1 : 1
  // Cars: ind. transport — show as "узгоджується".
  if (m === 0) return { city, price: null, days: city.days + 5 }
  return { city, price: Math.round(city.basePrice * m), days: city.days }
}

const STORAGE_KEY = 'mp:deliveryCity'

export function getStoredCity(): string {
  if (typeof window === 'undefined') return CITIES[0].ref
  return window.localStorage.getItem(STORAGE_KEY) || CITIES[0].ref
}

export function setStoredCity(ref: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, ref)
  } catch {}
}
