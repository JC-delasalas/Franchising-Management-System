# MVP Database Architecture: Franchisee Order Lifecycle Focus

## Executive Summary

**Simplified Architecture:** 45+ tables → **15 core tables**  
**Implementation Timeline:** 16 weeks → **6-8 weeks**  
**Focus:** Core franchisee order lifecycle with essential business value

## MVP Core Tables Analysis

### ✅ **Essential Tables (15 Core Tables)**

#### **1. User & Organization Management (3 tables)**
```sql
-- Keep existing structure - already optimized
user_profiles
organizations  
organization_members
```

#### **2. Franchise Core (3 tables)**
```sql
franchises              -- Core franchise information
franchise_packages      -- Different investment options (Standard, Premium, etc.)
franchise_applications  -- Application workflow (simplified to 3 states)
```

#### **3. Product & Inventory (3 tables)**
```sql
products               -- Product catalog with basic info
inventory_items        -- Current stock levels per location
stock_movements        -- Simple in/out tracking
```

#### **4. Order Management (3 tables)**
```sql
orders                 -- Purchase orders from franchisees
order_items           -- Order line items
order_approvals       -- Simple approval tracking
```

#### **5. Financial Management (3 tables)**
```sql
invoices              -- Generated invoices
payments              -- Payment tracking
financial_transactions -- Basic transaction log
```

### ❌ **Deferred to Phase 2 (30+ tables)**

#### **Complex Features to Defer:**
- **Media Management** (5 tables) → Use simple file URLs in existing tables
- **POS Integration** (6 tables) → Manual sales entry initially
- **Advanced Workflows** (4 tables) → Simple status-based approvals
- **Real-time Sync** (4 tables) → Standard CRUD operations
- **Advanced Analytics** (8 tables) → Basic reporting queries
- **Territory Management** (3 tables) → Simple text fields
- **Training System** (5 tables) → External training platform integration

## Simplified Schema Design

### **Core Franchisee Journey Tables**

```sql
-- 1. FRANCHISE PACKAGES (Simplified)
CREATE TABLE franchise_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id),
    name VARCHAR(100) NOT NULL, -- "Starter", "Standard", "Premium"
    description TEXT,
    initial_fee DECIMAL(12,2) NOT NULL,
    monthly_royalty_rate DECIMAL(5,2) NOT NULL, -- Percentage
    included_products TEXT[], -- Simple array for MVP
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SIMPLIFIED APPLICATIONS (3 states only)
ALTER TABLE franchise_applications 
    ALTER COLUMN status TYPE VARCHAR(20),
    ADD CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected')),
    ADD COLUMN package_id UUID REFERENCES franchise_packages(id),
    ADD COLUMN initial_payment_amount DECIMAL(12,2),
    ADD COLUMN approved_by UUID REFERENCES user_profiles(id),
    ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- 3. PRODUCTS (Essential fields only)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID REFERENCES franchises(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(50) DEFAULT 'each',
    minimum_order_qty INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INVENTORY (Location-based stock)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES franchise_locations(id),
    product_id UUID REFERENCES products(id),
    current_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, product_id)
);

-- 5. ORDERS (Core order management)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    location_id UUID REFERENCES franchise_locations(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'fulfilled')),
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    requested_delivery_date DATE,
    notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INVOICES (Simplified billing)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    location_id UUID REFERENCES franchise_locations(id),
    invoice_type VARCHAR(20) DEFAULT 'order' CHECK (invoice_type IN ('order', 'royalty', 'fee')),
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PAYMENTS (Simple payment tracking)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- 9. BASIC KPI TRACKING
CREATE TABLE location_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES franchise_locations(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## MVP User Journeys Implementation

### **1. Franchise Package Selection & Purchase**
```sql
-- View available packages
SELECT fp.*, f.name as franchise_name 
FROM franchise_packages fp
JOIN franchises f ON fp.franchise_id = f.id
WHERE fp.active = true;

-- Submit application
INSERT INTO franchise_applications (
    franchise_id, package_id, applicant_id, 
    application_data, initial_payment_amount
) VALUES (...);

-- Simple approval (no complex workflow)
UPDATE franchise_applications 
SET status = 'approved', approved_by = ?, approved_at = NOW()
WHERE id = ?;
```

### **2. Inventory Ordering System**
```sql
-- View available products for subscribed franchise
SELECT p.* FROM products p
JOIN franchise_applications fa ON p.franchise_id = fa.franchise_id
WHERE fa.applicant_id = ? AND fa.status = 'approved';

-- Create order
INSERT INTO orders (order_number, location_id, created_by) 
VALUES (?, ?, ?);

-- Add items to order
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
VALUES (?, ?, ?, ?, ?);

-- Submit for approval
UPDATE orders SET status = 'submitted' WHERE id = ?;
```

### **3. Payment Processing**
```sql
-- Generate invoice after order approval
INSERT INTO invoices (invoice_number, order_id, location_id, amount, due_date)
SELECT 
    'INV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('invoice_seq')::text, 6, '0'),
    id, location_id, total_amount, CURRENT_DATE + INTERVAL '30 days'
FROM orders WHERE id = ?;

-- Record payment
INSERT INTO payments (invoice_id, amount, payment_method, payment_reference)
VALUES (?, ?, ?, ?);
```

### **4. Basic KPI Tracking**
```sql
-- Simple metrics insertion
INSERT INTO location_metrics (location_id, metric_name, metric_value)
VALUES 
    (?, 'monthly_sales', ?),
    (?, 'order_count', ?),
    (?, 'avg_order_value', ?);

-- Basic reporting query
SELECT 
    metric_name,
    AVG(metric_value) as avg_value,
    MAX(metric_value) as max_value,
    COUNT(*) as data_points
FROM location_metrics 
WHERE location_id = ? AND metric_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY metric_name;
```

## Implementation Timeline: 6-8 Weeks

### **Week 1-2: Foundation**
- Set up simplified database schema (15 tables)
- Basic authentication and user management
- Franchise and package management

### **Week 3-4: Core Order Flow**
- Product catalog management
- Order creation and approval workflow
- Basic inventory tracking

### **Week 5-6: Payment & Billing**
- Invoice generation
- Payment processing integration
- Basic financial reporting

### **Week 7-8: Testing & Polish**
- End-to-end testing of franchisee journey
- Basic KPI dashboard
- Bug fixes and performance optimization

## Scalability Strategy

### **Phase 2 Enhancements (Weeks 9-16)**
1. **Advanced Workflows** - Multi-step approvals
2. **Real-time Features** - Live inventory updates
3. **POS Integration** - Automated sales recording
4. **Advanced Analytics** - Comprehensive reporting
5. **Media Management** - Document and training materials

### **Migration Path**
The simplified schema is designed to be **incrementally enhanced**:
- Additional columns can be added without breaking changes
- New tables can reference existing core tables
- Complex features can be layered on top of simple foundations

## Success Metrics

### **MVP Success Criteria**
- ✅ Franchisee can browse and select packages
- ✅ Complete application and approval process
- ✅ Place and track inventory orders
- ✅ Process payments end-to-end
- ✅ View basic performance metrics
- ✅ Generate essential reports

### **Performance Targets**
- **Page Load Time:** < 2 seconds
- **Order Processing:** < 30 seconds
- **Payment Processing:** < 10 seconds
- **Report Generation:** < 5 seconds

## Conclusion

This simplified MVP architecture delivers **80% of the business value** with **33% of the complexity**:

- **15 core tables** instead of 45+
- **6-8 week implementation** instead of 16 weeks
- **Focus on essential user journeys** with proven business value
- **Clear path to scale** without architectural refactoring

The MVP ensures rapid time-to-market while maintaining the flexibility to evolve into the comprehensive system as business needs grow.
