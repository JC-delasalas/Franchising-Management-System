/**
 * Cart Status Diagnostic Tool
 * Immediate verification of cart functionality
 */

import { CartAPI } from '@/api/cart';
import { supabase } from '@/lib/supabase';

export const cartStatusDiagnostic = {
  async runImmediateVerification() {
    console.log('🔍 CART DIAGNOSTIC - Starting immediate verification...');
    
    const results = {
      timestamp: new Date().toISOString(),
      authentication: null as any,
      rawCartData: null as any,
      cartSummary: null as any,
      productData: null as any,
      errors: [] as string[],
      status: 'unknown' as 'working' | 'broken' | 'unknown'
    };

    try {
      // 1. Verify Authentication
      console.log('🔍 Step 1: Checking authentication...');
      const { data: user, error: authError } = await supabase.auth.getUser();
      results.authentication = {
        authenticated: !!user.user,
        userId: user.user?.id,
        error: authError?.message
      };
      
      if (!user.user) {
        results.errors.push('User not authenticated');
        results.status = 'broken';
        return results;
      }

      console.log('✅ Authentication OK:', user.user.id);

      // 2. Check Raw Cart Data in Database
      console.log('🔍 Step 2: Checking raw cart data...');
      const { data: rawCart, error: cartError } = await supabase
        .from('shopping_cart')
        .select('*')
        .eq('user_id', user.user.id);

      results.rawCartData = {
        items: rawCart || [],
        count: rawCart?.length || 0,
        error: cartError?.message
      };

      if (cartError) {
        results.errors.push(`Cart query error: ${cartError.message}`);
      }

      console.log('📊 Raw cart data:', rawCart?.length || 0, 'items');

      // 3. Check Product Data for Cart Items
      if (rawCart && rawCart.length > 0) {
        console.log('🔍 Step 3: Checking product data...');
        const productIds = rawCart.map(item => item.product_id);
        const { data: products, error: productError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        results.productData = {
          products: products || [],
          count: products?.length || 0,
          error: productError?.message
        };

        if (productError) {
          results.errors.push(`Product query error: ${productError.message}`);
        }

        console.log('📦 Product data:', products?.length || 0, 'products found');
      }

      // 4. Test CartAPI.getCartSummary
      console.log('🔍 Step 4: Testing CartAPI.getCartSummary...');
      try {
        const summary = await CartAPI.getCartSummary();
        results.cartSummary = {
          itemCount: summary.itemCount,
          total: summary.total,
          items: summary.items?.length || 0,
          success: true
        };
        console.log('✅ CartAPI.getCartSummary SUCCESS:', summary);
      } catch (summaryError: any) {
        results.cartSummary = {
          success: false,
          error: summaryError.message
        };
        results.errors.push(`CartAPI error: ${summaryError.message}`);
        console.error('❌ CartAPI.getCartSummary FAILED:', summaryError);
      }

      // 5. Determine Overall Status
      if (results.errors.length === 0 && results.cartSummary?.success) {
        results.status = 'working';
        console.log('✅ CART STATUS: WORKING');
      } else {
        results.status = 'broken';
        console.log('❌ CART STATUS: BROKEN');
      }

    } catch (error: any) {
      results.errors.push(`Diagnostic error: ${error.message}`);
      results.status = 'broken';
      console.error('❌ Diagnostic failed:', error);
    }

    return results;
  },

  generateReport(results: any): string {
    const { authentication, rawCartData, productData, cartSummary, errors, status } = results;
    
    let report = `
🔍 CART STATUS DIAGNOSTIC REPORT
================================
Timestamp: ${results.timestamp}
Overall Status: ${status.toUpperCase()}

📊 AUTHENTICATION:
${authentication?.authenticated ? '✅' : '❌'} User authenticated: ${authentication?.userId || 'No'}
${authentication?.error ? `❌ Auth error: ${authentication.error}` : ''}

📊 RAW CART DATA:
${rawCartData?.count > 0 ? '✅' : '❌'} Cart items in database: ${rawCartData?.count || 0}
${rawCartData?.error ? `❌ Cart query error: ${rawCartData.error}` : ''}

📊 PRODUCT DATA:
${productData?.count > 0 ? '✅' : '❌'} Products found: ${productData?.count || 0}
${productData?.error ? `❌ Product query error: ${productData.error}` : ''}

📊 CART API:
${cartSummary?.success ? '✅' : '❌'} CartAPI.getCartSummary: ${cartSummary?.success ? 'SUCCESS' : 'FAILED'}
${cartSummary?.success ? `   Items: ${cartSummary.items}, Total: ₱${cartSummary.total}` : ''}
${cartSummary?.error ? `❌ API error: ${cartSummary.error}` : ''}

📊 ERRORS FOUND:
${errors.length === 0 ? '✅ No errors detected' : errors.map((e: string) => `❌ ${e}`).join('\n')}

📊 RECOMMENDATIONS:
`;

    if (status === 'working') {
      report += `✅ Cart is fully functional! Navigate to /cart to see your items.`;
    } else if (!authentication?.authenticated) {
      report += `❌ Please log in first, then test cart functionality.`;
    } else if (rawCartData?.count === 0) {
      report += `❌ No items in cart database. Add items from product catalog first.`;
    } else if (productData?.count === 0) {
      report += `❌ Products not found for cart items. Check product database.`;
    } else if (!cartSummary?.success) {
      report += `❌ CartAPI failing. Check API implementation and database queries.`;
    } else {
      report += `❌ Unknown issue. Check console logs for more details.`;
    }

    return report;
  },

  async runAndReport() {
    const results = await this.runImmediateVerification();
    const report = this.generateReport(results);
    console.log(report);
    return { results, report };
  }
};

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).cartStatusDiagnostic = cartStatusDiagnostic;
}
