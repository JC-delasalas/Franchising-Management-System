# FranchiseHub Setup Guide

This comprehensive guide will walk you through setting up the FranchiseHub Franchise Management System from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Setup](#application-setup)
5. [Development Workflow](#development-workflow)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Required Accounts
- **Supabase Account**: [supabase.com](https://supabase.com)
- **Vercel Account**: [vercel.com](https://vercel.com) (for deployment)
- **GitHub Account**: For repository access

### Recommended Tools
- **VS Code**: With TypeScript and React extensions
- **Supabase CLI**: For database management
- **Postman**: For API testing

---

## Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/JC-delasalas/Franchising-Management-System.git

# Navigate to project directory
cd Franchising-Management-System

# Install dependencies
npm install
```

### 2. Environment Configuration

Create environment files:

```bash
# Copy environment template
cp .env.example .env.local
```

Configure `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### 3. Supabase Project Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project initialization

2. **Get Project Credentials**:
   - Go to Project Settings → API
   - Copy the Project URL and anon/public key
   - Add these to your `.env.local` file

---

## Database Configuration

### 1. Install Supabase CLI (Optional but Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### 2. Database Schema Setup

#### Option A: Using SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the following scripts in order:

**Step 1: Core Schema**
```sql
-- Create user profiles table
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

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

**Step 2: Franchise Tables**
```sql
-- Create franchises table
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

-- Create franchise locations table
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

-- Enable RLS and create policies
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Franchisors can manage franchises" ON franchises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('franchisor', 'admin')
    )
  );
```

**Step 3: Product Management**
```sql
-- Create products table
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

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_sku ON products(sku);
```

**Step 4: Order Management Tables**

Run the order management schema from `docs/database-schema.md` sections for:
- `orders` table
- `order_items` table
- `payment_methods` table
- `addresses` table
- `shopping_cart` table
- `order_status_history` table
- `order_approvals` table
- `reorder_templates` table

### 3. Sample Data

Insert sample data for testing:

```sql
-- Insert sample franchise
INSERT INTO franchises (name, description, active) VALUES
('FranchiseHub Demo', 'Demo franchise for testing', true);

-- Insert sample products
INSERT INTO products (sku, name, description, category, subcategory, brand, unit_of_measure, price, cost_price, weight, minimum_order_qty, maximum_order_qty, lead_time_days, active) VALUES
('SKU001', 'Siomai Mix (500pcs)', 'Premium siomai mix for steaming', 'Food Items', 'Frozen Foods', 'FranchiseHub', 'pack', 2500.00, 2000.00, 2.5, 1, 10, 3, true),
('SKU002', 'Sauce Packets (100pcs)', 'Soy sauce packets for siomai', 'Condiments', 'Sauces', 'FranchiseHub', 'pack', 450.00, 350.00, 1.2, 1, 20, 1, true),
('SKU003', 'Disposable Containers (200pcs)', 'Food containers for takeout', 'Packaging', 'Containers', 'EcoPackaging', 'pack', 1200.00, 900.00, 3.0, 1, 15, 2, true);
```

---

## Application Setup

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:5173
```

### 2. Create Test Users

1. **Navigate to the application**
2. **Sign up for test accounts**:
   - Franchisor: `franchisor@test.com`
   - Franchisee: `franchisee@test.com`

3. **Update user roles in Supabase**:
   ```sql
   -- Set user roles (replace with actual user IDs)
   UPDATE user_profiles 
   SET role = 'franchisor' 
   WHERE email = 'franchisor@test.com';

   UPDATE user_profiles 
   SET role = 'franchisee' 
   WHERE email = 'franchisee@test.com';
   ```

### 3. Test Core Functionality

1. **Login as franchisee**
2. **Navigate to Product Catalog** (`/product-catalog`)
3. **Add items to cart**
4. **View shopping cart** (`/cart`)
5. **Test order creation workflow**

---

## Development Workflow

### 1. Code Structure

```
src/
├── api/                 # API integration layer
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript definitions
└── styles/             # Global styles
```

### 2. Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Database Development

```bash
# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# Run database migrations (if using Supabase CLI)
supabase db push

# Reset database (development only)
supabase db reset
```

---

## Production Deployment

### 1. Vercel Deployment

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings

2. **Environment Variables**:
   - Add production environment variables
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

3. **Deploy**:
   - Vercel will automatically deploy on push to main branch

### 2. Database Production Setup

1. **Upgrade Supabase Plan** (if needed)
2. **Configure Production Database**:
   - Run all schema migrations
   - Set up production data
   - Configure backups

3. **Security Configuration**:
   - Review RLS policies
   - Configure auth settings
   - Set up monitoring

---

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Issues
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify Supabase project status
# Check Supabase dashboard for project health
```

#### 2. Database Permission Errors
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';

-- Verify user authentication
SELECT auth.uid();
```

#### 3. Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
npm run build
```

#### 4. TypeScript Errors
```bash
# Regenerate database types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# Check TypeScript configuration
npm run type-check
```

### Getting Help

1. **Check Documentation**: Review API and database documentation
2. **GitHub Issues**: Search existing issues or create new ones
3. **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
4. **Community Support**: Supabase Discord or GitHub Discussions

---

## Next Steps

After successful setup:

1. **Explore Features**: Test all implemented functionality
2. **Customize**: Modify branding and configuration
3. **Extend**: Add new features using existing patterns
4. **Deploy**: Set up production environment
5. **Monitor**: Implement logging and monitoring

The FranchiseHub system is now ready for development and customization!
