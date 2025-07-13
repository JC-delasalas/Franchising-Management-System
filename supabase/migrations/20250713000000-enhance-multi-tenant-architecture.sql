-- Enhanced Multi-Tenant Architecture for Franchise Management System
-- This migration improves support for the 10 primary objectives

-- 1. Add metadata and preferences columns for structured/semi-structured data support
ALTER TABLE public.franchisor ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.franchisor ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

ALTER TABLE public.franchisee ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.franchisee ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

ALTER TABLE public.brand ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.brand ADD COLUMN IF NOT EXISTS marketing_data JSONB DEFAULT '{}';

ALTER TABLE public.product ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.product ADD COLUMN IF NOT EXISTS custom_attributes JSONB DEFAULT '{}';

ALTER TABLE public.location ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.location ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 2. Enhance sales_transaction for better analytics
ALTER TABLE public.sales_transaction ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.sales_transaction ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';

-- 3. Add missing tables for comprehensive franchise management

-- Enhanced role and permission system
CREATE TABLE IF NOT EXISTS public.permission (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_nm VARCHAR(255) NOT NULL,
    details TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(resource, action)
);

CREATE TABLE IF NOT EXISTS public.role (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id UUID NOT NULL REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE,
    role_nm VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(franchisor_id, role_nm)
);

CREATE TABLE IF NOT EXISTS public.role_permission (
    role_id UUID NOT NULL REFERENCES public.role(role_id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permission(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_role (
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.role(role_id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.location(location_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id, location_id)
);

-- Enhanced contract management
CREATE TABLE IF NOT EXISTS public.contract (
    contract_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id UUID NOT NULL REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE,
    contract_type VARCHAR(100) NOT NULL DEFAULT 'franchise_agreement',
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    document_path TEXT,
    franchisor_signer_id UUID REFERENCES public.user_profiles(user_id),
    franchisee_signer_id UUID REFERENCES public.user_profiles(user_id),
    signed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contract_version (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contract(contract_id) ON DELETE CASCADE,
    version_no INTEGER NOT NULL,
    document_path TEXT NOT NULL,
    changes_summary TEXT,
    created_by_user_id UUID REFERENCES public.user_profiles(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(contract_id, version_no)
);

-- Training and development system
CREATE TABLE IF NOT EXISTS public.training_module (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brand(brand_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    module_type module_type_enum NOT NULL DEFAULT 'document',
    content_path TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_training (
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.training_module(module_id) ON DELETE CASCADE,
    completion_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    completion_date TIMESTAMPTZ,
    score NUMERIC(5,2),
    PRIMARY KEY (user_id, module_id)
);

-- File management system
CREATE TABLE IF NOT EXISTS public.file_maintenance (
    file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id UUID NOT NULL REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE,
    franchisee_id UUID REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    description TEXT,
    uploaded_by UUID REFERENCES public.user_profiles(user_id),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report generation system
CREATE TABLE IF NOT EXISTS public.generated_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id UUID NOT NULL REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE,
    franchisee_id UUID REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    parameters JSONB DEFAULT '{}',
    file_path TEXT,
    file_size BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    generated_by UUID REFERENCES public.user_profiles(user_id),
    date_from DATE,
    date_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily sales reporting
CREATE TABLE IF NOT EXISTS public.daily_sales_report (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id UUID NOT NULL REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.location(location_id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    total_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_transactions INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    file_path TEXT,
    submitted_by UUID REFERENCES public.user_profiles(user_id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(location_id, report_date)
);

-- Enhanced audit logging
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchisor_metadata ON public.franchisor USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_franchisee_metadata ON public.franchisee USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_brand_metadata ON public.brand USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_product_metadata ON public.product USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_location_metadata ON public.location USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_user_profiles_metadata ON public.user_profiles USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_metadata ON public.sales_transaction USING GIN (metadata);

-- Multi-tenant isolation indexes
CREATE INDEX IF NOT EXISTS idx_franchisee_brand_id ON public.franchisee(brand_id);
CREATE INDEX IF NOT EXISTS idx_location_franchisee_id ON public.location(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_franchisor_id ON public.user_profiles(franchisor_id);
CREATE INDEX IF NOT EXISTS idx_role_franchisor_id ON public.role(franchisor_id);
CREATE INDEX IF NOT EXISTS idx_file_maintenance_franchisor_id ON public.file_maintenance(franchisor_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_franchisor_id ON public.generated_reports(franchisor_id);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sales_transaction_location_date ON public.sales_transaction(location_id, txn_date);
CREATE INDEX IF NOT EXISTS idx_daily_sales_report_location_date ON public.daily_sales_report(location_id, report_date);
CREATE INDEX IF NOT EXISTS idx_kpi_data_kpi_date ON public.kpi_data(kpi_id, recorded_date);

-- 5. Add missing enums
DO $$ BEGIN
    CREATE TYPE module_type_enum AS ENUM ('document', 'video', 'quiz');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Add comments for documentation
COMMENT ON TABLE public.franchisor IS 'Central table for franchise companies - supports multi-tenant architecture';
COMMENT ON TABLE public.franchisee IS 'Individual franchise owners/operators within a brand';
COMMENT ON TABLE public.brand IS 'Franchise brands managed by franchisors - supports multiple brands per franchisor';
COMMENT ON TABLE public.product IS 'Products available within each brand - centralized catalog management';
COMMENT ON TABLE public.location IS 'Physical franchise locations operated by franchisees';
COMMENT ON TABLE public.user_profiles IS 'User accounts with role-based access control';
COMMENT ON TABLE public.role IS 'Custom roles defined per franchisor for granular access control';
COMMENT ON TABLE public.permission IS 'System-wide permissions that can be assigned to roles';
COMMENT ON TABLE public.contract IS 'Legal agreements between franchisors and franchisees';
COMMENT ON TABLE public.training_module IS 'Standardized training content for franchise network';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for security and compliance';

-- 7. Update existing data to ensure consistency
UPDATE public.franchisor SET metadata = '{}' WHERE metadata IS NULL;
UPDATE public.franchisee SET metadata = '{}' WHERE metadata IS NULL;
UPDATE public.brand SET metadata = '{}' WHERE metadata IS NULL;
UPDATE public.product SET metadata = '{}' WHERE metadata IS NULL;
UPDATE public.location SET metadata = '{}' WHERE metadata IS NULL;
UPDATE public.user_profiles SET metadata = '{}' WHERE metadata IS NULL;
UPDATE public.sales_transaction SET metadata = '{}' WHERE metadata IS NULL;
