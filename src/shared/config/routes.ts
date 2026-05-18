export const ROUTES = {
  HOME: '/',
  MARKETPLACE: '/marketplace',
  CATALOG: '/catalog',
  CATALOG_CATEGORY: '/catalog/:categoryId',
  PRODUCT: '/products/:productId',
  FAVORITES: '/favorites',
  REQUEST: '/request',
  SEARCH: '/search',
  FILTERS: '/filters',
  PROFILE: '/profile',
  MENU: '/menu',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ARKANOID: '/arkanoid',
  AUTO: '/auto',
  AUTO_CAR: '/auto/:carId',
} as const

export function autoCarPath(id: string) {
  return `/auto/${encodeURIComponent(id)}`
}

export function catalogCategoryPath(categoryId: string) {
  return `/catalog/${categoryId}`
}

export function productPath(productId: string) {
  return `/products/${productId}`
}

export function requestPath(productId?: string) {
  if (productId) return `${ROUTES.REQUEST}/quote/${encodeURIComponent(productId)}`
  return ROUTES.REQUEST
}

export const REQUEST_PATHS = {
  HUB: ROUTES.REQUEST,
  CALLBACK: `${ROUTES.REQUEST}/callback`,
  INSTALLATION: `${ROUTES.REQUEST}/installation`,
  LOCATION: `${ROUTES.REQUEST}/location`,
  WARRANTY: `${ROUTES.REQUEST}/warranty`,
  QUOTE: `${ROUTES.REQUEST}/quote`,
  QUOTE_PRODUCT: `${ROUTES.REQUEST}/quote/:productId`,
  CUSTOM_STATION: `${ROUTES.REQUEST}/custom-station`,
  AUTOSERVICE: `${ROUTES.REQUEST}/autoservice`,
} as const

export function filtersPath(params?: { categoryId?: string; searchParams?: URLSearchParams }) {
  const sp = new URLSearchParams(params?.searchParams)
  if (params?.categoryId) sp.set('category', params.categoryId)
  const qs = sp.toString()
  return qs ? `${ROUTES.FILTERS}?${qs}` : ROUTES.FILTERS
}
