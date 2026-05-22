-- MVP Simplified Database Schema
-- Focus: Core franchisee order lifecycle with 15 essential tables
-- Timeline: 6-8 weeks implementation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequence for invoice numbering
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- ============================================================================
-- FRANCHISE PACKAGES (Simplified investment options)
-- ============================================================================
CREATE TABLE IF NOT EXISTS franchise_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Starter", "Standard", "Premium"
    description TEXT,
    initial_fee DECIMAL(12,2) NOT NULL,
    monthly_royalty_rate DECIMAL(5,2) NOT NULL, -- Percentage (e.g., 5.00 for 5%)
    marketing_fee_rate DECIMAL(5,2) DEFAULT 2.00, -- Marketing fee percentage
    included_products TEXT[] DEFAULT '{}', -- Simple array for MVP
    max_locations INTEGER DEFAULT 1,
    territory_size VARCHAR(100), -- Simple text description
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED FRANCHISE APPLICATIONS (Simplified to 3 states)
-- ============================================================================
ALTER TABLE franchise_applications 
    DROP CONSTRAINT IF EXISTS franchise_applications_status_check,
    ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES franchise_packages(id),
    ADD COLUMN IF NOT EXISTS initial_payment_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS monthly_royalty_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
    ALTER COLUMN status TYPE VARCHAR(20),
    ADD CONSTRAINT status_simple_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- ============================================================================
-- PRODUCTS (Essential product catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2), -- For margin calculations
    unit_of_measure VARCHAR(50) DEFAULT 'each',
    minimum_order_qty INTEGER DEFAULT 1,
    maximum_order_qty INTEGER,
    weight_kg DECIMAL(8,3),
    perishable BOOLEAN DEFAULT FALSE,
    shelf_life_days INTEGER,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INVENTORY TRACKING (Location-based stock levels)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0, -- Stock allocated to pending orders
    reorder_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 100,
    last_counted_at TIMESTAMP WITH TIME ZONE,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    average_monthly_usage INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, product_id)
);

-- ============================================================================
-- STOCK MOVEMENTS (Simple in/out tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) CHECK (movement_type IN ('in', 'out', 'adjustment')) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'sale', 'adjustment', 'initial'
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES user_profiles(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ORDERS (Core order management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'fulfilled', 'cancelled')),
    order_type VARCHAR(20) DEFAULT 'inventory' CHECK (order_type IN ('inventory', 'equipment', 'marketing')),
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    requested_delivery_date DATE,
    actual_delivery_date DATE,
    notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ORDER ITEMS (Order line items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    delivered_quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INVOICES (Simplified billing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    invoice_type VARCHAR(20) DEFAULT 'order' CHECK (invoice_type IN ('order', 'royalty', 'marketing_fee', 'initial_fee')),
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS (Simple payment tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check', 'online')),
    payment_reference VARCHAR(100), -- Transaction ID, check number, etc.
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    processor_response JSONB, -- Payment gateway response
    notes TEXT,
    processed_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BASIC KPI TRACKING (Essential metrics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS location_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_unit VARCHAR(20), -- 'PHP', 'count', 'percentage', etc.
    metric_date DATE DEFAULT CURRENT_DATE,
    period_type VARCHAR(20) DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, metric_name, metric_date, period_type)
);

-- ============================================================================
-- ESSENTIAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Franchise packages
CREATE INDEX IF NOT EXISTS idx_franchise_packages_franchise_active ON franchise_packages(franchise_id, active);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_franchise_active ON products(franchise_id, active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Inventory
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_product ON inventory_items(location_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_reorder ON inventory_items(current_stock, reorder_level) WHERE current_stock <= reorder_level;

-- Stock movements
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_date ON stock_movements(inventory_item_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_location_status ON orders(location_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_date ON orders(created_at);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_location_status ON invoices(location_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('pending', 'sent');
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date_status ON payments(payment_date, status);

-- Metrics
CREATE INDEX IF NOT EXISTS idx_location_metrics_location_date ON location_metrics(location_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_location_metrics_name_date ON location_metrics(metric_name, metric_date);

-- Applications
CREATE INDEX IF NOT EXISTS idx_franchise_applications_package ON franchise_applications(package_id);
CREATE INDEX IF NOT EXISTS idx_franchise_applications_applicant_status ON franchise_applications(applicant_id, status);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE franchise_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BASIC RLS POLICIES (Simplified)
-- ============================================================================

-- Franchisees can only see their own data
CREATE POLICY "franchisee_own_orders" ON orders
    FOR ALL USING (
        location_id IN (
            SELECT id FROM franchise_locations 
            WHERE franchisee_id = auth.uid()
        )
    );

CREATE POLICY "franchisee_own_inventory" ON inventory_items
    FOR ALL USING (
        location_id IN (
            SELECT id FROM franchise_locations 
            WHERE franchisee_id = auth.uid()
        )
    );

CREATE POLICY "franchisee_own_invoices" ON invoices
    FOR ALL USING (
        location_id IN (
            SELECT id FROM franchise_locations 
            WHERE franchisee_id = auth.uid()
        )
    );

-- Franchisors can see all data for their franchises
CREATE POLICY "franchisor_all_data" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM franchise_locations fl
            JOIN franchises f ON fl.franchise_id = f.id
            WHERE fl.id = orders.location_id
            AND f.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    sequence_part := LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN 'ORD-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Function to update inventory after order fulfillment
CREATE OR REPLACE FUNCTION update_inventory_on_fulfillment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'fulfilled' AND OLD.status != 'fulfilled' THEN
        -- Update inventory levels for each order item
        UPDATE inventory_items 
        SET current_stock = current_stock - oi.delivered_quantity,
            last_updated = NOW()
        FROM order_items oi
        WHERE oi.order_id = NEW.id
        AND inventory_items.location_id = NEW.location_id
        AND inventory_items.product_id = oi.product_id;
        
        -- Log stock movements
        INSERT INTO stock_movements (inventory_item_id, movement_type, quantity, reference_type, reference_id)
        SELECT 
            ii.id,
            'out',
            oi.delivered_quantity,
            'order',
            NEW.id
        FROM order_items oi
        JOIN inventory_items ii ON ii.location_id = NEW.location_id AND ii.product_id = oi.product_id
        WHERE oi.order_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates
CREATE TRIGGER update_inventory_on_order_fulfillment
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_on_fulfillment();

-- ============================================================================
-- BASIC VIEWS FOR REPORTING
-- ============================================================================

-- Order summary view
CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    fl.name as location_name,
    f.name as franchise_name,
    o.status,
    o.total_amount,
    o.created_at,
    o.approved_at,
    COUNT(oi.id) as item_count
FROM orders o
JOIN franchise_locations fl ON o.location_id = fl.id
JOIN franchises f ON fl.franchise_id = f.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, fl.name, f.name;

-- Inventory status view
CREATE VIEW inventory_status AS
SELECT 
    ii.id,
    fl.name as location_name,
    p.name as product_name,
    p.sku,
    ii.current_stock,
    ii.reorder_level,
    CASE 
        WHEN ii.current_stock <= ii.reorder_level THEN 'Low Stock'
        WHEN ii.current_stock <= (ii.reorder_level * 1.5) THEN 'Medium Stock'
        ELSE 'Good Stock'
    END as stock_status
FROM inventory_items ii
JOIN franchise_locations fl ON ii.location_id = fl.id
JOIN products p ON ii.product_id = p.id
WHERE p.active = true;
