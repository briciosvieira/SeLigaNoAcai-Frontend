import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { UserRole } from '@/types/admin.types';

type ProtectedRouteProps = {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
};

export function ProtectedRoute({
  requireAuth = false,
  requireAdmin = false,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Clientes com mustChangePassword só podem acessar /alterar-senha
  if (
    requireAuth &&
    isAuthenticated &&
    user?.role === 'CUSTOMER' &&
    user?.mustChangePassword === true &&
    location.pathname !== '/alterar-senha'
  ) {
    return <Navigate to="/alterar-senha" replace />;
  }

  if (requireAdmin) {
    if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
    if (user?.role === 'CUSTOMER') return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
