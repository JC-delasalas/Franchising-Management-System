-- Enhanced Product Catalog for Realistic Business Scenarios
-- This adds comprehensive product variety for inventory management

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

-- Verify product insertion
SELECT 'Enhanced Product Catalog' as status, COUNT(*) as total_products FROM products;
