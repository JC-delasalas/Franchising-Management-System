import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { config } from '@/config/environment';

// Validate required environment variables
if (!config.supabase.url) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!config.supabase.anonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'franchisehub-platform'
      }
    }
  }
);

// Service role client for admin operations (use carefully)
export const supabaseAdmin = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);