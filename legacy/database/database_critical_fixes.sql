-- CRITICAL DATABASE INFRASTRUCTURE DEPLOYMENT
-- Deploy all missing functions and tables in one batch

-- 1. CREATE MISSING TABLES

-- Create inventory_items table if not exists
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 10,
    max_stock_level INTEGER NOT NULL DEFAULT 100,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_records table if not exists
CREATE TABLE IF NOT EXISTS sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    items_sold JSONB DEFAULT '[]',
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
    customer_count INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_sales_records_location ON sales_records(franchise_location_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_date ON sales_records(sale_date);

-- 3. ENABLE RLS POLICIES
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_items
CREATE POLICY "Users can view inventory for their locations" ON inventory_items
    FOR SELECT USING (
        location_id IN (
            SELECT id FROM franchise_locations 
            WHERE franchisee_id = auth.uid() OR franchisor_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage inventory for their locations" ON inventory_items
    FOR ALL USING (
        location_id IN (
            SELECT id FROM franchise_locations 
            WHERE franchisee_id = auth.uid() OR franchisor_id = auth.uid()
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for sales_records
CREATE POLICY "Users can view sales for their locations" ON sales_records
    FOR SELECT USING (
        franchise_location_id IN (
            SELECT id FROM franchise_locations 
            WHERE franchisee_id = auth.uid() OR franchisor_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sales for their locations" ON sales_records
    FOR INSERT WITH CHECK (
        franchise_location_id IN (
            SELECT id FROM franchise_locations 
            WHERE franchisee_id = auth.uid()
        )
    );

-- 4. CREATE KPI CALCULATION FUNCTIONS

-- Franchisee KPI Calculation Function
CREATE OR REPLACE FUNCTION calculate_franchisee_kpis(p_location_id UUID)
RETURNS JSON AS $$
DECLARE
    today_sales DECIMAL := 0;
    week_sales DECIMAL := 0;
    month_sales DECIMAL := 0;
    sales_change DECIMAL := 0;
    order_count INTEGER := 0;
    avg_order_value DECIMAL := 0;
    inventory_value DECIMAL := 0;
    low_stock_items INTEGER := 0;
    result JSON;
BEGIN
    -- Today's sales
    SELECT COALESCE(SUM(total_amount), 0) INTO today_sales
    FROM sales_records
    WHERE franchise_location_id = p_location_id
    AND DATE(created_at) = CURRENT_DATE;
    
    -- Week sales
    SELECT COALESCE(SUM(total_amount), 0) INTO week_sales
    FROM sales_records
    WHERE franchise_location_id = p_location_id
    AND created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Month sales
    SELECT COALESCE(SUM(total_amount), 0) INTO month_sales
    FROM sales_records
    WHERE franchise_location_id = p_location_id
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Sales change (month over month)
    WITH current_month AS (
        SELECT COALESCE(SUM(total_amount), 0) as current_total
        FROM sales_records
        WHERE franchise_location_id = p_location_id
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    previous_month AS (
        SELECT COALESCE(SUM(total_amount), 0) as previous_total
        FROM sales_records
        WHERE franchise_location_id = p_location_id
        AND created_at >= CURRENT_DATE - INTERVAL '60 days'
        AND created_at < CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT 
        CASE 
            WHEN p.previous_total > 0 THEN 
                ((c.current_total - p.previous_total) / p.previous_total) * 100
            ELSE 0
        END INTO sales_change
    FROM current_month c, previous_month p;
    
    -- Order count
    SELECT COUNT(*) INTO order_count
    FROM orders
    WHERE franchise_location_id = p_location_id
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Average order value
    avg_order_value := CASE WHEN order_count > 0 THEN month_sales / order_count ELSE 0 END;
    
    -- Inventory value
    SELECT COALESCE(SUM(quantity * unit_cost), 0) INTO inventory_value
    FROM inventory_items
    WHERE location_id = p_location_id;
    
    -- Low stock items
    SELECT COUNT(*) INTO low_stock_items
    FROM inventory_items
    WHERE location_id = p_location_id
    AND quantity <= reorder_point;
    
    result := json_build_object(
        'todaySales', today_sales,
        'weekSales', week_sales,
        'monthSales', month_sales,
        'salesChange', ROUND(sales_change, 2),
        'orderCount', order_count,
        'avgOrderValue', ROUND(avg_order_value, 2),
        'inventoryValue', inventory_value,
        'lowStockItems', low_stock_items
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'todaySales', 0,
            'weekSales', 0,
            'monthSales', 0,
            'salesChange', 0,
            'orderCount', 0,
            'avgOrderValue', 0,
            'inventoryValue', 0,
            'lowStockItems', 0
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Franchisor KPI Calculation Function
CREATE OR REPLACE FUNCTION calculate_franchisor_kpis(p_franchisor_id UUID)
RETURNS JSON AS $$
DECLARE
    total_revenue DECIMAL := 0;
    total_orders INTEGER := 0;
    active_locations INTEGER := 0;
    avg_order_value DECIMAL := 0;
    revenue_growth DECIMAL := 0;
    order_growth DECIMAL := 0;
    result JSON;
BEGIN
    -- Get active locations count
    SELECT COUNT(*) INTO active_locations
    FROM franchise_locations
    WHERE franchisor_id = p_franchisor_id
    AND status = 'active';
    
    -- Total revenue (last 30 days)
    SELECT COALESCE(SUM(sr.total_amount), 0) INTO total_revenue
    FROM sales_records sr
    JOIN franchise_locations fl ON sr.franchise_location_id = fl.id
    WHERE fl.franchisor_id = p_franchisor_id
    AND sr.created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Total orders (last 30 days)
    SELECT COUNT(*) INTO total_orders
    FROM orders o
    JOIN franchise_locations fl ON o.franchise_location_id = fl.id
    WHERE fl.franchisor_id = p_franchisor_id
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Average order value
    avg_order_value := CASE WHEN total_orders > 0 THEN total_revenue / total_orders ELSE 0 END;
    
    -- Revenue growth (month over month)
    WITH current_month AS (
        SELECT COALESCE(SUM(sr.total_amount), 0) as current_total
        FROM sales_records sr
        JOIN franchise_locations fl ON sr.franchise_location_id = fl.id
        WHERE fl.franchisor_id = p_franchisor_id
        AND sr.created_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    previous_month AS (
        SELECT COALESCE(SUM(sr.total_amount), 0) as previous_total
        FROM sales_records sr
        JOIN franchise_locations fl ON sr.franchise_location_id = fl.id
        WHERE fl.franchisor_id = p_franchisor_id
        AND sr.created_at >= CURRENT_DATE - INTERVAL '60 days'
        AND sr.created_at < CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT 
        CASE 
            WHEN p.previous_total > 0 THEN 
                ((c.current_total - p.previous_total) / p.previous_total) * 100
            ELSE 0
        END INTO revenue_growth
    FROM current_month c, previous_month p;
    
    -- Order growth (month over month)
    WITH current_orders AS (
        SELECT COUNT(*) as current_count
        FROM orders o
        JOIN franchise_locations fl ON o.franchise_location_id = fl.id
        WHERE fl.franchisor_id = p_franchisor_id
        AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    previous_orders AS (
        SELECT COUNT(*) as previous_count
        FROM orders o
        JOIN franchise_locations fl ON o.franchise_location_id = fl.id
        WHERE fl.franchisor_id = p_franchisor_id
        AND o.created_at >= CURRENT_DATE - INTERVAL '60 days'
        AND o.created_at < CURRENT_DATE - INTERVAL '30 days'
    )
    SELECT 
        CASE 
            WHEN p.previous_count > 0 THEN 
                ((c.current_count - p.previous_count)::DECIMAL / p.previous_count) * 100
            ELSE 0
        END INTO order_growth
    FROM current_orders c, previous_orders p;
    
    result := json_build_object(
        'totalRevenue', total_revenue,
        'totalOrders', total_orders,
        'activeLocations', active_locations,
        'averageOrderValue', ROUND(avg_order_value, 2),
        'revenueGrowth', ROUND(revenue_growth, 2),
        'orderGrowth', ROUND(order_growth, 2)
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'totalRevenue', 0,
            'totalOrders', 0,
            'activeLocations', 0,
            'averageOrderValue', 0,
            'revenueGrowth', 0,
            'orderGrowth', 0
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION calculate_franchisee_kpis(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_franchisor_kpis(UUID) TO authenticated;
