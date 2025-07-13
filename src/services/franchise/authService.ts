import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type Franchisor = Database['public']['Tables']['franchisor']['Row'];
type FranchisorInsert = Database['public']['Tables']['franchisor']['Insert'];

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  accountType: 'franchisee' | 'franchisor';
  companyName?: string;
  brandName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  error?: any;
}

/**
 * Enhanced authentication service for franchise management system
 * Supports multi-tenant architecture with proper user onboarding
 */
export class FranchiseAuthService {
  
  /**
   * Sign up a new user with proper franchise context
   */
  static async signUp(data: SignupData): Promise<AuthResponse> {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            account_type: data.accountType,
            company_name: data.companyName,
            brand_name: data.brandName,
          }
        }
      });

      if (authError) {
        return {
          success: false,
          message: authError.message,
          error: authError
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Failed to create user account'
        };
      }

      // Step 2: Create franchisor if account type is franchisor
      let franchisorId: string | null = null;
      
      if (data.accountType === 'franchisor') {
        const franchisorData: FranchisorInsert = {
          company_nm: data.companyName || `${data.firstName} ${data.lastName} Franchise`,
          legal_nm: data.companyName,
          contact_email: data.email,
          phone_no: data.phone,
          status: 'pending', // Requires approval
          metadata: {
            account_type: 'franchisor',
            signup_date: new Date().toISOString(),
            onboarding_step: 'company_setup'
          },
          preferences: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency: 'USD',
            notifications: {
              email: true,
              sms: false
            }
          }
        };

        const { data: franchisorResult, error: franchisorError } = await supabase
          .from('franchisor')
          .insert(franchisorData)
          .select()
          .single();

        if (franchisorError) {
          console.error('Failed to create franchisor:', franchisorError);
          // Continue with user creation but log the error
        } else {
          franchisorId = franchisorResult.franchisor_id;
        }
      }

      // Step 3: Create user profile
      const userProfileData: UserProfileInsert = {
        user_id: authData.user.id,
        franchisor_id: franchisorId || await this.getDefaultFranchisorId(),
        first_nm: data.firstName,
        last_nm: data.lastName,
        phone_no: data.phone,
        status: 'pending',
        metadata: {
          account_type: data.accountType,
          signup_date: new Date().toISOString(),
          onboarding_step: data.accountType === 'franchisor' ? 'company_setup' : 'profile_setup'
        },
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          dashboard_layout: 'default'
        }
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(userProfileData);

      if (profileError) {
        console.error('Failed to create user profile:', profileError);
        return {
          success: false,
          message: 'Failed to create user profile',
          error: profileError
        };
      }

      return {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        user: authData.user
      };

    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during signup',
        error
      };
    }
  }

  /**
   * Sign in user with enhanced error handling
   */
  static async signIn(data: LoginData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        return {
          success: false,
          message: this.getAuthErrorMessage(authError.message),
          error: authError
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Login failed'
        };
      }

      // Get user profile for additional context
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          franchisor:franchisor_id (
            company_nm,
            status
          )
        `)
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Failed to fetch user profile:', profileError);
      }

      return {
        success: true,
        message: 'Login successful!',
        user: {
          ...authData.user,
          profile
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during login',
        error
      };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          message: error.message,
          error
        };
      }

      return {
        success: true,
        message: 'Signed out successfully'
      };

    } catch (error) {
      console.error('Signout error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during signout',
        error
      };
    }
  }

  /**
   * Get current user with profile information
   */
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select(`
          *,
          franchisor:franchisor_id (
            company_nm,
            status
          )
        `)
        .eq('user_id', user.id)
        .single();

      return {
        ...user,
        profile
      };

    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: error.message,
          error
        };
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        data
      };

    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error
      };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          success: false,
          message: error.message,
          error
        };
      }

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };

    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error
      };
    }
  }

  /**
   * Get default franchisor ID for demo purposes
   */
  private static async getDefaultFranchisorId(): Promise<string> {
    const { data } = await supabase
      .from('franchisor')
      .select('franchisor_id')
      .limit(1)
      .single();
    
    return data?.franchisor_id || crypto.randomUUID();
  }

  /**
   * Convert auth error messages to user-friendly messages
   */
  private static getAuthErrorMessage(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please verify your email address before logging in. Check your inbox for the verification link.',
      'Too many requests': 'Too many login attempts. Please wait a few minutes before trying again.',
      'User not found': 'No account found with this email address.',
      'Weak password': 'Password is too weak. Please choose a stronger password.',
      'Email already registered': 'An account with this email already exists. Please try logging in instead.'
    };

    return errorMap[errorMessage] || errorMessage;
  }
}

export default FranchiseAuthService;
