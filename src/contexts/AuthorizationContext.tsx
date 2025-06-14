
import React, { createContext, useContext, useMemo } from 'react';
import { getCurrentUser } from '@/services/authService';
import { IAMUser, IAMPermission } from '@/services/iam/iamTypes';

interface AuthorizationContextType {
  currentUser: IAMUser | null;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
  canAccessIAM: boolean;
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

export const AuthorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authUser = getCurrentUser();
  
  // Mock IAM user data - in real implementation, this would come from IAM service
  const currentUser: IAMUser | null = useMemo(() => {
    if (!authUser) return null;
    
    return {
      id: authUser.id,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      roles: authUser.accountType === 'franchisor' ? [
        {
          id: 'admin-role',
          name: 'Administrator',
          description: 'Full system access',
          permissions: [
            { id: '1', name: 'iam.read', description: 'Read IAM', resource: 'iam', action: 'read' },
            { id: '2', name: 'iam.write', description: 'Write IAM', resource: 'iam', action: 'write' },
            { id: '3', name: 'iam.delete', description: 'Delete IAM', resource: 'iam', action: 'delete' },
            { id: '4', name: 'iam.admin', description: 'Admin IAM', resource: 'iam', action: 'admin' }
          ],
          isSystemRole: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] : [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [authUser]);

  const hasPermission = (resource: string, action: string): boolean => {
    if (!currentUser) return false;
    
    return currentUser.roles.some(role => 
      role.permissions.some(permission => 
        permission.resource === resource && permission.action === action
      )
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!currentUser) return false;
    return currentUser.roles.some(role => role.name === roleName);
  };

  const canAccessIAM = hasPermission('iam', 'read') || hasRole('Administrator');

  const value = {
    currentUser,
    hasPermission,
    hasRole,
    canAccessIAM
  };

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
};

export const useAuthorization = () => {
  const context = useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error('useAuthorization must be used within an AuthorizationProvider');
  }
  return context;
};
