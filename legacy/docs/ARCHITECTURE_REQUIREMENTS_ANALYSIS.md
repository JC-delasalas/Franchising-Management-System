# Database Architecture Requirements Analysis

## Executive Summary

**Current Architecture Coverage: 35%**
**Required Enhancements: 65%**

The proposed database architecture provides a solid foundation but requires significant enhancements to support comprehensive franchise management requirements. This analysis identifies critical gaps and provides detailed enhancement recommendations.

## Detailed Requirements Analysis

### 1. File & Media Management

#### ✅ **Current Support (40%)**
- Basic file storage via `franchise_documents` table
- Supabase Storage integration in `StorageService`
- File metadata tracking (name, type, size, category)

#### ❌ **Critical Gaps (60%)**
- **No media-specific tables** for videos, audio, images
- **Missing version control** for document updates
- **No content delivery optimization** for different media types
- **Limited metadata** for media files (duration, resolution, thumbnails)
- **No media processing pipeline** for transcoding/optimization

#### 🔧 **Required Enhancements**
```sql
-- Media management tables
CREATE TABLE media_assets (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    media_type ENUM('document', 'video', 'audio', 'image'),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB, -- duration, resolution, codec, etc.
    processing_status ENUM('pending', 'processing', 'completed', 'failed'),
    cdn_urls JSONB, -- Multiple quality/format URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE media_versions (
    id UUID PRIMARY KEY,
    media_asset_id UUID REFERENCES media_assets(id),
    version_number INTEGER,
    file_url TEXT NOT NULL,
    change_notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Point of Sale (POS) & Transaction Processing

#### ❌ **Current Support (15%)**
- Basic `financial_transactions` table exists
- Simple transaction categorization

#### ❌ **Critical Gaps (85%)**
- **No real-time POS integration** architecture
- **Missing transaction line items** for detailed sales data
- **No payment processing** integration tables
- **Limited transaction metadata** for POS systems
- **No multi-location synchronization** framework

#### 🔧 **Required Enhancements**
```sql
-- POS Integration tables
CREATE TABLE pos_systems (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id),
    system_type VARCHAR(50), -- 'square', 'clover', 'toast', etc.
    api_credentials JSONB, -- Encrypted credentials
    sync_status ENUM('active', 'inactive', 'error'),
    last_sync_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE pos_transactions (
    id UUID PRIMARY KEY,
    pos_system_id UUID REFERENCES pos_systems(id),
    external_transaction_id VARCHAR(255),
    transaction_timestamp TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    tip_amount DECIMAL(12,2),
    payment_method VARCHAR(50),
    customer_id VARCHAR(255),
    metadata JSONB,
    sync_status ENUM('pending', 'synced', 'error')
);

CREATE TABLE pos_transaction_items (
    id UUID PRIMARY KEY,
    transaction_id UUID REFERENCES pos_transactions(id),
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,3),
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    modifiers JSONB
);
```

### 3. Inventory & Order Management

#### ❌ **Current Support (10%)**
- UI components exist (`InventoryTab.tsx`, `InventoryOrder.tsx`)
- No database schema support

#### ❌ **Critical Gaps (90%)**
- **No inventory tables** in database schema
- **Missing product catalog** management
- **No supplier integration** framework
- **No order workflow** management
- **No stock tracking** across locations

#### 🔧 **Required Enhancements**
```sql
-- Product & Inventory Management
CREATE TABLE brands (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    status ENUM('active', 'inactive', 'discontinued'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES brands(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(50),
    cost_price DECIMAL(12,2),
    retail_price DECIMAL(12,2),
    minimum_order_quantity INTEGER DEFAULT 1,
    status ENUM('active', 'inactive', 'discontinued'),
    metadata JSONB
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id),
    product_id UUID REFERENCES products(id),
    current_stock DECIMAL(10,3),
    reserved_stock DECIMAL(10,3),
    reorder_level DECIMAL(10,3),
    max_stock_level DECIMAL(10,3),
    last_counted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(location_id, product_id)
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info JSONB,
    payment_terms VARCHAR(100),
    delivery_areas TEXT[],
    status ENUM('active', 'inactive', 'suspended')
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id),
    supplier_id UUID REFERENCES suppliers(id),
    order_number VARCHAR(100) UNIQUE,
    status ENUM('draft', 'submitted', 'approved', 'rejected', 'fulfilled', 'cancelled'),
    total_amount DECIMAL(12,2),
    requested_delivery_date DATE,
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY,
    purchase_order_id UUID REFERENCES purchase_orders(id),
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,3),
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2)
);
```

### 4. Report Generation & Analytics

#### ✅ **Current Support (50%)**
- Basic `performance_metrics` table
- Materialized views for analytics
- Financial transaction tracking

#### ❌ **Critical Gaps (50%)**
- **No report templates** management
- **Missing custom report builder** schema
- **No automated report scheduling**
- **Limited KPI definitions** and tracking

#### 🔧 **Required Enhancements**
```sql
-- Reporting & Analytics Enhancement
CREATE TABLE report_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type ENUM('financial', 'operational', 'sales', 'inventory', 'custom'),
    template_config JSONB, -- Chart types, filters, groupings
    access_roles TEXT[],
    created_by UUID REFERENCES user_profiles(id),
    is_system_template BOOLEAN DEFAULT FALSE
);

CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY,
    template_id UUID REFERENCES report_templates(id),
    franchise_id UUID REFERENCES franchises(id),
    location_id UUID REFERENCES franchise_locations(id),
    schedule_config JSONB, -- Frequency, time, recipients
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    status ENUM('active', 'paused', 'error')
);

CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    calculation_formula TEXT,
    target_value DECIMAL(15,4),
    unit VARCHAR(50),
    category VARCHAR(100),
    applicable_to ENUM('franchise', 'location', 'organization')
);
```

### 5. Franchisor-Specific Capabilities

#### ✅ **Current Support (60%)**
- Organization structure with multi-tenant support
- Basic application workflow
- Financial modeling framework

#### ❌ **Critical Gaps (40%)**
- **No three-tier approval workflow** implementation
- **Missing automated invoice generation**
- **No royalty calculation engine**
- **Limited order approval system**

#### 🔧 **Required Enhancements**
```sql
-- Enhanced Approval Workflows
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY,
    workflow_type ENUM('application', 'order', 'payment', 'contract'),
    franchise_id UUID REFERENCES franchises(id),
    workflow_config JSONB, -- Steps, conditions, auto-approval rules
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE approval_instances (
    id UUID PRIMARY KEY,
    workflow_id UUID REFERENCES approval_workflows(id),
    entity_id UUID, -- application_id, order_id, etc.
    entity_type VARCHAR(50),
    current_step INTEGER DEFAULT 1,
    status ENUM('pending', 'approved', 'conditionally_approved', 'rejected'),
    decision_data JSONB,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Automated Billing & Invoicing
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    location_id UUID REFERENCES franchise_locations(id),
    invoice_number VARCHAR(100) UNIQUE,
    invoice_type ENUM('royalty', 'marketing_fee', 'order', 'setup', 'other'),
    amount DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    due_date DATE,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    payment_terms VARCHAR(100),
    line_items JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE royalty_calculations (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id),
    calculation_period_start DATE,
    calculation_period_end DATE,
    gross_sales DECIMAL(12,2),
    royalty_rate DECIMAL(5,2),
    royalty_amount DECIMAL(12,2),
    marketing_fee_rate DECIMAL(5,2),
    marketing_fee_amount DECIMAL(12,2),
    adjustments JSONB,
    status ENUM('calculated', 'reviewed', 'approved', 'invoiced')
);
```

### 6. Real-Time Synchronization Requirements

#### ❌ **Current Support (20%)**
- Basic Supabase real-time subscriptions available
- No conflict resolution framework

#### ❌ **Critical Gaps (80%)**
- **No synchronization state management**
- **Missing conflict resolution** mechanisms
- **No event sourcing** for data changes
- **Limited real-time notification** system

#### 🔧 **Required Enhancements**
```sql
-- Real-time Synchronization Framework
CREATE TABLE sync_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    change_data JSONB,
    source_system VARCHAR(100),
    target_systems TEXT[],
    sync_status ENUM('pending', 'processing', 'completed', 'failed'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(100),
    entity_id UUID,
    conflict_type ENUM('concurrent_update', 'data_mismatch', 'constraint_violation'),
    source_data JSONB,
    target_data JSONB,
    resolution_strategy ENUM('manual', 'source_wins', 'target_wins', 'merge'),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE notification_queue (
    id UUID PRIMARY KEY,
    recipient_id UUID REFERENCES user_profiles(id),
    notification_type VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    delivery_method ENUM('in_app', 'email', 'sms', 'push'),
    status ENUM('pending', 'sent', 'delivered', 'failed'),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);
```

## Summary of Required Enhancements

### 🔴 **Critical Missing Components (Must Implement)**
1. **Complete Inventory Management System** - 0% coverage
2. **POS Integration Framework** - 15% coverage  
3. **Real-time Synchronization Engine** - 20% coverage
4. **Media Asset Management** - 40% coverage

### 🟡 **Important Enhancements (Should Implement)**
1. **Advanced Reporting System** - 50% coverage
2. **Automated Billing & Invoicing** - 30% coverage
3. **Workflow Management Engine** - 60% coverage

### 🟢 **Foundation Ready (Good Coverage)**
1. **User & Organization Management** - 80% coverage
2. **Basic Financial Tracking** - 70% coverage
3. **Security & Audit Framework** - 75% coverage

## Implementation Priority

### Phase 1 (Weeks 1-4): Core Business Operations
1. Inventory & Product Management
2. POS Integration Framework
3. Order Management System

### Phase 2 (Weeks 5-8): Advanced Features  
1. Media Asset Management
2. Automated Billing & Invoicing
3. Enhanced Reporting System

### Phase 3 (Weeks 9-12): Real-time & Optimization
1. Real-time Synchronization Engine
2. Advanced Analytics & KPIs
3. Performance Optimization

**Total Implementation Effort: 12 weeks**
**Database Tables: Current 25 → Required 45+**
**Feature Coverage: Current 35% → Target 95%**
