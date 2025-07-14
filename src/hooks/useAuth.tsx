
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  signUp: (email: string, password: string, userData: SignupUserData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

        // Fetch user profile when signed in
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }

        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully:', session.user.email);
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          setUserProfile(null);
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

            if (session?.user) {
              await fetchUserProfile(session.user.id);
            }

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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createUserProfile = async (userId: string, userData: SignupUserData) => {
    try {
      console.log('Creating user profile for:', userId);

      // Create contact info if phone is provided
      let contactId = null;
      if (userData.phone) {
        const { data: contactData, error: contactError } = await supabase
          .from('contact_info')
          .insert({
            phone: userData.phone,
            email: userData.email || null
          })
          .select()
          .single();

        if (!contactError && contactData) {
          contactId = contactData.contact_id;
        }
      }

      // Find or create franchisor if account type is franchisor
      let franchisorId = null;
      if (userData.accountType === 'franchisor') {
        // Create address for franchisor if needed
        let addressId = null;
        if (userData.companyAddress) {
          const { data: addressData, error: addressError } = await supabase
            .from('address')
            .insert({
              street_address: userData.companyAddress.street || 'TBD',
              city: userData.companyAddress.city || 'TBD',
              state_province: userData.companyAddress.state,
              postal_code: userData.companyAddress.postal,
              country: userData.companyAddress.country || 'Philippines'
            })
            .select()
            .single();

          if (!addressError && addressData) {
            addressId = addressData.address_id;
          }
        }

        // Create franchisor
        const { data: franchData, error: franchError } = await supabase
          .from('franchisor')
          .insert({
            company_name: userData.companyName || `${userData.firstName} ${userData.lastName} Company`,
            legal_name: userData.companyName || `${userData.firstName} ${userData.lastName} Company`,
            address_id: addressId,
            contact_id: contactId,
            status: 'active'
          })
          .select()
          .single();

        if (!franchError && franchData) {
          franchisorId = franchData.franchisor_id;
        }
      } else {
        // For franchisees, assign to a default franchisor
        const { data: defaultFranchisor } = await supabase
          .from('franchisor')
          .select('franchisor_id')
          .eq('company_name', 'Demo Coffee Masters')
          .single();

        if (defaultFranchisor) {
          franchisorId = defaultFranchisor.franchisor_id;
        }
      }

      // Create user profile with normalized structure
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          account_type: userData.accountType,
          franchisor_id: franchisorId,
          contact_id: contactId,
          status: 'active'
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
      } else {
        console.log('User profile created successfully');
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

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

      // User profile will be created automatically by the database trigger
      if (data.user) {
        console.log('User created with ID:', data.user.id);
        console.log('Profile will be created automatically by trigger');
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

      // Clear user profile on signout
      setUserProfile(null);
      console.log('Signout successful');
      return { error: null };

    } catch (error) {
      console.error('Unexpected signout error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const value = {
    user,
    userProfile,
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
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
