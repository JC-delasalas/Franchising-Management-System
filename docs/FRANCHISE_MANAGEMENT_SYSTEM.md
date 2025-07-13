# Franchise Management System Documentation

## Overview

The Franchise Management System is a comprehensive multi-tenant platform designed to support franchise operations across multiple brands and networks. The system implements 10 primary objectives to ensure scalable, secure, and efficient franchise management.

## 🎯 Primary Objectives

### 1. Centralized Brand & Product Management
**Objective**: Maintain brand consistency and control the product catalog across the entire network from a single point.

**Supporting Tables**: `brand`, `product_category`, `product`

**How it works**: The franchisor uses these tables to define the official brand identity, control the exact products that can be sold, and enforce a standardized catalog, ensuring a consistent customer experience at every location.

**Key Features**:
- Multi-brand support per franchisor
- Centralized product catalog management
- Brand identity and marketing asset control
- Product categorization and pricing management
- Metadata support for custom brand attributes

### 2. Scalable Multi-Tenant Architecture
**Objective**: Build a platform that can securely host multiple, independent franchisor networks within the same system.

**Supporting Tables**: All tables with `franchisor_id` as a top-level key

**How it works**: By partitioning data with `franchisor_id`, the system ensures that one franchisor (e.g., a coffee shop chain) cannot access the sensitive operational data of another (e.g., a pizza chain), making it a true multi-tenant platform.

**Key Features**:
- Complete data isolation between franchisors
- Shared infrastructure with isolated data
- Scalable architecture supporting unlimited franchisors
- JSONB metadata support for flexible data structures
- Performance-optimized with proper indexing

### 3. Secure, Role-Based Access Control
**Objective**: Guarantee that users only have access to the data and functions appropriate for their role.

**Supporting Tables**: `user_profiles`, `role`, `permission`, `user_role`, `role_permission`

**How it works**: This five-table security model creates a powerful matrix where permissions are assigned to roles, and users are assigned to roles, ensuring granular control over who can do what—from a cashier processing a sale to an admin accessing network-wide analytics.

**Key Features**:
- Granular permission system
- Custom role creation per franchisor
- Location-based role assignments
- Hierarchical access control
- Audit trail for security actions

### 4. Efficient Inventory & Supply Chain Monitoring
**Objective**: Provide real-time visibility into stock levels and streamline the entire supply chain.

**Supporting Tables**: `inventory`, `supplier`, `purchase_order`, `shipment`, `inventory_order`

**How it works**: The system tracks inventory at each location, flagging low stock against the `min_stock_level`. It manages relationships with suppliers and tracks `purchase_orders` from creation to delivery via the `shipment` table, optimizing logistics.

**Key Features**:
- Real-time inventory tracking
- Automated low-stock alerts
- Supplier relationship management
- Purchase order lifecycle management
- Shipment tracking and logistics

### 5. Data-Driven Performance Analytics
**Objective**: Transform raw operational data into actionable business intelligence for strategic decision-making.

**Supporting Tables**: `kpi`, `kpi_data`, `sales_transaction`, `daily_sales_report`

**How it works**: The franchisor defines Key Performance Indicators in the `kpi` table. The system then records actual results in `kpi_data`, allowing for the generation of rich charts, graphs, and "Target Achievement" metrics seen on the dashboards.

**Key Features**:
- Custom KPI definition and tracking
- Real-time performance monitoring
- Comprehensive sales analytics
- Automated report generation
- Business intelligence dashboards

### 6. Automated Financial Management & Billing
**Objective**: Automate the franchisor's revenue cycle, from subscription management to payment collection.

**Supporting Tables**: `plan`, `subscription`, `invoice`, `payment`

**How it works**: This suite of tables manages the complete financial lifecycle. `plan` defines the franchise packages, `subscription` assigns them to franchisees, `invoice` handles automated billing, and `payment` tracks all incoming revenue.

**Key Features**:
- Subscription-based billing
- Automated invoice generation
- Payment processing integration
- Financial reporting and analytics
- Revenue tracking and forecasting

### 7. Comprehensive Franchisee Lifecycle Management
**Objective**: Manage the entire journey of a franchisee, from initial legal agreements to ongoing compliance.

**Supporting Tables**: `contract`, `contract_version`, `franchisee`

**How it works**: The system securely stores and versions legal contracts, linking them directly to the franchisee record. It tracks the `onboarding_status` and overall `status` of the franchisee, providing a complete administrative overview.

**Key Features**:
- Contract lifecycle management
- Document versioning and storage
- Onboarding process tracking
- Compliance monitoring
- Franchisee status management

### 8. Standardized Training & Development
**Objective**: Ensure all employees and franchisees receive consistent, high-quality training aligned with brand standards.

**Supporting Tables**: `training_module`, `user_training`

**How it works**: The `training_module` table acts as a central library for all training content. The `user_training` table tracks each user's progress, completion dates, and scores, ensuring a well-trained network.

**Key Features**:
- Centralized training content library
- Progress tracking and certification
- Mandatory vs. optional training
- Multi-format content support (documents, videos, quizzes)
- Performance scoring and analytics

### 9. Streamlined Customer Relationship Management (CRM)
**Objective**: Build and maintain a central database of end-customers to foster loyalty and analyze purchasing behavior.

**Supporting Tables**: `customer`, `sales_transaction`

**How it works**: The `customer` table captures customer information, while the `sales_transaction` table links them to their purchase history. This enables the creation of loyalty programs (`loyalty_member` field) and provides valuable data on customer habits.

**Key Features**:
- Centralized customer database
- Purchase history tracking
- Loyalty program management
- Customer behavior analytics
- Targeted marketing capabilities

### 10. Robust Auditing & System Integrity
**Objective**: Maintain a complete and immutable record of significant actions within the system for security and accountability.

**Supporting Tables**: `audit_logs`

**How it works**: This table automatically logs critical events, such as a user updating a product's price or changing a role's permissions. It records who did what and when, providing an essential security and troubleshooting tool.

**Key Features**:
- Comprehensive audit trail
- Automatic event logging
- Security monitoring
- Compliance reporting
- Troubleshooting support

## 🏗️ System Architecture

### Multi-Tenant Data Model
The system uses a shared database, separate schema approach where:
- All franchisors share the same infrastructure
- Data is isolated using `franchisor_id` as a tenant key
- Row-level security (RLS) policies enforce data isolation
- JSONB fields support flexible, semi-structured data

### Data Types Supported
1. **Structured Data**: Traditional relational data in defined columns
2. **Semi-Structured Data**: JSONB fields for flexible attributes and metadata
3. **Unstructured Data**: File storage with metadata tracking in `file_maintenance`

### Security Model
- Supabase Authentication for identity management
- Custom RBAC system for authorization
- Row-level security policies for data isolation
- Audit logging for compliance and security

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- PostgreSQL database (provided by Supabase)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Run database migrations: `npx supabase db push`
5. Start development server: `npm run dev`

### Environment Configuration
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Database Schema

### Core Tables
- **franchisor**: Franchise companies (tenant root)
- **franchisee**: Individual franchise operators
- **brand**: Franchise brands under each franchisor
- **location**: Physical franchise locations
- **user_profiles**: System users with role-based access

### Management Tables
- **product**: Centralized product catalog
- **inventory**: Location-specific inventory tracking
- **sales_transaction**: Transaction records and analytics
- **contract**: Legal agreements and documentation

### System Tables
- **role/permission**: Access control system
- **audit_logs**: Security and compliance logging
- **training_module**: Learning management system

## 🔧 API Reference

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout

### Franchise Management
- `GET /api/franchisors` - List franchisors
- `POST /api/franchisors` - Create franchisor
- `GET /api/franchisees` - List franchisees
- `POST /api/franchisees` - Create franchisee

### Brand & Product Management
- `GET /api/brands` - List brands
- `POST /api/brands` - Create brand
- `GET /api/products` - List products
- `POST /api/products` - Create product

## 🛡️ Security Features

### Authentication
- Supabase Auth integration
- Email verification
- Password reset functionality
- Multi-factor authentication support

### Authorization
- Role-based access control (RBAC)
- Granular permissions system
- Location-based access control
- Resource-level security

### Data Protection
- Row-level security (RLS)
- Data encryption at rest
- Secure API endpoints
- Audit logging

## 📈 Analytics & Reporting

### KPI Management
- Custom KPI definition
- Real-time data collection
- Target vs. actual tracking
- Performance dashboards

### Financial Reporting
- Revenue tracking
- Subscription analytics
- Payment processing
- Automated billing

### Operational Analytics
- Sales performance
- Inventory optimization
- Customer behavior
- Training effectiveness

## 🎓 Training System

### Content Management
- Multi-format support (documents, videos, quizzes)
- Version control for training materials
- Mandatory vs. optional training designation
- Brand-specific content organization

### Progress Tracking
- Individual progress monitoring
- Completion certification
- Performance scoring
- Compliance reporting

## 📞 Support & Maintenance

### File Management
- Document storage and organization
- Version control
- Access permissions
- Automated cleanup

### System Monitoring
- Performance metrics
- Error tracking
- Usage analytics
- Health monitoring

## 🔄 Integration Capabilities

### Third-Party Services
- Payment processors
- Email services
- SMS notifications
- Analytics platforms

### API Integration
- RESTful API design
- Webhook support
- Real-time subscriptions
- Batch processing

## 📋 Compliance & Governance

### Audit Requirements
- Complete action logging
- User activity tracking
- Data change history
- Compliance reporting

### Data Governance
- Data retention policies
- Privacy controls
- GDPR compliance
- Data export capabilities

## 🔧 Implementation Guide

### Service Layer Architecture

The system implements a comprehensive service layer that supports all 10 primary objectives:

```typescript
import {
  FranchiseAuthService,
  BrandService,
  RBACService,
  AnalyticsService,
  AuditService,
  FranchiseSystemInitializer
} from '@/services/franchise';
```

### Quick Start Implementation

#### 1. Initialize a New Franchisor
```typescript
// Initialize system for new franchisor
const result = await FranchiseSystemInitializer.initializeFranchisor(franchisorId);
if (result.success) {
  console.log('System initialized with default roles and permissions');
}
```

#### 2. Create a Brand and Products
```typescript
// Create a new brand
const brand = await BrandService.createBrand(franchisorId, {
  brand_nm: 'Coffee Express',
  tagline: 'Fast Coffee, Great Taste',
  metadata: { industry: 'food_service' }
});

// Add products to the brand
const product = await BrandService.createProduct({
  brand_id: brand.data.brand_id,
  product_nm: 'Espresso Blend',
  sku: 'ESP-001',
  unit_price: 12.99
});
```

#### 3. Set Up User Roles
```typescript
// Create custom role
const role = await RBACService.createRole(franchisorId, {
  role_nm: 'Store Manager',
  details: 'Manages daily store operations',
  permissions: ['view_sales', 'create_sales', 'view_inventory']
});

// Assign role to user
await RBACService.assignUserRole({
  user_id: userId,
  role_id: role.data.role_id,
  location_id: locationId
});
```

#### 4. Track KPIs and Analytics
```typescript
// Create KPI
const kpi = await AnalyticsService.createKPI({
  brand_id: brandId,
  kpi_nm: 'Daily Sales Target',
  target_value: 1500.00,
  unit_of_measure: 'USD'
});

// Record KPI data
await AnalyticsService.recordKPIData([{
  kpi_id: kpi.data.kpi_id,
  location_id: locationId,
  actual_value: 1650.00,
  recorded_date: '2024-01-15'
}]);
```

#### 5. Audit Logging
```typescript
// Log business events automatically
await AuditService.logDataChange(
  'product',
  productId,
  'update',
  oldProductData,
  newProductData,
  userId
);

// Log security events
await AuditService.logSecurityEvent(
  'role_assigned',
  { user_id: userId, role_id: roleId },
  adminUserId
);
```

### Database Migration

Apply the enhanced schema migration:

```bash
# Apply the migration
npx supabase db push

# Generate updated TypeScript types
npx supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts
```

### Environment Setup

Ensure your `.env` file includes:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Security Configuration

The system implements Row-Level Security (RLS) policies. Ensure your Supabase project has:

1. **Authentication enabled** with email verification
2. **RLS policies** for multi-tenant data isolation
3. **Custom claims** for role-based access control

### Performance Optimization

The system includes optimized indexes for:
- Multi-tenant queries (`franchisor_id` indexes)
- Analytics queries (date-based indexes)
- JSONB metadata searches (GIN indexes)

---

## 📚 Additional Documentation

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Database Schema](./DATABASE_SCHEMA.md) - Detailed schema documentation
- [Security Guide](./SECURITY.md) - Security implementation guide
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions

For detailed implementation guides, troubleshooting, and advanced features, see the additional documentation files in this directory.
