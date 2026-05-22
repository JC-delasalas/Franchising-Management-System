-- Enhanced User Schema - Building on Your Excellent Foundation
-- This enhances your existing design with missing business logic components

-- ============================================================================
-- FRANCHISE PACKAGES (Missing from your schema)
-- ============================================================================
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
    territory_description TEXT,
    support_level VARCHAR(50), -- "Basic", "Standard", "Premium"
    training_hours INTEGER DEFAULT 40,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENHANCE EXISTING TABLES (Your tables with added business logic)
-- ============================================================================

-- Enhance franchise_applications (link to packages)
ALTER TABLE franchise_applications 
    ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES franchise_packages(id),
    ADD COLUMN IF NOT EXISTS initial_payment_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS monthly_royalty_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS application_data JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance products (link to franchises and add business details)
ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS franchise_id UUID REFERENCES franchises(id),
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS minimum_order_qty INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS maximum_order_qty INTEGER,
    ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50) DEFAULT 'each',
    ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8,3),
    ADD COLUMN IF NOT EXISTS perishable BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER,
    ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance orders (add business workflow fields)
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'inventory',
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS requested_delivery_date DATE,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance order_items (add pricing and delivery details)
ALTER TABLE order_items 
    ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS total_price DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS delivered_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enhance invoices (add comprehensive billing fields)
ALTER TABLE invoices 
    ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES franchise_locations(id),
    ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(20) DEFAULT 'order',
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PHP',
    ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) DEFAULT 'Net 30',
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints for invoice types
ALTER TABLE invoices 
    DROP CONSTRAINT IF EXISTS invoice_type_check,
    ADD CONSTRAINT invoice_type_check CHECK (invoice_type IN ('order', 'royalty', 'marketing_fee', 'initial_fee', 'other'));

-- Enhance payments (add comprehensive payment tracking)
ALTER TABLE payments 
    ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed',
    ADD COLUMN IF NOT EXISTS processor_response JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints for payment methods and status
ALTER TABLE payments 
    DROP CONSTRAINT IF EXISTS payment_method_check,
    ADD CONSTRAINT payment_method_check CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check', 'online', 'other'));

ALTER TABLE payments 
    DROP CONSTRAINT IF EXISTS payment_status_check,
    ADD CONSTRAINT payment_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

-- Enhance user_profiles (add essential user management fields)
ALTER TABLE user_profiles 
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints for user status
ALTER TABLE user_profiles 
    DROP CONSTRAINT IF EXISTS user_status_check,
    ADD CONSTRAINT user_status_check CHECK (status IN ('active', 'inactive', 'suspended'));

-- Enhance organizations (add business details)
ALTER TABLE organizations 
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'franchisor',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
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
    ADD COLUMN IF NOT EXISTS marketing_fee_rate DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS territory TEXT,
    ADD COLUMN IF NOT EXISTS support_provided TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id),
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
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'planning',
    ADD COLUMN IF NOT EXISTS opening_date DATE,
    ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- LOCATION-BASED INVENTORY (Simpler than warehouse system for MVP)
-- ============================================================================
CREATE TABLE IF NOT EXISTS location_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 100,
    last_counted_at TIMESTAMP WITH TIME ZONE,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    average_monthly_usage INTEGER DEFAULT 0,
    cost_per_unit DECIMAL(12,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, product_id)
);

-- ============================================================================
-- STOCK MOVEMENTS (Track inventory changes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_inventory_id UUID REFERENCES location_inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'sale', 'adjustment', 'shipment'
    reference_id UUID,
    unit_cost DECIMAL(12,2),
    notes TEXT,
    performed_by UUID REFERENCES user_profiles(id),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ESSENTIAL INDEXES (Performance optimization)
-- ============================================================================

-- Franchise packages
CREATE INDEX IF NOT EXISTS idx_franchise_packages_franchise_active ON franchise_packages(franchise_id, active);

-- Enhanced products
CREATE INDEX IF NOT EXISTS idx_products_franchise_active ON products(franchise_id, active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enhanced orders
CREATE INDEX IF NOT EXISTS idx_orders_location_status ON orders(franchise_location_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_approved_by ON orders(approved_by);

-- Enhanced invoices
CREATE INDEX IF NOT EXISTS idx_invoices_location_type ON invoices(location_id, invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due ON invoices(status, due_date);

-- Location inventory
CREATE INDEX IF NOT EXISTS idx_location_inventory_location_product ON location_inventory(location_id, product_id);
CREATE INDEX IF NOT EXISTS idx_location_inventory_reorder ON location_inventory(current_stock, reorder_level) WHERE current_stock <= reorder_level;

-- Stock movements
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_date ON stock_movements(location_inventory_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status ON user_profiles(role, status);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE franchise_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- UPDATED TRIGGERS FOR ENHANCED TABLES
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_franchise_packages_updated_at BEFORE UPDATE ON franchise_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchises_updated_at BEFORE UPDATE ON franchises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_locations_updated_at BEFORE UPDATE ON franchise_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
