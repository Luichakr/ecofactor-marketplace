export type Seller = {
  id: string
  name: string
  /** Lifetime aggregate. */
  rating: number
  reviewsCount: number
  /** ISO date — used to compute "X років на ринку". */
  joinedAt: string
  productsCount: number
  verified: boolean
  description?: string
}

export const PLATFORM_SELLER_ID = 'ecofactor-store'

export const mockSellers: Seller[] = [
  {
    id: PLATFORM_SELLER_ID,
    name: 'ECOFACTOR Store',
    rating: 4.9,
    reviewsCount: 1247,
    joinedAt: '2019-04-12',
    productsCount: 412,
    verified: true,
    description:
      'Офіційний дистриб’ютор. Гарантія виробника, доставка по всій Україні, повернення 14 днів.',
  },
  {
    id: 'tire-pro',
    name: 'TirePro Київ',
    rating: 4.6,
    reviewsCount: 318,
    joinedAt: '2021-09-01',
    productsCount: 89,
    verified: true,
    description: 'Магазин шин і дисків. Безкоштовний шиномонтаж при замовленні комплекта.',
  },
]

export function getSeller(id?: string): Seller {
  if (!id) return mockSellers[0]
  return mockSellers.find((s) => s.id === id) ?? mockSellers[0]
}
