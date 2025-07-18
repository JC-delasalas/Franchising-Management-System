
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth, hasRole } from '@/hooks/useAuth';
import { PageLoading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useSessionManager } from '@/hooks/useSessionManager';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'franchisee' | 'franchisor';
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const { sessionActive } = useSessionManager();
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn('Auth loading timeout - forcing authentication check');
        setLoadingTimeout(true);
      }, 5000); // Reduced to 5 seconds since profile loading no longer blocks

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // Show loading only if still loading and not timed out
  if (isLoading && !loadingTimeout) {
    return <PageLoading message="Checking authentication..." />;
  }

  // If authentication is required but user is not logged in
  // Allow timeout case to proceed to avoid infinite loading
  if (requireAuth && !isAuthenticated && !loadingTimeout) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // SECURITY FIX: Never auto-redirect authenticated users from login page
  // Always require explicit user action to proceed to dashboard
  if (!requireAuth && isAuthenticated && !loadingTimeout) {
    // For login page, always show the login form - no auto-redirect
    if (location.pathname === '/login') {
      // Allow users to see login page even if authenticated
      // This prevents authentication bypass and allows manual account selection
      return <>{children}</>;
    }

    // For other guest-only pages (like signup), redirect to dashboard
    const dashboardRoute = role === 'franchisor'
      ? '/franchisor-dashboard'
      : '/franchisee-dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && user && !hasRole(role, requiredRole)) {
    const unauthorizedRoute = role === 'franchisor'
      ? '/franchisor-dashboard'
      : '/franchisee-dashboard';
    return <Navigate to={unauthorizedRoute} replace />;
  }

  // If session is not active (timed out)
  if (requireAuth && !sessionActive && isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const RequireAuth: React.FC<{ children: React.ReactNode; role?: 'franchisee' | 'franchisor' }> = ({ 
  children, 
  role 
}) => (
  <AuthGuard requireAuth={true} requiredRole={role}>
    {children}
  </AuthGuard>
);

export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth={false}>
    {children}
  </AuthGuard>
);
