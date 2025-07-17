
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
        console.warn('Auth loading timeout - this may indicate a profile loading issue');
        setLoadingTimeout(true);
      }, 8000); // Increased to 8 seconds to allow for profile loading

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

  // If authentication is not required but user is logged in (e.g., login page)
  // Only redirect if we're sure the user is authenticated (not during timeout)
  // SECURITY FIX: Don't auto-redirect from login page - let users explicitly choose to go to dashboard
  if (!requireAuth && isAuthenticated && !loadingTimeout) {
    // Check if we're on the login page specifically
    if (location.pathname === '/login') {
      // Show a notice that user is already logged in, but don't force redirect
      // This allows users to explicitly log out or choose to go to dashboard
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Already Logged In</h2>
              <p className="text-gray-600 mb-6">
                You are currently logged in as <strong>{user?.email}</strong> ({role}).
              </p>
              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full"
                >
                  <Link to={role === 'franchisor' ? '/franchisor-dashboard' : '/franchisee-dashboard'}>
                    Go to Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                >
                  Sign Out & Login as Different User
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
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
