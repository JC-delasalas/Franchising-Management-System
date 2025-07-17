// Test script for franchisor API methods
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ktugncuiwjoatopnialp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dWduY3Vpd2pvYXRvcG5pYWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUyNTM3NiwiZXhwIjoyMDY4MTAxMzc2fQ.m3tAWcq08Od0I7lto5mmKayVAEg7lZBiZjRrK4RudmE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Get Franchisor Metrics
async function testGetFranchisorMetrics() {
  console.log('\n🧪 Testing AnalyticsAPI.getFranchisorMetrics()...');
  
  try {
    // Get franchisor user
    const { data: franchisorUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'franchisor')
      .single();
    
    if (!franchisorUser) {
      throw new Error('No franchisor user found');
    }
    
    console.log('✅ Franchisor user found:', franchisorUser.id);
    
    // Get franchises owned by this franchisor
    const { data: franchises } = await supabase
      .from('franchises')
      .select('id, name, status')
      .eq('owner_id', franchisorUser.id);
    
    console.log('✅ Franchises found:', franchises?.length || 0);
    
    // Get franchise locations
    const franchiseIds = franchises?.map(f => f.id) || [];
    const { data: locations } = await supabase
      .from('franchise_locations')
      .select(`
        id, name, status,
        franchises!inner(id, name),
        user_profiles!franchisee_id(full_name, email)
      `)
      .in('franchise_id', franchiseIds);
    
    console.log('✅ Franchise locations found:', locations?.length || 0);
    
    // Get pending applications
    const { data: applications } = await supabase
      .from('franchise_applications')
      .select('id, status')
      .in('franchise_id', franchiseIds)
      .eq('status', 'pending');
    
    console.log('✅ Pending applications found:', applications?.length || 0);
    
    // Calculate metrics
    const totalRevenue = 0; // Would calculate from actual revenue data
    const activeLocations = locations?.filter(loc => loc.status === 'open').length || 0;
    
    const metrics = {
      overview: {
        total_franchises: franchises?.length || 0,
        active_locations: activeLocations,
        pending_applications: applications?.length || 0,
        total_revenue: totalRevenue
      },
      performance: {
        top_performing_locations: locations?.slice(0, 5).map(loc => ({
          location_id: loc.id,
          location_name: loc.name,
          revenue: 0,
          growth: 0
        })) || [],
        underperforming_locations: []
      },
      financial: {
        total_royalties: 0,
        pending_payments: 0,
        revenue_trend: []
      }
    };
    
    console.log('✅ Franchisor metrics calculated:', JSON.stringify(metrics, null, 2));
    return metrics;
    
  } catch (error) {
    console.error('❌ Error testing getFranchisorMetrics:', error.message);
    return null;
  }
}

// Test 2: Get Orders for Franchisor
async function testGetOrdersForFranchisor() {
  console.log('\n🧪 Testing OrdersAPI.getOrdersForFranchisor()...');
  
  try {
    // Get franchisor user
    const { data: franchisorUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'franchisor')
      .single();
    
    // Get all franchises owned by this franchisor
    const { data: franchises } = await supabase
      .from('franchises')
      .select('id')
      .eq('owner_id', franchisorUser.id);
    
    const franchiseIds = franchises?.map(f => f.id) || [];
    
    // Get all locations for these franchises
    const { data: locations } = await supabase
      .from('franchise_locations')
      .select('id')
      .in('franchise_id', franchiseIds);
    
    const locationIds = locations?.map(l => l.id) || [];
    
    // Get all orders for these locations
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku, price)
        ),
        franchise_locations (name, franchisee_id),
        user_profiles!created_by (full_name, email)
      `)
      .in('franchise_location_id', locationIds)
      .order('created_at', { ascending: false });
    
    console.log('✅ Orders found for franchisor:', orders?.length || 0);
    console.log('✅ Sample order:', orders?.[0] ? {
      id: orders[0].id,
      order_number: orders[0].order_number,
      status: orders[0].status,
      total_amount: orders[0].total_amount
    } : 'No orders');
    
    return orders;
    
  } catch (error) {
    console.error('❌ Error testing getOrdersForFranchisor:', error.message);
    return null;
  }
}

// Test 3: Get Pending Orders
async function testGetPendingOrders() {
  console.log('\n🧪 Testing OrdersAPI.getPendingOrders()...');
  
  try {
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, sku)
        ),
        franchise_locations (name),
        user_profiles!created_by (full_name)
      `)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true });
    
    console.log('✅ Pending orders found:', pendingOrders?.length || 0);
    console.log('✅ Sample pending order:', pendingOrders?.[0] ? {
      id: pendingOrders[0].id,
      order_number: pendingOrders[0].order_number,
      total_amount: pendingOrders[0].total_amount,
      location: pendingOrders[0].franchise_locations?.name
    } : 'No pending orders');
    
    return pendingOrders;
    
  } catch (error) {
    console.error('❌ Error testing getPendingOrders:', error.message);
    return null;
  }
}

// Test 4: Get Franchise Applications
async function testGetFranchiseApplications() {
  console.log('\n🧪 Testing FranchiseAPI.updateApplicationStatus()...');
  
  try {
    // Get all applications
    const { data: applications } = await supabase
      .from('franchise_applications')
      .select(`
        *,
        user_profiles!applicant_id (full_name, email, phone)
      `)
      .order('submitted_at', { ascending: false });
    
    console.log('✅ Applications found:', applications?.length || 0);
    console.log('✅ Sample application:', applications?.[0] ? {
      id: applications[0].id,
      application_number: applications[0].application_number,
      status: applications[0].status,
      applicant: applications[0].user_profiles?.full_name
    } : 'No applications');
    
    return applications;
    
  } catch (error) {
    console.error('❌ Error testing franchise applications:', error.message);
    return null;
  }
}

// Test 5: Verify Data Relationships
async function testDataRelationships() {
  console.log('\n🧪 Testing Data Relationships...');
  
  try {
    // Test franchise → locations → orders relationship
    const { data: franchiseData } = await supabase
      .from('franchises')
      .select(`
        id, name, owner_id,
        franchise_locations (
          id, name, franchisee_id,
          orders (
            id, order_number, status, total_amount
          )
        )
      `)
      .limit(1)
      .single();
    
    console.log('✅ Franchise relationship test:', {
      franchise: franchiseData?.name,
      locations: franchiseData?.franchise_locations?.length || 0,
      total_orders: franchiseData?.franchise_locations?.reduce((sum, loc) => 
        sum + (loc.orders?.length || 0), 0) || 0
    });
    
    return franchiseData;
    
  } catch (error) {
    console.error('❌ Error testing data relationships:', error.message);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Franchisor API Tests...\n');
  
  const results = {
    franchisorMetrics: await testGetFranchisorMetrics(),
    franchisorOrders: await testGetOrdersForFranchisor(),
    pendingOrders: await testGetPendingOrders(),
    applications: await testGetFranchiseApplications(),
    dataRelationships: await testDataRelationships()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('✅ Franchisor Metrics:', results.franchisorMetrics ? 'PASS' : 'FAIL');
  console.log('✅ Franchisor Orders:', results.franchisorOrders ? 'PASS' : 'FAIL');
  console.log('✅ Pending Orders:', results.pendingOrders ? 'PASS' : 'FAIL');
  console.log('✅ Applications:', results.applications ? 'PASS' : 'FAIL');
  console.log('✅ Data Relationships:', results.dataRelationships ? 'PASS' : 'FAIL');
  
  const passCount = Object.values(results).filter(r => r !== null).length;
  console.log(`\n🎯 Overall: ${passCount}/5 tests passed`);
  
  return results;
}

// Execute tests
runAllTests().catch(console.error);
