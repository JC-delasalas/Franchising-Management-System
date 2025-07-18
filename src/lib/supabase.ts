import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Disable automatic token refresh
    persistSession: false,   // Disable session persistence to prevent auto-login
    detectSessionInUrl: false // Disable URL session detection
  }
})

// Re-export types for convenience
export type { Database, UserProfile, Organization, Franchise, FranchisePackage, FranchiseApplication, FranchiseLocation, UserRole, UserStatus, FranchiseStatus } from '@/types/database'
