/**
 * Quick Cart Test Utility
 * Direct testing of cart functionality without complex analysis
 */

import { CartAPI } from '@/api/cart';
import { supabase } from '@/lib/supabase';

export const quickCartTest = {
  // Test 1: Check if user is authenticated
  async testAuth() {
    console.log('🔐 Testing authentication...');
    const { data: user, error } = await supabase.auth.getUser();
    console.log('🔐 Auth result:', { user: user.user?.id, error });
    return { authenticated: !!user.user, userId: user.user?.id, error };
  },

  // Test 2: Check if shopping_cart table exists and is accessible
  async testTableAccess() {
    console.log('🗄️ Testing shopping_cart table access...');
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select('count(*)')
        .limit(1);
      
      console.log('🗄️ Table access result:', { data, error });
      return { accessible: !error, error };
    } catch (error) {
      console.error('🗄️ Table access failed:', error);
      return { accessible: false, error };
    }
  },

  // Test 3: Check if products table exists and has data
  async testProductsTable() {
    console.log('📦 Testing products table...');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, active')
        .eq('active', true)
        .limit(5);
      
      console.log('📦 Products result:', { count: data?.length || 0, data, error });
      return { hasProducts: (data?.length || 0) > 0, products: data, error };
    } catch (error) {
      console.error('📦 Products test failed:', error);
      return { hasProducts: false, error };
    }
  },

  // Test 4: Try to add a test item to cart
  async testAddToCart() {
    console.log('➕ Testing add to cart...');
    
    // First get a product to add
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .eq('active', true)
      .limit(1);
    
    if (!products || products.length === 0) {
      console.error('➕ No products available for testing');
      return { success: false, error: 'No products available' };
    }

    const testProduct = products[0];
    console.log('➕ Using test product:', testProduct);

    try {
      const result = await CartAPI.addToCart(testProduct.id, 1);
      console.log('➕ Add to cart result:', result);
      return { success: true, result };
    } catch (error) {
      console.error('➕ Add to cart failed:', error);
      return { success: false, error };
    }
  },

  // Test 5: Check current cart contents
  async testGetCart() {
    console.log('📋 Testing get cart...');
    try {
      const items = await CartAPI.getCartItems();
      console.log('📋 Cart items:', items);
      
      const summary = await CartAPI.getCartSummary();
      console.log('📋 Cart summary:', summary);
      
      return { success: true, items, summary };
    } catch (error) {
      console.error('📋 Get cart failed:', error);
      return { success: false, error };
    }
  },

  // Test 6: Check raw database cart data
  async testRawCartData() {
    console.log('🔍 Testing raw cart data...');
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('user_id', user.user.id);
      
      console.log('🔍 Raw cart data:', { data, error });
      return { success: !error, data, error };
    } catch (error) {
      console.error('🔍 Raw cart data failed:', error);
      return { success: false, error };
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running quick cart tests...');
    
    const results = {
      auth: await this.testAuth(),
      tableAccess: await this.testTableAccess(),
      products: await this.testProductsTable(),
      addToCart: await this.testAddToCart(),
      getCart: await this.testGetCart(),
      rawData: await this.testRawCartData(),
    };

    console.log('🚀 All test results:', results);

    // Generate quick diagnosis
    const diagnosis = [];
    if (!results.auth.authenticated) diagnosis.push('❌ User not authenticated');
    if (!results.tableAccess.accessible) diagnosis.push('❌ Cannot access shopping_cart table');
    if (!results.products.hasProducts) diagnosis.push('❌ No active products available');
    if (!results.addToCart.success) diagnosis.push('❌ Cannot add items to cart');
    if (!results.getCart.success) diagnosis.push('❌ Cannot retrieve cart data');

    if (diagnosis.length === 0) {
      diagnosis.push('✅ All tests passed - cart should be working');
    }

    console.log('🔍 Quick Diagnosis:', diagnosis);
    return { results, diagnosis };
  }
};

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).quickCartTest = quickCartTest;
}
