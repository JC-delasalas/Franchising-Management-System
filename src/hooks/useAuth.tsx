
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, userData: SignupUserData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

interface SignupUserData {
  firstName: string;
  lastName: string;
  phone?: string;
  accountType: 'franchisee' | 'franchisor';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully:', session.user.email);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
        }

        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed for:', session.user?.email);
        }

        if (event === 'USER_UPDATED' && session) {
          console.log('User updated:', session.user?.email);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'No session');
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: SignupUserData) => {
    try {
      console.log('Attempting signup for:', email);
      
      // Use the current site URL for redirect
      const redirectUrl = `${window.location.origin}/supabase-login?message=account-created`;
      
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            account_type: userData.accountType,
            role: userData.accountType,
            franchisor_id: crypto.randomUUID() // Generate a franchisor ID for demo purposes
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      console.log('Signup successful:', data);
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('Email confirmation required for:', email);
      }
      
      return { error: null };
      
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting signin for:', email);
      
      // Demo bypass for testing
      if ((email === 'demo@franchisee.com' || email === 'demo@franchisor.com') && password === 'demo123') {
        console.log('Demo login bypass activated for:', email);
        
        // Create a mock session for demo purposes
        const mockUser = {
          id: email === 'demo@franchisee.com' ? 'demo-franchisee-id' : 'demo-franchisor-id',
          email: email,
          user_metadata: {
            first_name: 'Demo',
            last_name: email === 'demo@franchisee.com' ? 'Franchisee' : 'Franchisor',
            account_type: email === 'demo@franchisee.com' ? 'franchisee' : 'franchisor'
          }
        } as any;
        
        const mockSession = {
          user: mockUser,
          access_token: 'demo-token',
          refresh_token: 'demo-refresh-token'
        } as any;
        
        // Set the demo session
        setUser(mockUser);
        setSession(mockSession);
        
        console.log('Demo login successful for:', email);
        return { error: null };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Signin error:', error);
        
        // Provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: { ...error, message: 'Invalid email or password. Please check your credentials.' } };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { ...error, message: 'Please verify your email address before signing in.' } };
        } else if (error.message.includes('User not found')) {
          return { error: { ...error, message: 'No account found with this email address.' } };
        }
        
        return { error };
      }

      console.log('Signin successful:', data.user?.email);
      return { error: null };
      
    } catch (error) {
      console.error('Unexpected signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user:', user?.email);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        return { error };
      }

      console.log('Signout successful');
      return { error: null };
      
    } catch (error) {
      console.error('Unexpected signout error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
