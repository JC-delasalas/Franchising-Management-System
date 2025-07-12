
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
  redirectTo = '/login'
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
    // We'll need to get user profile to determine dashboard route
    return <Navigate to="/franchisee-dashboard" replace />;
  }

  // For role-based access, we'll need to check user profile data
  // This will be handled by individual dashboard components

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
