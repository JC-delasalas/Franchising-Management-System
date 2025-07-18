import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,  // Enable automatic token refresh for better UX
    persistSession: true,    // Enable session persistence
    detectSessionInUrl: true // Enable URL session detection for auth callbacks
  }
})

// Re-export types for convenience
export type { Database, UserProfile, Organization, Franchise, FranchisePackage, FranchiseApplication, FranchiseLocation, UserRole, UserStatus, FranchiseStatus } from '@/types/database'
