import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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

// Create or update user profile when user signs up/in
const upsertUserProfile = async (user: User): Promise<UserProfile> => {
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

    // If it's a 403 error, try a simple update instead
    if (error.code === '42501' || error.message.includes('403')) {
      console.log('Attempting profile update instead of upsert...');
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update also failed:', updateError);
        throw updateError;
      }

      return updateData;
    }

    throw error
  }

  return data
}

export const useAuth = (): AuthState => {
  const [session, setSession] = useState<Session | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  // Fetch user profile data with error handling
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['user-profile', authUser?.id],
    queryFn: () => getUserProfile(authUser!.id),
    enabled: !!authUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Only retry twice
    retryDelay: 1000, // 1 second delay
    // Don't hang forever - timeout after 10 seconds
    gcTime: 10 * 1000,
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

  // Create fallback user profile if profile loading fails but auth succeeds
  const fallbackProfile = authUser && profileError ? {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
    role: authUser.user_metadata?.role || 'franchisee',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : null;

  const effectiveProfile = userProfile || fallbackProfile;

  return {
    user: effectiveProfile,
    session,
    isAuthenticated: !!session && !!authUser, // Don't require profile for auth
    isLoading: isLoading, // Only depend on auth loading, not profile loading
    role: effectiveProfile?.role || null,
    permissions: effectiveProfile?.metadata?.permissions || {}
  }
}

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

// Update user profile
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
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
