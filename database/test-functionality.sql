-- =============================================
-- FRANCHISEHUB FUNCTIONALITY TESTING SCRIPT
-- =============================================

-- STEP 1: TEST USER PROFILES AND AUTHENTICATION
-- =============================================

-- Check if user_profiles table exists and has proper structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Test user profile creation (you'll need to do this through Supabase Auth)
-- This is just to verify the structure

-- STEP 2: TEST PRODUCT CATALOG FUNCTIONALITY
-- =============================================

-- Test product search and filtering
SELECT 
    p.name,
    p.sku,
    p.price,
    pc.name as category,
    p.active,
    p.featured
FROM products p
JOIN product_categories pc ON p.category_id = pc.id
WHERE p.active = true
ORDER BY p.featured DESC, p.name;

-- Test inventory availability check
SELECT 
    p.name,
    p.sku,
    p.price,
    w.name as warehouse,
    i.quantity_on_hand,
    i.available_quantity,
    CASE 
        WHEN i.available_quantity > 0 THEN 'In Stock'
        ELSE 'Out of Stock'
    END as stock_status
FROM products p
JOIN inventory i ON p.id = i.product_id
JOIN warehouses w ON i.warehouse_id = w.id
WHERE p.active = true
ORDER BY p.name, w.name;

-- STEP 3: TEST SHOPPING CART FUNCTIONALITY
-- =============================================

-- Test shopping cart insertion (simulate adding items to cart)
-- Note: Replace 'user-uuid-here' with actual user ID from auth.users

-- Example cart operations (you'll test these through the application)
/*
INSERT INTO shopping_cart (user_id, product_id, quantity) VALUES
('user-uuid-here', (SELECT id FROM products WHERE sku = 'FB-001'), 2),
('user-uuid-here', (SELECT id FROM products WHERE sku = 'KE-002'), 1);
*/

-- Test cart item count calculation
/*
SELECT
    sc.user_id,
    COUNT(sc.id) as item_count,
    SUM(sc.quantity) as total_quantity
FROM shopping_cart sc
WHERE sc.user_id = 'user-uuid-here'
GROUP BY sc.user_id;
*/

-- STEP 4: TEST ORDER CREATION AND WORKFLOW
-- =============================================

-- Test order number generation
SELECT generate_order_number() as sample_order_number;

-- Test order creation (simulate order placement)
-- Note: This would normally be done through the application API

/*
-- Example order creation
INSERT INTO orders (
    order_number,
    franchise_location_id,
    created_by,
    status,
    order_type,
    priority,
    subtotal,
    tax_amount,
    shipping_amount,
    total_amount
) VALUES (
    generate_order_number(),
    (SELECT id FROM franchise_locations LIMIT 1),
    'user-uuid-here',
    'pending_approval',
    'inventory',
    'normal',
    35450.00,
    4254.00,
    200.00,
    39904.00
);
*/

-- Test order status workflow
SELECT 
    enumlabel as available_statuses
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
ORDER BY enumsortorder;

-- STEP 5: TEST NOTIFICATION SYSTEM
-- =============================================

-- Test notification types
SELECT 
    enumlabel as notification_types
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
ORDER BY enumsortorder;

-- Test notification priority levels
SELECT 
    enumlabel as priority_levels
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_priority')
ORDER BY enumsortorder;

-- STEP 6: TEST PAYMENT AND ADDRESS FUNCTIONALITY
-- =============================================

-- Test payment method types
SELECT 
    enumlabel as payment_types
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_type')
ORDER BY enumsortorder;

-- Test address types
SELECT 
    enumlabel as address_types
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'address_type')
ORDER BY enumsortorder;

-- STEP 7: TEST FRANCHISE MANAGEMENT
-- =============================================

-- Test franchise listings
SELECT 
    f.name,
    f.category,
    f.investment_range_min,
    f.investment_range_max,
    f.franchise_fee,
    f.royalty_rate,
    f.status,
    f.featured,
    o.name as organization_name
FROM franchises f
JOIN organizations o ON f.organization_id = o.id
WHERE f.status = 'active'
ORDER BY f.featured DESC, f.name;

-- STEP 8: PERFORMANCE TESTING
-- =============================================

-- Test query performance on products with inventory
EXPLAIN ANALYZE
SELECT 
    p.name,
    p.sku,
    p.price,
    pc.name as category,
    SUM(i.available_quantity) as total_available
FROM products p
JOIN product_categories pc ON p.category_id = pc.id
JOIN inventory i ON p.id = i.product_id
WHERE p.active = true
GROUP BY p.id, p.name, p.sku, p.price, pc.name
HAVING SUM(i.available_quantity) > 0
ORDER BY p.name;

-- Test index usage on orders
EXPLAIN ANALYZE
SELECT 
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at
FROM orders o
WHERE o.status = 'pending_approval'
ORDER BY o.created_at DESC;

-- STEP 9: DATA INTEGRITY TESTING
-- =============================================

-- Test foreign key constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('orders', 'order_items', 'cart_items', 'notifications', 'inventory')
ORDER BY tc.table_name;

-- Test unique constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- STEP 10: FINAL VERIFICATION
-- =============================================

-- Count all records in critical tables
SELECT 
    'products' as table_name, 
    COUNT(*) as record_count,
    COUNT(CASE WHEN active = true THEN 1 END) as active_records
FROM products
UNION ALL
SELECT 
    'inventory', 
    COUNT(*),
    COUNT(CASE WHEN available_quantity > 0 THEN 1 END)
FROM inventory
UNION ALL
SELECT 
    'franchises', 
    COUNT(*),
    COUNT(CASE WHEN status = 'active' THEN 1 END)
FROM franchises
UNION ALL
SELECT 
    'warehouses', 
    COUNT(*),
    COUNT(CASE WHEN active = true THEN 1 END)
FROM warehouses
ORDER BY table_name;

-- Check database size and performance
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
    AND tablename IN ('products', 'orders', 'inventory', 'notifications')
ORDER BY tablename, attname;

-- Final success message
SELECT 
    'Database migration completed successfully!' as status,
    COUNT(DISTINCT table_name) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
