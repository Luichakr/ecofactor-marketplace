import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { trackPageView } from '../shared/lib/analytics/analytics'
import { ROUTES } from '../shared/config/routes'
import { MarketplaceHomePage } from '../pages/marketplace/MarketplaceHomePage'
import { CatalogPage } from '../pages/catalog/CatalogPage'
import { ProductPage } from '../pages/product/ProductPage'
import { FavoritesPage } from '../pages/favorites/FavoritesPage'
import { RequestHubPage } from '../pages/request/RequestHubPage'
import { QuoteRequestPage } from '../pages/request/QuoteRequestPage'
import { CallbackForm } from '../features/request/forms/CallbackForm'
import { InstallationForm } from '../features/request/forms/InstallationForm'
import { LocationForm } from '../features/request/forms/LocationForm'
import { WarrantyForm } from '../features/request/forms/WarrantyForm'
import { CustomStationForm } from '../features/request/forms/CustomStationForm'
import { AutoserviceForm } from '../features/request/forms/AutoserviceForm'
import { CartPage } from '../pages/cart/CartPage'
import { CheckoutPage } from '../pages/checkout/CheckoutPage'
import { SearchPage } from '../pages/search/SearchPage'
import { FiltersPage } from '../pages/filters/FiltersPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { MenuPage } from '../pages/menu/MenuPage'
import { ArkanoidPage } from '../pages/arkanoid/ArkanoidPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'
import { OrdersPage } from '../pages/orders/OrdersPage'
import { OrderDetailPage } from '../pages/orders/OrderDetailPage'
import { AddressesPage } from '../pages/profile/AddressesPage'
import { CardsPage } from '../pages/profile/CardsPage'
import { SettingsPage } from '../pages/profile/SettingsPage'
import { ReturnFormPage } from '../pages/orders/ReturnFormPage'
import { WishlistSharedPage } from '../pages/favorites/WishlistSharedPage'

function PageViewTracker() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    trackPageView(pathname + search)
  }, [pathname, search])
  return null
}

export function AppRouter() {
  return (
    <>
    <PageViewTracker />
    <Routes>
      {/* Redirect root to marketplace */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.MARKETPLACE} replace />} />

      {/* Layout with bottom nav */}
      <Route element={<AppLayout />}>
        <Route path={ROUTES.MARKETPLACE} element={<MarketplaceHomePage />} />
        <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
        <Route path={ROUTES.CATALOG_CATEGORY} element={<CatalogPage />} />
        <Route path={ROUTES.PRODUCT} element={<ProductPage />} />
        <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
        <Route path={ROUTES.REQUEST} element={<RequestHubPage />} />
        <Route path={`${ROUTES.REQUEST}/callback`} element={<CallbackForm />} />
        <Route path={`${ROUTES.REQUEST}/installation`} element={<InstallationForm />} />
        <Route path={`${ROUTES.REQUEST}/location`} element={<LocationForm />} />
        <Route path={`${ROUTES.REQUEST}/warranty`} element={<WarrantyForm />} />
        <Route path={`${ROUTES.REQUEST}/quote`} element={<QuoteRequestPage />} />
        <Route path={`${ROUTES.REQUEST}/quote/:productId`} element={<QuoteRequestPage />} />
        <Route path={`${ROUTES.REQUEST}/custom-station`} element={<CustomStationForm />} />
        <Route path={`${ROUTES.REQUEST}/autoservice`} element={<AutoserviceForm />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.FILTERS} element={<FiltersPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
        <Route path={ROUTES.ORDER_DETAIL} element={<OrderDetailPage />} />
        <Route path={ROUTES.ADDRESSES} element={<AddressesPage />} />
        <Route path={ROUTES.PAYMENT_METHODS} element={<CardsPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.RETURN_OPEN} element={<ReturnFormPage />} />
        <Route path={ROUTES.WISHLIST_SHARED} element={<WishlistSharedPage />} />
        <Route path={ROUTES.MENU} element={<MenuPage />} />
        <Route path={ROUTES.CART} element={<CartPage />} />
        <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
        <Route path={ROUTES.ARKANOID} element={<ArkanoidPage />} />
        {/* Auto vertical migrated into the universal catalog. Old links
            (/auto, /auto/:carId) redirect into /catalog/cars and
            /product/:productId so previously-shared URLs still resolve. */}
        <Route path={ROUTES.AUTO} element={<Navigate to="/catalog/cars" replace />} />
        <Route path={ROUTES.AUTO_CAR} element={<AutoCarRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  )
}

import { useParams } from 'react-router-dom'
import { productPath } from '../shared/config/routes'

/** Old /auto/:carId URLs map 1:1 to /product/:productId since the lubeavto
 *  card id became the universal product id. */
function AutoCarRedirect() {
  const { carId } = useParams<{ carId: string }>()
  return <Navigate to={carId ? productPath(carId) : '/catalog/cars'} replace />
}
