-- Demo Data Setup for Enhanced Schema
-- This creates demo users, franchises, and sample data for testing

-- ============================================================================
-- DEMO ORGANIZATIONS
-- ============================================================================
INSERT INTO organizations (id, name, description, type, status, contact_email, contact_phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'FranchiseHub Corp', 'Leading franchise management company in the Philippines', 'franchisor', 'active', 'admin@franchisehub.com', '+63-2-123-4567'),
('550e8400-e29b-41d4-a716-446655440002', 'Metro Franchise Group', 'Regional franchise development company', 'franchisor', 'active', 'info@metrofranchise.com', '+63-2-234-5678')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO USER PROFILES
-- ============================================================================
-- Note: These users should be created in Supabase Auth first
-- For demo purposes, we'll create profiles that can be linked to auth users

INSERT INTO user_profiles (id, email, full_name, role, status, metadata, timezone) VALUES
-- Franchisor Demo User
('550e8400-e29b-41d4-a716-446655440010', 'franchisor@demo.com', 'John Franchisor', 'franchisor', 'active', 
 '{"organization_id": "550e8400-e29b-41d4-a716-446655440001", "permissions": {"manage_franchises": true, "approve_applications": true}}', 'Asia/Manila'),

-- Franchisee Demo User
('550e8400-e29b-41d4-a716-446655440011', 'franchisee@demo.com', 'Maria Franchisee', 'franchisee', 'active', 
 '{"primary_location_id": "550e8400-e29b-41d4-a716-446655440020", "permissions": {"manage_location": true}}', 'Asia/Manila'),

-- Admin Demo User
('550e8400-e29b-41d4-a716-446655440012', 'admin@demo.com', 'Admin User', 'admin', 'active', 
 '{"permissions": {"full_access": true}}', 'Asia/Manila')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ORGANIZATION MEMBERS
-- ============================================================================
INSERT INTO organization_members (organization_id, user_id, role, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'owner', true),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 'admin', true)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- ============================================================================
-- DEMO FRANCHISES
-- ============================================================================
INSERT INTO franchises (id, organization_id, name, description, category, investment_range_min, investment_range_max, 
                       franchise_fee, royalty_rate, marketing_fee_rate, status, featured, owner_id) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', 
 'Siomai Express', 'Premium siomai franchise with proven business model', 'Food & Beverage', 
 150000, 500000, 50000, 5.00, 2.00, 'active', true, '550e8400-e29b-41d4-a716-446655440010'),

('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', 
 'Coffee Corner', 'Specialty coffee shop franchise', 'Food & Beverage', 
 200000, 800000, 75000, 6.00, 2.50, 'active', true, '550e8400-e29b-41d4-a716-446655440010'),

('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440001', 
 'Laundry Plus', 'Modern laundromat franchise', 'Services', 
 300000, 1000000, 100000, 4.00, 1.50, 'active', false, '550e8400-e29b-41d4-a716-446655440010')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FRANCHISE PACKAGES
-- ============================================================================
INSERT INTO franchise_packages (id, franchise_id, name, description, initial_fee, monthly_royalty_rate, 
                               marketing_fee_rate, max_locations, active, sort_order) VALUES
-- Siomai Express Packages
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440030', 
 'Starter', 'Basic siomai cart setup', 150000, 5.00, 2.00, 1, true, 1),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440030', 
 'Standard', 'Small store setup with equipment', 300000, 5.00, 2.00, 2, true, 2),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440030', 
 'Premium', 'Full restaurant setup', 500000, 5.00, 2.00, 5, true, 3),

-- Coffee Corner Packages
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440031', 
 'Kiosk', 'Coffee kiosk setup', 200000, 6.00, 2.50, 1, true, 1),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440031', 
 'Cafe', 'Full coffee shop', 500000, 6.00, 2.50, 3, true, 2),

-- Laundry Plus Packages
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440032', 
 'Express', 'Basic laundromat', 300000, 4.00, 1.50, 1, true, 1),
('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440032', 
 'Full Service', 'Complete laundry service', 800000, 4.00, 1.50, 2, true, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO FRANCHISE LOCATIONS
-- ============================================================================
INSERT INTO franchise_locations (id, franchise_id, franchisee_id, name, address, city, state, 
                                country, status, opening_date) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', 
 '550e8400-e29b-41d4-a716-446655440011', 'Siomai Express - Makati', 
 'Unit 123, Ayala Avenue, Makati City', 'Makati', 'Metro Manila', 'Philippines', 'open', '2024-01-15'),

('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440031', 
 '550e8400-e29b-41d4-a716-446655440011', 'Coffee Corner - BGC', 
 'Unit 456, BGC Central, Taguig City', 'Taguig', 'Metro Manila', 'Philippines', 'construction', '2024-03-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO FRANCHISE APPLICATION
-- ============================================================================
INSERT INTO franchise_applications (id, franchise_id, package_id, applicant_id, status, 
                                   application_data, initial_payment_amount, submitted_at, approved_at, approved_by) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440030', 
 '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440011', 'approved',
 '{"personal_info": {"full_name": "Maria Franchisee", "email": "franchisee@demo.com", "phone": "+63-917-123-4567"}, 
   "business_experience": {"years_experience": 5, "management_experience": true}, 
   "financial_info": {"liquid_capital": 400000, "net_worth": 800000}}',
 300000, '2024-01-01 10:00:00+08', '2024-01-05 14:30:00+08', '550e8400-e29b-41d4-a716-446655440010')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO PRODUCTS
-- ============================================================================
INSERT INTO products (id, franchise_id, sku, name, description, category, price, cost_price, 
                     minimum_order_qty, active) VALUES
-- Siomai Express Products
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440030', 
 'SIO-001', 'Pork Siomai', 'Premium pork siomai (12 pcs)', 'Food', 120.00, 60.00, 10, true),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440030', 
 'SIO-002', 'Chicken Siomai', 'Chicken siomai (12 pcs)', 'Food', 100.00, 50.00, 10, true),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440030', 
 'SIO-003', 'Beef Siomai', 'Premium beef siomai (12 pcs)', 'Food', 150.00, 75.00, 10, true),

-- Coffee Corner Products
('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440031', 
 'COF-001', 'Americano', 'Premium americano coffee', 'Beverage', 120.00, 40.00, 5, true),
('550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440031', 
 'COF-002', 'Cappuccino', 'Classic cappuccino', 'Beverage', 150.00, 50.00, 5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO WAREHOUSES
-- ============================================================================
INSERT INTO warehouses (id, code, name, description, city, state, country, status) VALUES
('550e8400-e29b-41d4-a716-446655440070', 'WH-MNL-01', 'Manila Central Warehouse', 
 'Main distribution center for Metro Manila', 'Manila', 'Metro Manila', 'Philippines', 'active'),
('550e8400-e29b-41d4-a716-446655440071', 'WH-CEU-01', 'Cebu Distribution Center', 
 'Regional warehouse for Visayas', 'Cebu City', 'Cebu', 'Philippines', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO INVENTORY LEVELS
-- ============================================================================
INSERT INTO inventory_levels (warehouse_id, product_id, quantity_on_hand, reorder_level, max_stock_level, cost_per_unit) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440060', 150, 20, 500, 60.00),
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440061', 200, 25, 600, 50.00),
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440062', 100, 15, 400, 75.00),
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440063', 80, 10, 300, 40.00),
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440064', 120, 15, 400, 50.00)
ON CONFLICT (warehouse_id, product_id) DO NOTHING;

-- ============================================================================
-- DEMO ORDERS
-- ============================================================================
INSERT INTO orders (id, order_number, franchise_location_id, status, order_date, subtotal, total_amount, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440080', 'ORD-2024-000001', '550e8400-e29b-41d4-a716-446655440020', 
 'Completed', '2024-01-10 09:00:00+08', 2400.00, 2400.00, '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440081', 'ORD-2024-000002', '550e8400-e29b-41d4-a716-446655440020', 
 'Processing', '2024-01-15 14:30:00+08', 1800.00, 1800.00, '550e8400-e29b-41d4-a716-446655440011')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO ORDER ITEMS
-- ============================================================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440060', 10, 120.00, 1200.00),
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440061', 12, 100.00, 1200.00),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440062', 12, 150.00, 1800.00)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO INVOICES
-- ============================================================================
INSERT INTO invoices (id, order_id, location_id, invoice_number, invoice_type, total_amount, 
                     issue_date, due_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440080', 
 '550e8400-e29b-41d4-a716-446655440020', 'INV-2024-000001', 'order', 2400.00, 
 '2024-01-10', '2024-02-09', 'paid'),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440081', 
 '550e8400-e29b-41d4-a716-446655440020', 'INV-2024-000002', 'order', 1800.00, 
 '2024-01-15', '2024-02-14', 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEMO PAYMENTS
-- ============================================================================
INSERT INTO payments (invoice_id, amount, payment_method, payment_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440090', 2400.00, 'bank_transfer', '2024-01-12 10:30:00+08', 'completed')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO PERFORMANCE TARGETS
-- ============================================================================
INSERT INTO performance_targets (franchise_location_id, target_type, target_revenue, start_date, end_date, actual_value) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'revenue', 50000.00, '2024-01-01', '2024-01-31', 45250.00),
('550e8400-e29b-41d4-a716-446655440020', 'revenue', 200000.00, '2024-01-01', '2024-03-31', 135000.00)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UPDATE USER METADATA WITH LOCATION REFERENCES
-- ============================================================================
UPDATE user_profiles 
SET metadata = metadata || '{"primary_location_id": "550e8400-e29b-41d4-a716-446655440020"}'::jsonb
WHERE id = '550e8400-e29b-41d4-a716-446655440011';

-- ============================================================================
-- DEMO NOTIFICATION
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Demo data setup completed successfully!';
    RAISE NOTICE 'Demo accounts:';
    RAISE NOTICE '  Franchisor: franchisor@demo.com / demo123';
    RAISE NOTICE '  Franchisee: franchisee@demo.com / demo123';
    RAISE NOTICE '  Admin: admin@demo.com / demo123';
    RAISE NOTICE '';
    RAISE NOTICE 'Note: You need to create these users in Supabase Auth with the same email addresses and password "demo123"';
END $$;
