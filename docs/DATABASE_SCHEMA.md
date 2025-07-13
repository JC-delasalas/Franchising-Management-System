# Database Schema Documentation

## Overview

The Franchise Management System uses a PostgreSQL database with a multi-tenant architecture. The schema is designed to support the 10 primary objectives while maintaining data isolation, performance, and flexibility.

## Architecture Principles

### Multi-Tenant Design
- **Shared Database, Separate Schema**: All franchisors share the same database infrastructure
- **Tenant Isolation**: Data is isolated using `franchisor_id` as a tenant key
- **Row-Level Security (RLS)**: Supabase RLS policies enforce data access controls
- **Performance Optimization**: Strategic indexing for multi-tenant queries

### Data Type Support
1. **Structured Data**: Traditional relational columns with defined types
2. **Semi-Structured Data**: JSONB columns for flexible metadata and preferences
3. **Unstructured Data**: File references with metadata in `file_maintenance` table

## Core Tables

### 1. Franchisor (Tenant Root)
```sql
CREATE TABLE public.franchisor (
    franchisor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    metadata JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose**: Central table for franchise companies - the root of multi-tenant architecture

**Key Fields**:
- `franchisor_id`: Unique identifier and tenant key
- `metadata`: Flexible data for custom attributes (industry, founded_year, etc.)
- `preferences`: User preferences (timezone, currency, notifications)

### 2. Brand
```sql
CREATE TABLE public.brand (
    brand_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id UUID NOT NULL REFERENCES public.franchisor(franchisor_id),
    brand_nm VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    details TEXT,
    logo_url TEXT,
    metadata JSONB DEFAULT '{}',
    marketing_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose**: Franchise brands managed by franchisors - supports multiple brands per franchisor

**Key Fields**:
- `marketing_data`: Brand colors, fonts, style guides
- `metadata`: Target demographics, price points, market positioning

### 3. Franchisee
```sql
CREATE TABLE public.franchisee (
    franchisee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brand(brand_id),
    op_nm VARCHAR(255) NOT NULL,
    legal_nm VARCHAR(255),
    contact_first_nm VARCHAR(255),
    contact_last_nm VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    phone_no VARCHAR(50),
    status user_status_enum NOT NULL DEFAULT 'active',
    onboarding_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose**: Individual franchise owners/operators within a brand

**Key Fields**:
- `onboarding_status`: Tracks franchisee lifecycle (pending, in_progress, completed)
- `metadata`: Territory, investment level, business metrics
- `preferences`: Marketing budget, staff size, operational preferences

### 4. Location
```sql
CREATE TABLE public.location (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id UUID NOT NULL REFERENCES public.franchisee(franchisee_id),
    location_nm VARCHAR(255) NOT NULL,
    street_addr VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_prov VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    phone_no VARCHAR(50),
    email VARCHAR(255),
    opening_date DATE,
    status user_status_enum NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    operating_hours JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose**: Physical franchise locations operated by franchisees

**Key Fields**:
- `operating_hours`: Flexible schedule definition per day of week
- `metadata`: Square footage, seating capacity, special features

## Product Management

### 5. Product Category
```sql
CREATE TABLE public.product_category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brand(brand_id),
    cat_nm VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6. Product
```sql
CREATE TABLE public.product (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brand(brand_id),
    category_id UUID REFERENCES public.product_category(category_id),
    product_nm VARCHAR(255) NOT NULL,
    details TEXT,
    sku VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    custom_attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Purpose**: Centralized product catalog management per brand

**Key Fields**:
- `metadata`: Origin, roast level, nutritional info
- `custom_attributes`: Allergens, certifications, shelf life

## User Management & Security

### 7. User Profiles
```sql
CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    franchisor_id UUID NOT NULL REFERENCES public.franchisor(franchisor_id),
    first_nm VARCHAR(255) NOT NULL,
    last_nm VARCHAR(255) NOT NULL,
    phone_no VARCHAR(50),
    avatar_url TEXT,
    status user_status_enum NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8. Role
```sql
CREATE TABLE public.role (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id UUID NOT NULL REFERENCES public.franchisor(franchisor_id),
    role_nm VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(franchisor_id, role_nm)
);
```

### 9. Permission
```sql
CREATE TABLE public.permission (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_nm VARCHAR(255) NOT NULL,
    details TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(resource, action)
);
```

### 10. Role Permission (Junction Table)
```sql
CREATE TABLE public.role_permission (
    role_id UUID NOT NULL REFERENCES public.role(role_id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permission(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

### 11. User Role (Junction Table)
```sql
CREATE TABLE public.user_role (
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.role(role_id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.location(location_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id, location_id)
);
```

## Sales & Analytics

### 12. Sales Transaction
```sql
CREATE TABLE public.sales_transaction (
    txn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.location(location_id),
    customer_id UUID REFERENCES public.customer(customer_id),
    user_id UUID REFERENCES public.user_profiles(user_id),
    total_amt NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    status transaction_status_enum NOT NULL DEFAULT 'completed',
    txn_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    custom_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Key Fields**:
- `metadata`: Order type, table number, special instructions
- `custom_data`: Promotion codes, discounts, loyalty points

### 13. KPI
```sql
CREATE TABLE public.kpi (
    kpi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brand(brand_id),
    kpi_nm VARCHAR(255) NOT NULL,
    details TEXT,
    target_value NUMERIC(18, 4),
    unit_of_measure VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 14. KPI Data
```sql
CREATE TABLE public.kpi_data (
    data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID NOT NULL REFERENCES public.kpi(kpi_id),
    location_id UUID REFERENCES public.location(location_id),
    actual_value NUMERIC(18, 4) NOT NULL,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Inventory Management

### 15. Inventory
```sql
CREATE TABLE public.inventory (
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.location(location_id),
    product_id UUID NOT NULL REFERENCES public.product(product_id),
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 16. Supplier
```sql
CREATE TABLE public.supplier (
    supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisor_id UUID NOT NULL REFERENCES public.franchisor(franchisor_id),
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
```

## Training System

### 17. Training Module
```sql
CREATE TABLE public.training_module (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brand(brand_id),
    title VARCHAR(255) NOT NULL,
    details TEXT,
    module_type module_type_enum NOT NULL DEFAULT 'document',
    content_path TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 18. User Training
```sql
CREATE TABLE public.user_training (
    user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.training_module(module_id) ON DELETE CASCADE,
    completion_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    completion_date TIMESTAMPTZ,
    score NUMERIC(5,2),
    PRIMARY KEY (user_id, module_id)
);
```

## Contract Management

### 19. Contract
```sql
CREATE TABLE public.contract (
    contract_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchisee_id UUID NOT NULL REFERENCES public.franchisee(franchisee_id),
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
```

## Audit & Compliance

### 20. Audit Logs
```sql
CREATE TABLE public.audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(user_id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    action_type VARCHAR(100) NOT NULL,
    details JSONB,
    metadata JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    ip_address INET,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Enums

### User Status
```sql
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'pending');
```

### Transaction Status
```sql
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
```

### Module Type
```sql
CREATE TYPE module_type_enum AS ENUM ('document', 'video', 'quiz');
```

### Order Status
```sql
CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
```

### Billing Cycle
```sql
CREATE TYPE billing_cycle_enum AS ENUM ('monthly', 'annually', 'one-time');
```

## Views

### User Dashboard View
```sql
CREATE VIEW public.user_dashboard_view AS
SELECT 
  up.user_id,
  up.first_nm,
  up.last_nm,
  up.phone_no,
  up.avatar_url,
  up.status,
  up.metadata,
  up.preferences,
  f.company_nm as franchisor_name,
  f.franchisor_id
FROM public.user_profiles up
JOIN public.franchisor f ON f.franchisor_id = up.franchisor_id
WHERE up.user_id = auth.uid();
```

### Franchise Overview
```sql
CREATE VIEW public.franchise_overview AS
SELECT 
  fr.franchisee_id,
  fr.op_nm as operating_name,
  fr.legal_nm as legal_name,
  fr.contact_email,
  fr.status,
  fr.onboarding_status,
  fr.metadata,
  b.brand_nm as brand_name,
  b.tagline as brand_tagline,
  b.logo_url as brand_logo,
  COUNT(l.location_id) as location_count,
  COALESCE(SUM(st.total_amt), 0) as total_sales
FROM public.franchisee fr
JOIN public.brand b ON b.brand_id = fr.brand_id
LEFT JOIN public.location l ON l.franchisee_id = fr.franchisee_id
LEFT JOIN public.sales_transaction st ON st.location_id = l.location_id
WHERE b.franchisor_id = get_my_franchisor_id()
GROUP BY fr.franchisee_id, b.brand_id;
```

## Indexes

### Multi-Tenant Performance
```sql
-- Core tenant isolation
CREATE INDEX idx_user_profiles_franchisor_id ON public.user_profiles(franchisor_id);
CREATE INDEX idx_role_franchisor_id ON public.role(franchisor_id);
CREATE INDEX idx_franchisee_brand_id ON public.franchisee(brand_id);
CREATE INDEX idx_location_franchisee_id ON public.location(franchisee_id);

-- Analytics performance
CREATE INDEX idx_sales_transaction_location_date ON public.sales_transaction(location_id, txn_date);
CREATE INDEX idx_kpi_data_kpi_date ON public.kpi_data(kpi_id, recorded_date);

-- JSONB metadata indexes
CREATE INDEX idx_franchisor_metadata ON public.franchisor USING GIN (metadata);
CREATE INDEX idx_brand_metadata ON public.brand USING GIN (metadata);
CREATE INDEX idx_product_metadata ON public.product USING GIN (metadata);
```

## Security Policies

### Row Level Security (RLS)
All tables implement RLS policies to ensure data isolation:

```sql
-- Example: Franchisor data isolation
CREATE POLICY "Franchisors can only see their own data" 
ON public.franchisee 
FOR ALL 
USING (
  brand_id IN (
    SELECT brand_id 
    FROM public.brand 
    WHERE franchisor_id = get_my_franchisor_id()
  )
);
```

## Data Relationships

### Hierarchy
```
Franchisor (Tenant Root)
├── Brand (1:N)
│   ├── Product (1:N)
│   ├── KPI (1:N)
│   └── Training Module (1:N)
├── Franchisee (1:N via Brand)
│   ├── Location (1:N)
│   └── Contract (1:N)
└── User Profiles (1:N)
    └── User Roles (N:M with Location context)
```

### Key Relationships
- **Multi-tenant isolation**: All data traces back to `franchisor_id`
- **Brand-centric**: Products, KPIs, and training are brand-specific
- **Location-based operations**: Sales, inventory, and user roles are location-specific
- **Flexible metadata**: JSONB fields support custom attributes across all entities

---

This schema supports all 10 primary objectives while maintaining performance, security, and flexibility for future enhancements.
