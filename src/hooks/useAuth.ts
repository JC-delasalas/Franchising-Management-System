import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthenticationError, handleAuthError, logError } from '@/lib/errors'

interface AuthState {
  user: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  role: string | null
  permissions: Record<string, any>
}

// Get user profile from database
const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

// Create or update user profile when user signs up/in with enhanced security
const upsertUserProfile = async (user: User): Promise<UserProfile> => {
  try {
    // First check if profile already exists
    const existingProfile = await getUserProfile(user.id);

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      avatar_url: user.user_metadata?.avatar_url,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Set default role if not exists, preserve existing role
      role: existingProfile?.role || user.user_metadata?.role || 'franchisee',
      status: existingProfile?.status || 'active'
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user profile:', error);

      // Provide more specific error handling
      if (error.code === 'PGRST116') {
        throw new AuthenticationError('Profile not found and could not be created', 'PROFILE_CREATION_FAILED', undefined, true);
      } else if (error.code === '42501') {
        throw new AuthenticationError('Insufficient permissions to create profile', 'INSUFFICIENT_PERMISSIONS', undefined, true);
      } else {
        throw new AuthenticationError('Unable to create or update user profile', 'PROFILE_CREATION_FAILED', undefined, false);
      }
    }

    return data
  } catch (error) {
    console.error('Profile upsert failed:', error);

    // Only force sign out for critical errors, not temporary issues
    if (error instanceof AuthenticationError && error.shouldSignOut) {
      console.warn('Critical profile error - signing out user');
      await supabase.auth.signOut();
    }

    throw error;
  }
}

export const useAuth = (): AuthState => {
  const [session, setSession] = useState<Session | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  // Fetch user profile data with optimized error handling
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['user-profile', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;

      try {
        const profile = await getUserProfile(authUser.id);
        if (!profile) {
          // If profile doesn't exist, try to create it
          console.log('Profile not found, attempting to create...');
          return await upsertUserProfile(authUser);
        }
        return profile;
      } catch (error) {
        console.error('Profile query failed:', error);
        // Return null instead of throwing to prevent blocking authentication
        return null;
      }
    },
    enabled: !!authUser?.id && !!session, // Only load profile when session is established
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Limit retries to prevent infinite loading
      return failureCount < 1;
    },
    retryDelay: 2000, // 2 second delay
    gcTime: 10 * 1000,
    // Run in background, don't block UI
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthUser(session?.user ?? null)
      setIsLoading(false)

      // Create/update user profile if user exists
      if (session?.user) {
        upsertUserProfile(session.user).catch(console.error)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setAuthUser(session?.user ?? null)
      setIsLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Create/update user profile on sign in
        try {
          await upsertUserProfile(session.user)
          // Invalidate user profile query to refetch
          queryClient.invalidateQueries({ queryKey: ['user-profile', session.user.id] })
        } catch (error) {
          console.error('Error updating user profile:', error)
        }
      }

      if (event === 'SIGNED_OUT') {
        // Clear user profile cache
        queryClient.removeQueries({ queryKey: ['user-profile'] })
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  // SECURITY: Authentication based on session, profile loading doesn't block auth
  // This prevents infinite loading while maintaining security
  const hasValidSession = !!session && !!authUser;
  const isValidAuthentication = hasValidSession; // Session is sufficient for authentication

  // Handle profile loading errors securely but don't block authentication
  if (authUser && profileError && !profileLoading) {
    const authError = handleAuthError(profileError);
    logError(authError, {
      userId: authUser.id,
      context: 'profile_loading_failed'
    });

    // Only force sign out for critical authentication errors, not profile issues
    if (authError.shouldSignOut && authError.code !== 'PROFILE_NOT_FOUND') {
      console.warn('Critical auth error - signing out user for security');
      supabase.auth.signOut();
    }
  }

  // Optimize loading state - don't block on profile loading
  const authLoadingComplete = !isLoading && hasValidSession;
  const shouldStopLoading = authLoadingComplete || profileError;

  return {
    user: userProfile, // Return profile if available, null if not
    session,
    isAuthenticated: isValidAuthentication,
    isLoading: isLoading && !authLoadingComplete, // Only show loading for session, not profile
    role: userProfile?.role || 'franchisee', // Default role if profile unavailable
    permissions: userProfile?.metadata?.permissions || {}
  }
}

// Auth helper functions with enhanced error handling
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const authError = handleAuthError(error);
      logError(authError, { context: 'sign_in_attempt' });
      throw authError;
    }

    return data
  } catch (error) {
    // Re-throw our custom errors, or wrap unexpected errors
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during sign in.')
  }
}

export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      // Provide user-friendly error messages for signup
      switch (error.message) {
        case 'User already registered':
          throw new Error('An account with this email already exists. Please sign in instead.')
        case 'Password should be at least 6 characters':
          throw new Error('Password must be at least 6 characters long.')
        case 'Signup is disabled':
          throw new Error('New account registration is currently disabled. Please contact support.')
        default:
          console.error('Sign up error:', error)
          throw new Error('Unable to create account at this time. Please try again later.')
      }
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during account creation.')
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      throw new Error('Unable to sign out properly. Please clear your browser data if the issue persists.')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during sign out.')
  }
}

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      switch (error.message) {
        case 'For security purposes, you can only request this once every 60 seconds':
          throw new Error('Password reset email was already sent. Please wait 60 seconds before requesting another.')
        default:
          console.error('Password reset error:', error)
          throw new Error('Unable to send password reset email. Please try again later.')
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred while requesting password reset.')
  }
}

// Update user profile with enhanced error handling
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('You must be signed in to update your profile.')
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      switch (error.code) {
        case 'PGRST116':
          throw new Error('Profile not found. Please contact support.')
        case '23505':
          throw new Error('This information is already in use by another account.')
        default:
          throw new Error('Unable to update profile. Please try again later.')
      }
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred while updating your profile.')
  }
}

// Check if user has specific role
export const hasRole = (userRole: string | null, requiredRole: string | string[]): boolean => {
  if (!userRole) return false
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  
  return userRole === requiredRole
}

// Check if user has specific permission
export const hasPermission = (permissions: Record<string, any>, permission: string): boolean => {
  return permissions[permission] === true
}

// Role hierarchy for permission checking
const roleHierarchy = {
  'admin': ['admin', 'franchisor', 'franchisee', 'user'],
  'franchisor': ['franchisor', 'franchisee', 'user'],
  'franchisee': ['franchisee', 'user'],
  'user': ['user']
}

export const hasRoleOrHigher = (userRole: string | null, requiredRole: string): boolean => {
  if (!userRole) return false
  
  const allowedRoles = roleHierarchy[userRole as keyof typeof roleHierarchy] || []
  return allowedRoles.includes(requiredRole)
}
