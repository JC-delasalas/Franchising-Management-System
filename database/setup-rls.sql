-- =============================================
-- FRANCHISEHUB ROW LEVEL SECURITY (RLS) SETUP
-- =============================================

-- STEP 1: ENABLE RLS ON ALL TABLES
-- =============================================

-- Core user and organization tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Franchise management tables
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_locations ENABLE ROW LEVEL SECURITY;

-- Product and inventory tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Payment and address tables
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Shopping cart table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Order management tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_approvals ENABLE ROW LEVEL SECURITY;

-- Notification tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- STEP 2: CREATE RLS POLICIES FOR USER PROFILES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins and franchisors can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'franchisor')
        )
    );

-- STEP 3: CREATE RLS POLICIES FOR ORGANIZATIONS
-- =============================================

-- Everyone can view active organizations (for franchise listings)
CREATE POLICY "Public can view active organizations" ON organizations
    FOR SELECT USING (status = 'active');

-- Only admins can modify organizations
CREATE POLICY "Admins can manage organizations" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- STEP 4: CREATE RLS POLICIES FOR FRANCHISES
-- =============================================

-- Everyone can view active franchises
CREATE POLICY "Public can view active franchises" ON franchises
    FOR SELECT USING (status = 'active');

-- Franchise owners can view their own franchises
CREATE POLICY "Owners can view own franchises" ON franchises
    FOR SELECT USING (owner_id = auth.uid());

-- Franchisors and admins can manage franchises
CREATE POLICY "Franchisors can manage franchises" ON franchises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- STEP 5: CREATE RLS POLICIES FOR PRODUCTS AND INVENTORY
-- =============================================

-- Everyone can view active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (active = true);

-- Franchisors and admins can manage products
CREATE POLICY "Franchisors can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- Everyone can view product categories
CREATE POLICY "Public can view product categories" ON product_categories
    FOR SELECT USING (active = true);

-- Franchisors and admins can manage categories
CREATE POLICY "Franchisors can manage categories" ON product_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- Everyone can view inventory for active products
CREATE POLICY "Public can view inventory" ON inventory
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = inventory.product_id 
            AND active = true
        )
    );

-- Franchisors and admins can manage inventory
CREATE POLICY "Franchisors can manage inventory" ON inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- STEP 6: CREATE RLS POLICIES FOR CART ITEMS
-- =============================================

-- Users can only access their own cart items
CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (user_id = auth.uid());

-- STEP 7: CREATE RLS POLICIES FOR PAYMENT METHODS AND ADDRESSES
-- =============================================

-- Users can only access their own payment methods
CREATE POLICY "Users can manage own payment methods" ON payment_methods
    FOR ALL USING (user_id = auth.uid());

-- Users can only access their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (user_id = auth.uid());

-- STEP 8: CREATE RLS POLICIES FOR ORDERS
-- =============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (created_by = auth.uid());

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own draft orders
CREATE POLICY "Users can update own draft orders" ON orders
    FOR UPDATE USING (
        created_by = auth.uid() 
        AND status = 'draft'
    );

-- Franchisors and admins can view and manage all orders
CREATE POLICY "Franchisors can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- STEP 9: CREATE RLS POLICIES FOR ORDER ITEMS
-- =============================================

-- Users can view order items for their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_items.order_id 
            AND created_by = auth.uid()
        )
    );

-- Users can manage order items for their own draft orders
CREATE POLICY "Users can manage own draft order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_items.order_id 
            AND created_by = auth.uid()
            AND status = 'draft'
        )
    );

-- Franchisors and admins can manage all order items
CREATE POLICY "Franchisors can manage all order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- STEP 10: CREATE RLS POLICIES FOR NOTIFICATIONS
-- =============================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read, delete)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (recipient_id = auth.uid());

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage own notification preferences" ON user_notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- STEP 11: CREATE RLS POLICIES FOR ORDER HISTORY AND APPROVALS
-- =============================================

-- Users can view status history for their own orders
CREATE POLICY "Users can view own order history" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_status_history.order_id 
            AND created_by = auth.uid()
        )
    );

-- Franchisors and admins can view all order history
CREATE POLICY "Franchisors can view all order history" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- System can create order history records
CREATE POLICY "System can create order history" ON order_status_history
    FOR INSERT WITH CHECK (true);

-- Users can view approvals for their own orders
CREATE POLICY "Users can view own order approvals" ON order_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_approvals.order_id 
            AND created_by = auth.uid()
        )
    );

-- Franchisors and admins can manage order approvals
CREATE POLICY "Franchisors can manage order approvals" ON order_approvals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('franchisor', 'admin')
        )
    );

-- STEP 12: VERIFICATION
-- =============================================

-- Check that RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
