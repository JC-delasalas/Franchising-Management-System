# FranchiseHub Database Schema Documentation

This document provides comprehensive documentation of the FranchiseHub database schema, including all tables, relationships, and security policies.

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Tables](#core-tables)
3. [Order Management Tables](#order-management-tables)
4. [Security Implementation](#security-implementation)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Database Functions](#database-functions)

---

## Schema Overview

The FranchiseHub database consists of **25+ tables** organized into logical groups:

- **Core System**: User management, franchises, locations
- **Product Management**: Products, inventory, warehouses
- **Order Management**: Orders, cart, payments, addresses
- **Analytics**: Performance tracking, financial data
- **System**: Notifications, settings, audit logs

### Database Statistics
- **Total Tables**: 25+
- **RLS Policies**: 25+
- **Performance Indexes**: 20+
- **Secure Functions**: 4
- **Relationships**: 50+ foreign key constraints

---

## Core Tables

### user_profiles
Extends Supabase Auth users with additional profile information.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  role TEXT CHECK (role IN ('franchisee', 'franchisor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Users can view and update their own profile
- Franchisors can view franchisee profiles

### franchises
Franchise brand information.

```sql
CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  brand_colors JSONB,
  contact_info JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### franchise_locations
Individual franchise outlets.

```sql
CREATE TABLE franchise_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID REFERENCES franchises(id),
  franchisee_id UUID REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  phone_number TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### products
Product catalog with comprehensive product information.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID REFERENCES franchises(id),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  brand TEXT,
  unit_of_measure TEXT DEFAULT 'piece',
  price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight DECIMAL(8,3),
  minimum_order_qty INTEGER DEFAULT 1,
  maximum_order_qty INTEGER,
  lead_time_days INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Order Management Tables

### orders
Main orders table with comprehensive order information.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  franchise_location_id UUID REFERENCES franchise_locations(id),
  created_by UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'rejected', 
    'processing', 'shipped', 'delivered', 'cancelled'
  )),
  order_type TEXT DEFAULT 'inventory',
  priority TEXT DEFAULT 'normal',
  
  -- Financial Information
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  
  -- Payment Information
  payment_method_id UUID REFERENCES payment_methods(id),
  billing_address_id UUID REFERENCES addresses(id),
  shipping_address_id UUID REFERENCES addresses(id),
  
  -- Approval Workflow
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  approval_comments TEXT,
  rejection_reason TEXT,
  
  -- Shipping Information
  tracking_number TEXT,
  carrier TEXT,
  shipping_method TEXT,
  shipped_date TIMESTAMPTZ,
  estimated_delivery_date TIMESTAMPTZ,
  delivered_date TIMESTAMPTZ,
  
  -- Additional Information
  order_notes TEXT,
  required_date DATE,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES user_profiles(id),
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### order_items
Individual items within orders.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  delivered_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### payment_methods
User payment methods with support for multiple payment types.

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN (
    'bank_transfer', 'credit_card', 'debit_card', 'gcash', 'cash_on_delivery'
  )),
  nickname TEXT,
  is_default BOOLEAN DEFAULT false,
  
  -- Bank Transfer Fields
  bank_name TEXT,
  account_number TEXT,
  account_holder_name TEXT,
  
  -- Card Fields
  card_last_four TEXT,
  card_brand TEXT,
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  
  -- GCash Fields
  gcash_number TEXT,
  gcash_account_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### addresses
Billing and shipping addresses.

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  address_type TEXT NOT NULL CHECK (address_type IN ('billing', 'shipping', 'both')),
  recipient_name TEXT NOT NULL,
  company_name TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  postal_code TEXT NOT NULL CHECK (postal_code ~ '^[0-9]{4}$'),
  country TEXT DEFAULT 'Philippines',
  phone_number TEXT,
  delivery_instructions TEXT,
  nickname TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### shopping_cart
User shopping cart for order preparation.

```sql
CREATE TABLE shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);
```

### order_status_history
Audit trail for order status changes.

```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### order_approvals
Order approval workflow tracking.

```sql
CREATE TABLE order_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES user_profiles(id),
  approval_level INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'request_changes')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### reorder_templates
Saved order templates for quick reordering.

```sql
CREATE TABLE reorder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Array of {product_id, quantity}
  is_favorite BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Security Implementation

### Row Level Security (RLS) Policies

All tables have comprehensive RLS policies ensuring data isolation:

#### User Profile Security
```sql
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### Order Management Security
```sql
-- Franchisees can view their own orders
CREATE POLICY "Franchisees can view their orders" ON orders
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('franchisor', 'admin')
    )
  );

-- Payment methods are user-specific
CREATE POLICY "Users can manage their payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);
```

#### Cart Security
```sql
-- Shopping cart is user-specific
CREATE POLICY "Users can manage their cart" ON shopping_cart
  FOR ALL USING (auth.uid() = user_id);
```

### Database Functions

#### Secure Order Number Generation
```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
         LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
         LPAD(NEXTVAL('order_sequence')::TEXT, 4, '0');
END;
$$;
```

---

## Relationships

### Primary Relationships
- `user_profiles` ← `franchise_locations` (franchisee)
- `franchises` ← `franchise_locations` (franchise brand)
- `franchise_locations` ← `orders` (order location)
- `user_profiles` ← `orders` (order creator)
- `orders` ← `order_items` (order contents)
- `products` ← `order_items` (ordered products)

### Order Management Relationships
- `user_profiles` ← `payment_methods` (user payments)
- `user_profiles` ← `addresses` (user addresses)
- `user_profiles` ← `shopping_cart` (user cart)
- `payment_methods` ← `orders` (order payment)
- `addresses` ← `orders` (billing/shipping)

### Workflow Relationships
- `orders` ← `order_status_history` (status tracking)
- `orders` ← `order_approvals` (approval workflow)
- `user_profiles` ← `reorder_templates` (saved templates)

---

## Indexes

### Performance Indexes
```sql
-- Order management indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_franchise_location ON orders(franchise_location_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Product catalog indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_sku ON products(sku);

-- Cart and payment indexes
CREATE INDEX idx_shopping_cart_user ON shopping_cart(user_id);
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Search indexes
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));
```

---

## Database Functions

### Order Processing Functions
1. **`generate_order_number()`** - Secure order number generation
2. **`process_order_approval()`** - Handle order approval workflow
3. **`check_approval_requirements()`** - Validate approval requirements
4. **`calculate_order_total()`** - Calculate order totals with tax and shipping

All functions use `SECURITY DEFINER` and `SET search_path = public` for security.

---

## Migration Strategy

### Schema Updates
1. All schema changes are versioned and tracked
2. Migrations include both forward and rollback scripts
3. RLS policies are updated with schema changes
4. Indexes are maintained during migrations

### Data Integrity
- Foreign key constraints ensure referential integrity
- Check constraints validate data formats
- Generated columns maintain calculated values
- Triggers handle automatic timestamp updates

This schema provides a robust foundation for the FranchiseHub system with comprehensive security, performance optimization, and data integrity.
