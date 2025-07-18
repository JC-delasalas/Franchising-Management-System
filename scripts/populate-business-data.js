const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ktugncuiwjoatopnialp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dWduY3Vpd2pvYXRvcG5pYWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUyNTM3NiwiZXhwIjoyMDY4MTAxMzc2fQ.m3tAWcq08Od0I7lto5mmKayVAEg7lZBiZjRrK4RudmE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateBusinessData() {
  console.log('🚀 Starting comprehensive business data population...');

  try {
    // Step 1: Add enhanced products
    console.log('📦 Adding enhanced product catalog...');
    
    const products = [
      {
        id: 'p0000001-0001-0001-0001-000000000001',
        franchise_id: '550e8400-e29b-41d4-a716-446655440030',
        sku: 'KP-ARB-001',
        name: 'Premium Arabica Beans',
        description: 'Premium single-origin Arabica coffee beans',
        category: 'Coffee Beans',
        price: 85.00,
        cost_price: 45.00,
        minimum_order_qty: 5,
        active: true
      },
      {
        id: 'p0000001-0001-0001-0001-000000000002',
        franchise_id: '550e8400-e29b-41d4-a716-446655440030',
        sku: 'KP-ROB-001',
        name: 'Robusta Coffee Blend',
        description: 'Strong Robusta blend for espresso',
        category: 'Coffee Beans',
        price: 65.00,
        cost_price: 35.00,
        minimum_order_qty: 5,
        active: true
      },
      {
        id: 'p0000001-0001-0001-0001-000000000003',
        franchise_id: '550e8400-e29b-41d4-a716-446655440030',
        sku: 'KP-ICE-001',
        name: 'Iced Coffee Concentrate',
        description: 'Cold brew concentrate for iced coffee',
        category: 'Beverages',
        price: 120.00,
        cost_price: 70.00,
        minimum_order_qty: 3,
        active: true
      },
      {
        id: 'p0000001-0001-0001-0001-000000000004',
        franchise_id: '550e8400-e29b-41d4-a716-446655440030',
        sku: 'KP-CUP-012',
        name: 'Paper Cups 12oz',
        description: 'Disposable paper cups 12oz (50pcs)',
        category: 'Supplies',
        price: 25.00,
        cost_price: 15.00,
        minimum_order_qty: 20,
        active: true
      },
      {
        id: 'p0000001-0001-0001-0001-000000000005',
        franchise_id: '550e8400-e29b-41d4-a716-446655440030',
        sku: 'KP-CUP-016',
        name: 'Paper Cups 16oz',
        description: 'Disposable paper cups 16oz (50pcs)',
        category: 'Supplies',
        price: 30.00,
        cost_price: 18.00,
        minimum_order_qty: 20,
        active: true
      }
    ];

    const { data: productData, error: productError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });

    if (productError) {
      console.error('❌ Error adding products:', productError);
    } else {
      console.log('✅ Products added successfully');
    }

    // Step 2: Update franchise performance tiers
    console.log('🏢 Updating franchise performance tiers...');
    
    const { data: locations, error: locationsError } = await supabase
      .from('franchise_locations')
      .select('id, name');

    if (locationsError) {
      console.error('❌ Error fetching locations:', locationsError);
      return;
    }

    for (const location of locations) {
      let monthlyTarget = 50000; // Default for struggling locations
      
      if (location.name.includes('BGC') || location.name.includes('Makati')) {
        monthlyTarget = 450000; // High performers
      } else if (location.name.includes('Ortigas') || location.name.includes('Alabang')) {
        monthlyTarget = 380000; // High performers
      } else if (location.name.includes('Quezon City') || location.name.includes('Pasig')) {
        monthlyTarget = 200000; // Average performers
      } else if (location.name.includes('Cebu') || location.name.includes('Davao')) {
        monthlyTarget = 180000; // Average performers
      } else if (location.name.includes('Baguio') || location.name.includes('Iloilo')) {
        monthlyTarget = 100000; // Low performers
      }

      await supabase
        .from('franchise_locations')
        .update({ monthly_target: monthlyTarget })
        .eq('id', location.id);
    }

    console.log('✅ Franchise performance tiers updated');

    // Step 3: Populate inventory levels
    console.log('📦 Populating realistic inventory scenarios...');
    
    const { data: warehouses, error: warehousesError } = await supabase
      .from('warehouses')
      .select('id, name');

    if (warehousesError) {
      console.error('❌ Error fetching warehouses:', warehousesError);
      return;
    }

    // Clear existing inventory
    await supabase.from('inventory_levels').delete().gte('created_at', '2024-01-01');

    const inventoryData = [];
    
    for (const warehouse of warehouses.slice(0, 5)) { // Limit to first 5 warehouses
      for (const product of products) {
        const isCentral = warehouse.name.includes('Central');
        const isSupplies = product.category === 'Supplies';
        const isCoffee = product.category === 'Coffee Beans';
        
        const baseQuantity = isCentral ? 
          (isSupplies ? 400 : isCoffee ? 200 : 100) :
          (isSupplies ? 150 : isCoffee ? 80 : 50);
        
        const quantity = baseQuantity + Math.floor(Math.random() * 100);
        const reorderLevel = isCoffee ? 20 : isSupplies ? 50 : 15;
        const maxStock = isCentral ? 500 : 250;
        
        inventoryData.push({
          warehouse_id: warehouse.id,
          product_id: product.id,
          quantity_on_hand: quantity,
          reserved_quantity: Math.random() < 0.3 ? Math.floor(Math.random() * 15) + 5 : 0,
          reorder_level: reorderLevel,
          max_stock_level: maxStock,
          cost_per_unit: product.cost_price,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    const { data: inventoryResult, error: inventoryError } = await supabase
      .from('inventory_levels')
      .insert(inventoryData);

    if (inventoryError) {
      console.error('❌ Error adding inventory:', inventoryError);
    } else {
      console.log('✅ Inventory levels populated');
    }

    // Step 4: Create low stock alerts
    console.log('⚠️ Creating low stock scenarios...');
    
    const { data: lowStockUpdate, error: lowStockError } = await supabase
      .from('inventory_levels')
      .update({ quantity_on_hand: 10 }) // Below reorder point
      .in('product_id', products.slice(0, 3).map(p => p.id))
      .limit(5);

    if (lowStockError) {
      console.error('❌ Error creating low stock scenarios:', lowStockError);
    } else {
      console.log('✅ Low stock scenarios created');
    }

    // Step 5: Generate sales data
    console.log('💰 Generating sales transaction data...');
    
    const salesData = [];
    const { data: franchiseeUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'franchisee')
      .limit(1)
      .single();

    for (const location of locations.slice(0, 10)) { // Limit to 10 locations
      const target = location.name.includes('BGC') ? 450000 : 
                    location.name.includes('Quezon') ? 200000 : 100000;
      
      const transactionCount = target >= 400000 ? 15 : target >= 150000 ? 10 : 5;
      
      for (let i = 0; i < transactionCount; i++) {
        const baseAmount = target >= 400000 ? 1500 : target >= 150000 ? 800 : 400;
        const totalAmount = baseAmount + Math.floor(Math.random() * 1000);
        
        salesData.push({
          id: crypto.randomUUID(),
          location_id: location.id,
          total_amount: totalAmount,
          tax_amount: Math.round(totalAmount * 0.12 * 100) / 100,
          payment_method: ['cash', 'credit_card', 'gcash', 'paymaya'][Math.floor(Math.random() * 4)],
          created_by: franchiseeUser?.id,
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    const { data: salesResult, error: salesError } = await supabase
      .from('sales_records')
      .insert(salesData);

    if (salesError) {
      console.error('❌ Error adding sales data:', salesError);
    } else {
      console.log('✅ Sales transaction data generated');
    }

    // Final verification
    console.log('\n📊 Data Population Summary:');
    
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: inventoryCount } = await supabase
      .from('inventory_levels')
      .select('*', { count: 'exact', head: true });
    
    const { count: salesCount } = await supabase
      .from('sales_records')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Products: ${productCount} records`);
    console.log(`✅ Inventory Levels: ${inventoryCount} records`);
    console.log(`✅ Sales Records: ${salesCount} records`);
    
    console.log('\n🎉 Comprehensive business data population completed successfully!');

  } catch (error) {
    console.error('❌ Error during data population:', error);
  }
}

// Run the population script
populateBusinessData();
