
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoading } from '@/components/ui/loading';

interface SupabaseAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'franchisee' | 'franchisor';
  redirectTo?: string;
}

export const SupabaseAuthGuard: React.FC<SupabaseAuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/supabase-login'
}) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is logged in (e.g., login page)
  if (!requireAuth && user) {
    // Get account type from user metadata or default to franchisee
    const accountType = user.user_metadata?.account_type || user.user_metadata?.role || 'franchisee';
    const dashboardRoute = accountType === 'franchisor' 
      ? '/franchisor-dashboard' 
      : '/franchisee-dashboard';
    
    // Check if coming from a previous location
    const from = location.state?.from?.pathname;
    const redirectTo = from && from !== '/supabase-login' && from !== '/supabase-signup' 
      ? from 
      : dashboardRoute;
    
    return <Navigate to={redirectTo} replace />;
  }

  // For role-based access, check user metadata
  if (requiredRole && user) {
    const userRole = user.user_metadata?.account_type || user.user_metadata?.role;
    if (userRole !== requiredRole) {
      const unauthorizedRoute = userRole === 'franchisor' 
        ? '/franchisor-dashboard' 
        : '/franchisee-dashboard';
      return <Navigate to={unauthorizedRoute} replace />;
    }
  }

  return <>{children}</>;
};

export const RequireSupabaseAuth: React.FC<{ children: React.ReactNode; role?: 'franchisee' | 'franchisor' }> = ({ 
  children, 
  role 
}) => (
  <SupabaseAuthGuard requireAuth={true} requiredRole={role}>
    {children}
  </SupabaseAuthGuard>
);

export const GuestOnlySupabase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SupabaseAuthGuard requireAuth={false}>
    {children}
  </SupabaseAuthGuard>
);
