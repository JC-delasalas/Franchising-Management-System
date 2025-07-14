import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  status: string;
}

interface SimpleAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedSession = localStorage.getItem('franchise_user_session');
    if (storedSession) {
      try {
        const userData = JSON.parse(storedSession);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('franchise_user_session');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('franchise_user_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('franchise_user_session');
    // Redirect to registration page after logout
    window.location.href = '/register';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
