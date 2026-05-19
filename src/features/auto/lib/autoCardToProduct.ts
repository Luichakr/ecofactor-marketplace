import type { AutoCard } from '../api/lubeavtoApi'
import type { MarketplaceProduct, ProductAttribute } from '../../../entities/product/model/product.types'

/** Convert a Lubeavto `AutoCard` to a universal `MarketplaceProduct` so the
 *  car listing flows through the same CatalogPage / ProductCard / facet
 *  pipeline as zarjadki / sonce / kolesa. Attributes are emitted with
 *  `filterable: true` for the keys we want to surface in the facet sheet
 *  (make / year / price / mileage / transmission / drive / bodyType). */
export function autoCardToProduct(car: AutoCard): MarketplaceProduct {
  const subcategory = car.isHybrid ? 'cars-hybrid' : 'cars-electric'

  const attributes: ProductAttribute[] = [
    { key: 'subcategory', label: 'Тип',    value: subcategory, type: 'select', filterable: true, visibleInCard: false, visibleInDetails: false, priority: 1 },
    { key: 'brand',       label: 'Марка',  value: car.make,    type: 'select', filterable: true, visibleInCard: true,  visibleInDetails: true,  priority: 2 },
    { key: 'model',       label: 'Модель', value: car.model,   type: 'text',                       visibleInCard: true,  visibleInDetails: true,  priority: 3 },
    { key: 'year',        label: 'Рік',    value: car.year,    type: 'number', filterable: true, visibleInCard: true,  visibleInDetails: true,  priority: 4 },
    { key: 'mileage',     label: 'Пробіг', value: car.mileageKm, type: 'number', unit: 'км', filterable: true, visibleInCard: true, visibleInDetails: true, priority: 5 },
    { key: 'price',       label: 'Ціна',   value: car.priceUsd, type: 'number', unit: '$', filterable: true, visibleInDetails: false, priority: 6 },
    { key: 'transmission',label: 'КПП',    value: car.transmission || 'Невідомо', type: 'select', filterable: true, visibleInDetails: true, priority: 7 },
    { key: 'drive',       label: 'Привід', value: car.drive || 'Невідомо',        type: 'select', filterable: true, visibleInDetails: true, priority: 8 },
    { key: 'bodyType',    label: 'Кузов',  value: car.bodyType || 'Невідомо',     type: 'select', filterable: true, visibleInDetails: true, priority: 9 },
    { key: 'fuel',        label: 'Тип',    value: car.isHybrid ? 'Гібрид' : 'Електро', type: 'select', filterable: true, visibleInDetails: true, priority: 10 },
    { key: 'color',       label: 'Колір',  value: car.color || 'Невідомо',        type: 'select', filterable: true, visibleInDetails: true, priority: 11 },
    { key: 'location',    label: 'Місто',  value: car.location || car.country || 'Невідомо', type: 'select', filterable: true, visibleInCard: true, visibleInDetails: true, priority: 12 },
  ]

  return {
    id: car.id,
    categoryId: 'cars',
    title: car.title,
    subtitle: `${car.year} · ${car.mileageLabel}`,
    description: car.description,
    price: { value: car.priceUsd, currency: 'USD', label: car.priceLabel },
    status: car.isSold ? 'service' : car.isAvailable ? 'inStock' : 'available',
    image: car.image,
    gallery: car.images,
    badges: [
      car.isHybrid ? 'Гібрид' : 'Електро',
      ...(car.isDamaged ? ['Пошкодж.'] : []),
    ],
    attributes,
    createdAt: car.publishDate,
    sellerId: 'ecofactor-store',
  }
}
