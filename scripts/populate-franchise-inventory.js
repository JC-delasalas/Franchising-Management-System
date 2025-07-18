const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ktugncuiwjoatopnialp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dWduY3Vpd2pvYXRvcG5pYWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUyNTM3NiwiZXhwIjoyMDY4MTAxMzc2fQ.m3tAWcq08Od0I7lto5mmKayVAEg7lZBiZjRrK4RudmE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Performance tier mapping based on location names
const getPerformanceTier = (locationName) => {
  const name = locationName.toLowerCase();
  
  if (name.includes('bgc') || name.includes('makati') || name.includes('ortigas')) {
    return 'high'; // High performers: 80-150 units per product
  } else if (name.includes('quezon') || name.includes('cebu') || name.includes('davao') || name.includes('eastwood')) {
    return 'average'; // Average performers: 40-80 units per product
  } else if (name.includes('baguio') || name.includes('iloilo') || name.includes('trinoma')) {
    return 'low'; // Low performers: 15-40 units per product
  } else {
    return 'struggling'; // Struggling locations: 5-20 units per product
  }
};

// Get inventory quantity based on performance tier and product category
const getInventoryQuantity = (tier, category, isLowStock = false) => {
  const baseQuantities = {
    high: { min: 80, max: 150 },
    average: { min: 40, max: 80 },
    low: { min: 15, max: 40 },
    struggling: { min: 5, max: 20 }
  };
  
  const range = baseQuantities[tier];
  let quantity = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  
  // Adjust for product category
  if (category === 'Food' || category === 'Food Items') {
    quantity = Math.floor(quantity * 0.7); // Food items have lower stock
  } else if (category === 'Equipment') {
    quantity = Math.floor(quantity * 0.3); // Equipment has very low stock
  } else if (category === 'Packaging' || category === 'Supplies') {
    quantity = Math.floor(quantity * 1.2); // Packaging/supplies have higher stock
  }
  
  // Create low stock scenarios
  if (isLowStock) {
    const reorderPoint = getReorderPoint(category);
    quantity = Math.floor(Math.random() * (reorderPoint * 0.8)) + 1; // Below reorder point
  }
  
  return Math.max(1, quantity); // Ensure at least 1 unit
};

// Get reorder point based on product category
const getReorderPoint = (category) => {
  switch (category) {
    case 'Food':
    case 'Food Items':
      return 25;
    case 'Beverage':
    case 'Beverages':
      return 20;
    case 'Packaging':
    case 'Supplies':
      return 50;
    case 'Equipment':
      return 5;
    case 'Condiments':
      return 30;
    default:
      return 20;
  }
};

// Get max stock level based on performance tier and category
const getMaxStockLevel = (tier, category) => {
  const baseMax = {
    high: 300,
    average: 200,
    low: 150,
    struggling: 100
  };
  
  let maxStock = baseMax[tier];
  
  if (category === 'Equipment') {
    maxStock = Math.floor(maxStock * 0.2);
  } else if (category === 'Packaging' || category === 'Supplies') {
    maxStock = Math.floor(maxStock * 1.5);
  }
  
  return maxStock;
};

async function populateFranchiseInventory() {
  console.log('🚀 Starting comprehensive franchise inventory population...');

  try {
    // Get all franchise locations
    const { data: locations, error: locationsError } = await supabase
      .from('franchise_locations')
      .select('id, name');

    if (locationsError) {
      console.error('❌ Error fetching locations:', locationsError);
      return;
    }

    console.log(`📍 Found ${locations.length} franchise locations`);

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, cost_price, category')
      .limit(20); // Focus on top 20 products for comprehensive coverage

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }

    console.log(`📦 Found ${products.length} products to distribute`);

    // Clear existing inventory_items for fresh population
    console.log('🧹 Clearing existing inventory_items...');
    await supabase.from('inventory_items').delete().gte('created_at', '2024-01-01');

    const inventoryData = [];
    let lowStockLocationCount = 0;
    const targetLowStockLocations = 18; // Target 18 locations with low stock

    // Populate inventory for each location
    for (const location of locations) {
      const tier = getPerformanceTier(location.name);
      const shouldHaveLowStock = lowStockLocationCount < targetLowStockLocations && Math.random() < 0.6;
      
      if (shouldHaveLowStock) {
        lowStockLocationCount++;
        console.log(`⚠️ Creating low stock scenario for: ${location.name} (${tier} performer)`);
      }

      // Add inventory for each product (focus on essential products)
      for (const product of products.slice(0, 15)) { // 15 products per location
        const isLowStock = shouldHaveLowStock && Math.random() < 0.4; // 40% of products low stock
        const quantity = getInventoryQuantity(tier, product.category, isLowStock);
        const reorderPoint = getReorderPoint(product.category);
        const maxStockLevel = getMaxStockLevel(tier, product.category);

        inventoryData.push({
          location_id: location.id,
          product_id: product.id,
          quantity: quantity,
          unit_cost: product.cost_price,
          reorder_point: reorderPoint,
          max_stock_level: maxStockLevel,
          last_updated: new Date().toISOString(),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    console.log(`📊 Generated ${inventoryData.length} inventory records`);
    console.log(`⚠️ Created low stock scenarios for ${lowStockLocationCount} locations`);

    // Insert inventory data in batches to avoid timeouts
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < inventoryData.length; i += batchSize) {
      const batch = inventoryData.slice(i, i + batchSize);
      
      const { data: result, error: insertError } = await supabase
        .from('inventory_items')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        continue;
      }

      insertedCount += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records (Total: ${insertedCount})`);
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verification
    console.log('\n📊 Inventory Population Summary:');
    
    const { count: totalInventory } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });
    
    const { data: lowStockItems } = await supabase
      .from('inventory_items')
      .select('location_id, product_id, quantity, reorder_point')
      .lt('quantity', supabase.raw('reorder_point'));

    const { data: criticalStockItems } = await supabase
      .from('inventory_items')
      .select('location_id, product_id, quantity, reorder_point')
      .lt('quantity', supabase.raw('reorder_point * 0.5'));

    console.log(`✅ Total Inventory Records: ${totalInventory}`);
    console.log(`⚠️ Low Stock Items: ${lowStockItems?.length || 0}`);
    console.log(`🚨 Critical Stock Items: ${criticalStockItems?.length || 0}`);
    
    // Count locations with low stock
    const locationsWithLowStock = new Set(lowStockItems?.map(item => item.location_id) || []);
    console.log(`📍 Locations with Low Stock Alerts: ${locationsWithLowStock.size}`);

    console.log('\n🎉 Comprehensive franchise inventory population completed successfully!');

  } catch (error) {
    console.error('❌ Error during inventory population:', error);
  }
}

// Run the population script
populateFranchiseInventory();
