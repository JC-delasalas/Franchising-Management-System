-- Simplified Business Data Population for Existing Schema
-- This works with the current database structure

-- Step 1: Add more products using existing schema
INSERT INTO products (id, franchise_id, sku, name, description, category, price, cost_price, minimum_order_qty, active) VALUES
-- Coffee Products
('p0000001-0001-0001-0001-000000000001', '550e8400-e29b-41d4-a716-446655440030', 'KP-ARB-001', 'Premium Arabica Beans', 'Premium single-origin Arabica coffee beans', 'Coffee Beans', 85.00, 45.00, 5, true),
('p0000001-0001-0001-0001-000000000002', '550e8400-e29b-41d4-a716-446655440030', 'KP-ROB-001', 'Robusta Coffee Blend', 'Strong Robusta blend for espresso', 'Coffee Beans', 65.00, 35.00, 5, true),
('p0000001-0001-0001-0001-000000000003', '550e8400-e29b-41d4-a716-446655440030', 'KP-ICE-001', 'Iced Coffee Concentrate', 'Cold brew concentrate for iced coffee', 'Beverages', 120.00, 70.00, 3, true),

-- Supplies
('p0000001-0001-0001-0001-000000000004', '550e8400-e29b-41d4-a716-446655440030', 'KP-CUP-012', 'Paper Cups 12oz', 'Disposable paper cups 12oz (50pcs)', 'Supplies', 25.00, 15.00, 20, true),
('p0000001-0001-0001-0001-000000000005', '550e8400-e29b-41d4-a716-446655440030', 'KP-CUP-016', 'Paper Cups 16oz', 'Disposable paper cups 16oz (50pcs)', 'Supplies', 30.00, 18.00, 20, true),
('p0000001-0001-0001-0001-000000000006', '550e8400-e29b-41d4-a716-446655440030', 'KP-LID-001', 'Plastic Lids', 'Plastic lids for cups (100pcs)', 'Supplies', 20.00, 12.00, 25, true),

-- Food Items
('p0000001-0001-0001-0001-000000000007', '550e8400-e29b-41d4-a716-446655440030', 'KP-PST-001', 'Pastry Mix', 'All-purpose pastry and bread mix', 'Food', 75.00, 40.00, 10, true),
('p0000001-0001-0001-0001-000000000008', '550e8400-e29b-41d4-a716-446655440030', 'KP-BRD-001', 'Sandwich Bread', 'Fresh sandwich bread daily delivery', 'Food', 45.00, 25.00, 15, true),

-- Equipment
('p0000001-0001-0001-0001-000000000009', '550e8400-e29b-41d4-a716-446655440030', 'KP-FLT-001', 'Coffee Machine Filters', 'Replacement filters for coffee machines', 'Equipment', 120.00, 75.00, 5, true),
('p0000001-0001-0001-0001-000000000010', '550e8400-e29b-41d4-a716-446655440030', 'KP-CLN-001', 'Cleaning Supplies', 'Complete cleaning kit for equipment', 'Supplies', 85.00, 50.00, 8, true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update franchise locations with performance targets
UPDATE franchise_locations SET
  monthly_target = CASE 
    -- High Performers (₱300K-500K targets)
    WHEN name LIKE '%BGC%' OR name LIKE '%Makati%' THEN 450000
    WHEN name LIKE '%Ortigas%' OR name LIKE '%Alabang%' THEN 380000
    -- Average Performers (₱150K-250K targets)  
    WHEN name LIKE '%Quezon City%' OR name LIKE '%Pasig%' THEN 200000
    WHEN name LIKE '%Cebu%' OR name LIKE '%Davao%' THEN 180000
    WHEN name LIKE '%Ermita%' OR name LIKE '%Taguig%' THEN 160000
    -- Low Performers (₱80K-120K targets)
    WHEN name LIKE '%Baguio%' OR name LIKE '%Iloilo%' THEN 100000
    WHEN name LIKE '%Muntinlupa%' OR name LIKE '%Pasay%' THEN 90000
    -- Struggling Locations (₱40K-60K targets)
    ELSE 50000
  END
WHERE monthly_target IS NULL OR monthly_target = 0;

-- Step 3: Populate realistic inventory levels
-- Clear existing inventory for fresh data
DELETE FROM inventory_levels WHERE created_at > '2024-01-01';

-- Add inventory for first 5 products across warehouses
INSERT INTO inventory_levels (warehouse_id, product_id, quantity_on_hand, reserved_quantity, reorder_level, max_stock_level, cost_per_unit, created_at, updated_at)
SELECT 
  w.id as warehouse_id,
  p.id as product_id,
  -- Realistic quantities based on warehouse and product type
  CASE 
    WHEN w.name LIKE '%Central%' THEN 
      CASE 
        WHEN p.category = 'Coffee Beans' THEN 150 + FLOOR(RANDOM() * 100)  -- 150-250
        WHEN p.category = 'Supplies' THEN 300 + FLOOR(RANDOM() * 200)      -- 300-500
        ELSE 80 + FLOOR(RANDOM() * 70)                                     -- 80-150
      END
    ELSE 
      CASE 
        WHEN p.category = 'Coffee Beans' THEN 50 + FLOOR(RANDOM() * 50)    -- 50-100
        WHEN p.category = 'Supplies' THEN 100 + FLOOR(RANDOM() * 100)      -- 100-200
        ELSE 30 + FLOOR(RANDOM() * 40)                                     -- 30-70
      END
  END as quantity_on_hand,
  
  -- Some reserved stock
  CASE WHEN RANDOM() < 0.3 THEN FLOOR(RANDOM() * 15) + 5 ELSE 0 END as reserved_quantity,
  
  -- Reorder levels
  CASE 
    WHEN p.category = 'Coffee Beans' THEN 20
    WHEN p.category = 'Supplies' THEN 50
    ELSE 15
  END as reorder_level,
  
  -- Max stock levels
  CASE 
    WHEN w.name LIKE '%Central%' THEN 500
    ELSE 250
  END as max_stock_level,
  
  p.cost_price as cost_per_unit,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) as created_at,
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
LIMIT 50;  -- Limit to prevent timeout

-- Step 4: Create low stock scenarios for alerts
UPDATE inventory_levels 
SET quantity_on_hand = FLOOR(reorder_level * 0.7)  -- Below reorder point
WHERE warehouse_id IN (
  SELECT id FROM warehouses LIMIT 3
) 
AND product_id IN (
  SELECT id FROM products WHERE category IN ('Coffee Beans', 'Supplies') LIMIT 5
);

-- Step 5: Generate sales records for past 3 months
INSERT INTO sales_records (
  id, location_id, total_amount, tax_amount, payment_method, created_by, created_at, updated_at
)
SELECT 
  gen_random_uuid() as id,
  fl.id as location_id,
  
  -- Transaction amounts based on location performance
  CASE 
    WHEN fl.monthly_target >= 400000 THEN 800 + FLOOR(RANDOM() * 2200)   -- ₱800-3000
    WHEN fl.monthly_target >= 150000 THEN 500 + FLOOR(RANDOM() * 1500)   -- ₱500-2000
    WHEN fl.monthly_target >= 80000 THEN 300 + FLOOR(RANDOM() * 1000)    -- ₱300-1300
    ELSE 150 + FLOOR(RANDOM() * 500)                                     -- ₱150-650
  END as total_amount,
  
  -- 12% tax
  ROUND((
    CASE 
      WHEN fl.monthly_target >= 400000 THEN 800 + FLOOR(RANDOM() * 2200)
      WHEN fl.monthly_target >= 150000 THEN 500 + FLOOR(RANDOM() * 1500)
      WHEN fl.monthly_target >= 80000 THEN 300 + FLOOR(RANDOM() * 1000)
      ELSE 150 + FLOOR(RANDOM() * 500)
    END
  ) * 0.12, 2) as tax_amount,
  
  -- Payment methods
  CASE 
    WHEN RANDOM() < 0.4 THEN 'cash'
    WHEN RANDOM() < 0.7 THEN 'credit_card'
    WHEN RANDOM() < 0.9 THEN 'gcash'
    ELSE 'paymaya'
  END as payment_method,
  
  (SELECT id FROM user_profiles WHERE role = 'franchisee' LIMIT 1) as created_by,
  
  -- Past 3 months
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 90) as created_at,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 90) as updated_at

FROM franchise_locations fl
CROSS JOIN generate_series(1, 
  CASE 
    WHEN fl.monthly_target >= 400000 THEN 15  -- High performers
    WHEN fl.monthly_target >= 150000 THEN 10  -- Average performers
    WHEN fl.monthly_target >= 80000 THEN 6    -- Low performers
    ELSE 3                                    -- Struggling
  END
) as series
WHERE fl.monthly_target > 0
LIMIT 200;  -- Cap total transactions

-- Verification queries
SELECT 'Data Population Summary' as status;
SELECT 'Products' as table_name, COUNT(*) as record_count FROM products;
SELECT 'Inventory Levels' as table_name, COUNT(*) as record_count FROM inventory_levels;
SELECT 'Sales Records' as table_name, COUNT(*) as record_count FROM sales_records WHERE created_at >= NOW() - INTERVAL '3 months';
SELECT 'Low Stock Items' as alert_type, COUNT(*) as count FROM inventory_levels WHERE quantity_on_hand <= reorder_level;
