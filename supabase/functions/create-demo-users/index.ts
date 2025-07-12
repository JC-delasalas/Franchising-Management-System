
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create demo users
    const demoUsers = [
      {
        email: 'demo@franchisee.com',
        password: 'demo123',
        userData: {
          first_name: 'Demo',
          last_name: 'Franchisee',
          account_type: 'franchisee',
          role: 'franchisee'
        }
      },
      {
        email: 'demo@franchisor.com',
        password: 'demo123',
        userData: {
          first_name: 'Demo',
          last_name: 'Franchisor',
          account_type: 'franchisor',
          role: 'franchisor'
        }
      }
    ];

    const results = [];

    for (const demoUser of demoUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(demoUser.email);
      
      if (existingUser.user) {
        console.log(`Demo user ${demoUser.email} already exists`);
        results.push({ email: demoUser.email, status: 'already_exists' });
        continue;
      }

      // Create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: demoUser.email,
        password: demoUser.password,
        email_confirm: true, // Auto-confirm email for demo users
        user_metadata: demoUser.userData
      });

      if (error) {
        console.error(`Error creating demo user ${demoUser.email}:`, error);
        results.push({ email: demoUser.email, status: 'error', error: error.message });
      } else {
        console.log(`Demo user ${demoUser.email} created successfully`);
        results.push({ email: demoUser.email, status: 'created', id: data.user?.id });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in create-demo-users function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
