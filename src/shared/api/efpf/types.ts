export type EfpfPrice = {
  regular: string | null
  sale: string | null
  current: string | null
  currency: string
  on_sale: boolean
}

export type EfpfStock = {
  status: 'instock' | 'outofstock' | 'onbackorder' | string
  quantity: number | null
  manage: boolean
  backorders: string
  in_stock: boolean
}

export type EfpfCategory = {
  id: number
  name: string
  slug: string
  parent: number
}

export type EfpfAttributeOption = {
  slug: string
  name: string
}

export type EfpfAttribute = {
  key: string
  name: string
  taxonomy: string | null
  visible: boolean
  variation: boolean
  options: EfpfAttributeOption[]
}

export type EfpfImage = {
  id: number
  full: string
  medium: string
  thumbnail: string
}

export type EfpfImages = {
  main: EfpfImage | null
  gallery: EfpfImage[]
}

export type EfpfProduct = {
  id: number
  store_id: string
  type: 'simple' | 'variable' | string
  parent_id: number
  sku: string
  status: string
  name: string
  slug: string
  permalink: string
  language: string
  description: string
  short_description: string
  price: EfpfPrice
  stock: EfpfStock
  weight: string | null
  dimensions: { length: string; width: string; height: string }
  categories: EfpfCategory[]
  tags: Array<{ id: number; name: string; slug: string }>
  attributes: EfpfAttribute[]
  images: EfpfImages
  meta: Record<string, unknown>
  created_at: string
  modified_at: string
}

export type EfpfListResponse = {
  ok: boolean
  store_id: string
  generated_at: string
  lang: string
  page: number
  per_page: number
  total: number
  pages: number
  count: number
  items: EfpfProduct[]
}
