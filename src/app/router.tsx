import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import { CustomerErrorPage } from '@/pages/CustomerErrorPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { HomePage } from '@/features/catalog/pages/HomePage';
import { LocationPage } from '@/features/location/pages/LocationPage';
import { CartPage } from '@/features/cart/pages/CartPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { LoyaltyPage } from '@/features/loyalty/pages/LoyaltyPage';

import { AdminDashboardPage } from '@/features/admin/dashboard/pages/AdminDashboardPage';
import { AdminOrdersPage } from '@/features/admin/orders/pages/AdminOrdersPage';
import { AdminCustomersPage } from '@/features/admin/customers/pages/AdminCustomersPage';
import { AdminUsersPage } from '@/features/admin/users/pages/AdminUsersPage';
import { AdminBannersPage } from '@/features/admin/banners/pages/AdminBannersPage';
import { AdminProductsPage } from '@/features/admin/products/pages/AdminProductsPage';
import { AdminOptionsPage } from '@/features/admin/options/pages/AdminOptionsPage';
import { AdminStorePage } from '@/features/admin/store/pages/AdminStorePage';
import { AdminDeliveryZonesPage } from '@/features/admin/delivery-zones/pages/AdminDeliveryZonesPage';
import { AdminPromotionsPage } from '@/features/admin/promotions/pages/AdminPromotionsPage';
import { AdminLoyaltyPage } from '@/features/admin/loyalty/pages/AdminLoyaltyPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },

      /* Rotas do cliente */
      {
        element: <CustomerLayout />,
        errorElement: <CustomerErrorPage />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/search', element: <HomePage /> },
          { path: '/location', element: <LocationPage /> },
          { path: '/cart', element: <CartPage /> },

          /* Rotas que exigem login */
          {
            element: <ProtectedRoute requireAuth redirectTo="/login" />,
            children: [
              { path: '/orders', element: <OrdersPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/loyalty', element: <LoyaltyPage /> },
            ],
          },
        ],
      },

      /* Rotas admin — exige ADMIN ou STAFF */
      {
        element: <ProtectedRoute requireAdmin redirectTo="/login" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/admin', element: <AdminDashboardPage /> },
              { path: '/admin/orders', element: <AdminOrdersPage /> },
              { path: '/admin/banners', element: <AdminBannersPage /> },
              {
                element: <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />,
                children: [
                  { path: '/admin/customers', element: <AdminCustomersPage /> },
                  { path: '/admin/products', element: <AdminProductsPage /> },
                  { path: '/admin/options', element: <AdminOptionsPage /> },
                  { path: '/admin/store', element: <AdminStorePage /> },
                  { path: '/admin/delivery-zones', element: <AdminDeliveryZonesPage /> },
                  { path: '/admin/promotions', element: <AdminPromotionsPage /> },
                  { path: '/admin/loyalty', element: <AdminLoyaltyPage /> },
                ],
              },
              {
                element: <ProtectedRoute allowedRoles={['ADMIN']} />,
                children: [
                  { path: '/admin/users', element: <AdminUsersPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
