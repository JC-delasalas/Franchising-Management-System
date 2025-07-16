# FranchiseHub Database Migration Guide

## 🚨 Critical Database Schema Update Required

Our application has implemented comprehensive functionality that requires a complete database schema. The current database is missing essential tables for all the features we've built.

## 📊 Current Implementation vs Database Gap Analysis

### ✅ **Implemented Features Requiring Database Support:**

#### **Phase 1: User Management**
- ✅ User profiles with roles and permissions
- ✅ Organization management
- ❌ **Missing**: Enhanced user_profiles table with proper fields

#### **Phase 2: Franchise Management**
- ✅ Franchise listings and applications
- ✅ Franchise locations and packages
- ❌ **Missing**: Complete franchise management tables

#### **Phase 3: Order Management System**
- ✅ Product catalog and inventory
- ✅ Shopping cart functionality
- ✅ Complete order lifecycle (create → approve → ship → deliver)
- ✅ Payment method management
- ✅ Address management
- ✅ Shipping and fulfillment
- ❌ **Missing**: ALL order-related tables

#### **Phase 4.1: Notifications System**
- ✅ Real-time notifications
- ✅ User notification preferences
- ✅ Order lifecycle notifications
- ❌ **Missing**: ALL notification tables

## 🗄️ Required Database Tables

### **Missing Critical Tables:**
1. **Product Management**: `products`, `product_categories`, `inventory`, `warehouses`
2. **Order System**: `orders`, `order_items`, `order_status_history`, `order_approvals`
3. **Payment & Address**: `payment_methods`, `addresses`
4. **Shopping Cart**: `cart_items`
5. **Notifications**: `notifications`, `user_notification_preferences`
6. **Enhanced Franchise**: Updated franchise tables with all required fields

## 🚀 Migration Steps

### **Step 1: Backup Current Database**
```sql
-- Create backup of existing data
pg_dump your_database_name > backup_before_migration.sql
```

### **Step 2: Apply Complete Schema**
```sql
-- Run the complete schema file
\i database/complete-schema.sql
```

### **Step 3: Migrate Existing Data**
If you have existing data in user_profiles, franchises, etc., you'll need to:

1. **Export existing data**:
```sql
COPY user_profiles TO 'user_profiles_backup.csv' DELIMITER ',' CSV HEADER;
COPY franchises TO 'franchises_backup.csv' DELIMITER ',' CSV HEADER;
-- Repeat for other existing tables
```

2. **Apply new schema**
3. **Import data back** with proper field mapping

### **Step 4: Set Up Row Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- Continue for all tables

-- Create RLS policies (examples)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);
```

### **Step 5: Create Sample Data**
```sql
-- Insert sample data for testing
INSERT INTO product_categories (name, description) VALUES 
('Food & Beverages', 'Food and beverage products'),
('Equipment', 'Restaurant equipment and supplies'),
('Marketing', 'Marketing materials and signage');

INSERT INTO products (name, sku, price, category_id) VALUES 
('Coffee Beans - Premium Blend', 'CB-001', 450.00, (SELECT id FROM product_categories WHERE name = 'Food & Beverages')),
('Espresso Machine', 'EM-001', 25000.00, (SELECT id FROM product_categories WHERE name = 'Equipment'));

-- Add sample warehouse
INSERT INTO warehouses (name, city, state, country) VALUES 
('Main Warehouse', 'Manila', 'Metro Manila', 'Philippines');

-- Add inventory
INSERT INTO inventory (warehouse_id, product_id, quantity_on_hand) VALUES 
((SELECT id FROM warehouses LIMIT 1), (SELECT id FROM products WHERE sku = 'CB-001'), 100),
((SELECT id FROM warehouses LIMIT 1), (SELECT id FROM products WHERE sku = 'EM-001'), 5);
```

## ⚠️ **CRITICAL: Application Will Not Work Without This Migration**

### **Current Status:**
- ❌ **Orders cannot be created** - No orders table
- ❌ **Cart functionality broken** - No cart_items table  
- ❌ **Product catalog empty** - No products table
- ❌ **Notifications system broken** - No notifications table
- ❌ **Payment methods broken** - No payment_methods table
- ❌ **Address management broken** - No addresses table

### **After Migration:**
- ✅ **Complete order management workflow**
- ✅ **Real-time notifications system**
- ✅ **Product catalog with inventory**
- ✅ **Shopping cart functionality**
- ✅ **Payment and address management**
- ✅ **Shipping and fulfillment tracking**

## 🔧 Supabase Setup Instructions

### **Option 1: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `complete-schema.sql`
4. Execute the script

### **Option 2: Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

### **Option 3: Direct PostgreSQL**
```bash
# Connect to your database
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run the schema file
\i database/complete-schema.sql
```

## 📋 Post-Migration Checklist

- [ ] All tables created successfully
- [ ] Indexes applied for performance
- [ ] Triggers set up for updated_at fields
- [ ] RLS policies configured
- [ ] Sample data inserted for testing
- [ ] Application connects successfully
- [ ] Order creation workflow works
- [ ] Notification system functional
- [ ] Product catalog displays
- [ ] Cart functionality works

## 🚨 **Action Required**

**The database schema MUST be updated before the application can function properly.** All the features we've implemented depend on these database tables.

**Recommended approach:**
1. **Immediate**: Apply the complete schema to a development/staging environment
2. **Test**: Verify all functionality works with the new schema
3. **Production**: Apply to production with proper backup and rollback plan

## 📞 Support

If you encounter issues during migration:
1. Check the Supabase logs for detailed error messages
2. Verify your database permissions
3. Ensure all foreign key relationships are properly set up
4. Test with sample data before using real data

The complete schema includes all necessary tables, indexes, functions, and triggers to support the full FranchiseHub application functionality.
