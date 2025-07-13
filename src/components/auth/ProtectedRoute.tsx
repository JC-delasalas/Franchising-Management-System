import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useDatabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  const { data: userWithRoles, isLoading: rolesLoading } = useUserRoles(
    user?.id || ''
  );

  // Show loading spinner while checking authentication
  if (loading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && userWithRoles?.data) {
    const hasRole = userWithRoles.data.roles.some(
      role => role.role_nm === requiredRole
    );
    
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission requirement
  if (requiredPermission && userWithRoles?.data) {
    const hasPermission = userWithRoles.data.roles.some(role =>
      role.permissions.some(permission => 
        permission.permission_nm === requiredPermission
      )
    );
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Higher-order component for easier usage
export const withAuth = (
  Component: React.ComponentType<any>,
  options?: {
    requiredPermission?: string;
    requiredRole?: string;
    fallbackPath?: string;
  }
) => {
  return (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user } = useAuth();
  const { data: userWithRoles } = useUserRoles(user?.id || '');

  const hasPermission = (permission: string): boolean => {
    if (!userWithRoles?.data) return false;
    
    return userWithRoles.data.roles.some(role =>
      role.permissions.some(p => p.permission_nm === permission)
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!userWithRoles?.data) return false;
    
    return userWithRoles.data.roles.some(role => role.role_nm === roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!userWithRoles?.data) return false;
    
    return userWithRoles.data.roles.some(role => 
      roleNames.includes(role.role_nm)
    );
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!userWithRoles?.data) return false;
    
    return userWithRoles.data.roles.some(role =>
      role.permissions.some(p => permissions.includes(p.permission_nm))
    );
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    roles: userWithRoles?.data?.roles || [],
    permissions: userWithRoles?.data?.roles.flatMap(role => role.permissions) || [],
    isLoading: !userWithRoles
  };
};
