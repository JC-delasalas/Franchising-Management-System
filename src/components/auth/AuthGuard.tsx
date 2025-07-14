
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, AuthUser } from '@/services/authService';
import { PageLoading } from '@/components/ui/loading';
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
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is logged in (e.g., login page)
  if (!requireAuth && user) {
    const dashboardRoute = user.accountType === 'franchisor' 
      ? '/franchisor-dashboard' 
      : '/franchisee-dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && user && user.accountType !== requiredRole) {
    const unauthorizedRoute = user.accountType === 'franchisor' 
      ? '/franchisor-dashboard' 
      : '/franchisee-dashboard';
    return <Navigate to={unauthorizedRoute} replace />;
  }

  // If session is not active (timed out)
  if (requireAuth && !sessionActive && user) {
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
