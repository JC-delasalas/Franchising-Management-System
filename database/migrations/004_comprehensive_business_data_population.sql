-- =====================================================
-- COMPREHENSIVE BUSINESS DATA POPULATION
-- Realistic Franchise Network Scenarios
-- =====================================================

-- This script populates the database with realistic business scenarios
-- including diverse franchise performance, inventory challenges, and operational data

-- Step 1: Enhanced Franchise Locations with Performance Tiers
-- =====================================================

-- Update existing franchise locations with realistic performance characteristics
UPDATE franchise_locations SET
  status = 'open',
  opening_date = CASE 
    WHEN name LIKE '%Ermita%' THEN '2023-01-15'::date
    WHEN name LIKE '%Makati%' THEN '2022-08-20'::date
    WHEN name LIKE '%BGC%' THEN '2023-03-10'::date
    WHEN name LIKE '%Quezon City%' THEN '2022-11-05'::date
    WHEN name LIKE '%Cebu%' THEN '2023-02-28'::date
    ELSE '2023-01-01'::date
  END,
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
  END;

-- Step 2: Comprehensive Product Catalog Enhancement
-- =====================================================

-- Add more products for realistic inventory scenarios
INSERT INTO products (id, name, sku, category, price, cost_price, unit_of_measure, active, featured, description) VALUES
-- Coffee Products
('p0000001-0001-0001-0001-000000000001', 'Premium Arabica Beans', 'KP-ARB-001', 'Coffee Beans', 85.00, 45.00, 'kg', true, true, 'Premium single-origin Arabica coffee beans'),
('p0000001-0001-0001-0001-000000000002', 'Robusta Coffee Blend', 'KP-ROB-001', 'Coffee Beans', 65.00, 35.00, 'kg', true, false, 'Strong Robusta blend for espresso'),
('p0000001-0001-0001-0001-000000000003', 'Decaf Coffee Beans', 'KP-DEC-001', 'Coffee Beans', 95.00, 55.00, 'kg', true, false, 'Swiss water process decaffeinated beans'),

-- Beverages
('p0000001-0001-0001-0001-000000000004', 'Iced Coffee Concentrate', 'KP-ICE-001', 'Beverages', 120.00, 70.00, 'liter', true, true, 'Cold brew concentrate for iced coffee'),
('p0000001-0001-0001-0001-000000000005', 'Milk Tea Base', 'KP-MTB-001', 'Beverages', 150.00, 85.00, 'liter', true, true, 'Premium milk tea base concentrate'),
('p0000001-0001-0001-0001-000000000006', 'Fruit Syrup Assorted', 'KP-SYR-001', 'Beverages', 80.00, 45.00, 'bottle', true, false, 'Assorted fruit syrups for beverages'),

-- Food Items
('p0000001-0001-0001-0001-000000000007', 'Pastry Mix', 'KP-PST-001', 'Food', 75.00, 40.00, 'kg', true, true, 'All-purpose pastry and bread mix'),
('p0000001-0001-0001-0001-000000000008', 'Sandwich Bread', 'KP-BRD-001', 'Food', 45.00, 25.00, 'loaf', true, false, 'Fresh sandwich bread daily delivery'),
('p0000001-0001-0001-0001-000000000009', 'Cheese Slices', 'KP-CHE-001', 'Food', 180.00, 120.00, 'pack', true, false, 'Premium cheese slices for sandwiches'),

-- Supplies
('p0000001-0001-0001-0001-000000000010', 'Paper Cups 12oz', 'KP-CUP-012', 'Supplies', 25.00, 15.00, 'pack', true, true, 'Disposable paper cups 12oz (50pcs)'),
('p0000001-0001-0001-0001-000000000011', 'Paper Cups 16oz', 'KP-CUP-016', 'Supplies', 30.00, 18.00, 'pack', true, true, 'Disposable paper cups 16oz (50pcs)'),
('p0000001-0001-0001-0001-000000000012', 'Plastic Lids', 'KP-LID-001', 'Supplies', 20.00, 12.00, 'pack', true, false, 'Plastic lids for cups (100pcs)'),
('p0000001-0001-0001-0001-000000000013', 'Napkins', 'KP-NAP-001', 'Supplies', 35.00, 20.00, 'pack', true, false, 'Paper napkins (200pcs)'),
('p0000001-0001-0001-0001-000000000014', 'Stirrers', 'KP-STR-001', 'Supplies', 15.00, 8.00, 'pack', true, false, 'Wooden coffee stirrers (500pcs)'),

-- Equipment & Maintenance
('p0000001-0001-0001-0001-000000000015', 'Coffee Machine Filters', 'KP-FLT-001', 'Equipment', 120.00, 75.00, 'pack', true, false, 'Replacement filters for coffee machines'),
('p0000001-0001-0001-0001-000000000016', 'Cleaning Supplies', 'KP-CLN-001', 'Supplies', 85.00, 50.00, 'kit', true, false, 'Complete cleaning kit for equipment'),
('p0000001-0001-0001-0001-000000000017', 'Uniform Shirts', 'KP-UNI-001', 'Uniform', 350.00, 200.00, 'piece', true, false, 'Staff uniform shirts with logo'),

-- Seasonal Items
('p0000001-0001-0001-0001-000000000018', 'Holiday Blend Coffee', 'KP-HOL-001', 'Coffee Beans', 110.00, 65.00, 'kg', true, true, 'Special holiday season coffee blend'),
('p0000001-0001-0001-0001-000000000019', 'Summer Iced Tea Mix', 'KP-ICT-001', 'Beverages', 90.00, 50.00, 'kg', true, false, 'Refreshing iced tea mix for summer'),
('p0000001-0001-0001-0001-000000000020', 'Gift Cards', 'KP-GFT-001', 'Merchandise', 500.00, 500.00, 'piece', true, true, 'Franchise gift cards for customers')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Realistic Inventory Distribution Across Warehouses
-- =====================================================

-- Clear existing inventory_levels for fresh population
DELETE FROM inventory_levels;

-- Populate warehouse inventory with realistic scenarios
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
CROSS JOIN products p
WHERE 
  -- Only populate relevant products for each warehouse type
  (w.type = 'cold_storage' AND p.category IN ('Beverages', 'Food')) OR
  (w.type = 'distribution' AND p.category NOT IN ('Equipment')) OR
  (w.name LIKE '%Central%')  -- Central warehouses get all products
ORDER BY w.name, p.category, p.name;

-- Step 4: Create Critical Inventory Scenarios
-- =====================================================

-- Create low stock alerts (15-20 products below reorder points)
UPDATE inventory_levels 
SET quantity_on_hand = FLOOR(RANDOM() * reorder_level * 0.8)  -- 0-80% of reorder level
WHERE warehouse_id IN (
  SELECT id FROM warehouses WHERE name LIKE '%Central%' OR name LIKE '%Manila%'
) 
AND product_id IN (
  SELECT id FROM products WHERE featured = true OR category IN ('Coffee Beans', 'Supplies')
)
AND RANDOM() < 0.4;  -- 40% chance for featured/important products

-- Create overstocked scenarios (10-15 products exceeding max levels)
UPDATE inventory_levels 
SET quantity_on_hand = max_stock_level + FLOOR(RANDOM() * 100) + 50  -- Exceed max by 50-150
WHERE warehouse_id IN (
  SELECT id FROM warehouses WHERE type = 'distribution'
) 
AND product_id IN (
  SELECT id FROM products WHERE category IN ('Supplies', 'Equipment')
)
AND RANDOM() < 0.25;  -- 25% chance for supplies/equipment

-- Step 5: Comprehensive Sales Data Population (6 Months Historical)
-- =====================================================

-- Clear existing sales records for fresh population
DELETE FROM sales_records WHERE created_at > '2024-01-01';

-- Generate realistic sales data for the past 6 months
INSERT INTO sales_records (
  id, location_id, total_amount, tax_amount, discount_amount,
  payment_method, receipt_number, created_by, created_at, updated_at
)
SELECT
  gen_random_uuid() as id,
  fl.id as location_id,

  -- Realistic transaction amounts based on location performance tier
  CASE
    WHEN fl.monthly_target >= 400000 THEN  -- High performers
      CASE
        WHEN RANDOM() < 0.1 THEN FLOOR(RANDOM() * 8000) + 2000   -- 10% large orders ₱2K-10K
        WHEN RANDOM() < 0.4 THEN FLOOR(RANDOM() * 3000) + 500    -- 30% medium orders ₱500-3.5K
        ELSE FLOOR(RANDOM() * 1500) + 200                        -- 60% small orders ₱200-1.7K
      END
    WHEN fl.monthly_target >= 150000 THEN  -- Average performers
      CASE
        WHEN RANDOM() < 0.05 THEN FLOOR(RANDOM() * 5000) + 1500  -- 5% large orders ₱1.5K-6.5K
        WHEN RANDOM() < 0.35 THEN FLOOR(RANDOM() * 2000) + 400   -- 30% medium orders ₱400-2.4K
        ELSE FLOOR(RANDOM() * 1000) + 150                        -- 65% small orders ₱150-1.15K
      END
    WHEN fl.monthly_target >= 80000 THEN   -- Low performers
      CASE
        WHEN RANDOM() < 0.02 THEN FLOOR(RANDOM() * 3000) + 1000  -- 2% large orders ₱1K-4K
        WHEN RANDOM() < 0.25 THEN FLOOR(RANDOM() * 1500) + 300   -- 23% medium orders ₱300-1.8K
        ELSE FLOOR(RANDOM() * 800) + 100                         -- 75% small orders ₱100-900
      END
    ELSE  -- Struggling locations
      CASE
        WHEN RANDOM() < 0.01 THEN FLOOR(RANDOM() * 2000) + 500   -- 1% large orders ₱500-2.5K
        WHEN RANDOM() < 0.15 THEN FLOOR(RANDOM() * 1000) + 200   -- 14% medium orders ₱200-1.2K
        ELSE FLOOR(RANDOM() * 500) + 80                          -- 85% small orders ₱80-580
      END
  END as total_amount,

  -- Tax amount (12% VAT)
  ROUND((
    CASE
      WHEN fl.monthly_target >= 400000 THEN
        CASE
          WHEN RANDOM() < 0.1 THEN FLOOR(RANDOM() * 8000) + 2000
          WHEN RANDOM() < 0.4 THEN FLOOR(RANDOM() * 3000) + 500
          ELSE FLOOR(RANDOM() * 1500) + 200
        END
      WHEN fl.monthly_target >= 150000 THEN
        CASE
          WHEN RANDOM() < 0.05 THEN FLOOR(RANDOM() * 5000) + 1500
          WHEN RANDOM() < 0.35 THEN FLOOR(RANDOM() * 2000) + 400
          ELSE FLOOR(RANDOM() * 1000) + 150
        END
      WHEN fl.monthly_target >= 80000 THEN
        CASE
          WHEN RANDOM() < 0.02 THEN FLOOR(RANDOM() * 3000) + 1000
          WHEN RANDOM() < 0.25 THEN FLOOR(RANDOM() * 1500) + 300
          ELSE FLOOR(RANDOM() * 800) + 100
        END
      ELSE
        CASE
          WHEN RANDOM() < 0.01 THEN FLOOR(RANDOM() * 2000) + 500
          WHEN RANDOM() < 0.15 THEN FLOOR(RANDOM() * 1000) + 200
          ELSE FLOOR(RANDOM() * 500) + 80
        END
    END
  ) * 0.12, 2) as tax_amount,

  -- Discount amount (0-15% for some transactions)
  CASE
    WHEN RANDOM() < 0.2 THEN ROUND((
      CASE
        WHEN fl.monthly_target >= 400000 THEN
          CASE
            WHEN RANDOM() < 0.1 THEN FLOOR(RANDOM() * 8000) + 2000
            WHEN RANDOM() < 0.4 THEN FLOOR(RANDOM() * 3000) + 500
            ELSE FLOOR(RANDOM() * 1500) + 200
          END
        ELSE FLOOR(RANDOM() * 1000) + 100
      END
    ) * (RANDOM() * 0.15), 2)  -- 0-15% discount
    ELSE 0
  END as discount_amount,

  -- Payment methods distribution
  CASE
    WHEN RANDOM() < 0.4 THEN 'cash'
    WHEN RANDOM() < 0.7 THEN 'credit_card'
    WHEN RANDOM() < 0.85 THEN 'gcash'
    WHEN RANDOM() < 0.95 THEN 'paymaya'
    ELSE 'bank_transfer'
  END as payment_method,

  -- Receipt numbers
  'RCP-' || TO_CHAR(NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 180), 'YYYYMMDD') || '-' ||
  LPAD(FLOOR(RANDOM() * 9999)::text, 4, '0') as receipt_number,

  -- Created by (franchise staff)
  (SELECT id FROM user_profiles WHERE role = 'franchisee' ORDER BY RANDOM() LIMIT 1) as created_by,

  -- Transaction dates (past 6 months with realistic patterns)
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 180) -
  INTERVAL '1 hour' * FLOOR(RANDOM() * 12) as created_at,

  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 180) as updated_at

FROM franchise_locations fl
CROSS JOIN generate_series(1,
  -- Number of transactions per location based on performance
  CASE
    WHEN fl.monthly_target >= 400000 THEN 120  -- High performers: ~120 transactions
    WHEN fl.monthly_target >= 150000 THEN 80   -- Average performers: ~80 transactions
    WHEN fl.monthly_target >= 80000 THEN 50    -- Low performers: ~50 transactions
    ELSE 25                                    -- Struggling: ~25 transactions
  END
) as series
WHERE fl.status = 'open'
LIMIT 1000;  -- Cap at 1000 total transactions for performance

-- Step 6: Operational Challenges and Pending Approvals
-- =====================================================

-- Create pending orders requiring franchisor approval
INSERT INTO orders (
  id, franchise_location_id, total_amount, status, priority,
  approval_required, created_by, notes, created_at, updated_at
)
SELECT
  gen_random_uuid() as id,
  fl.id as franchise_location_id,

  -- Large orders requiring approval (₱15K-50K)
  FLOOR(RANDOM() * 35000) + 15000 as total_amount,

  'pending_approval' as status,

  CASE
    WHEN RANDOM() < 0.3 THEN 'high'
    WHEN RANDOM() < 0.7 THEN 'medium'
    ELSE 'normal'
  END as priority,

  true as approval_required,

  (SELECT id FROM user_profiles WHERE role = 'franchisee' ORDER BY RANDOM() LIMIT 1) as created_by,

  CASE
    WHEN RANDOM() < 0.2 THEN 'Bulk order for promotional event'
    WHEN RANDOM() < 0.4 THEN 'Equipment replacement - urgent'
    WHEN RANDOM() < 0.6 THEN 'Seasonal inventory preparation'
    WHEN RANDOM() < 0.8 THEN 'New product line introduction'
    ELSE 'Regular bulk restocking order'
  END as notes,

  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 7) as created_at,
  NOW() - INTERVAL '1 hour' * FLOOR(RANDOM() * 24) as updated_at

FROM franchise_locations fl
WHERE fl.status = 'open' AND RANDOM() < 0.4  -- 40% of locations have pending orders
LIMIT 15;

-- Create some approved orders for comparison
INSERT INTO orders (
  id, franchise_location_id, total_amount, status, priority,
  approval_required, approved_by, approved_at, created_by, notes, created_at, updated_at
)
SELECT
  gen_random_uuid() as id,
  fl.id as franchise_location_id,
  FLOOR(RANDOM() * 25000) + 10000 as total_amount,
  'approved' as status,
  'normal' as priority,
  true as approval_required,
  (SELECT id FROM user_profiles WHERE role = 'franchisor' LIMIT 1) as approved_by,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 3) as approved_at,
  (SELECT id FROM user_profiles WHERE role = 'franchisee' ORDER BY RANDOM() LIMIT 1) as created_by,
  'Approved bulk order - processing' as notes,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 10) as created_at,
  NOW() - INTERVAL '1 hour' * FLOOR(RANDOM() * 12) as updated_at

FROM franchise_locations fl
WHERE fl.status = 'open' AND RANDOM() < 0.3  -- 30% have recent approved orders
LIMIT 10;

-- Step 7: Performance Alerts and Notifications
-- =====================================================

-- Create performance-based notifications
INSERT INTO notifications (
  id, user_id, title, message, type, priority, read, created_at
)
SELECT
  gen_random_uuid() as id,
  up.id as user_id,

  CASE
    WHEN fl.monthly_target < 60000 THEN 'Performance Alert: Low Sales'
    WHEN EXISTS (
      SELECT 1 FROM inventory_levels il
      JOIN warehouses w ON il.warehouse_id = w.id
      WHERE il.quantity_on_hand <= il.reorder_level
      AND w.name LIKE '%' || fl.city || '%'
    ) THEN 'Inventory Alert: Low Stock Items'
    WHEN RANDOM() < 0.3 THEN 'Training Reminder: Monthly Compliance'
    WHEN RANDOM() < 0.5 THEN 'New Product Launch: Holiday Specials'
    ELSE 'System Update: Dashboard Enhancements'
  END as title,

  CASE
    WHEN fl.monthly_target < 60000 THEN
      'Your location performance is below target. Contact support for assistance with sales strategies.'
    WHEN EXISTS (
      SELECT 1 FROM inventory_levels il
      JOIN warehouses w ON il.warehouse_id = w.id
      WHERE il.quantity_on_hand <= il.reorder_level
      AND w.name LIKE '%' || fl.city || '%'
    ) THEN
      'Several items are running low in your area warehouse. Please review and place reorder requests.'
    WHEN RANDOM() < 0.3 THEN
      'Monthly compliance training is due by the end of this week. Please complete the required modules.'
    WHEN RANDOM() < 0.5 THEN
      'New holiday-themed products are now available for order. Update your inventory for the season.'
    ELSE
      'Dashboard has been updated with new analytics features. Check out the enhanced reporting tools.'
  END as message,

  CASE
    WHEN fl.monthly_target < 60000 THEN 'alert'
    WHEN EXISTS (
      SELECT 1 FROM inventory_levels il
      JOIN warehouses w ON il.warehouse_id = w.id
      WHERE il.quantity_on_hand <= il.reorder_level
      AND w.name LIKE '%' || fl.city || '%'
    ) THEN 'warning'
    ELSE 'info'
  END as type,

  CASE
    WHEN fl.monthly_target < 60000 THEN 'high'
    WHEN EXISTS (
      SELECT 1 FROM inventory_levels il
      JOIN warehouses w ON il.warehouse_id = w.id
      WHERE il.quantity_on_hand <= il.reorder_level
      AND w.name LIKE '%' || fl.city || '%'
    ) THEN 'medium'
    ELSE 'low'
  END as priority,

  RANDOM() < 0.3 as read,  -- 30% of notifications are read

  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 14) as created_at

FROM user_profiles up
JOIN franchise_locations fl ON up.metadata->>'primary_location_id' = fl.id::text
WHERE up.role = 'franchisee'
LIMIT 25;

-- Step 8: Data Validation and Summary
-- =====================================================

-- Validation queries to verify data population
SELECT 'VALIDATION: Data Population Summary' as status;

-- Inventory summary
SELECT
  'Inventory Levels' as data_type,
  COUNT(*) as total_records,
  COUNT(CASE WHEN quantity_on_hand <= reorder_level THEN 1 END) as low_stock_items,
  COUNT(CASE WHEN quantity_on_hand > max_stock_level THEN 1 END) as overstocked_items,
  ROUND(SUM(quantity_on_hand * cost_per_unit), 2) as total_inventory_value
FROM inventory_levels;

-- Sales summary
SELECT
  'Sales Records' as data_type,
  COUNT(*) as total_transactions,
  ROUND(SUM(total_amount), 2) as total_sales_value,
  ROUND(AVG(total_amount), 2) as average_transaction,
  COUNT(DISTINCT location_id) as locations_with_sales
FROM sales_records
WHERE created_at >= NOW() - INTERVAL '6 months';

-- Orders summary
SELECT
  'Orders' as data_type,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_approvals,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_orders,
  ROUND(SUM(total_amount), 2) as total_order_value
FROM orders;

-- Notifications summary
SELECT
  'Notifications' as data_type,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN type = 'alert' THEN 1 END) as alerts,
  COUNT(CASE WHEN type = 'warning' THEN 1 END) as warnings,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_notifications
FROM notifications;

-- Performance tier summary
SELECT
  'Franchise Performance Tiers' as data_type,
  COUNT(CASE WHEN monthly_target >= 400000 THEN 1 END) as high_performers,
  COUNT(CASE WHEN monthly_target >= 150000 AND monthly_target < 400000 THEN 1 END) as average_performers,
  COUNT(CASE WHEN monthly_target >= 80000 AND monthly_target < 150000 THEN 1 END) as low_performers,
  COUNT(CASE WHEN monthly_target < 80000 THEN 1 END) as struggling_locations
FROM franchise_locations
WHERE status = 'open';

SELECT 'Comprehensive Business Data Population Complete' as final_status,
       'Database now contains realistic franchise network scenarios' as description;
