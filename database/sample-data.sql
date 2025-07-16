-- =============================================
-- FRANCHISEHUB SAMPLE DATA FOR TESTING
-- =============================================

-- STEP 1: INSERT ORGANIZATIONS
-- =============================================

INSERT INTO organizations (id, name, description, type, contact_email, contact_phone) VALUES 
(gen_random_uuid(), 'FranchiseHub Corp', 'Leading franchise management company in the Philippines', 'franchisor', 'info@franchisehub.ph', '+63-2-8123-4567'),
(gen_random_uuid(), 'Philippine Franchise Association', 'Supporting franchise development nationwide', 'management_company', 'contact@pfa.ph', '+63-2-8765-4321');

-- STEP 2: INSERT PRODUCT CATEGORIES
-- =============================================

INSERT INTO product_categories (id, name, description, sort_order) VALUES 
(gen_random_uuid(), 'Food & Beverages', 'Food and beverage products for restaurants and cafes', 1),
(gen_random_uuid(), 'Kitchen Equipment', 'Professional kitchen equipment and appliances', 2),
(gen_random_uuid(), 'Furniture & Fixtures', 'Restaurant furniture, tables, chairs, and fixtures', 3),
(gen_random_uuid(), 'Marketing Materials', 'Promotional materials, signage, and branding items', 4),
(gen_random_uuid(), 'Cleaning Supplies', 'Cleaning and sanitation products', 5),
(gen_random_uuid(), 'Packaging & Disposables', 'Food packaging, containers, and disposable items', 6);

-- STEP 3: INSERT PRODUCTS
-- =============================================

-- Food & Beverages
INSERT INTO products (id, name, description, sku, category_id, price, cost, unit_of_measure, minimum_order_quantity, reorder_level, images, tags) VALUES 
(gen_random_uuid(), 'Premium Coffee Beans - Arabica Blend', 'High-quality Arabica coffee beans from Batangas', 'FB-001', (SELECT id FROM product_categories WHERE name = 'Food & Beverages'), 450.00, 300.00, 'kg', 5, 20, ARRAY['https://example.com/coffee-beans.jpg'], ARRAY['coffee', 'arabica', 'premium']),
(gen_random_uuid(), 'Barako Coffee Beans', 'Traditional Filipino Barako coffee beans', 'FB-002', (SELECT id FROM product_categories WHERE name = 'Food & Beverages'), 380.00, 250.00, 'kg', 5, 15, ARRAY['https://example.com/barako-beans.jpg'], ARRAY['coffee', 'barako', 'local']),
(gen_random_uuid(), 'Fresh Milk - 1 Liter', 'Fresh dairy milk for beverages', 'FB-003', (SELECT id FROM product_categories WHERE name = 'Food & Beverages'), 85.00, 65.00, 'liter', 10, 50, ARRAY['https://example.com/fresh-milk.jpg'], ARRAY['milk', 'dairy', 'fresh']),
(gen_random_uuid(), 'Sugar - White Refined', 'Premium white refined sugar', 'FB-004', (SELECT id FROM product_categories WHERE name = 'Food & Beverages'), 65.00, 45.00, 'kg', 10, 30, ARRAY['https://example.com/sugar.jpg'], ARRAY['sugar', 'sweetener']);

-- Kitchen Equipment
INSERT INTO products (id, name, description, sku, category_id, price, cost, unit_of_measure, minimum_order_quantity, reorder_level, images, tags) VALUES 
(gen_random_uuid(), 'Commercial Espresso Machine', 'Professional 2-group espresso machine', 'KE-001', (SELECT id FROM product_categories WHERE name = 'Kitchen Equipment'), 125000.00, 95000.00, 'unit', 1, 2, ARRAY['https://example.com/espresso-machine.jpg'], ARRAY['espresso', 'machine', 'commercial']),
(gen_random_uuid(), 'Coffee Grinder - Commercial', 'Heavy-duty commercial coffee grinder', 'KE-002', (SELECT id FROM product_categories WHERE name = 'Kitchen Equipment'), 35000.00, 25000.00, 'unit', 1, 3, ARRAY['https://example.com/coffee-grinder.jpg'], ARRAY['grinder', 'coffee', 'commercial']),
(gen_random_uuid(), 'Refrigerator - Display Chiller', '3-door display chiller for beverages', 'KE-003', (SELECT id FROM product_categories WHERE name = 'Kitchen Equipment'), 85000.00, 65000.00, 'unit', 1, 2, ARRAY['https://example.com/display-chiller.jpg'], ARRAY['refrigerator', 'chiller', 'display']),
(gen_random_uuid(), 'Blender - Commercial Grade', 'High-power commercial blender for smoothies', 'KE-004', (SELECT id FROM product_categories WHERE name = 'Kitchen Equipment'), 15000.00, 11000.00, 'unit', 1, 5, ARRAY['https://example.com/blender.jpg'], ARRAY['blender', 'commercial', 'smoothie']);

-- Furniture & Fixtures
INSERT INTO products (id, name, description, sku, category_id, price, cost, unit_of_measure, minimum_order_quantity, reorder_level, images, tags) VALUES 
(gen_random_uuid(), 'Dining Table - 4 Seater', 'Wooden dining table for 4 people', 'FF-001', (SELECT id FROM product_categories WHERE name = 'Furniture & Fixtures'), 8500.00, 6000.00, 'unit', 2, 10, ARRAY['https://example.com/dining-table.jpg'], ARRAY['table', 'dining', 'wood']),
(gen_random_uuid(), 'Dining Chair - Cushioned', 'Comfortable cushioned dining chair', 'FF-002', (SELECT id FROM product_categories WHERE name = 'Furniture & Fixtures'), 2500.00, 1800.00, 'unit', 4, 20, ARRAY['https://example.com/dining-chair.jpg'], ARRAY['chair', 'cushioned', 'dining']),
(gen_random_uuid(), 'Counter Stool - Bar Height', 'Modern bar height counter stool', 'FF-003', (SELECT id FROM product_categories WHERE name = 'Furniture & Fixtures'), 3200.00, 2300.00, 'unit', 2, 15, ARRAY['https://example.com/counter-stool.jpg'], ARRAY['stool', 'counter', 'bar']);

-- Marketing Materials
INSERT INTO products (id, name, description, sku, category_id, price, cost, unit_of_measure, minimum_order_quantity, reorder_level, images, tags) VALUES 
(gen_random_uuid(), 'LED Menu Board', 'Digital LED menu display board', 'MM-001', (SELECT id FROM product_categories WHERE name = 'Marketing Materials'), 25000.00, 18000.00, 'unit', 1, 3, ARRAY['https://example.com/led-menu.jpg'], ARRAY['menu', 'led', 'digital']),
(gen_random_uuid(), 'Promotional Banners', 'Custom promotional vinyl banners', 'MM-002', (SELECT id FROM product_categories WHERE name = 'Marketing Materials'), 1500.00, 1000.00, 'piece', 5, 10, ARRAY['https://example.com/banner.jpg'], ARRAY['banner', 'promotional', 'vinyl']);

-- STEP 4: INSERT WAREHOUSES
-- =============================================

INSERT INTO warehouses (id, name, address, city, state, country, active) VALUES 
(gen_random_uuid(), 'Main Distribution Center', '123 Industrial Ave, Laguna Technopark', 'Biñan', 'Laguna', 'Philippines', true),
(gen_random_uuid(), 'Metro Manila Hub', '456 Commerce St, Ortigas Center', 'Pasig', 'Metro Manila', 'Philippines', true),
(gen_random_uuid(), 'Cebu Regional Warehouse', '789 Business Park Rd, IT Park', 'Cebu City', 'Cebu', 'Philippines', true);

-- STEP 5: INSERT INVENTORY
-- =============================================

-- Get warehouse and product IDs for inventory
WITH warehouse_main AS (SELECT id FROM warehouses WHERE name = 'Main Distribution Center'),
     warehouse_manila AS (SELECT id FROM warehouses WHERE name = 'Metro Manila Hub'),
     warehouse_cebu AS (SELECT id FROM warehouses WHERE name = 'Cebu Regional Warehouse')

-- Main Distribution Center Inventory
INSERT INTO inventory (warehouse_id, product_id, quantity_on_hand, reserved_quantity, reorder_level) 
SELECT 
    w.id as warehouse_id,
    p.id as product_id,
    CASE 
        WHEN p.sku LIKE 'FB-%' THEN 100 + (RANDOM() * 200)::INTEGER
        WHEN p.sku LIKE 'KE-%' THEN 5 + (RANDOM() * 10)::INTEGER
        WHEN p.sku LIKE 'FF-%' THEN 20 + (RANDOM() * 30)::INTEGER
        WHEN p.sku LIKE 'MM-%' THEN 10 + (RANDOM() * 20)::INTEGER
        ELSE 50
    END as quantity_on_hand,
    0 as reserved_quantity,
    p.reorder_level
FROM warehouse_main w
CROSS JOIN products p;

-- Metro Manila Hub Inventory (smaller quantities)
INSERT INTO inventory (warehouse_id, product_id, quantity_on_hand, reserved_quantity, reorder_level)
SELECT 
    w.id as warehouse_id,
    p.id as product_id,
    CASE 
        WHEN p.sku LIKE 'FB-%' THEN 50 + (RANDOM() * 100)::INTEGER
        WHEN p.sku LIKE 'KE-%' THEN 2 + (RANDOM() * 5)::INTEGER
        WHEN p.sku LIKE 'FF-%' THEN 10 + (RANDOM() * 15)::INTEGER
        WHEN p.sku LIKE 'MM-%' THEN 5 + (RANDOM() * 10)::INTEGER
        ELSE 25
    END as quantity_on_hand,
    0 as reserved_quantity,
    p.reorder_level
FROM warehouse_manila w
CROSS JOIN products p;

-- STEP 6: CREATE SAMPLE FRANCHISES
-- =============================================

INSERT INTO franchises (id, organization_id, name, description, category, investment_range_min, investment_range_max, franchise_fee, royalty_rate, marketing_fee_rate, territory, status, featured) VALUES 
(gen_random_uuid(), (SELECT id FROM organizations WHERE name = 'FranchiseHub Corp'), 'Coffee Corner Express', 'Premium coffee shop franchise with modern ambiance', 'Food & Beverage', 500000.00, 1000000.00, 150000.00, 0.05, 0.02, 'Metro Manila', 'active', true),
(gen_random_uuid(), (SELECT id FROM organizations WHERE name = 'FranchiseHub Corp'), 'Quick Bites Deli', 'Fast-casual dining franchise specializing in sandwiches and salads', 'Food & Beverage', 300000.00, 600000.00, 100000.00, 0.04, 0.015, 'Nationwide', 'active', true),
(gen_random_uuid(), (SELECT id FROM organizations WHERE name = 'FranchiseHub Corp'), 'Bubble Tea Paradise', 'Trendy bubble tea and dessert franchise', 'Food & Beverage', 200000.00, 400000.00, 75000.00, 0.06, 0.02, 'Urban Areas', 'active', false);

-- STEP 7: VERIFICATION QUERIES
-- =============================================

-- Check data was inserted correctly
SELECT 'Organizations' as table_name, COUNT(*) as record_count FROM organizations
UNION ALL
SELECT 'Product Categories', COUNT(*) FROM product_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Warehouses', COUNT(*) FROM warehouses
UNION ALL
SELECT 'Inventory Records', COUNT(*) FROM inventory
UNION ALL
SELECT 'Franchises', COUNT(*) FROM franchises
ORDER BY table_name;

-- Check inventory levels by warehouse
SELECT 
    w.name as warehouse_name,
    COUNT(i.id) as products_stocked,
    SUM(i.quantity_on_hand) as total_units,
    SUM(i.available_quantity) as available_units
FROM warehouses w
LEFT JOIN inventory i ON w.id = i.warehouse_id
GROUP BY w.id, w.name
ORDER BY w.name;

-- Check products by category
SELECT 
    pc.name as category_name,
    COUNT(p.id) as product_count,
    AVG(p.price) as avg_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM product_categories pc
LEFT JOIN products p ON pc.id = p.category_id
GROUP BY pc.id, pc.name
ORDER BY pc.sort_order;
