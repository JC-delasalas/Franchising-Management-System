import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface SimpleRequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const SimpleRequireAuth: React.FC<SimpleRequireAuthProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useSimpleAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to registration if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && !allowedRoles.includes(user.account_type)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">
            Your account type: {user.account_type}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SimpleRequireAuth;
