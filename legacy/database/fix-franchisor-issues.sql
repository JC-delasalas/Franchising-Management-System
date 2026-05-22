-- =============================================
-- FRANCHISOR FUNCTIONALITY FIXES
-- =============================================
-- 
-- PURPOSE: Fix missing data and functionality for franchisor dashboard
-- 
-- =============================================

-- STEP 1: ENSURE SAMPLE FRANCHISOR USER EXISTS
-- =============================================

-- Insert sample franchisor user (if not exists)
INSERT INTO user_profiles (id, email, full_name, role, status)
SELECT 
    gen_random_uuid(),
    'franchisor@franchisehub.com',
    'John Franchisor',
    'franchisor',
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE role = 'franchisor'
);

-- STEP 2: ENSURE FRANCHISES HAVE PROPER OWNER RELATIONSHIPS
-- =============================================

-- Update existing franchises to have proper owner relationships
UPDATE franchises 
SET owner_id = (SELECT id FROM user_profiles WHERE role = 'franchisor' LIMIT 1)
WHERE owner_id IS NULL;

-- STEP 3: CREATE SAMPLE FRANCHISE LOCATIONS
-- =============================================

-- Insert sample franchise locations if they don't exist
WITH franchisor_user AS (
    SELECT id FROM user_profiles WHERE role = 'franchisor' LIMIT 1
),
sample_franchisee AS (
    INSERT INTO user_profiles (id, email, full_name, role, status)
    SELECT 
        gen_random_uuid(),
        'franchisee@test.com',
        'Jane Franchisee',
        'franchisee',
        'active'
    WHERE NOT EXISTS (
        SELECT 1 FROM user_profiles WHERE email = 'franchisee@test.com'
    )
    RETURNING id
),
franchise_data AS (
    SELECT id FROM franchises LIMIT 1
)
INSERT INTO franchise_locations (
    id, franchise_id, franchisee_id, name, address, city, state, 
    country, status, monthly_revenue, opening_date
)
SELECT 
    gen_random_uuid(),
    f.id,
    COALESCE(sf.id, (SELECT id FROM user_profiles WHERE role = 'franchisee' LIMIT 1)),
    'Downtown Coffee Shop',
    '123 Main Street',
    'Manila',
    'Metro Manila',
    'Philippines',
    'open',
    150000.00,
    '2024-01-15'
FROM franchise_data f
LEFT JOIN sample_franchisee sf ON true
WHERE NOT EXISTS (
    SELECT 1 FROM franchise_locations WHERE name = 'Downtown Coffee Shop'
);

-- Add more sample locations
INSERT INTO franchise_locations (
    id, franchise_id, franchisee_id, name, address, city, state, 
    country, status, monthly_revenue, opening_date
)
SELECT 
    gen_random_uuid(),
    f.id,
    (SELECT id FROM user_profiles WHERE role = 'franchisee' LIMIT 1),
    'Mall Branch',
    '456 Shopping Center',
    'Quezon City',
    'Metro Manila',
    'Philippines',
    'open',
    200000.00,
    '2024-02-01'
FROM (SELECT id FROM franchises LIMIT 1) f
WHERE NOT EXISTS (
    SELECT 1 FROM franchise_locations WHERE name = 'Mall Branch'
);

-- STEP 4: CREATE SAMPLE ORDERS FOR TESTING
-- =============================================

-- Insert sample orders for the franchise locations
WITH location_data AS (
    SELECT id, franchisee_id FROM franchise_locations LIMIT 1
),
sample_orders AS (
    INSERT INTO orders (
        id, order_number, franchise_location_id, created_by, status, 
        order_type, priority, subtotal, tax_amount, shipping_amount, 
        total_amount, created_at
    )
    SELECT 
        gen_random_uuid(),
        'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
        ld.id,
        ld.franchisee_id,
        CASE 
            WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'pending_approval'
            WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'approved'
            ELSE 'delivered'
        END,
        'inventory',
        'normal',
        amounts.subtotal,
        amounts.subtotal * 0.12,
        200.00,
        amounts.subtotal * 1.12 + 200.00,
        NOW() - (ROW_NUMBER() OVER() || ' days')::INTERVAL
    FROM location_data ld
    CROSS JOIN (
        VALUES 
            (5000.00),
            (7500.00),
            (3200.00),
            (12000.00),
            (8900.00)
    ) AS amounts(subtotal)
    WHERE NOT EXISTS (
        SELECT 1 FROM orders WHERE franchise_location_id = ld.id
    )
    RETURNING id, franchise_location_id
)
-- Insert order items for the sample orders
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
SELECT 
    gen_random_uuid(),
    so.id,
    p.id,
    CASE 
        WHEN p.price < 1000 THEN 5
        WHEN p.price < 5000 THEN 2
        ELSE 1
    END,
    p.price
FROM sample_orders so
CROSS JOIN (
    SELECT id, price FROM products WHERE active = true LIMIT 3
) p;

-- STEP 5: CREATE SAMPLE FRANCHISE APPLICATIONS
-- =============================================

-- Insert sample franchise applications
INSERT INTO franchise_applications (
    id, franchise_id, applicant_id, status, application_data, 
    initial_payment_amount, monthly_royalty_amount, submitted_at
)
SELECT 
    gen_random_uuid(),
    f.id,
    up.id,
    'pending',
    jsonb_build_object(
        'business_experience', '5 years in retail',
        'investment_capacity', '₱500,000',
        'preferred_location', 'Makati CBD'
    ),
    100000.00,
    7500.00,
    NOW() - (ROW_NUMBER() OVER() || ' days')::INTERVAL
FROM (SELECT id FROM franchises LIMIT 1) f
CROSS JOIN (
    VALUES 
        ('applicant1@test.com', 'John Applicant'),
        ('applicant2@test.com', 'Maria Santos'),
        ('applicant3@test.com', 'Robert Cruz')
) AS applicants(email, name)
LEFT JOIN user_profiles up ON up.email = applicants.email
WHERE up.id IS NULL OR NOT EXISTS (
    SELECT 1 FROM franchise_applications WHERE applicant_id = up.id
);

-- Create applicant users if they don't exist
INSERT INTO user_profiles (id, email, full_name, role, status)
SELECT 
    gen_random_uuid(),
    applicants.email,
    applicants.name,
    'user',
    'active'
FROM (
    VALUES 
        ('applicant1@test.com', 'John Applicant'),
        ('applicant2@test.com', 'Maria Santos'),
        ('applicant3@test.com', 'Robert Cruz')
) AS applicants(email, name)
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE email = applicants.email
);

-- STEP 6: UPDATE ANALYTICS DATA
-- =============================================

-- Update franchise revenue data
UPDATE franchise_locations 
SET monthly_revenue = CASE 
    WHEN name LIKE '%Downtown%' THEN 150000.00
    WHEN name LIKE '%Mall%' THEN 200000.00
    ELSE 100000.00 + (RANDOM() * 100000.00)
END
WHERE monthly_revenue IS NULL OR monthly_revenue = 0;

-- STEP 7: VERIFICATION QUERIES
-- =============================================

-- Verify franchisor setup
SELECT 
    'FRANCHISOR SETUP VERIFICATION' as check_type,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'franchisor') as franchisor_users,
    (SELECT COUNT(*) FROM franchises WHERE owner_id IS NOT NULL) as franchises_with_owners,
    (SELECT COUNT(*) FROM franchise_locations) as total_locations,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM franchise_applications WHERE status = 'pending') as pending_applications;

-- Check order status distribution
SELECT 
    'ORDER STATUS DISTRIBUTION' as check_type,
    status,
    COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY status;

-- Check revenue data
SELECT 
    'REVENUE DATA CHECK' as check_type,
    fl.name as location_name,
    fl.monthly_revenue,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_order_value
FROM franchise_locations fl
LEFT JOIN orders o ON fl.id = o.franchise_location_id
GROUP BY fl.id, fl.name, fl.monthly_revenue
ORDER BY fl.monthly_revenue DESC;

-- =============================================
-- FRANCHISOR FIXES COMPLETE
-- =============================================

SELECT 
    'FRANCHISOR FUNCTIONALITY FIXES COMPLETE' as status,
    'All sample data and relationships created' as result,
    'Franchisor dashboard should now work properly' as next_step;
