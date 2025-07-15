-- Enhanced Database Architecture Migration
-- This migration implements the ideal franchise management system architecture

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('user', 'franchisee', 'franchisor', 'admin', 'staff');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE organization_type AS ENUM ('franchisor', 'management_company', 'investor');
CREATE TYPE franchise_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn');
CREATE TYPE territory_exclusivity AS ENUM ('exclusive', 'non_exclusive', 'protected');
CREATE TYPE territory_status AS ENUM ('available', 'assigned', 'reserved');
CREATE TYPE location_status AS ENUM ('planning', 'construction', 'training', 'open', 'closed', 'sold');
CREATE TYPE transaction_type AS ENUM ('revenue', 'expense', 'royalty', 'marketing_fee');
CREATE TYPE training_type AS ENUM ('initial', 'ongoing', 'certification', 'compliance');
CREATE TYPE delivery_method AS ENUM ('online', 'in_person', 'hybrid');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE metric_period AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- Enhanced user profiles table
ALTER TABLE user_profiles 
    ALTER COLUMN role TYPE user_role USING role::user_role,
    ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

-- User addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('home', 'business', 'billing', 'shipping')),
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

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    notification_push BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'PHP',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website VARCHAR(255),
    type organization_type DEFAULT 'franchisor',
    status franchise_status DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Franchise categories table
CREATE TABLE IF NOT EXISTS franchise_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced franchises table
ALTER TABLE franchises 
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES franchise_categories(id),
    ADD COLUMN IF NOT EXISTS royalty_rate DECIMAL(5,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS marketing_fee_rate DECIMAL(5,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS term_years INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS financial_requirements JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS qualifications_required JSONB DEFAULT '{}',
    ALTER COLUMN status TYPE franchise_status USING status::franchise_status;

-- Franchise packages table
CREATE TABLE IF NOT EXISTS franchise_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    investment_amount DECIMAL(12,2) NOT NULL,
    franchise_fee DECIMAL(12,2) NOT NULL,
    inclusions JSONB DEFAULT '{}',
    terms JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Franchise territories table with GIS support
CREATE TABLE IF NOT EXISTS franchise_territories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    boundary_polygon GEOMETRY(POLYGON, 4326),
    exclusivity territory_exclusivity DEFAULT 'exclusive',
    population DECIMAL(10,0),
    demographics JSONB DEFAULT '{}',
    status territory_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Territory conflicts table
CREATE TABLE IF NOT EXISTS territory_conflicts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    territory_a_id UUID REFERENCES franchise_territories(id),
    territory_b_id UUID REFERENCES franchise_territories(id),
    conflict_type VARCHAR(50) CHECK (conflict_type IN ('overlap', 'proximity', 'demographic')),
    resolution_status VARCHAR(50) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'escalated')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enhanced franchise locations table
ALTER TABLE franchise_locations 
    ADD COLUMN IF NOT EXISTS territory_id UUID REFERENCES franchise_territories(id),
    ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}',
    ALTER COLUMN status TYPE location_status USING status::location_status;

-- Enhanced franchise applications table
ALTER TABLE franchise_applications 
    ADD COLUMN IF NOT EXISTS territory_id UUID REFERENCES franchise_territories(id),
    ADD COLUMN IF NOT EXISTS requested_investment DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS business_plan TEXT,
    ALTER COLUMN status TYPE application_status USING status::application_status;

-- Application workflows table
CREATE TABLE IF NOT EXISTS application_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    workflow_steps JSONB NOT NULL DEFAULT '[]',
    required_documents TEXT[] DEFAULT '{}',
    auto_approval_criteria JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial models table
CREATE TABLE IF NOT EXISTS financial_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    revenue_projections JSONB DEFAULT '{}',
    expense_categories JSONB DEFAULT '{}',
    break_even_analysis JSONB DEFAULT '{}',
    roi_projections JSONB DEFAULT '{}',
    projection_years INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction categories table
CREATE TABLE IF NOT EXISTS transaction_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    type transaction_type NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced financial transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES transaction_categories(id),
    type transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training programs table
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type training_type NOT NULL,
    duration_hours INTEGER DEFAULT 0,
    delivery_method delivery_method DEFAULT 'online',
    mandatory BOOLEAN DEFAULT FALSE,
    prerequisites JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training modules table
CREATE TABLE IF NOT EXISTS training_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training enrollments table
CREATE TABLE IF NOT EXISTS training_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5,2),
    UNIQUE(user_id, program_id)
);

-- Enhanced support tickets table
ALTER TABLE support_tickets 
    ADD COLUMN IF NOT EXISTS priority ticket_priority DEFAULT 'medium',
    ALTER COLUMN status TYPE ticket_status USING status::ticket_status;

-- Ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES user_profiles(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced performance metrics table
ALTER TABLE performance_metrics
    ADD COLUMN IF NOT EXISTS unit VARCHAR(20),
    ADD COLUMN IF NOT EXISTS period metric_period DEFAULT 'daily',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ALTER COLUMN metric_date TYPE DATE USING metric_date::DATE;

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'franchisees', 'staff', 'prospects')),
    delivery_method VARCHAR(50) DEFAULT 'in_app' CHECK (delivery_method IN ('email', 'sms', 'in_app', 'portal')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) CHECK (campaign_type IN ('brand', 'local', 'digital', 'traditional')),
    budget DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    target_metrics JSONB DEFAULT '{}',
    actual_metrics JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance records table
CREATE TABLE IF NOT EXISTS compliance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    compliance_type VARCHAR(100) NOT NULL,
    requirement_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'compliant', 'non_compliant', 'expired')),
    due_date DATE,
    completion_date DATE,
    notes TEXT,
    documents TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES user_profiles(id),
    inspection_type VARCHAR(100) NOT NULL,
    inspection_date DATE NOT NULL,
    score DECIMAL(5,2),
    findings JSONB DEFAULT '{}',
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced audit logs table
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS session_id UUID,
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS request_id UUID;

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status ON user_profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_type ON user_addresses(user_id, type);
CREATE INDEX IF NOT EXISTS idx_organizations_type_status ON organizations(type, status);
CREATE INDEX IF NOT EXISTS idx_franchises_org_category ON franchises(organization_id, category_id);
CREATE INDEX IF NOT EXISTS idx_franchises_status_featured ON franchises(status, featured);
CREATE INDEX IF NOT EXISTS idx_territories_franchise_status ON franchise_territories(franchise_id, status);
CREATE INDEX IF NOT EXISTS idx_territories_boundary ON franchise_territories USING GIST(boundary_polygon);
CREATE INDEX IF NOT EXISTS idx_locations_territory_status ON franchise_locations(territory_id, status);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON franchise_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_applications_franchise_status ON franchise_applications(franchise_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_territory_status ON franchise_applications(territory_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_location_date ON financial_transactions(location_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON financial_transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_user_status ON training_enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON support_tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_location_date ON performance_metrics(location_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON audit_logs(table_name, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_franchises_search ON franchises USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_organizations_search ON organizations USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS franchise_performance_summary AS
SELECT
    f.id,
    f.name,
    f.status,
    o.name as organization_name,
    fc.name as category_name,
    COUNT(DISTINCT fl.id) as location_count,
    COUNT(DISTINCT fa.id) FILTER (WHERE fa.status = 'approved') as approved_applications,
    COUNT(DISTINCT fa.id) FILTER (WHERE fa.status = 'pending') as pending_applications,
    AVG(pm.metric_value) FILTER (WHERE pm.metric_name = 'monthly_revenue') as avg_monthly_revenue,
    MAX(fl.created_at) as latest_location_opened
FROM franchises f
LEFT JOIN organizations o ON f.organization_id = o.id
LEFT JOIN franchise_categories fc ON f.category_id = fc.id
LEFT JOIN franchise_locations fl ON f.id = fl.franchise_id
LEFT JOIN franchise_applications fa ON f.id = fa.franchise_id
LEFT JOIN performance_metrics pm ON fl.id = pm.location_id
GROUP BY f.id, f.name, f.status, o.name, fc.name;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_franchise_performance_summary_id ON franchise_performance_summary(id);

-- Enable RLS on new tables
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
