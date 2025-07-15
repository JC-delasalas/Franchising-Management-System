
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

interface AuthorizationContextType {
  canAccessIAM: boolean;
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  refreshPermissions: () => void;
  reset: () => void;
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

export const AuthorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [canAccessIAM, setCanAccessIAM] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { error, retryCount, handleError, retry, reset } = useErrorRecovery({
    maxRetries: 3,
    retryDelay: 1000,
    onError: (err) => console.error('Authorization error:', err)
  });

  const checkPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !user) {
        setCanAccessIAM(false);
        setIsLoading(false);
        return;
      }

      // Check if user has IAM access (franchisor or admin)
      const hasIAMAccess = user.role === 'franchisor' || user.role === 'admin';
      setCanAccessIAM(hasIAMAccess);

      console.log('Permissions checked successfully', { user: user.email, hasIAMAccess });
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to check permissions'));
      setCanAccessIAM(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPermissions = () => {
    retry(checkPermissions);
  };

  useEffect(() => {
    if (!authLoading) {
      checkPermissions();
    }
  }, [authLoading, isAuthenticated, user]);

  // Auto-retry on transient errors
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log('Auto-retrying permission check...');
        refreshPermissions();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  const value = {
    canAccessIAM,
    isLoading: isLoading || authLoading,
    error,
    retryCount,
    refreshPermissions,
    retry,
    reset
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
