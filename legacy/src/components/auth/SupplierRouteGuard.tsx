import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SupplierRouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: 'read' | 'write';
}

/**
 * Route guard component that protects supplier management routes
 * Only allows access to users with appropriate supplier permissions
 */
export const SupplierRouteGuard: React.FC<SupplierRouteGuardProps> = ({
  children,
  requiredPermission = 'read'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check supplier access permissions
  const hasSupplierAccess = checkSupplierPermission(user.role, requiredPermission);

  if (!hasSupplierAccess) {
    return <SupplierAccessDenied userRole={user.role} requiredPermission={requiredPermission} />;
  }

  return <>{children}</>;
};

/**
 * Check if user role has required supplier permission
 */
function checkSupplierPermission(
  userRole: 'franchisor' | 'franchisee' | 'admin' | 'user',
  requiredPermission: 'read' | 'write'
): boolean {
  const permissions = {
    franchisor: { read: true, write: true },
    admin: { read: true, write: false },
    franchisee: { read: false, write: false },
    user: { read: false, write: false }
  };

  const userPermissions = permissions[userRole];
  return requiredPermission === 'read' ? userPermissions.read : userPermissions.write;
}

/**
 * Component shown when user doesn't have supplier access
 */
const SupplierAccessDenied: React.FC<{
  userRole: string;
  requiredPermission: string;
}> = ({ userRole, requiredPermission }) => {
  const getErrorMessage = () => {
    switch (userRole) {
      case 'franchisee':
        return {
          title: 'Supplier Management Access Restricted',
          message: 'Franchisees cannot access supplier management functionality. This area is reserved for franchisors to maintain control over the supplier network. If you need supplier information or have supplier-related inquiries, please contact your franchisor.',
          suggestion: 'You can still place orders for approved products through the Order Management section.'
        };
      case 'user':
        return {
          title: 'Access Denied',
          message: 'Staff users do not have access to supplier management functionality. This area requires franchisor-level permissions.',
          suggestion: 'Contact your location manager or franchisor if you need supplier-related information.'
        };
      case 'admin':
        return {
          title: requiredPermission === 'write' ? 'Read-Only Access' : 'Access Denied',
          message: requiredPermission === 'write' 
            ? 'Administrators have read-only access to supplier information for support purposes. You cannot modify supplier data.'
            : 'Access denied to supplier information.',
          suggestion: 'Contact a franchisor if supplier modifications are needed.'
        };
      default:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access supplier management.',
          suggestion: 'Contact your system administrator for assistance.'
        };
    }
  };

  const { title, message, suggestion } = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
          
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm text-gray-600">
              {message}
            </AlertDescription>
          </Alert>

          {suggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Suggestion:</strong> {suggestion}
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            User Role: {userRole} | Required Permission: {requiredPermission}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook to check supplier permissions in components
 */
export const useSupplierPermissions = () => {
  const { user } = useAuth();

  const hasSupplierRead = user ? checkSupplierPermission(user.role, 'read') : false;
  const hasSupplierWrite = user ? checkSupplierPermission(user.role, 'write') : false;

  return {
    hasSupplierRead,
    hasSupplierWrite,
    canViewSuppliers: hasSupplierRead,
    canManageSuppliers: hasSupplierWrite,
    userRole: user?.role
  };
};

export default SupplierRouteGuard;
