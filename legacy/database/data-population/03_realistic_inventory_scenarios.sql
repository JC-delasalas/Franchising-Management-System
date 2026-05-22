-- Populate realistic inventory scenarios with critical alerts and overstocking
-- This creates diverse inventory management challenges

-- Clear existing inventory_levels for fresh population
DELETE FROM inventory_levels;

-- Populate warehouse inventory with realistic scenarios (batch 1 - first 5 products)
INSERT INTO inventory_levels (warehouse_id, product_id, quantity_on_hand, reserved_quantity, reorder_level, max_stock_level, cost_per_unit, last_restocked_at, created_at, updated_at)
SELECT 
  w.id as warehouse_id,
  p.id as product_id,
  -- Realistic quantity distribution based on warehouse type and product category
  CASE 
    WHEN w.name LIKE '%Central%' THEN 
      CASE 
        WHEN p.category = 'Coffee Beans' THEN FLOOR(RANDOM() * 200) + 50  -- 50-250 kg
        WHEN p.category = 'Beverages' THEN FLOOR(RANDOM() * 100) + 30     -- 30-130 units
        WHEN p.category = 'Supplies' THEN FLOOR(RANDOM() * 500) + 100     -- 100-600 packs
        ELSE FLOOR(RANDOM() * 150) + 25                                   -- 25-175 units
      END
    WHEN w.type = 'cold_storage' THEN
      CASE 
        WHEN p.category IN ('Beverages', 'Food') THEN FLOOR(RANDOM() * 80) + 20  -- 20-100 units
        ELSE 0  -- No dry goods in cold storage
      END
    ELSE 
      CASE 
        WHEN p.category = 'Coffee Beans' THEN FLOOR(RANDOM() * 100) + 20  -- 20-120 kg
        WHEN p.category = 'Supplies' THEN FLOOR(RANDOM() * 300) + 50      -- 50-350 packs
        ELSE FLOOR(RANDOM() * 80) + 15                                    -- 15-95 units
      END
  END as quantity_on_hand,
  
  -- Reserved quantity (some items reserved for pending orders)
  CASE 
    WHEN RANDOM() < 0.3 THEN FLOOR(RANDOM() * 20) + 5  -- 30% chance of having reserved stock
    ELSE 0
  END as reserved_quantity,
  
  -- Reorder levels based on product importance
  CASE 
    WHEN p.featured = true THEN 25  -- Higher reorder level for featured products
    WHEN p.category = 'Coffee Beans' THEN 20
    WHEN p.category = 'Supplies' THEN 50
    ELSE 15
  END as reorder_level,
  
  -- Max stock levels
  CASE 
    WHEN w.name LIKE '%Central%' THEN 500
    WHEN w.type = 'cold_storage' THEN 200
    ELSE 300
  END as max_stock_level,
  
  p.cost_price as cost_per_unit,
  
  -- Last restocked dates (varied timing)
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) as last_restocked_at,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60) as created_at,
  NOW() - INTERVAL '1 hour' * FLOOR(RANDOM() * 24) as updated_at

FROM warehouses w
CROSS JOIN (
  SELECT * FROM products 
  WHERE id IN (
    'p0000001-0001-0001-0001-000000000001',
    'p0000001-0001-0001-0001-000000000002',
    'p0000001-0001-0001-0001-000000000003',
    'p0000001-0001-0001-0001-000000000004',
    'p0000001-0001-0001-0001-000000000005'
  )
) p
WHERE 
  -- Only populate relevant products for each warehouse type
  (w.type = 'cold_storage' AND p.category IN ('Beverages', 'Food')) OR
  (w.type = 'distribution' AND p.category NOT IN ('Equipment')) OR
  (w.name LIKE '%Central%')  -- Central warehouses get all products
ORDER BY w.name, p.category, p.name;

-- Verify first batch
SELECT 'Inventory Batch 1' as status, COUNT(*) as records_inserted FROM inventory_levels;
