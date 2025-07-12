
-- =================================================================
-- SUPABASE (POSTGRESQL) SCRIPT FOR FRANCHISEHUB
-- Translated and optimized for Supabase
-- =================================================================

-- SECTION 1: EXTENSIONS & CUSTOM TYPES
-- =================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE billing_cycle_enum AS ENUM ('monthly', 'annually', 'one-time');
CREATE TYPE module_type_enum AS ENUM ('document', 'video', 'quiz');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- =================================================================
-- SECTION 2: TABLE DEFINITIONS
-- =================================================================

CREATE TABLE public.franchisor (
    franchisor_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_nm VARCHAR(255) NOT NULL UNIQUE,
    legal_nm VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL UNIQUE,
    phone_no VARCHAR(50),
    street_addr VARCHAR(255),
    city VARCHAR(100),
    state_prov VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.brand (
    brand_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id uuid NOT NULL,
    brand_nm VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    logo_url TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.franchisee (
    franchisee_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL,
    op_nm VARCHAR(255) NOT NULL,
    legal_nm VARCHAR(255),
    contact_first_nm VARCHAR(255),
    contact_last_nm VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    phone_no VARCHAR(50),
    status user_status_enum NOT NULL DEFAULT 'active',
    onboarding_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.location (
    location_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id uuid NOT NULL,
    location_nm VARCHAR(255) NOT NULL,
    street_addr VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_prov VARCHAR(100),
    region VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    phone_no VARCHAR(50),
    email VARCHAR(255),
    opening_date DATE,
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.supplier (
    supplier_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id uuid NOT NULL,
    supplier_nm VARCHAR(255) NOT NULL,
    contact_first_nm VARCHAR(255),
    contact_last_nm VARCHAR(255),
    email VARCHAR(255),
    phone_no VARCHAR(50),
    street_addr VARCHAR(255),
    city VARCHAR(100),
    state_prov VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.customer (
    customer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id uuid NOT NULL,
    first_nm VARCHAR(255),
    last_nm VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone_no VARCHAR(50),
    loyalty_member BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    franchisor_id uuid NOT NULL,
    first_nm VARCHAR(255) NOT NULL,
    last_nm VARCHAR(255) NOT NULL,
    phone_no VARCHAR(50),
    avatar_url TEXT,
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.role (
    role_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id uuid NOT NULL,
    role_nm VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.permission (
    permission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_nm VARCHAR(255) NOT NULL UNIQUE,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_category (
    category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL,
    cat_nm VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product (
    product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL,
    category_id uuid,
    product_nm VARCHAR(255) NOT NULL,
    details TEXT,
    sku VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory (
    inventory_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL,
    product_id uuid NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced inventory orders table for franchisor visibility
CREATE TABLE public.inventory_order (
    order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id uuid NOT NULL,
    location_id uuid NOT NULL,
    order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status order_status_enum NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_order_item (
    order_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE public.sales_transaction (
    txn_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL,
    user_id uuid,
    customer_id uuid,
    txn_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    total_amt NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    status transaction_status_enum NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sales_item (
    sales_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id uuid NOT NULL,
    product_id uuid NOT NULL,
    qty_sold INT NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    discount_amt NUMERIC(10, 2) DEFAULT 0.00
);

CREATE TABLE public.purchase_order (
    order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amt NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.purchase_order_item (
    order_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    qty_ordered INT NOT NULL,
    order_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE public.shipment (
    shipment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_no VARCHAR(100) UNIQUE,
    carrier VARCHAR(100),
    from_location_id uuid,
    to_location_id uuid,
    purchase_order_id uuid,
    inventory_order_id uuid,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.plan (
    plan_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL,
    plan_nm VARCHAR(255) NOT NULL,
    details TEXT,
    price NUMERIC(10, 2) NOT NULL,
    billing_cycle billing_cycle_enum NOT NULL,
    features_included JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subscription (
    subscription_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    next_billing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.invoice (
    invoice_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid,
    franchisee_id uuid NOT NULL,
    invoice_no VARCHAR(100) UNIQUE,
    invoice_date DATE,
    due_date DATE,
    total_amt NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payment (
    payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    gateway_txn_id VARCHAR(255) UNIQUE,
    status transaction_status_enum NOT NULL DEFAULT 'completed'
);

CREATE TABLE public.kpi (
    kpi_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL,
    kpi_nm VARCHAR(255) NOT NULL,
    details TEXT,
    target_value NUMERIC(18, 4),
    unit_of_measure VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.kpi_data (
    data_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id uuid NOT NULL,
    location_id uuid,
    recorded_date DATE NOT NULL,
    actual_value NUMERIC(18, 4) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.training_module (
    module_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    content_path TEXT,
    module_type module_type_enum NOT NULL DEFAULT 'document',
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_training (
    user_id uuid NOT NULL,
    module_id uuid NOT NULL,
    completion_status VARCHAR(50) NOT NULL DEFAULT 'assigned',
    completion_date TIMESTAMPTZ,
    score NUMERIC(5, 2),
    PRIMARY KEY (user_id, module_id)
);

CREATE TABLE public.contract (
    contract_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id uuid NOT NULL,
    contract_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    document_path TEXT,
    franchisor_signer_id uuid,
    franchisee_signer_id uuid,
    signed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contract_version (
    version_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id uuid NOT NULL,
    version_no INT NOT NULL,
    document_path TEXT NOT NULL,
    changes_summary TEXT,
    created_by_user_id uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id uuid,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id uuid,
    details JSONB,
    ip_address INET,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_role (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    location_id uuid,
    PRIMARY KEY (user_id, role_id, location_id)
);

CREATE TABLE public.role_permission (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- =================================================================
-- SECTION 3: FOREIGN KEYS & CONSTRAINTS
-- =================================================================

ALTER TABLE public.brand ADD FOREIGN KEY (franchisor_id) REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE;
ALTER TABLE public.franchisee ADD FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id) ON DELETE CASCADE;
ALTER TABLE public.location ADD FOREIGN KEY (franchisee_id) REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE;
ALTER TABLE public.supplier ADD FOREIGN KEY (franchisor_id) REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE;
ALTER TABLE public.customer ADD FOREIGN KEY (franchisor_id) REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE;
ALTER TABLE public.user_profiles ADD FOREIGN KEY (franchisor_id) REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE;
ALTER TABLE public.role ADD FOREIGN KEY (franchisor_id) REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE;
ALTER TABLE public.product_category ADD FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id) ON DELETE CASCADE;
ALTER TABLE public.product ADD FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id) ON DELETE CASCADE;
ALTER TABLE public.product ADD FOREIGN KEY (category_id) REFERENCES public.product_category(category_id) ON DELETE SET NULL;
ALTER TABLE public.inventory ADD FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;
ALTER TABLE public.inventory ADD FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE CASCADE;
ALTER TABLE public.inventory_order ADD FOREIGN KEY (franchisee_id) REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE;
ALTER TABLE public.inventory_order ADD FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;
ALTER TABLE public.inventory_order_item ADD FOREIGN KEY (order_id) REFERENCES public.inventory_order(order_id) ON DELETE CASCADE;
ALTER TABLE public.inventory_order_item ADD FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE RESTRICT;
ALTER TABLE public.sales_transaction ADD FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;
ALTER TABLE public.sales_transaction ADD FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.sales_transaction ADD FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id) ON DELETE SET NULL;
ALTER TABLE public.sales_item ADD FOREIGN KEY (txn_id) REFERENCES public.sales_transaction(txn_id) ON DELETE CASCADE;
ALTER TABLE public.sales_item ADD FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_order ADD FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order ADD FOREIGN KEY (supplier_id) REFERENCES public.supplier(supplier_id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order ADD FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_order_item ADD FOREIGN KEY (order_id) REFERENCES public.purchase_order(order_id) ON DELETE CASCADE;
ALTER TABLE public.purchase_order_item ADD FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE RESTRICT;
ALTER TABLE public.shipment ADD FOREIGN KEY (from_location_id) REFERENCES public.location(location_id) ON DELETE SET NULL;
ALTER TABLE public.shipment ADD FOREIGN KEY (to_location_id) REFERENCES public.location(location_id) ON DELETE SET NULL;
ALTER TABLE public.shipment ADD FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(order_id) ON DELETE SET NULL;
ALTER TABLE public.shipment ADD FOREIGN KEY (inventory_order_id) REFERENCES public.inventory_order(order_id) ON DELETE SET NULL;
ALTER TABLE public.plan ADD FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id) ON DELETE CASCADE;
ALTER TABLE public.subscription ADD FOREIGN KEY (franchisee_id) REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE;
ALTER TABLE public.subscription ADD FOREIGN KEY (plan_id) REFERENCES public.plan(plan_id) ON DELETE RESTRICT;
ALTER TABLE public.invoice ADD FOREIGN KEY (subscription_id) REFERENCES public.subscription(subscription_id) ON DELETE SET NULL;
ALTER TABLE public.invoice ADD FOREIGN KEY (franchisee_id) REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE;
ALTER TABLE public.payment ADD FOREIGN KEY (invoice_id) REFERENCES public.invoice(invoice_id) ON DELETE CASCADE;
ALTER TABLE public.kpi ADD FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id) ON DELETE CASCADE;
ALTER TABLE public.kpi_data ADD FOREIGN KEY (kpi_id) REFERENCES public.kpi(kpi_id) ON DELETE CASCADE;
ALTER TABLE public.kpi_data ADD FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;
ALTER TABLE public.training_module ADD FOREIGN KEY (brand_id) REFERENCES public.brand(brand_id) ON DELETE CASCADE;
ALTER TABLE public.user_training ADD FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.user_training ADD FOREIGN KEY (module_id) REFERENCES public.training_module(module_id) ON DELETE CASCADE;
ALTER TABLE public.contract ADD FOREIGN KEY (franchisee_id) REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE;
ALTER TABLE public.contract ADD FOREIGN KEY (franchisor_signer_id) REFERENCES public.user_profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.contract ADD FOREIGN KEY (franchisee_signer_id) REFERENCES public.user_profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.contract_version ADD FOREIGN KEY (contract_id) REFERENCES public.contract(contract_id) ON DELETE CASCADE;
ALTER TABLE public.contract_version ADD FOREIGN KEY (created_by_user_id) REFERENCES public.user_profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.user_role ADD FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.user_role ADD FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON DELETE CASCADE;
ALTER TABLE public.user_role ADD FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;
ALTER TABLE public.role_permission ADD FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON DELETE CASCADE;
ALTER TABLE public.role_permission ADD FOREIGN KEY (permission_id) REFERENCES public.permission(permission_id) ON DELETE CASCADE;

-- =================================================================
-- SECTION 4: INDEXES FOR PERFORMANCE
-- =================================================================

CREATE INDEX idx_franchisee_brand_id ON public.franchisee(brand_id);
CREATE INDEX idx_location_franchisee_id ON public.location(franchisee_id);
CREATE INDEX idx_location_region ON public.location(region);
CREATE INDEX idx_product_brand_id ON public.product(brand_id);
CREATE INDEX idx_sales_txn_date ON public.sales_transaction(txn_date);
CREATE INDEX idx_franchisee_status ON public.franchisee(status);
CREATE INDEX idx_inventory_order_franchisee ON public.inventory_order(franchisee_id);
CREATE INDEX idx_inventory_order_location ON public.inventory_order(location_id);
CREATE INDEX idx_inventory_order_date ON public.inventory_order(order_date);
CREATE INDEX idx_inventory_order_status ON public.inventory_order(status);

-- =================================================================
-- SECTION 5: TRIGGER FOR AUTO-UPDATING TIMESTAMPS
-- =================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with an `updated_at` column
CREATE TRIGGER on_franchisor_update BEFORE UPDATE ON public.franchisor FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_brand_update BEFORE UPDATE ON public.brand FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_franchisee_update BEFORE UPDATE ON public.franchisee FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_location_update BEFORE UPDATE ON public.location FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_supplier_update BEFORE UPDATE ON public.supplier FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_customer_update BEFORE UPDATE ON public.customer FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_user_profiles_update BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_role_update BEFORE UPDATE ON public.role FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_product_category_update BEFORE UPDATE ON public.product_category FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_product_update BEFORE UPDATE ON public.product FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_inventory_order_update BEFORE UPDATE ON public.inventory_order FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_sales_transaction_update BEFORE UPDATE ON public.sales_transaction FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_purchase_order_update BEFORE UPDATE ON public.purchase_order FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_shipment_update BEFORE UPDATE ON public.shipment FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_plan_update BEFORE UPDATE ON public.plan FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_subscription_update BEFORE UPDATE ON public.subscription FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_invoice_update BEFORE UPDATE ON public.invoice FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_kpi_update BEFORE UPDATE ON public.kpi FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_training_module_update BEFORE UPDATE ON public.training_module FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_contract_update BEFORE UPDATE ON public.contract FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =================================================================
-- SECTION 6: ROW-LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Helper function to get the franchisor_id for the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_my_franchisor_id()
RETURNS uuid AS $$
  SELECT franchisor_id FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on key tables
ALTER TABLE public.franchisor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchisee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (user_id = auth.uid());

-- Franchisor policies
CREATE POLICY "Users can view their franchisor"
ON public.franchisor
FOR SELECT
USING (franchisor_id = public.get_my_franchisor_id());

-- Brand policies
CREATE POLICY "Users can view brands in their franchisor network"
ON public.brand
FOR SELECT
USING (franchisor_id = public.get_my_franchisor_id());

-- Franchisee policies
CREATE POLICY "Users can view franchisees in their franchisor network"
ON public.franchisee
FOR SELECT
USING (
  brand_id IN (
    SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
  )
);

-- Location policies
CREATE POLICY "Users can view locations in their franchisor network"
ON public.location
FOR SELECT
USING (
  franchisee_id IN (
    SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
      SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
    )
  )
);

-- Product policies
CREATE POLICY "Users can view products in their franchisor network"
ON public.product
FOR SELECT
USING (
  brand_id IN (
    SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
  )
);

-- Product category policies
CREATE POLICY "Users can view product categories in their franchisor network"
ON public.product_category
FOR SELECT
USING (
  brand_id IN (
    SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
  )
);

-- Inventory policies
CREATE POLICY "Users can view inventory in their franchisor network"
ON public.inventory
FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM public.location WHERE franchisee_id IN (
      SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
        SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
      )
    )
  )
);

-- Inventory order policies (KEY FOR FRANCHISOR VISIBILITY)
CREATE POLICY "Users can view inventory orders in their franchisor network"
ON public.inventory_order
FOR ALL
USING (
  franchisee_id IN (
    SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
      SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
    )
  )
);

CREATE POLICY "Users can view inventory order items in their franchisor network"
ON public.inventory_order_item
FOR SELECT
USING (
  order_id IN (
    SELECT order_id FROM public.inventory_order WHERE franchisee_id IN (
      SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
        SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
      )
    )
  )
);

-- Sales transaction policies
CREATE POLICY "Users can view sales transactions in their franchisor network"
ON public.sales_transaction
FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM public.location WHERE franchisee_id IN (
      SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
        SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
      )
    )
  )
);

-- Sales item policies
CREATE POLICY "Users can view sales items in their franchisor network"
ON public.sales_item
FOR SELECT
USING (
  txn_id IN (
    SELECT txn_id FROM public.sales_transaction WHERE location_id IN (
      SELECT location_id FROM public.location WHERE franchisee_id IN (
        SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
          SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
        )
      )
    )
  )
);

-- Purchase order policies
CREATE POLICY "Users can view purchase orders in their franchisor network"
ON public.purchase_order
FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM public.location WHERE franchisee_id IN (
      SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
        SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
      )
    )
  )
);

-- Purchase order item policies
CREATE POLICY "Users can view purchase order items in their franchisor network"
ON public.purchase_order_item
FOR SELECT
USING (
  order_id IN (
    SELECT order_id FROM public.purchase_order WHERE location_id IN (
      SELECT location_id FROM public.location WHERE franchisee_id IN (
        SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
          SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
        )
      )
    )
  )
);

-- Supplier policies
CREATE POLICY "Users can view suppliers in their franchisor network"
ON public.supplier
FOR SELECT
USING (franchisor_id = public.get_my_franchisor_id());

-- Customer policies
CREATE POLICY "Users can view customers in their franchisor network"
ON public.customer
FOR SELECT
USING (franchisor_id = public.get_my_franchisor_id());

-- =================================================================
-- SECTION 7: SAMPLE DATA FOR TESTING
-- =================================================================

-- Insert sample franchisor
INSERT INTO public.franchisor (franchisor_id, company_nm, legal_nm, contact_email, phone_no, street_addr, city, state_prov, postal_code, country)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'FoodChain Corp', 'FoodChain Corporation Ltd', 'admin@foodchain.com', '+1-555-0100', '123 Business Ave', 'Business City', 'BC', '12345', 'USA');

-- Insert sample brand
INSERT INTO public.brand (brand_id, franchisor_id, brand_nm, tagline, details)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Siomai King', 'The King of Siomai', 'Premium siomai franchise serving authentic Filipino street food');

-- Insert sample product category
INSERT INTO public.product_category (category_id, brand_id, cat_nm, details)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Food Items', 'Main food products and ingredients');

-- Insert sample products
INSERT INTO public.product (product_id, brand_id, category_id, product_nm, details, sku, unit_price)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Siomai Mix (500pcs)', 'Premium siomai mix for 500 pieces', 'SM-MIX-500', 2500.00),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Sauce Packets (100pcs)', 'Special sauce packets', 'SC-PKT-100', 450.00),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Disposable Containers (200pcs)', 'Food grade containers', 'DC-CNT-200', 1200.00);
