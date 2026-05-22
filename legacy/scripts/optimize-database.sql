-- Database Performance Optimization Script for FranchiseHub
-- This script creates indexes and optimizations for better query performance

-- ============================================================================
-- ORDERS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for orders by creator (franchisor dashboard queries)
CREATE INDEX IF NOT EXISTS idx_orders_created_by_status_date 
ON orders(created_by, status, created_at DESC);

-- Index for pending orders (approval dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON orders(status, created_at DESC) 
WHERE status = 'Pending';

-- Index for franchise location orders
CREATE INDEX IF NOT EXISTS idx_orders_franchise_location_date 
ON orders(franchise_location_id, created_at DESC);

-- Index for order search and filtering
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(order_number);

-- Composite index for complex dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_composite_dashboard 
ON orders(created_by, franchise_location_id, status, created_at DESC);

-- ============================================================================
-- ORDER ITEMS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- Index for product analytics
CREATE INDEX IF NOT EXISTS idx_order_items_product_analytics 
ON order_items(product_id, created_at DESC);

-- Index for order totals calculation
CREATE INDEX IF NOT EXISTS idx_order_items_order_totals 
ON order_items(order_id, total_price);

-- ============================================================================
-- PRODUCTS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for active products (catalog queries)
CREATE INDEX IF NOT EXISTS idx_products_active_category 
ON products(active, category, name) 
WHERE active = true;

-- Full-text search index for product search
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Index for price filtering
CREATE INDEX IF NOT EXISTS idx_products_price_range 
ON products(price, active) 
WHERE active = true;

-- Index for SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku 
ON products(sku) 
WHERE active = true;

-- ============================================================================
-- FRANCHISE LOCATIONS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for franchise owner queries
CREATE INDEX IF NOT EXISTS idx_franchise_locations_owner 
ON franchise_locations(franchise_owner_id, status);

-- Index for active locations
CREATE INDEX IF NOT EXISTS idx_franchise_locations_active 
ON franchise_locations(status, created_at DESC) 
WHERE status = 'Active';

-- Index for location search
CREATE INDEX IF NOT EXISTS idx_franchise_locations_search 
ON franchise_locations USING gin(to_tsvector('english', name || ' ' || COALESCE(address, '')));

-- ============================================================================
-- NOTIFICATIONS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_date 
ON notifications(user_id, read, created_at DESC);

-- Index for unread notifications count
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, read) 
WHERE read = false;

-- Index for notification cleanup
CREATE INDEX IF NOT EXISTS idx_notifications_cleanup 
ON notifications(created_at) 
WHERE read = true;

-- ============================================================================
-- INVENTORY LEVELS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for warehouse inventory
CREATE INDEX IF NOT EXISTS idx_inventory_levels_warehouse 
ON inventory_levels(warehouse_id, product_id);

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock 
ON inventory_levels(warehouse_id, current_stock, minimum_stock) 
WHERE current_stock <= minimum_stock;

-- Index for product inventory across warehouses
CREATE INDEX IF NOT EXISTS idx_inventory_product_levels 
ON inventory_levels(product_id, current_stock);

-- ============================================================================
-- INVENTORY MOVEMENTS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for warehouse movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_warehouse_date 
ON inventory_movements(warehouse_id, created_at DESC);

-- Index for product movement history
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_date 
ON inventory_movements(product_id, created_at DESC);

-- Index for movement type analytics
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type_date 
ON inventory_movements(movement_type, created_at DESC);

-- ============================================================================
-- USER PROFILES TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for user role queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON user_profiles(role, active) 
WHERE active = true;

-- Index for user search
CREATE INDEX IF NOT EXISTS idx_user_profiles_search 
ON user_profiles USING gin(to_tsvector('english', full_name || ' ' || email));

-- Index for last login tracking
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login 
ON user_profiles(last_login_at DESC) 
WHERE active = true;

-- ============================================================================
-- ANALYTICS OPTIMIZATIONS
-- ============================================================================

-- Index for sales analytics by date range
CREATE INDEX IF NOT EXISTS idx_orders_analytics_date_range 
ON orders(created_at, status, total_amount) 
WHERE status = 'Completed';

-- Index for franchise performance analytics
CREATE INDEX IF NOT EXISTS idx_orders_franchise_analytics 
ON orders(franchise_location_id, status, created_at, total_amount) 
WHERE status = 'Completed';

-- Index for product performance analytics
CREATE INDEX IF NOT EXISTS idx_order_items_product_performance 
ON order_items(product_id, quantity, total_price, created_at);

-- ============================================================================
-- APPROVAL WORKFLOWS TABLE OPTIMIZATIONS
-- ============================================================================

-- Index for pending approvals
CREATE INDEX IF NOT EXISTS idx_approval_workflows_pending 
ON approval_workflows(status, created_at DESC) 
WHERE status = 'pending';

-- Index for user approvals
CREATE INDEX IF NOT EXISTS idx_approval_workflows_approver 
ON approval_workflows(current_approver_id, status);

-- Index for entity approvals
CREATE INDEX IF NOT EXISTS idx_approval_workflows_entity 
ON approval_workflows(entity_type, entity_id, status);

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View for slow query monitoring
CREATE OR REPLACE VIEW slow_queries_summary AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY abs(correlation) DESC;

-- View for index usage statistics
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- ============================================================================
-- MAINTENANCE PROCEDURES
-- ============================================================================

-- Function to analyze table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE orders;
    ANALYZE order_items;
    ANALYZE products;
    ANALYZE franchise_locations;
    ANALYZE notifications;
    ANALYZE inventory_levels;
    ANALYZE inventory_movements;
    ANALYZE user_profiles;
    ANALYZE approval_workflows;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications 
    WHERE read = true 
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Query to check index usage
-- SELECT * FROM index_usage_stats WHERE idx_scan < 100;

-- Query to find unused indexes
-- SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Query to check table sizes
-- SELECT 
--     schemaname,
--     tablename,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- EXECUTION NOTES
-- ============================================================================

-- Run this script on your Supabase database to optimize performance
-- Monitor the impact using the provided views and queries
-- Schedule regular ANALYZE operations for optimal query planning
-- Consider running cleanup_old_notifications() weekly

-- To execute the maintenance functions:
-- SELECT update_table_statistics();
-- SELECT cleanup_old_notifications();
