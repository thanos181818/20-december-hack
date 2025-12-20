import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireCustomer?: boolean;
  allowAll?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireCustomer = false, allowAll = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? '/admin/login' : '/login'} replace />;
  }

  // Allow all authenticated users (used for pages like order-confirmation)
  if (allowAll) {
    return <>{children}</>;
  }

  // Admin trying to access admin routes - OK
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // Customer routes - if admin is logged in, redirect to admin dashboard
  if (requireCustomer && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // For non-admin protected routes (like dashboard, orders, etc.)
  // Redirect admin to admin dashboard if they try to access customer pages
  if (!requireAdmin && !requireCustomer && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

