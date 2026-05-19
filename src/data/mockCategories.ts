import type { MarketplaceCategory } from '../entities/category/model/category.types'

/**
 * Top-level categories. Each is a separate vertical with its own subcategories
 * (which are filterable in CatalogPage via the SubcategoryTabs strip).
 *
 * Subcategory IDs match EFPF API category slugs so the adapter can route
 * incoming products into the right subcategory without a lookup table.
 */
export const mockCategories: MarketplaceCategory[] = [
  {
    id: 'ev-charging',
    title: 'EV-зарядка',
    subtitle: 'Зарядні станції, кабелі, аксесуари',
    icon: 'charger',
    description: 'Мобільні зарядки, кабелі Type 2 та аксесуари для зарядки електромобілів',
    subcategories: [
      { id: 'mobile-charging-stations', title: 'Мобільні' },
      { id: 'cables', title: 'Кабелі' },
      { id: 'accessories', title: 'Аксесуари' },
    ],
  },
  {
    id: 'solar',
    title: 'Сонячна станція',
    subtitle: 'Панелі, інвертори, батареї',
    icon: 'panel',
    description: 'Сонячні панелі, гібридні інвертори, акумуляторні батареї та комплектуючі для автономної енергосистеми',
    subcategories: [
      { id: 'solar-panels', title: 'Панелі' },
      { id: 'hybrid-inverters', title: 'Інвертори' },
      { id: 'accumulator-batteries', title: 'Батареї' },
      { id: 'komplektuiuchi', title: 'Комплектуючі' },
    ],
  },
  {
    id: 'wheels',
    title: 'Колеса',
    subtitle: 'Шини, диски, кріплення',
    icon: 'wheel',
    description: 'Літні, зимові та всесезонні шини, литі та ковані диски, кріплення',
    subcategories: [
      { id: 'tires', title: 'Шини' },
      { id: 'disks', title: 'Диски' },
      { id: 'mounts', title: 'Кріплення' },
    ],
  },
  {
    id: 'cars',
    title: 'Авто',
    subtitle: 'Електро, гібриди',
    icon: 'car',
    description: 'Електромобілі та гібриди в наявності',
    subcategories: [
      { id: 'cars-electric', title: 'Електро' },
      { id: 'cars-hybrid',   title: 'Гібриди' },
    ],
  },
]
