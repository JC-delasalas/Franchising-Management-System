-- ============================================================================
-- DEMO USER SETUP SCRIPT
-- ============================================================================
--
-- STEP 1: Create Auth Users in Supabase Dashboard
-- ============================================================================
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" and create these three users:
--
--    User 1:
--    - Email: franchisor@demo.com
--    - Password: demo123
--    - Email Confirm: true
--
--    User 2:
--    - Email: franchisee@demo.com
--    - Password: demo123
--    - Email Confirm: true
--
--    User 3:
--    - Email: admin@demo.com
--    - Password: demo123
--    - Email Confirm: true
--
-- 3. After creating each user, copy their UUID from the Users table
-- 4. Replace the placeholder UUIDs below with the actual auth.users IDs
-- 5. Run this script in the Supabase SQL Editor
--
-- ============================================================================
-- STEP 2: Update UUIDs and Run This Script
-- ============================================================================

-- Demo User Profiles
-- Replace these UUIDs with actual auth.users IDs after creating auth users
INSERT INTO user_profiles (id, email, full_name, role, status, metadata) VALUES
-- Franchisor Demo User (replace with actual auth.users ID)
('REPLACE_WITH_FRANCHISOR_AUTH_ID', 'franchisor@demo.com', 'John Franchisor', 'franchisor', 'active', 
 '{"organization_id": "550e8400-e29b-41d4-a716-446655440001", "permissions": {"manage_franchises": true, "approve_applications": true}}'),

-- Franchisee Demo User (replace with actual auth.users ID)
('REPLACE_WITH_FRANCHISEE_AUTH_ID', 'franchisee@demo.com', 'Maria Franchisee', 'franchisee', 'active', 
 '{"primary_location_id": "550e8400-e29b-41d4-a716-446655440020", "permissions": {"manage_location": true}}'),

-- Admin Demo User (replace with actual auth.users ID)
('REPLACE_WITH_ADMIN_AUTH_ID', 'admin@demo.com', 'Admin User', 'admin', 'active', 
 '{"permissions": {"full_access": true}}')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata;

-- Organization Members
INSERT INTO organization_members (organization_id, user_id, role, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'REPLACE_WITH_FRANCHISOR_AUTH_ID', 'owner', true),
('550e8400-e29b-41d4-a716-446655440001', 'REPLACE_WITH_ADMIN_AUTH_ID', 'admin', true)
ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- Update franchise locations with proper franchisee ID
UPDATE franchise_locations 
SET franchisee_id = 'REPLACE_WITH_FRANCHISEE_AUTH_ID'
WHERE id = '550e8400-e29b-41d4-a716-446655440020';

UPDATE franchise_locations 
SET franchisee_id = 'REPLACE_WITH_FRANCHISEE_AUTH_ID'
WHERE id = '550e8400-e29b-41d4-a716-446655440021';

-- Update orders with proper user references
UPDATE orders 
SET created_by = 'REPLACE_WITH_FRANCHISEE_AUTH_ID'
WHERE id IN ('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440081');

-- Update franchise ownership
UPDATE franchises 
SET owner_id = 'REPLACE_WITH_FRANCHISOR_AUTH_ID'
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001';

-- Update stock movements with user references
UPDATE stock_movements 
SET performed_by = 'REPLACE_WITH_FRANCHISEE_AUTH_ID'
WHERE warehouse_id = '550e8400-e29b-41d4-a716-446655440020';

-- Update performance targets with user references
UPDATE performance_targets 
SET created_by = 'REPLACE_WITH_FRANCHISOR_AUTH_ID'
WHERE franchise_location_id = '550e8400-e29b-41d4-a716-446655440020';

-- Create demo application
INSERT INTO franchise_applications (id, franchise_id, package_id, applicant_id, status, 
                                   application_data, initial_payment_amount, submitted_at, approved_at, approved_by) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440030', 
 '550e8400-e29b-41d4-a716-446655440041', 'REPLACE_WITH_FRANCHISEE_AUTH_ID', 'approved',
 '{"personal_info": {"full_name": "Maria Franchisee", "email": "franchisee@demo.com", "phone": "+63-917-123-4567"}, 
   "business_experience": {"years_experience": 5, "management_experience": true}, 
   "financial_info": {"liquid_capital": 400000, "net_worth": 800000}}',
 300000, '2024-01-01 10:00:00+08', '2024-01-05 14:30:00+08', 'REPLACE_WITH_FRANCHISOR_AUTH_ID')
ON CONFLICT (id) DO UPDATE SET
  applicant_id = EXCLUDED.applicant_id,
  approved_by = EXCLUDED.approved_by;

-- Create demo notifications
INSERT INTO notifications (user_id, title, message, type, priority) VALUES
('REPLACE_WITH_FRANCHISEE_AUTH_ID', 'Welcome to FranchiseHub!', 'Your account has been set up successfully. Start exploring your dashboard.', 'success', 'normal'),
('REPLACE_WITH_FRANCHISOR_AUTH_ID', 'New Application Received', 'A new franchise application has been submitted for review.', 'info', 'normal'),
('REPLACE_WITH_ADMIN_AUTH_ID', 'System Status', 'All systems are operational and running smoothly.', 'info', 'low')
ON CONFLICT DO NOTHING;

-- Instructions for manual setup:
-- 
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create three users with the following emails and password "demo123":
--    - franchisor@demo.com
--    - franchisee@demo.com  
--    - admin@demo.com
-- 3. Copy their auth.users IDs
-- 4. Replace the placeholder UUIDs in this script with the actual IDs
-- 5. Run this script in the SQL Editor
--
-- Example:
-- Replace 'REPLACE_WITH_FRANCHISOR_AUTH_ID' with actual UUID like '123e4567-e89b-12d3-a456-426614174000'
