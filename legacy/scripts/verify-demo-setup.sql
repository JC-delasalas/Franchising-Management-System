-- ============================================================================
-- DEMO SETUP VERIFICATION SCRIPT
-- ============================================================================
-- Run this script after creating demo users to verify everything is working
-- ============================================================================

-- Test 1: Verify auth users exist
SELECT 
    'Auth Users Test' as test_name,
    COUNT(*) as total_auth_users,
    COUNT(*) FILTER (WHERE email LIKE '%@demo.com') as demo_users
FROM auth.users;

-- Test 2: Verify user profiles are created
SELECT 
    'User Profiles Test' as test_name,
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE email LIKE '%@demo.com') as demo_profiles,
    string_agg(DISTINCT role, ', ') as roles_present
FROM user_profiles
WHERE email LIKE '%@demo.com';

-- Test 3: Verify organization membership
SELECT 
    'Organization Membership Test' as test_name,
    COUNT(*) as total_memberships,
    string_agg(DISTINCT role, ', ') as membership_roles
FROM organization_members om
JOIN user_profiles up ON om.user_id = up.id
WHERE up.email LIKE '%@demo.com';

-- Test 4: Verify franchise ownership
SELECT 
    'Franchise Ownership Test' as test_name,
    COUNT(*) as franchises_owned,
    string_agg(f.name, ', ') as franchise_names
FROM franchises f
JOIN user_profiles up ON f.owner_id = up.id
WHERE up.email LIKE '%@demo.com';

-- Test 5: Verify location assignment
SELECT 
    'Location Assignment Test' as test_name,
    COUNT(*) as locations_assigned,
    string_agg(fl.name, ', ') as location_names
FROM franchise_locations fl
JOIN user_profiles up ON fl.franchisee_id = up.id
WHERE up.email LIKE '%@demo.com';

-- Test 6: Verify demo data relationships
SELECT 
    'Demo Data Relationships Test' as test_name,
    (SELECT COUNT(*) FROM orders o 
     JOIN user_profiles up ON o.created_by = up.id 
     WHERE up.email LIKE '%@demo.com') as orders_by_demo_users,
    (SELECT COUNT(*) FROM franchise_applications fa 
     JOIN user_profiles up ON fa.applicant_id = up.id 
     WHERE up.email LIKE '%@demo.com') as applications_by_demo_users,
    (SELECT COUNT(*) FROM notifications n 
     JOIN user_profiles up ON n.user_id = up.id 
     WHERE up.email LIKE '%@demo.com') as notifications_for_demo_users;

-- Test 7: Test RLS policies with demo users
-- This will show if the policies are working correctly
SELECT 
    'RLS Policy Test' as test_name,
    'Check manually by logging in as each demo user' as instruction,
    'Verify each user can only see their authorized data' as expected_result;

-- Test 8: Verify demo user login credentials
SELECT 
    'Demo User Credentials' as test_name,
    'franchisor@demo.com / demo123' as franchisor_login,
    'franchisee@demo.com / demo123' as franchisee_login,
    'admin@demo.com / demo123' as admin_login;

-- ============================================================================
-- EXPECTED RESULTS SUMMARY
-- ============================================================================
-- 
-- Auth Users Test: Should show 3+ total users, 3 demo users
-- User Profiles Test: Should show 3 demo profiles with roles: admin, franchisor, franchisee
-- Organization Membership Test: Should show 2 memberships (franchisor as owner, admin as admin)
-- Franchise Ownership Test: Should show franchises owned by franchisor user
-- Location Assignment Test: Should show locations assigned to franchisee user
-- Demo Data Relationships Test: Should show orders, applications, and notifications linked to demo users
-- 
-- If any test shows 0 results, check the demo user setup script and ensure:
-- 1. Auth users were created successfully
-- 2. Correct UUIDs were used in the setup script
-- 3. The setup script was executed without errors
-- 
-- ============================================================================

-- Additional diagnostic queries if issues are found:

-- Check if auth users exist but profiles are missing
SELECT 
    'Missing Profiles Diagnostic' as test_name,
    au.email,
    au.id as auth_id,
    CASE WHEN up.id IS NULL THEN 'MISSING PROFILE' ELSE 'PROFILE EXISTS' END as profile_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email LIKE '%@demo.com'
ORDER BY au.email;

-- Check for any constraint violations in demo data
SELECT 
    'Constraint Violations Check' as test_name,
    'Run this if demo setup fails' as instruction;

-- Verify all foreign key relationships are valid
SELECT 
    'Foreign Key Validation' as test_name,
    COUNT(*) as total_franchise_locations,
    COUNT(*) FILTER (WHERE franchisee_id IS NOT NULL) as locations_with_franchisee,
    COUNT(*) FILTER (WHERE franchise_id IS NOT NULL) as locations_with_franchise
FROM franchise_locations;

-- ============================================================================
-- TROUBLESHOOTING GUIDE
-- ============================================================================
-- 
-- Issue: Auth Users Test shows 0 demo users
-- Solution: Create the auth users in Supabase Dashboard first
-- 
-- Issue: User Profiles Test shows 0 demo profiles  
-- Solution: Check that UUIDs in setup script match auth.users IDs exactly
-- 
-- Issue: Organization Membership Test shows 0 memberships
-- Solution: Verify organization_id exists and UUIDs are correct
-- 
-- Issue: Location Assignment Test shows 0 locations
-- Solution: Check that franchise_locations table has demo data
-- 
-- Issue: RLS Policy Test - users can see unauthorized data
-- Solution: Review and update RLS policies for affected tables
-- 
-- ============================================================================
