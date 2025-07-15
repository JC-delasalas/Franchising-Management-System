# Ideal Database Architecture for Franchise Management System

## Overview

This document outlines the ideal database architecture for a comprehensive Franchise Management System designed to handle the complete lifecycle of franchise operations, from initial discovery to ongoing management.

## Design Principles

### 1. **Scalability First**
- Designed to handle thousands of franchises and millions of transactions
- Horizontal scaling capabilities with proper indexing
- Efficient query patterns for high-traffic scenarios

### 2. **Data Integrity & Security**
- Row Level Security (RLS) on all sensitive tables
- Comprehensive audit logging
- GDPR/privacy compliance ready
- Strong referential integrity

### 3. **Business Logic Alignment**
- Models real-world franchise relationships
- Supports complex business workflows
- Flexible enough for different franchise models

### 4. **Performance Optimization**
- Strategic indexing for common queries
- Materialized views for complex analytics
- Efficient data types and constraints

## Core Architecture Components

### 1. **User Management Layer**
```sql
-- Enhanced user profiles with role-based access
user_profiles (
    id UUID PRIMARY KEY,
    role ENUM('user', 'franchisee', 'franchisor', 'admin', 'staff'),
    status ENUM('active', 'inactive', 'suspended'),
    metadata JSONB -- Flexible additional data
)

-- Multi-address support for users
user_addresses (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    type ENUM('home', 'business', 'billing', 'shipping'),
    is_primary BOOLEAN DEFAULT FALSE
)
```

### 2. **Organization Structure**
```sql
-- Support for multi-brand franchisors
organizations (
    id UUID PRIMARY KEY,
    type ENUM('franchisor', 'management_company', 'investor'),
    settings JSONB -- Configurable business rules
)

-- Flexible membership model
organization_members (
    organization_id UUID,
    user_id UUID,
    role ENUM('owner', 'admin', 'manager', 'staff'),
    permissions JSONB
)
```

### 3. **Enhanced Franchise Model**
```sql
-- Core franchise with financial modeling
franchises (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    category_id UUID REFERENCES franchise_categories(id),
    royalty_rate DECIMAL(5,2), -- Percentage
    marketing_fee_rate DECIMAL(5,2),
    term_years INTEGER,
    financial_requirements JSONB,
    support_provided JSONB,
    qualifications_required JSONB
)

-- Multiple investment packages per franchise
franchise_packages (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    name VARCHAR(100), -- e.g., "Standard", "Premium", "Express"
    investment_amount DECIMAL(12,2),
    inclusions JSONB,
    terms JSONB
)
```

### 4. **Territory Management**
```sql
-- Geographic territory management with GIS support
franchise_territories (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    boundary_polygon GEOMETRY(POLYGON, 4326),
    exclusivity ENUM('exclusive', 'non_exclusive', 'protected'),
    population DECIMAL(10,0),
    demographics JSONB,
    status ENUM('available', 'assigned', 'reserved')
)

-- Conflict resolution for overlapping territories
territory_conflicts (
    id UUID PRIMARY KEY,
    territory_a_id UUID REFERENCES franchise_territories(id),
    territory_b_id UUID REFERENCES franchise_territories(id),
    conflict_type ENUM('overlap', 'proximity', 'demographic'),
    resolution_status ENUM('pending', 'resolved', 'escalated')
)
```

### 5. **Financial Management**
```sql
-- Comprehensive financial modeling
financial_models (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    revenue_projections JSONB, -- Year-by-year projections
    expense_categories JSONB,
    break_even_analysis JSONB,
    roi_projections JSONB,
    projection_years INTEGER DEFAULT 5
)

-- Transaction tracking with categorization
financial_transactions (
    id UUID PRIMARY KEY,
    location_id UUID REFERENCES franchise_locations(id),
    type ENUM('revenue', 'expense', 'royalty', 'marketing_fee'),
    amount DECIMAL(12,2),
    transaction_date DATE,
    reference_number VARCHAR(50),
    status ENUM('pending', 'completed', 'cancelled')
)
```

### 6. **Application Workflow**
```sql
-- Enhanced application process
franchise_applications (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    territory_id UUID REFERENCES franchise_territories(id),
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected'),
    application_data JSONB, -- Structured application form data
    business_plan TEXT,
    assigned_reviewer UUID REFERENCES user_profiles(id)
)

-- Workflow management
application_workflows (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    workflow_steps JSONB, -- Configurable approval steps
    required_documents TEXT[],
    auto_approval_criteria JSONB
)
```

## Advanced Features

### 1. **Training & Development**
```sql
training_programs (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    type ENUM('initial', 'ongoing', 'certification', 'compliance'),
    delivery_method ENUM('online', 'in_person', 'hybrid'),
    mandatory BOOLEAN DEFAULT FALSE
)

training_enrollments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    program_id UUID REFERENCES training_programs(id),
    status ENUM('enrolled', 'in_progress', 'completed', 'failed')
)
```

### 2. **Support & Communication**
```sql
support_tickets (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    location_id UUID REFERENCES franchise_locations(id),
    priority ENUM('low', 'medium', 'high', 'urgent'),
    category ENUM('technical', 'operational', 'financial', 'marketing')
)

announcements (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    target_audience ENUM('all', 'franchisees', 'staff', 'prospects'),
    delivery_method ENUM('email', 'sms', 'in_app', 'portal')
)
```

### 3. **Analytics & Reporting**
```sql
performance_metrics (
    id UUID PRIMARY KEY,
    franchise_id UUID REFERENCES franchises(id),
    location_id UUID REFERENCES franchise_locations(id),
    metric_name VARCHAR(100),
    metric_value DECIMAL(15,2),
    period ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
)

-- Materialized views for complex analytics
CREATE MATERIALIZED VIEW franchise_performance_summary AS
SELECT 
    f.id,
    f.name,
    COUNT(fl.id) as location_count,
    AVG(pm.metric_value) as avg_revenue,
    -- Additional calculated metrics
FROM franchises f
LEFT JOIN franchise_locations fl ON f.id = fl.franchise_id
LEFT JOIN performance_metrics pm ON fl.id = pm.location_id
GROUP BY f.id, f.name;
```

## Performance Optimizations

### 1. **Strategic Indexing**
```sql
-- Core business queries
CREATE INDEX idx_franchises_category_status ON franchises(category_id, status);
CREATE INDEX idx_applications_status_date ON franchise_applications(status, submitted_at);
CREATE INDEX idx_locations_territory ON franchise_locations(territory_id, status);
CREATE INDEX idx_transactions_date_type ON financial_transactions(transaction_date, type);

-- Geographic queries
CREATE INDEX idx_territories_boundary ON franchise_territories USING GIST(boundary_polygon);
CREATE INDEX idx_locations_coordinates ON franchise_locations(latitude, longitude);

-- Full-text search
CREATE INDEX idx_franchises_search ON franchises USING GIN(to_tsvector('english', name || ' ' || description));
```

### 2. **Partitioning Strategy**
```sql
-- Partition large tables by date
CREATE TABLE financial_transactions_y2024 PARTITION OF financial_transactions
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Partition audit logs by month
CREATE TABLE audit_logs_202401 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Security & Compliance

### 1. **Row Level Security Policies**
```sql
-- Franchisees can only see their own data
CREATE POLICY franchisee_own_data ON franchise_locations
FOR ALL USING (
    franchisee_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'franchisor')
    )
);

-- Territory-based access control
CREATE POLICY territory_access ON franchise_applications
FOR SELECT USING (
    applicant_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM franchises f
        JOIN organization_members om ON f.organization_id = om.organization_id
        WHERE f.id = franchise_applications.franchise_id
        AND om.user_id = auth.uid()
    )
);
```

### 2. **Audit Trail**
```sql
-- Comprehensive audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, table_name, action, record_id,
        old_values, new_values, ip_address
    ) VALUES (
        auth.uid(), TG_TABLE_NAME, TG_OP, 
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
        inet_client_addr()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Migration Strategy

### 1. **From Current Schema**
1. **Phase 1**: Add new tables without breaking existing functionality
2. **Phase 2**: Migrate data from simple arrays to normalized tables
3. **Phase 3**: Update application code to use new schema
4. **Phase 4**: Remove deprecated columns and tables

### 2. **Data Migration Scripts**
```sql
-- Example: Migrate support_provided array to structured table
INSERT INTO franchise_support_items (franchise_id, support_type, description)
SELECT 
    id,
    'general',
    unnest(support_provided)
FROM franchises 
WHERE support_provided IS NOT NULL;
```

This architecture provides a robust foundation for a scalable franchise management system that can grow with business needs while maintaining performance and security.
