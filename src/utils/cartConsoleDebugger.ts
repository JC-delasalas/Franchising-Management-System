// Cart Console Debugger - Run this in browser console for immediate debugging
// Usage: Copy and paste this entire script into browser console while on the cart page

import { supabase } from '@/lib/supabase';
import { CartAPI } from '@/api/cart';

declare global {
  interface Window {
    debugCart: () => Promise<void>;
    testCartAuth: () => Promise<void>;
    testCartQuery: () => Promise<void>;
    testCartAPI: () => Promise<void>;
  }
}

// Step 1: Test Authentication
window.testCartAuth = async () => {
  console.log('🔍 STEP 1: Authentication State Verification');
  console.log('='.repeat(50));
  
  try {
    const startTime = performance.now();
    const authResponse = await supabase.auth.getUser();
    const authTime = performance.now() - startTime;
    
    console.log('Auth Response Time:', authTime.toFixed(2) + 'ms');
    console.log('Auth Data:', authResponse.data);
    console.log('Auth Error:', authResponse.error);
    
    if (authResponse.error) {
      console.error('❌ AUTHENTICATION FAILED:', authResponse.error.message);
      return;
    }
    
    if (!authResponse.data?.user) {
      console.error('❌ NO AUTHENTICATED USER');
      return;
    }
    
    const user = authResponse.data.user;
    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email,
      role: user.role,
      aud: user.aud,
      exp: user.exp ? new Date(user.exp * 1000) : 'No expiration'
    });
    
    // Test session
    const sessionResponse = await supabase.auth.getSession();
    console.log('Session valid:', !sessionResponse.error && !!sessionResponse.data.session);
    console.log('Session expires at:', sessionResponse.data.session?.expires_at);
    
    // Test user profile exists
    const profileResponse = await supabase
      .from('user_profiles')
      .select('id, email, role, status')
      .eq('id', user.id)
      .single();
    
    console.log('Profile exists:', !profileResponse.error);
    console.log('Profile data:', profileResponse.data);
    
    console.log('✅ AUTHENTICATION STATE: VERIFIED');
    
  } catch (error) {
    console.error('❌ AUTHENTICATION TEST FAILED:', error);
  }
};

// Step 2: Test Direct Cart Query
window.testCartQuery = async () => {
  console.log('🔍 STEP 2: Direct Cart Query Testing');
  console.log('='.repeat(50));
  
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      console.error('❌ No authenticated user for query test');
      return;
    }
    
    console.log('Testing queries for user:', user.user.id);
    
    // Test 1: Basic cart query
    console.log('Test 1: Basic shopping_cart query');
    const basicStart = performance.now();
    const basicQuery = await supabase
      .from('shopping_cart')
      .select('*')
      .eq('user_id', user.user.id);
    const basicTime = performance.now() - basicStart;
    
    console.log('Basic query result:', {
      success: !basicQuery.error,
      count: basicQuery.data?.length,
      timing: basicTime.toFixed(2) + 'ms',
      error: basicQuery.error?.message,
      data: basicQuery.data
    });
    
    // Test 2: Cart with products join
    console.log('Test 2: Cart with products!inner join');
    const joinStart = performance.now();
    const joinQuery = await supabase
      .from('shopping_cart')
      .select(`
        *,
        products!inner (
          id,
          name,
          sku,
          price,
          images,
          description,
          unit_of_measure,
          minimum_order_qty,
          maximum_order_qty,
          active
        )
      `)
      .eq('user_id', user.user.id)
      .order('added_at', { ascending: false });
    const joinTime = performance.now() - joinStart;
    
    console.log('Join query result:', {
      success: !joinQuery.error,
      count: joinQuery.data?.length,
      timing: joinTime.toFixed(2) + 'ms',
      error: joinQuery.error?.message,
      data: joinQuery.data
    });
    
    if (joinQuery.error) {
      console.error('❌ JOIN QUERY FAILED - THIS IS LIKELY THE ROOT CAUSE');
      console.error('Error details:', joinQuery.error);
    } else {
      console.log('✅ CART QUERIES: SUCCESSFUL');
    }
    
  } catch (error) {
    console.error('❌ CART QUERY TEST FAILED:', error);
  }
};

// Step 3: Test Cart API
window.testCartAPI = async () => {
  console.log('🔍 STEP 3: Cart API Testing');
  console.log('='.repeat(50));
  
  try {
    // Test CartAPI.getCartSummary()
    console.log('Testing CartAPI.getCartSummary()...');
    const apiStart = performance.now();
    const apiResult = await CartAPI.getCartSummary();
    const apiTime = performance.now() - apiStart;
    
    console.log('API result:', {
      success: true,
      timing: apiTime.toFixed(2) + 'ms',
      data: apiResult
    });
    
    console.log('✅ CART API: SUCCESSFUL');
    
  } catch (error) {
    console.error('❌ CART API FAILED:', error);
    console.error('This indicates the API method itself has issues');
  }
};

// Complete debug function
window.debugCart = async () => {
  console.clear();
  console.log('🚀 CART LOADING ROOT CAUSE ANALYSIS');
  console.log('='.repeat(60));
  console.log('Starting systematic investigation...');
  console.log('');
  
  await window.testCartAuth();
  console.log('');
  await window.testCartQuery();
  console.log('');
  await window.testCartAPI();
  console.log('');
  
  console.log('🏁 ANALYSIS COMPLETE');
  console.log('='.repeat(60));
  console.log('Check the results above to identify the exact failure point.');
  console.log('');
  console.log('Quick Commands:');
  console.log('- debugCart() - Run complete analysis');
  console.log('- testCartAuth() - Test authentication only');
  console.log('- testCartQuery() - Test database queries only');
  console.log('- testCartAPI() - Test API methods only');
};

// Auto-expose functions when script loads
if (typeof window !== 'undefined') {
  console.log('🔧 Cart Console Debugger loaded!');
  console.log('Run debugCart() to start analysis');
}

export {};
