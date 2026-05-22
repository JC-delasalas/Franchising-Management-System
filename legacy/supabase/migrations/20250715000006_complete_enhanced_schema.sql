-- COMPLETE ENHANCED SCHEMA - Building on Your Excellent Foundation
-- Implements all suggested enhancements while preserving your excellent order lifecycle and analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location features

-- ============================================================================
-- PHASE 1: ENHANCE YOUR EXISTING TABLES WITH BUSINESS LOGIC
-- ============================================================================

-- Enhance auth_users (keep your structure, add essentials)
-- Note: auth_users is managed by Supabase Auth, we enhance user_profiles instead

-- Enhance user_profiles (add comprehensive user management)
ALTER TABLE user_profiles 
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Manila',
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance organizations (add comprehensive business details)
ALTER TABLE organizations 
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'franchisor' CHECK (type IN ('franchisor', 'management_company', 'investor')),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance franchises (add comprehensive franchise details)
ALTER TABLE franchises 
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS investment_range_min DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS investment_range_max DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS franchise_fee DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS royalty_rate DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS marketing_fee_rate DECIMAL(5,2) DEFAULT 2.00,
    ADD COLUMN IF NOT EXISTS territory TEXT,
    ADD COLUMN IF NOT EXISTS support_provided TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- ADD MISSING BUSINESS LOGIC TABLES
-- ============================================================================

-- Franchise Packages (Investment Tiers - CRITICAL MISSING PIECE)
CREATE TABLE IF NOT EXISTS franchise_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Starter", "Standard", "Premium"
    description TEXT,
    initial_fee DECIMAL(12,2) NOT NULL,
    monthly_royalty_rate DECIMAL(5,2) NOT NULL,
    marketing_fee_rate DECIMAL(5,2) DEFAULT 2.00,
    included_products TEXT[] DEFAULT '{}',
    max_locations INTEGER DEFAULT 1,
    territory_size VARCHAR(100),
    support_level VARCHAR(50) DEFAULT 'standard', -- "basic", "standard", "premium"
    training_hours INTEGER DEFAULT 40,
    equipment_included BOOLEAN DEFAULT FALSE,
    marketing_materials_included BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance franchise_applications (link to packages + workflow)
ALTER TABLE franchise_applications 
    ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES franchises(id),
    ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES franchise_packages(id),
    ADD COLUMN IF NOT EXISTS application_data JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS initial_payment_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS monthly_royalty_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS business_plan TEXT,
    ADD COLUMN IF NOT EXISTS financial_statements JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS references JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance franchise_locations (add operational details)
ALTER TABLE franchise_locations 
    ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES franchises(id),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state VARCHAR(100),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Philippines',
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'construction', 'training', 'open', 'closed', 'sold')),
    ADD COLUMN IF NOT EXISTS opening_date DATE,
    ADD COLUMN IF NOT EXISTS closing_date DATE,
    ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS square_footage INTEGER,
    ADD COLUMN IF NOT EXISTS seating_capacity INTEGER,
    ADD COLUMN IF NOT EXISTS parking_spaces INTEGER,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance products (add franchise context and business details)
ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES franchises(id),
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS minimum_order_qty INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS maximum_order_qty INTEGER,
    ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50) DEFAULT 'each',
    ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8,3),
    ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}', -- length, width, height
    ADD COLUMN IF NOT EXISTS perishable BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER,
    ADD COLUMN IF NOT EXISTS storage_requirements TEXT,
    ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS nutritional_info JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS allergen_info TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- ENHANCE YOUR EXCELLENT ORDER LIFECYCLE
-- ============================================================================

-- Enhance orders (add comprehensive order management)
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'inventory' CHECK (order_type IN ('inventory', 'equipment', 'marketing', 'supplies')),
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS requested_delivery_date DATE,
    ADD COLUMN IF NOT EXISTS promised_delivery_date DATE,
    ADD COLUMN IF NOT EXISTS special_instructions TEXT,
    ADD COLUMN IF NOT EXISTS internal_notes TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance order_items (add detailed line item information)
ALTER TABLE order_items 
    ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2) NOT NULL,
    ADD COLUMN IF NOT EXISTS total_price DECIMAL(12,2) NOT NULL,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS delivered_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS backordered_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cancelled_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,2), -- For margin calculations
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance warehouses (add comprehensive warehouse management)
ALTER TABLE warehouses 
    ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS warehouse_type VARCHAR(50) DEFAULT 'distribution' CHECK (warehouse_type IN ('distribution', 'manufacturing', 'cold_storage', 'dry_storage')),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state VARCHAR(100),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Philippines',
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS capacity_cubic_meters DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS temperature_controlled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS security_level VARCHAR(20) DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance inventory_levels (add comprehensive inventory tracking)
ALTER TABLE inventory_levels 
    ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS available_quantity INTEGER GENERATED ALWAYS AS (quantity_on_hand - reserved_quantity) STORED,
    ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000,
    ADD COLUMN IF NOT EXISTS average_daily_usage DECIMAL(8,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_counted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_restocked_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS cost_per_unit DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS location_in_warehouse VARCHAR(100), -- Aisle, shelf, bin
    ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS expiry_date DATE,
    ADD COLUMN IF NOT EXISTS supplier_id UUID, -- Will reference suppliers table in Phase 2
    ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance shipments (add comprehensive shipping details)
ALTER TABLE shipments 
    ADD COLUMN IF NOT EXISTS shipment_number VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50), -- "standard", "express", "overnight"
    ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
    ADD COLUMN IF NOT EXISTS actual_delivery_date DATE,
    ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8,3),
    ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS special_handling TEXT,
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS delivery_address JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'returned', 'cancelled')),
    ADD COLUMN IF NOT EXISTS shipped_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS delivered_by VARCHAR(255), -- Delivery person name
    ADD COLUMN IF NOT EXISTS delivery_signature TEXT,
    ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- ENHANCE YOUR EXCELLENT FINANCIAL MANAGEMENT
-- ============================================================================

-- Enhance invoices (add comprehensive billing capabilities)
ALTER TABLE invoices 
    ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES franchise_locations(id),
    ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(20) DEFAULT 'order' CHECK (invoice_type IN ('order', 'royalty', 'marketing_fee', 'initial_fee', 'equipment', 'other')),
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PHP',
    ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) DEFAULT 'Net 30',
    ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS internal_notes TEXT,
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance payments (add comprehensive payment processing)
ALTER TABLE payments 
    ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
    ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'full' CHECK (payment_type IN ('full', 'partial', 'overpayment', 'refund')),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    ADD COLUMN IF NOT EXISTS processor VARCHAR(50), -- "stripe", "paypal", "bank_transfer"
    ADD COLUMN IF NOT EXISTS processor_transaction_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS processor_response JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS net_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PHP',
    ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- ADDITIONAL BUSINESS LOGIC TABLES (Missing from Original)
-- ============================================================================

-- Stock Movements (Track all inventory changes)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    warehouse_id UUID REFERENCES warehouses(id),
    product_id UUID REFERENCES products(id),
    movement_type VARCHAR(20) CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer', 'return')) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(12,2),
    reference_type VARCHAR(50), -- 'order', 'shipment', 'adjustment', 'return', 'transfer'
    reference_id UUID,
    batch_number VARCHAR(100),
    expiry_date DATE,
    location_from VARCHAR(100), -- Source location for transfers
    location_to VARCHAR(100), -- Destination location for transfers
    notes TEXT,
    performed_by UUID REFERENCES user_profiles(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Status History (Track order lifecycle)
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES user_profiles(id),
    change_reason TEXT,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Items (Link shipments to specific order items)
CREATE TABLE IF NOT EXISTS shipment_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id),
    product_id UUID REFERENCES products(id),
    quantity_shipped INTEGER NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Line Items (Detailed invoice breakdown)
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Charges (Royalties, Marketing Fees)
CREATE TABLE IF NOT EXISTS recurring_charges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    charge_type VARCHAR(50) CHECK (charge_type IN ('royalty', 'marketing_fee', 'technology_fee', 'other')) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    percentage_rate DECIMAL(5,2), -- If percentage-based
    base_amount DECIMAL(12,2), -- Amount percentage is calculated on
    frequency VARCHAR(20) DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_charge_date DATE,
    last_charged_date DATE,
    active BOOLEAN DEFAULT TRUE,
    auto_invoice BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Addresses (Multiple addresses per user)
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    address_type VARCHAR(20) CHECK (address_type IN ('home', 'business', 'billing', 'shipping')) NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Philippines',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Members (User-Organization relationships)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')) NOT NULL,
    permissions JSONB DEFAULT '{}',
    department VARCHAR(100),
    title VARCHAR(100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ============================================================================
-- COMPREHENSIVE INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status ON user_profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_type_status ON organizations(type, status);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);

-- Franchises indexes
CREATE INDEX IF NOT EXISTS idx_franchises_org_status ON franchises(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_franchises_category ON franchises(category);
CREATE INDEX IF NOT EXISTS idx_franchises_featured ON franchises(featured, status);
CREATE INDEX IF NOT EXISTS idx_franchises_owner ON franchises(owner_id);

-- Franchise packages indexes
CREATE INDEX IF NOT EXISTS idx_franchise_packages_franchise_active ON franchise_packages(franchise_id, active);
CREATE INDEX IF NOT EXISTS idx_franchise_packages_sort ON franchise_packages(sort_order);

-- Franchise applications indexes
CREATE INDEX IF NOT EXISTS idx_franchise_applications_applicant_status ON franchise_applications(applicant_id, status);
CREATE INDEX IF NOT EXISTS idx_franchise_applications_franchise ON franchise_applications(franchise_id);
CREATE INDEX IF NOT EXISTS idx_franchise_applications_package ON franchise_applications(package_id);
CREATE INDEX IF NOT EXISTS idx_franchise_applications_submitted ON franchise_applications(submitted_at);

-- Franchise locations indexes
CREATE INDEX IF NOT EXISTS idx_franchise_locations_franchise_status ON franchise_locations(franchise_id, status);
CREATE INDEX IF NOT EXISTS idx_franchise_locations_franchisee ON franchise_locations(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_franchise_locations_coordinates ON franchise_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_franchise_locations_city_state ON franchise_locations(city, state);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_franchise_active ON products(franchise_id, active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured, active);
CREATE INDEX IF NOT EXISTS idx_products_perishable ON products(perishable);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_location_status ON orders(franchise_location_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(order_date, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_approved_by ON orders(approved_by);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(requested_delivery_date);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Warehouses indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_type_status ON warehouses(warehouse_type, status);
CREATE INDEX IF NOT EXISTS idx_warehouses_manager ON warehouses(manager_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_coordinates ON warehouses(latitude, longitude);

-- Inventory levels indexes
CREATE INDEX IF NOT EXISTS idx_inventory_levels_warehouse_product ON inventory_levels(warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_reorder ON inventory_levels(quantity_on_hand, reorder_level) WHERE quantity_on_hand <= reorder_level;
CREATE INDEX IF NOT EXISTS idx_inventory_levels_expiry ON inventory_levels(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_levels_batch ON inventory_levels(batch_number);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_warehouse ON shipments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_shipments_number ON shipments(shipment_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status_date ON shipments(status, shipped_date);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_delivery_date ON shipments(estimated_delivery_date);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_location_type ON invoices(location_id, invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due ON invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date_method ON payments(payment_date, payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_processor ON payments(processor, processor_transaction_id);

-- Sales receipts indexes
CREATE INDEX IF NOT EXISTS idx_sales_receipts_location_date ON sales_receipts(franchise_location_id, receipt_date);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_number ON sales_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_cashier ON sales_receipts(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_customer ON sales_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipts_voided ON sales_receipts(voided, receipt_date);

-- Sales receipt items indexes
CREATE INDEX IF NOT EXISTS idx_sales_receipt_items_receipt ON sales_receipt_items(sales_receipt_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipt_items_product ON sales_receipt_items(product_id);

-- Performance targets indexes
CREATE INDEX IF NOT EXISTS idx_performance_targets_location_type ON performance_targets(franchise_location_id, target_type);
CREATE INDEX IF NOT EXISTS idx_performance_targets_period ON performance_targets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_performance_targets_created_by ON performance_targets(created_by);

-- Location reviews indexes
CREATE INDEX IF NOT EXISTS idx_location_reviews_location_date ON location_reviews(franchise_location_id, review_date);
CREATE INDEX IF NOT EXISTS idx_location_reviews_rating ON location_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_location_reviews_source ON location_reviews(review_source);
CREATE INDEX IF NOT EXISTS idx_location_reviews_verified ON location_reviews(verified);

-- Compliance audits indexes
CREATE INDEX IF NOT EXISTS idx_compliance_audits_location_type ON compliance_audits(franchise_location_id, audit_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audits_date ON compliance_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_compliance_audits_auditor ON compliance_audits(auditor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audits_score ON compliance_audits(score, passed);
CREATE INDEX IF NOT EXISTS idx_compliance_audits_status ON compliance_audits(status);

-- KPI summary indexes
CREATE INDEX IF NOT EXISTS idx_kpi_summary_org_category ON kpi_summary(organization_id, kpi_category);
CREATE INDEX IF NOT EXISTS idx_kpi_summary_name_period ON kpi_summary(kpi_name, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_kpi_summary_calculated ON kpi_summary(last_calculated_at);

-- Additional business logic table indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_date ON stock_movements(warehouse_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_date ON stock_movements(product_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_batch ON stock_movements(batch_number);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, changed_at);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_by ON order_status_history(changed_by);

CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_order_item ON shipment_items(order_item_id);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_product ON invoice_line_items(product_id);

CREATE INDEX IF NOT EXISTS idx_recurring_charges_location_active ON recurring_charges(location_id, active);
CREATE INDEX IF NOT EXISTS idx_recurring_charges_next_charge ON recurring_charges(next_charge_date) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_charges_type ON recurring_charges(charge_type);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_type ON user_addresses(user_id, address_type);
CREATE INDEX IF NOT EXISTS idx_user_addresses_primary ON user_addresses(user_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_organization_members_org_active ON organization_members(organization_id, active);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_role ON organization_members(role);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

-- Enable RLS on existing tables (if not already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on new tables
ALTER TABLE franchise_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMPREHENSIVE RLS POLICIES
-- ============================================================================

-- User profiles policies
CREATE POLICY "users_own_profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "organization_members_view_profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om1
            JOIN organization_members om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid() AND om2.user_id = user_profiles.id
            AND om1.active = true AND om2.active = true
        )
    );

-- Organizations policies
CREATE POLICY "organization_members_access" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = organizations.id
            AND user_id = auth.uid()
            AND active = true
        )
    );

-- Franchises policies
CREATE POLICY "public_view_active_franchises" ON franchises
    FOR SELECT USING (status = 'active');

CREATE POLICY "franchise_owners_manage" ON franchises
    FOR ALL USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = franchises.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
            AND active = true
        )
    );

-- Franchise locations policies
CREATE POLICY "franchisee_own_locations" ON franchise_locations
    FOR ALL USING (
        franchisee_id = auth.uid() OR
        manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM franchises f
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE f.id = franchise_locations.franchise_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'manager')
            AND om.active = true
        )
    );

-- Orders policies
CREATE POLICY "location_staff_orders" ON orders
    FOR ALL USING (
        created_by = auth.uid() OR
        approved_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM franchise_locations fl
            WHERE fl.id = orders.franchise_location_id
            AND (fl.franchisee_id = auth.uid() OR fl.manager_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM franchise_locations fl
            JOIN franchises f ON fl.franchise_id = f.id
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE fl.id = orders.franchise_location_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'manager')
            AND om.active = true
        )
    );

-- Invoices policies
CREATE POLICY "financial_access_invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM franchise_locations fl
            WHERE fl.id = invoices.location_id
            AND (fl.franchisee_id = auth.uid() OR fl.manager_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM franchise_locations fl
            JOIN franchises f ON fl.franchise_id = f.id
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE fl.id = invoices.location_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'manager')
            AND om.active = true
        )
    );

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Order number generation function
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

-- Invoice number generation function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    sequence_part := LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
    RETURN 'INV-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Shipment number generation function
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    sequence_part := LPAD(nextval('shipment_number_seq')::TEXT, 6, '0');
    RETURN 'SHP-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for shipment numbers
CREATE SEQUENCE IF NOT EXISTS shipment_number_seq START 1;

-- Order status change trigger
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (
            order_id, previous_status, new_status, changed_by, change_reason
        ) VALUES (
            NEW.id, OLD.status, NEW.status, auth.uid(),
            COALESCE(NEW.rejection_reason, NEW.cancellation_reason, 'Status updated')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Inventory update on shipment
CREATE OR REPLACE FUNCTION update_inventory_on_shipment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
        -- Update inventory levels for shipped items
        UPDATE inventory_levels
        SET
            quantity_on_hand = quantity_on_hand - si.quantity_shipped,
            last_updated = NOW()
        FROM shipment_items si
        WHERE si.shipment_id = NEW.id
        AND inventory_levels.warehouse_id = NEW.warehouse_id
        AND inventory_levels.product_id = si.product_id;

        -- Log stock movements
        INSERT INTO stock_movements (
            warehouse_id, product_id, movement_type, quantity,
            reference_type, reference_id, performed_by
        )
        SELECT
            NEW.warehouse_id, si.product_id, 'out', si.quantity_shipped,
            'shipment', NEW.id, NEW.shipped_by
        FROM shipment_items si
        WHERE si.shipment_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_subtotal DECIMAL(12,2);
    order_tax DECIMAL(12,2);
    order_total DECIMAL(12,2);
BEGIN
    -- Calculate totals from order items
    SELECT
        COALESCE(SUM(total_price), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO order_subtotal, order_tax
    FROM order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

    order_total := order_subtotal + order_tax;

    -- Update order totals
    UPDATE orders
    SET
        subtotal = order_subtotal,
        tax_amount = order_tax,
        total_amount = order_total + COALESCE(shipping_amount, 0) - COALESCE(discount_amount, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchises_updated_at
    BEFORE UPDATE ON franchises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_packages_updated_at
    BEFORE UPDATE ON franchise_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_applications_updated_at
    BEFORE UPDATE ON franchise_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_locations_updated_at
    BEFORE UPDATE ON franchise_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_receipts_updated_at
    BEFORE UPDATE ON sales_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_targets_updated_at
    BEFORE UPDATE ON performance_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_reviews_updated_at
    BEFORE UPDATE ON location_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_audits_updated_at
    BEFORE UPDATE ON compliance_audits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_summary_updated_at
    BEFORE UPDATE ON kpi_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_charges_updated_at
    BEFORE UPDATE ON recurring_charges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER log_order_status_changes
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

CREATE TRIGGER update_inventory_on_shipment_status
    AFTER UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_shipment();

CREATE TRIGGER calculate_order_totals_on_items
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

-- ============================================================================
-- ENHANCED VIEWS FOR REPORTING AND ANALYTICS
-- ============================================================================

-- Comprehensive order summary view
CREATE VIEW order_summary AS
SELECT
    o.id,
    o.order_number,
    fl.name as location_name,
    f.name as franchise_name,
    org.name as organization_name,
    o.status,
    o.order_type,
    o.priority,
    o.total_amount,
    o.order_date,
    o.requested_delivery_date,
    o.created_at,
    o.approved_at,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity,
    creator.full_name as created_by_name,
    approver.full_name as approved_by_name
FROM orders o
JOIN franchise_locations fl ON o.franchise_location_id = fl.id
JOIN franchises f ON fl.franchise_id = f.id
JOIN organizations org ON f.organization_id = org.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN user_profiles creator ON o.created_by = creator.id
LEFT JOIN user_profiles approver ON o.approved_by = approver.id
GROUP BY o.id, fl.name, f.name, org.name, creator.full_name, approver.full_name;

-- Inventory status view with alerts
CREATE VIEW inventory_status AS
SELECT
    il.warehouse_id,
    w.name as warehouse_name,
    il.product_id,
    p.name as product_name,
    p.sku,
    p.category,
    il.quantity_on_hand,
    il.reserved_quantity,
    il.available_quantity,
    il.reorder_level,
    il.max_stock_level,
    CASE
        WHEN il.available_quantity <= 0 THEN 'Out of Stock'
        WHEN il.available_quantity <= il.reorder_level THEN 'Low Stock'
        WHEN il.available_quantity <= (il.reorder_level * 1.5) THEN 'Medium Stock'
        ELSE 'Good Stock'
    END as stock_status,
    CASE
        WHEN il.available_quantity <= 0 THEN 'critical'
        WHEN il.available_quantity <= il.reorder_level THEN 'warning'
        WHEN il.available_quantity <= (il.reorder_level * 1.5) THEN 'caution'
        ELSE 'normal'
    END as alert_level,
    il.last_counted_at,
    il.last_restocked_at,
    il.expiry_date,
    CASE
        WHEN il.expiry_date IS NOT NULL AND il.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        THEN true ELSE false
    END as expiring_soon
FROM inventory_levels il
JOIN warehouses w ON il.warehouse_id = w.id
JOIN products p ON il.product_id = p.id
WHERE p.active = true AND w.status = 'active';

-- Financial summary view
CREATE VIEW financial_summary AS
SELECT
    fl.id as location_id,
    fl.name as location_name,
    f.name as franchise_name,

    -- Order metrics
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed' AND o.order_date >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30_days,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'completed' AND o.order_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as order_total_last_30_days,

    -- Sales metrics
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.receipt_date >= CURRENT_DATE - INTERVAL '30 days') as sales_count_last_30_days,
    COALESCE(SUM(sr.total_amount) FILTER (WHERE sr.receipt_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as sales_total_last_30_days,
    COALESCE(AVG(sr.total_amount) FILTER (WHERE sr.receipt_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as avg_sale_amount,

    -- Invoice metrics
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending') as pending_invoices,
    COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'pending'), 0) as pending_invoice_amount,
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'overdue') as overdue_invoices,
    COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'overdue'), 0) as overdue_amount,

    -- Payment metrics
    COALESCE(SUM(p.amount) FILTER (WHERE p.payment_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as payments_last_30_days,

    -- Performance metrics
    COALESCE(AVG(pt.achievement_percentage) FILTER (WHERE pt.end_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as avg_target_achievement

FROM franchise_locations fl
JOIN franchises f ON fl.franchise_id = f.id
LEFT JOIN orders o ON fl.id = o.franchise_location_id
LEFT JOIN sales_receipts sr ON fl.id = sr.franchise_location_id AND sr.voided = false
LEFT JOIN invoices i ON fl.id = i.location_id
LEFT JOIN payments p ON i.id = p.invoice_id AND p.status = 'completed'
LEFT JOIN performance_targets pt ON fl.id = pt.franchise_location_id
WHERE fl.status IN ('open', 'training')
GROUP BY fl.id, fl.name, f.name;

-- Franchise performance dashboard
CREATE VIEW franchise_performance_dashboard AS
SELECT
    f.id as franchise_id,
    f.name as franchise_name,
    org.name as organization_name,
    f.category,
    f.status,

    -- Location metrics
    COUNT(DISTINCT fl.id) as total_locations,
    COUNT(DISTINCT fl.id) FILTER (WHERE fl.status = 'open') as active_locations,
    COUNT(DISTINCT fl.id) FILTER (WHERE fl.status = 'construction') as locations_in_construction,

    -- Application metrics
    COUNT(DISTINCT fa.id) FILTER (WHERE fa.status = 'pending') as pending_applications,
    COUNT(DISTINCT fa.id) FILTER (WHERE fa.status = 'approved') as approved_applications,
    COUNT(DISTINCT fa.id) FILTER (WHERE fa.submitted_at >= CURRENT_DATE - INTERVAL '30 days') as applications_last_30_days,

    -- Financial metrics
    COALESCE(SUM(sr.total_amount) FILTER (WHERE sr.receipt_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as total_sales_last_30_days,
    COALESCE(AVG(sr.total_amount) FILTER (WHERE sr.receipt_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as avg_sale_amount,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.receipt_date >= CURRENT_DATE - INTERVAL '30 days') as transaction_count_last_30_days,

    -- Order metrics
    COUNT(DISTINCT o.id) FILTER (WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30_days,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as order_value_last_30_days,

    -- Review metrics
    COALESCE(AVG(lr.rating), 0) as avg_rating,
    COUNT(DISTINCT lr.id) as total_reviews,
    COUNT(DISTINCT lr.id) FILTER (WHERE lr.review_date >= CURRENT_DATE - INTERVAL '30 days') as reviews_last_30_days,

    -- Compliance metrics
    COALESCE(AVG(ca.score) FILTER (WHERE ca.audit_date >= CURRENT_DATE - INTERVAL '90 days'), 0) as avg_compliance_score,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.passed = false AND ca.audit_date >= CURRENT_DATE - INTERVAL '90 days') as failed_audits_last_90_days

FROM franchises f
JOIN organizations org ON f.organization_id = org.id
LEFT JOIN franchise_locations fl ON f.id = fl.franchise_id
LEFT JOIN franchise_applications fa ON f.id = fa.franchise_id
LEFT JOIN sales_receipts sr ON fl.id = sr.franchise_location_id AND sr.voided = false
LEFT JOIN orders o ON fl.id = o.franchise_location_id
LEFT JOIN location_reviews lr ON fl.id = lr.franchise_location_id
LEFT JOIN compliance_audits ca ON fl.id = ca.franchise_location_id
WHERE f.status = 'active'
GROUP BY f.id, f.name, org.name, f.category, f.status;

-- Low stock alerts view
CREATE VIEW low_stock_alerts AS
SELECT
    w.id as warehouse_id,
    w.name as warehouse_name,
    p.id as product_id,
    p.name as product_name,
    p.sku,
    p.category,
    il.quantity_on_hand,
    il.available_quantity,
    il.reorder_level,
    il.average_daily_usage,
    CASE
        WHEN il.average_daily_usage > 0
        THEN ROUND(il.available_quantity / il.average_daily_usage, 1)
        ELSE NULL
    END as days_of_stock_remaining,
    il.expiry_date,
    CASE
        WHEN il.available_quantity <= 0 THEN 'Out of Stock'
        WHEN il.available_quantity <= il.reorder_level THEN 'Reorder Required'
        WHEN il.expiry_date IS NOT NULL AND il.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Expiring Soon'
        ELSE 'Low Stock Warning'
    END as alert_type,
    CASE
        WHEN il.available_quantity <= 0 THEN 1
        WHEN il.expiry_date IS NOT NULL AND il.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 2
        WHEN il.available_quantity <= il.reorder_level THEN 3
        ELSE 4
    END as priority_order
FROM inventory_levels il
JOIN warehouses w ON il.warehouse_id = w.id
JOIN products p ON il.product_id = p.id
WHERE p.active = true
AND w.status = 'active'
AND (
    il.available_quantity <= il.reorder_level OR
    (il.expiry_date IS NOT NULL AND il.expiry_date <= CURRENT_DATE + INTERVAL '30 days')
)
ORDER BY priority_order, il.available_quantity;

-- ============================================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- ============================================================================

-- Insert sample franchise categories
INSERT INTO franchises (organization_id, name, category, description, status, featured)
SELECT
    org.id,
    'Sample Franchise',
    'Food & Beverage',
    'A sample franchise for testing purposes',
    'active',
    true
FROM organizations org
WHERE org.name = 'Sample Organization'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FINAL SETUP AND VALIDATION
-- ============================================================================

-- Create helpful functions for common operations
CREATE OR REPLACE FUNCTION get_franchise_locations(franchise_uuid UUID)
RETURNS TABLE (
    location_id UUID,
    location_name TEXT,
    status TEXT,
    franchisee_name TEXT,
    city TEXT,
    state TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fl.id,
        fl.name,
        fl.status,
        up.full_name,
        fl.city,
        fl.state
    FROM franchise_locations fl
    LEFT JOIN user_profiles up ON fl.franchisee_id = up.id
    WHERE fl.franchise_id = franchise_uuid
    ORDER BY fl.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get inventory alerts for a warehouse
CREATE OR REPLACE FUNCTION get_inventory_alerts(warehouse_uuid UUID)
RETURNS TABLE (
    product_name TEXT,
    sku TEXT,
    current_stock INTEGER,
    reorder_level INTEGER,
    alert_type TEXT,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.name,
        p.sku,
        il.quantity_on_hand,
        il.reorder_level,
        CASE
            WHEN il.available_quantity <= 0 THEN 'OUT_OF_STOCK'
            WHEN il.available_quantity <= il.reorder_level THEN 'LOW_STOCK'
            WHEN il.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING_SOON'
            ELSE 'NORMAL'
        END,
        CASE
            WHEN il.expiry_date IS NOT NULL
            THEN EXTRACT(DAY FROM il.expiry_date - CURRENT_DATE)::INTEGER
            ELSE NULL
        END
    FROM inventory_levels il
    JOIN products p ON il.product_id = p.id
    WHERE il.warehouse_id = warehouse_uuid
    AND p.active = true
    AND (
        il.available_quantity <= il.reorder_level OR
        il.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    )
    ORDER BY
        CASE
            WHEN il.available_quantity <= 0 THEN 1
            WHEN il.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 2
            WHEN il.available_quantity <= il.reorder_level THEN 3
            ELSE 4
        END;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE franchise_packages IS 'Investment tiers and packages offered by franchises (Starter, Standard, Premium)';
COMMENT ON TABLE stock_movements IS 'Complete audit trail of all inventory movements across warehouses';
COMMENT ON TABLE order_status_history IS 'Tracks all status changes in the order lifecycle for audit purposes';
COMMENT ON TABLE recurring_charges IS 'Manages ongoing charges like royalties and marketing fees';
COMMENT ON VIEW inventory_status IS 'Real-time view of inventory levels with stock alerts and expiry warnings';
COMMENT ON VIEW financial_summary IS 'Comprehensive financial metrics per location including sales, orders, and payments';
COMMENT ON VIEW franchise_performance_dashboard IS 'High-level performance metrics for franchise management';

-- Final validation
DO $$
BEGIN
    RAISE NOTICE 'Enhanced schema migration completed successfully!';
    RAISE NOTICE 'Total tables created/enhanced: %', (
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    );
    RAISE NOTICE 'Total views created: %', (
        SELECT COUNT(*) FROM information_schema.views
        WHERE table_schema = 'public'
    );
    RAISE NOTICE 'Total indexes created: %', (
        SELECT COUNT(*) FROM pg_indexes
        WHERE schemaname = 'public'
    );
END $$;

-- ============================================================================
-- ENHANCE YOUR EXCELLENT ANALYTICS FRAMEWORK
-- ============================================================================

-- Enhance sales_receipts (add comprehensive sales tracking)
ALTER TABLE sales_receipts 
    ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'return', 'void', 'refund')),
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
    ADD COLUMN IF NOT EXISTS customer_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cashier_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS pos_terminal_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS receipt_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS voided BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS void_reason TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance sales_receipt_items (add detailed line item tracking)
ALTER TABLE sales_receipt_items 
    ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2) NOT NULL,
    ADD COLUMN IF NOT EXISTS total_price DECIMAL(12,2) NOT NULL,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2), -- For profit calculations
    ADD COLUMN IF NOT EXISTS modifiers JSONB DEFAULT '{}', -- Size, extras, etc.
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance performance_targets (add comprehensive target management)
ALTER TABLE performance_targets 
    ADD COLUMN IF NOT EXISTS target_type VARCHAR(50) DEFAULT 'revenue' CHECK (target_type IN ('revenue', 'units_sold', 'customer_count', 'average_order_value', 'profit_margin')),
    ADD COLUMN IF NOT EXISTS target_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (target_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    ADD COLUMN IF NOT EXISTS start_date DATE NOT NULL,
    ADD COLUMN IF NOT EXISTS end_date DATE NOT NULL,
    ADD COLUMN IF NOT EXISTS actual_value DECIMAL(15,2),
    ADD COLUMN IF NOT EXISTS achievement_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN target_revenue > 0 THEN (actual_value / target_revenue * 100) ELSE 0 END
    ) STORED,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance location_reviews (add comprehensive review system)
ALTER TABLE location_reviews 
    ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reviewer_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS review_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS review_text TEXT,
    ADD COLUMN IF NOT EXISTS review_source VARCHAR(50) DEFAULT 'internal', -- "google", "yelp", "facebook", "internal"
    ADD COLUMN IF NOT EXISTS external_review_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    ADD COLUMN IF NOT EXISTS food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    ADD COLUMN IF NOT EXISTS cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    ADD COLUMN IF NOT EXISTS value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN,
    ADD COLUMN IF NOT EXISTS response_text TEXT,
    ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS review_date DATE DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance compliance_audits (add comprehensive audit management)
ALTER TABLE compliance_audits 
    ADD COLUMN IF NOT EXISTS audit_type VARCHAR(50) DEFAULT 'operational' CHECK (audit_type IN ('operational', 'financial', 'health_safety', 'brand_standards', 'quality_assurance')),
    ADD COLUMN IF NOT EXISTS auditor_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS auditor_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS audit_date DATE NOT NULL,
    ADD COLUMN IF NOT EXISTS max_score DECIMAL(5,2) DEFAULT 100.00,
    ADD COLUMN IF NOT EXISTS passing_score DECIMAL(5,2) DEFAULT 80.00,
    ADD COLUMN IF NOT EXISTS passed BOOLEAN GENERATED ALWAYS AS (score >= passing_score) STORED,
    ADD COLUMN IF NOT EXISTS findings JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS recommendations TEXT,
    ADD COLUMN IF NOT EXISTS corrective_actions JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS follow_up_date DATE,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'follow_up_required')),
    ADD COLUMN IF NOT EXISTS report_url TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance kpi_summary (add comprehensive KPI tracking)
ALTER TABLE kpi_summary 
    ADD COLUMN IF NOT EXISTS kpi_category VARCHAR(50) DEFAULT 'financial' CHECK (kpi_category IN ('financial', 'operational', 'customer', 'employee', 'quality')),
    ADD COLUMN IF NOT EXISTS kpi_value DECIMAL(15,4),
    ADD COLUMN IF NOT EXISTS kpi_unit VARCHAR(20), -- "PHP", "count", "percentage", "ratio"
    ADD COLUMN IF NOT EXISTS target_value DECIMAL(15,4),
    ADD COLUMN IF NOT EXISTS previous_value DECIMAL(15,4),
    ADD COLUMN IF NOT EXISTS period_start DATE,
    ADD COLUMN IF NOT EXISTS period_end DATE,
    ADD COLUMN IF NOT EXISTS calculation_method TEXT,
    ADD COLUMN IF NOT EXISTS data_sources TEXT[],
    ADD COLUMN IF NOT EXISTS trend VARCHAR(20) CHECK (trend IN ('up', 'down', 'stable', 'volatile')),
    ADD COLUMN IF NOT EXISTS variance_percentage DECIMAL(8,2),
    ADD COLUMN IF NOT EXISTS last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
