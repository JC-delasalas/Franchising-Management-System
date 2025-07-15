-- Comprehensive Database Enhancements for Full Franchise Management
-- This migration adds all missing components identified in the requirements analysis

-- Additional custom types
CREATE TYPE media_type AS ENUM ('document', 'video', 'audio', 'image');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE sync_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE conflict_resolution AS ENUM ('manual', 'source_wins', 'target_wins', 'merge');
CREATE TYPE notification_delivery AS ENUM ('in_app', 'email', 'sms', 'push');
CREATE TYPE invoice_type AS ENUM ('royalty', 'marketing_fee', 'order', 'setup', 'other');
CREATE TYPE order_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'fulfilled', 'cancelled');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'conditionally_approved', 'rejected');

-- ============================================================================
-- MEDIA & FILE MANAGEMENT
-- ============================================================================

-- Enhanced media asset management
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    media_type media_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT,
    duration_seconds INTEGER, -- For video/audio
    resolution VARCHAR(20), -- For video/images (e.g., "1920x1080")
    metadata JSONB DEFAULT '{}',
    processing_status processing_status DEFAULT 'pending',
    cdn_urls JSONB DEFAULT '{}', -- Multiple quality/format URLs
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media version control
CREATE TABLE IF NOT EXISTS media_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    change_notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(media_asset_id, version_number)
);

-- ============================================================================
-- PRODUCT & INVENTORY MANAGEMENT
-- ============================================================================

-- Brand management for multi-brand franchisors
CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{}', -- Primary, secondary colors
    status franchise_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Product catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit_of_measure VARCHAR(50) DEFAULT 'each',
    cost_price DECIMAL(12,2),
    retail_price DECIMAL(12,2),
    minimum_order_quantity INTEGER DEFAULT 1,
    maximum_order_quantity INTEGER,
    weight_kg DECIMAL(8,3),
    dimensions JSONB, -- length, width, height
    perishable BOOLEAN DEFAULT FALSE,
    shelf_life_days INTEGER,
    status franchise_status DEFAULT 'active',
    images TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory tracking per location
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock DECIMAL(10,3) DEFAULT 0,
    reserved_stock DECIMAL(10,3) DEFAULT 0,
    reorder_level DECIMAL(10,3) DEFAULT 0,
    max_stock_level DECIMAL(10,3),
    average_daily_usage DECIMAL(10,3),
    last_counted_at TIMESTAMP WITH TIME ZONE,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    cost_per_unit DECIMAL(12,2),
    expiry_date DATE,
    batch_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, product_id)
);

-- Stock movement tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'waste')),
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(12,2),
    reference_type VARCHAR(50), -- 'purchase_order', 'sale', 'adjustment', etc.
    reference_id UUID,
    notes TEXT,
    performed_by UUID REFERENCES user_profiles(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier management
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    payment_terms VARCHAR(100),
    delivery_areas TEXT[] DEFAULT '{}',
    minimum_order_amount DECIMAL(12,2),
    delivery_fee DECIMAL(12,2),
    lead_time_days INTEGER DEFAULT 1,
    rating DECIMAL(3,2), -- 1.00 to 5.00
    status franchise_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product-supplier relationships
CREATE TABLE IF NOT EXISTS product_suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_sku VARCHAR(100),
    cost_price DECIMAL(12,2),
    minimum_order_quantity INTEGER DEFAULT 1,
    lead_time_days INTEGER DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, supplier_id)
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status order_status DEFAULT 'draft',
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase order line items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    received_quantity DECIMAL(10,3) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- POS INTEGRATION & TRANSACTION PROCESSING
-- ============================================================================

-- POS system configurations
CREATE TABLE IF NOT EXISTS pos_systems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    system_type VARCHAR(50) NOT NULL, -- 'square', 'clover', 'toast', 'custom'
    system_name VARCHAR(255),
    api_endpoint TEXT,
    api_credentials JSONB, -- Encrypted credentials
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_frequency_minutes INTEGER DEFAULT 15,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POS transactions
CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pos_system_id UUID REFERENCES pos_systems(id) ON DELETE CASCADE,
    external_transaction_id VARCHAR(255) NOT NULL,
    transaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    tip_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    customer_id VARCHAR(255),
    cashier_id VARCHAR(255),
    receipt_number VARCHAR(100),
    voided BOOLEAN DEFAULT FALSE,
    refunded BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    sync_status sync_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pos_system_id, external_transaction_id)
);

-- POS transaction line items
CREATE TABLE IF NOT EXISTS pos_transaction_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES pos_transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    external_product_id VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    modifiers JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED REPORTING & ANALYTICS
-- ============================================================================

-- Report templates
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) CHECK (report_type IN ('financial', 'operational', 'sales', 'inventory', 'custom')),
    template_config JSONB NOT NULL, -- Chart types, filters, groupings, calculations
    access_roles TEXT[] DEFAULT '{}',
    is_system_template BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schedule_config JSONB NOT NULL, -- Frequency, time, recipients
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    error_message TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI definitions and tracking
CREATE TABLE IF NOT EXISTS kpi_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    calculation_formula TEXT NOT NULL,
    target_value DECIMAL(15,4),
    unit VARCHAR(50),
    category VARCHAR(100),
    applicable_to VARCHAR(20) CHECK (applicable_to IN ('franchise', 'location', 'organization')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI tracking
CREATE TABLE IF NOT EXISTS kpi_values (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kpi_definition_id UUID REFERENCES kpi_definitions(id) ON DELETE CASCADE,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    value DECIMAL(15,4) NOT NULL,
    target_value DECIMAL(15,4),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WORKFLOW & APPROVAL MANAGEMENT
-- ============================================================================

-- Configurable approval workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_type VARCHAR(50) CHECK (workflow_type IN ('application', 'order', 'payment', 'contract', 'upgrade')),
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    workflow_config JSONB NOT NULL, -- Steps, conditions, auto-approval rules
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval instances
CREATE TABLE IF NOT EXISTS approval_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL, -- application_id, order_id, etc.
    entity_type VARCHAR(50) NOT NULL,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status approval_status DEFAULT 'pending',
    decision_data JSONB DEFAULT '{}',
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES user_profiles(id)
);

-- Individual approval steps
CREATE TABLE IF NOT EXISTS approval_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    approval_instance_id UUID REFERENCES approval_instances(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES user_profiles(id),
    status approval_status DEFAULT 'pending',
    decision VARCHAR(50),
    comments TEXT,
    decided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BILLING & INVOICING
-- ============================================================================

-- Invoice management
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_type invoice_type NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_terms VARCHAR(100),
    notes TEXT,
    generated_by UUID REFERENCES user_profiles(id),
    paid_at TIMESTAMP WITH TIME ZONE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated royalty calculations
CREATE TABLE IF NOT EXISTS royalty_calculations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    calculation_period_start DATE NOT NULL,
    calculation_period_end DATE NOT NULL,
    gross_sales DECIMAL(12,2) NOT NULL,
    net_sales DECIMAL(12,2) NOT NULL,
    royalty_rate DECIMAL(5,2) NOT NULL,
    royalty_amount DECIMAL(12,2) NOT NULL,
    marketing_fee_rate DECIMAL(5,2) DEFAULT 0,
    marketing_fee_amount DECIMAL(12,2) DEFAULT 0,
    adjustments JSONB DEFAULT '{}',
    adjustment_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'calculated' CHECK (status IN ('calculated', 'reviewed', 'approved', 'invoiced')),
    invoice_id UUID REFERENCES invoices(id),
    calculated_by UUID REFERENCES user_profiles(id),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- REAL-TIME SYNCHRONIZATION & NOTIFICATIONS
-- ============================================================================

-- Event sourcing for real-time sync
CREATE TABLE IF NOT EXISTS sync_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    change_data JSONB NOT NULL,
    source_system VARCHAR(100) NOT NULL,
    target_systems TEXT[] DEFAULT '{}',
    sync_status sync_status DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Conflict resolution for concurrent updates
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    conflict_type VARCHAR(50) CHECK (conflict_type IN ('concurrent_update', 'data_mismatch', 'constraint_violation')),
    source_data JSONB NOT NULL,
    target_data JSONB NOT NULL,
    resolution_strategy conflict_resolution DEFAULT 'manual',
    resolved_data JSONB,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification queue for real-time alerts
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    delivery_method notification_delivery DEFAULT 'in_app',
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly', 'never')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- ============================================================================
-- ENHANCED INDEXES FOR PERFORMANCE
-- ============================================================================

-- Media assets indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_franchise_type ON media_assets(franchise_id, media_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_location_type ON media_assets(location_id, media_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(processing_status);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN(tags);

-- Product and inventory indexes
CREATE INDEX IF NOT EXISTS idx_products_brand_status ON products(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_product ON inventory_items(location_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_reorder ON inventory_items(current_stock, reorder_level) WHERE current_stock <= reorder_level;
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date ON stock_movements(inventory_item_id, movement_date);

-- POS and transaction indexes
CREATE INDEX IF NOT EXISTS idx_pos_transactions_system_timestamp ON pos_transactions(pos_system_id, transaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_external_id ON pos_transactions(external_transaction_id);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_product ON pos_transaction_items(product_id);

-- Purchase order indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_location_status ON purchase_orders(location_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_date ON purchase_orders(supplier_id, created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_number ON purchase_orders(order_number);

-- Billing and invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_franchise_status ON invoices(franchise_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_location_type ON invoices(location_id, invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('sent', 'overdue');
CREATE INDEX IF NOT EXISTS idx_royalty_calculations_location_period ON royalty_calculations(location_id, calculation_period_start, calculation_period_end);

-- Approval workflow indexes
CREATE INDEX IF NOT EXISTS idx_approval_instances_entity ON approval_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_instances_status ON approval_instances(status);
CREATE INDEX IF NOT EXISTS idx_approval_steps_approver_status ON approval_steps(approver_id, status);

-- Sync and notification indexes
CREATE INDEX IF NOT EXISTS idx_sync_events_entity ON sync_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_status ON sync_events(sync_status, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_recipient_status ON notification_queue(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_at) WHERE status = 'pending';

-- KPI and reporting indexes
CREATE INDEX IF NOT EXISTS idx_kpi_values_definition_period ON kpi_values(kpi_definition_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_kpi_values_franchise_location ON kpi_values(franchise_id, location_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Comprehensive franchise performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS franchise_analytics_summary AS
SELECT
    f.id as franchise_id,
    f.name as franchise_name,
    o.name as organization_name,
    fc.name as category_name,
    COUNT(DISTINCT fl.id) as total_locations,
    COUNT(DISTINCT fl.id) FILTER (WHERE fl.status = 'open') as active_locations,
    COUNT(DISTINCT fa.id) FILTER (WHERE fa.status = 'approved') as approved_applications,
    COUNT(DISTINCT fa.id) FILTER (WHERE fa.status IN ('submitted', 'under_review')) as pending_applications,
    COALESCE(SUM(pt.total_amount), 0) as total_sales_last_30_days,
    COALESCE(AVG(pt.total_amount), 0) as avg_transaction_amount,
    COUNT(DISTINCT pt.id) as total_transactions_last_30_days,
    COALESCE(SUM(rc.royalty_amount), 0) as total_royalties_last_30_days,
    COALESCE(AVG(ii.current_stock / NULLIF(ii.reorder_level, 0)), 0) as avg_stock_ratio,
    COUNT(DISTINCT ii.id) FILTER (WHERE ii.current_stock <= ii.reorder_level) as low_stock_items,
    MAX(fl.created_at) as latest_location_opened,
    NOW() as last_updated
FROM franchises f
LEFT JOIN organizations o ON f.organization_id = o.id
LEFT JOIN franchise_categories fc ON f.category_id = fc.id
LEFT JOIN franchise_locations fl ON f.id = fl.franchise_id
LEFT JOIN franchise_applications fa ON f.id = fa.franchise_id
LEFT JOIN pos_systems ps ON fl.id = ps.location_id
LEFT JOIN pos_transactions pt ON ps.id = pt.pos_system_id
    AND pt.transaction_timestamp >= NOW() - INTERVAL '30 days'
LEFT JOIN royalty_calculations rc ON fl.id = rc.location_id
    AND rc.calculation_period_start >= NOW() - INTERVAL '30 days'
LEFT JOIN inventory_items ii ON fl.id = ii.location_id
WHERE f.status = 'active'
GROUP BY f.id, f.name, o.name, fc.name;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_franchise_analytics_summary_id
ON franchise_analytics_summary(franchise_id);

-- Location performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS location_performance_summary AS
SELECT
    fl.id as location_id,
    fl.name as location_name,
    f.name as franchise_name,
    fl.status,
    COALESCE(SUM(pt.total_amount), 0) as total_sales_last_30_days,
    COUNT(DISTINCT pt.id) as transaction_count_last_30_days,
    COALESCE(AVG(pt.total_amount), 0) as avg_transaction_amount,
    COALESCE(SUM(rc.royalty_amount), 0) as royalties_last_30_days,
    COUNT(DISTINCT ii.id) as total_inventory_items,
    COUNT(DISTINCT ii.id) FILTER (WHERE ii.current_stock <= ii.reorder_level) as low_stock_items,
    COUNT(DISTINCT po.id) FILTER (WHERE po.status IN ('submitted', 'approved')) as pending_orders,
    NOW() as last_updated
FROM franchise_locations fl
LEFT JOIN franchises f ON fl.franchise_id = f.id
LEFT JOIN pos_systems ps ON fl.id = ps.location_id
LEFT JOIN pos_transactions pt ON ps.id = pt.pos_system_id
    AND pt.transaction_timestamp >= NOW() - INTERVAL '30 days'
LEFT JOIN royalty_calculations rc ON fl.id = rc.location_id
    AND rc.calculation_period_start >= NOW() - INTERVAL '30 days'
LEFT JOIN inventory_items ii ON fl.id = ii.location_id
LEFT JOIN purchase_orders po ON fl.id = po.location_id
    AND po.created_at >= NOW() - INTERVAL '30 days'
WHERE fl.status IN ('open', 'training')
GROUP BY fl.id, fl.name, f.name, fl.status;

-- Create unique index for location performance view
CREATE UNIQUE INDEX IF NOT EXISTS idx_location_performance_summary_id
ON location_performance_summary(location_id);
