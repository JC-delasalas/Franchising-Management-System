-- =============================================
-- FRANCHISEHUB DATABASE ENHANCEMENT SCRIPT
-- =============================================
-- 
-- PURPOSE: Optimize and enhance database after cleanup
-- FOCUS: Performance, security, and missing functionality
-- 
-- =============================================

-- STEP 1: ADD MISSING INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status ON user_profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower ON user_profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at DESC);

-- Products performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, active);
CREATE INDEX IF NOT EXISTS idx_products_sku_active ON products(sku, active);
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));

-- Orders performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_location_status ON orders(franchise_location_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_by_date ON orders(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount) WHERE status != 'cancelled';

-- Order items performance indexes
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_created ON order_items(order_id, created_at);

-- Shopping cart performance indexes
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_updated ON shopping_cart(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_product_user ON shopping_cart(product_id, user_id);

-- Notifications performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type_priority ON notifications(type, priority);
CREATE INDEX IF NOT EXISTS idx_notifications_related_order ON notifications(related_order_id) WHERE related_order_id IS NOT NULL;

-- Inventory performance indexes
CREATE INDEX IF NOT EXISTS idx_inventory_levels_product_warehouse ON inventory_levels(product_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_low_stock ON inventory_levels(product_id) WHERE quantity_on_hand <= reorder_level;
CREATE INDEX IF NOT EXISTS idx_inventory_levels_available ON inventory_levels(warehouse_id) WHERE (quantity_on_hand - reserved_quantity) > 0;

-- Franchise performance indexes
CREATE INDEX IF NOT EXISTS idx_franchises_status_featured ON franchises(status, featured);
CREATE INDEX IF NOT EXISTS idx_franchise_locations_franchisee_status ON franchise_locations(franchisee_id, status);

-- STEP 2: ADD MISSING CONSTRAINTS
-- =============================================

-- Add check constraints for data integrity
ALTER TABLE products ADD CONSTRAINT chk_products_price_positive CHECK (price >= 0);
ALTER TABLE products ADD CONSTRAINT chk_products_minimum_order_qty CHECK (minimum_order_qty > 0);

ALTER TABLE orders ADD CONSTRAINT chk_orders_amounts_positive CHECK (
    subtotal >= 0 AND 
    tax_amount >= 0 AND 
    shipping_amount >= 0 AND 
    total_amount >= 0
);

ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_price_positive CHECK (unit_price >= 0);

ALTER TABLE shopping_cart ADD CONSTRAINT chk_shopping_cart_quantity_positive CHECK (quantity > 0);

ALTER TABLE inventory_levels ADD CONSTRAINT chk_inventory_levels_quantities_positive CHECK (
    quantity_on_hand >= 0 AND 
    reserved_quantity >= 0 AND
    reserved_quantity <= quantity_on_hand
);

-- STEP 3: ADD MISSING TRIGGERS
-- =============================================

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables that might be missing them
CREATE TRIGGER trigger_update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_shopping_cart_updated_at 
    BEFORE UPDATE ON shopping_cart 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 4: ADD MISSING FUNCTIONS
-- =============================================

-- Function to calculate cart total
CREATE OR REPLACE FUNCTION calculate_cart_total(user_uuid UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    total DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(sc.quantity * p.price), 0)
    INTO total
    FROM shopping_cart sc
    JOIN products p ON sc.product_id = p.id
    WHERE sc.user_id = user_uuid AND p.active = true;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to check inventory availability
CREATE OR REPLACE FUNCTION check_inventory_availability(
    product_uuid UUID, 
    warehouse_uuid UUID, 
    required_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    available_qty INTEGER;
BEGIN
    SELECT (quantity_on_hand - reserved_quantity)
    INTO available_qty
    FROM inventory_levels
    WHERE product_id = product_uuid AND warehouse_id = warehouse_uuid;
    
    RETURN COALESCE(available_qty, 0) >= required_quantity;
END;
$$ LANGUAGE plpgsql;

-- Function to reserve inventory
CREATE OR REPLACE FUNCTION reserve_inventory(
    product_uuid UUID,
    warehouse_uuid UUID,
    reserve_quantity INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE inventory_levels
    SET reserved_quantity = reserved_quantity + reserve_quantity,
        updated_at = NOW()
    WHERE product_id = product_uuid 
      AND warehouse_id = warehouse_uuid
      AND (quantity_on_hand - reserved_quantity) >= reserve_quantity;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: CREATE USEFUL VIEWS
-- =============================================

-- Product catalog view with inventory
CREATE OR REPLACE VIEW product_catalog_view AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.description,
    p.category,
    p.price,
    p.unit_of_measure,
    p.minimum_order_qty,
    p.maximum_order_qty,
    p.images,
    p.active,
    COALESCE(SUM(il.quantity_on_hand - il.reserved_quantity), 0) as total_available,
    COUNT(DISTINCT il.warehouse_id) as warehouse_count,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN inventory_levels il ON p.id = il.product_id
WHERE p.active = true
GROUP BY p.id, p.name, p.sku, p.description, p.category, p.price, 
         p.unit_of_measure, p.minimum_order_qty, p.maximum_order_qty, 
         p.images, p.active, p.created_at, p.updated_at;

-- Order summary view
CREATE OR REPLACE VIEW order_summary_view AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    up.full_name as created_by_name,
    up.email as created_by_email,
    fl.name as location_name,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN user_profiles up ON o.created_by = up.id
LEFT JOIN franchise_locations fl ON o.franchise_location_id = fl.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at, 
         o.updated_at, up.full_name, up.email, fl.name;

-- Low stock alert view
CREATE OR REPLACE VIEW low_stock_alerts_view AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku,
    w.id as warehouse_id,
    w.name as warehouse_name,
    il.quantity_on_hand,
    il.reserved_quantity,
    (il.quantity_on_hand - il.reserved_quantity) as available_quantity,
    il.reorder_level,
    CASE 
        WHEN (il.quantity_on_hand - il.reserved_quantity) <= 0 THEN 'OUT_OF_STOCK'
        WHEN (il.quantity_on_hand - il.reserved_quantity) <= il.reorder_level THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END as stock_status
FROM products p
JOIN inventory_levels il ON p.id = il.product_id
JOIN warehouses w ON il.warehouse_id = w.id
WHERE p.active = true
  AND (il.quantity_on_hand - il.reserved_quantity) <= il.reorder_level;

-- STEP 6: OPTIMIZE EXISTING TABLES
-- =============================================

-- Analyze tables for better query planning
ANALYZE user_profiles;
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE shopping_cart;
ANALYZE notifications;
ANALYZE inventory_levels;
ANALYZE franchises;
ANALYZE franchise_locations;

-- STEP 7: ADD MISSING RLS POLICIES
-- =============================================

-- Ensure RLS is enabled on all core tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for inventory_levels
CREATE POLICY "Public can view inventory levels" ON inventory_levels
    FOR SELECT USING (true);

CREATE POLICY "Franchisors can manage inventory levels" ON inventory_levels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- STEP 8: VERIFICATION
-- =============================================

-- Verify enhancements
SELECT 
    'ENHANCEMENT VERIFICATION' as status,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public') as total_views,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions;

-- Test new functions
SELECT 
    'FUNCTION TESTS' as test_category,
    generate_order_number() as sample_order_number,
    calculate_cart_total('00000000-0000-0000-0000-000000000000') as sample_cart_total;

-- =============================================
-- ENHANCEMENT COMPLETE
-- =============================================
