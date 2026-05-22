-- =============================================
-- FRANCHISEHUB DATABASE MIGRATION - STEP BY STEP
-- =============================================

-- STEP 1: BACKUP EXISTING DATA (Run this first!)
-- =============================================

-- Check what tables currently exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Backup existing user_profiles if it exists
-- (You can export this from Supabase dashboard if needed)

-- STEP 2: CREATE ENUMS (Run these first)
-- =============================================

-- Drop existing enums if they exist (to avoid conflicts)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS organization_type CASCADE;
DROP TYPE IF EXISTS franchise_status CASCADE;
DROP TYPE IF EXISTS location_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS order_type CASCADE;
DROP TYPE IF EXISTS order_priority CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;

-- Create all required enums
CREATE TYPE user_role AS ENUM ('user', 'franchisee', 'franchisor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE organization_type AS ENUM ('franchisor', 'management_company', 'investor');
CREATE TYPE franchise_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE location_status AS ENUM ('planning', 'construction', 'training', 'open', 'closed', 'sold');
CREATE TYPE order_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('inventory', 'equipment', 'marketing', 'maintenance');
CREATE TYPE order_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE payment_type AS ENUM ('bank_transfer', 'credit_card', 'debit_card', 'gcash', 'cash_on_delivery');
CREATE TYPE address_type AS ENUM ('billing', 'shipping', 'both');
CREATE TYPE notification_type AS ENUM ('order_approved', 'order_rejected', 'order_shipped', 'order_delivered', 'order_created', 'system_announcement', 'low_stock_alert', 'payment_reminder');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- STEP 3: CREATE SEQUENCES (Run these next)
-- =============================================

-- Create sequences for auto-numbering
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS shipment_number_seq START 1;

-- STEP 4: CREATE UTILITY FUNCTIONS (Run these next)
-- =============================================

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate shipment number function
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('shipment_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: VERIFICATION QUERIES (Run after migration)
-- =============================================

-- Check all tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all enums were created
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN (
    'user_role', 'user_status', 'organization_type', 'franchise_status',
    'location_status', 'order_status', 'order_type', 'order_priority',
    'payment_status', 'payment_type', 'address_type', 'notification_type',
    'notification_priority'
)
GROUP BY t.typname
ORDER BY t.typname;

-- Check foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Count records in each table (after sample data)
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "Rows Inserted"
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
