# Franchise Management System API Reference

## Overview

This document provides comprehensive API reference for the Franchise Management System. All APIs are built on Supabase and follow RESTful conventions with real-time capabilities.

## Authentication

### Base URL
```
https://your-project.supabase.co/rest/v1/
```

### Headers
```http
Authorization: Bearer YOUR_JWT_TOKEN
apikey: YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

### Authentication Flow
1. **Sign Up**: Create new user account
2. **Sign In**: Authenticate and receive JWT token
3. **Token Refresh**: Automatically handled by Supabase client
4. **Sign Out**: Invalidate session

## Core Entities

### Franchisors

#### List Franchisors
```http
GET /franchisor
```

**Response:**
```json
{
  "data": [
    {
      "franchisor_id": "uuid",
      "company_nm": "Coffee Masters Inc",
      "legal_nm": "Coffee Masters Incorporated",
      "contact_email": "admin@coffeemasters.com",
      "phone_no": "+1-555-0100",
      "street_addr": "123 Business Ave",
      "city": "New York",
      "state_prov": "NY",
      "postal_code": "10001",
      "country": "USA",
      "status": "active",
      "metadata": {},
      "preferences": {},
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Franchisor
```http
POST /franchisor
```

**Request Body:**
```json
{
  "company_nm": "New Franchise Co",
  "legal_nm": "New Franchise Company LLC",
  "contact_email": "admin@newfranchise.com",
  "phone_no": "+1-555-0200",
  "street_addr": "456 Franchise Blvd",
  "city": "Los Angeles",
  "state_prov": "CA",
  "postal_code": "90210",
  "country": "USA",
  "metadata": {
    "industry": "food_service",
    "founded_year": 2024
  },
  "preferences": {
    "timezone": "America/Los_Angeles",
    "currency": "USD"
  }
}
```

### Brands

#### List Brands
```http
GET /brand?franchisor_id=eq.{franchisor_id}
```

#### Create Brand
```http
POST /brand
```

**Request Body:**
```json
{
  "franchisor_id": "uuid",
  "brand_nm": "Coffee Express",
  "tagline": "Fast Coffee, Great Taste",
  "details": "Premium coffee franchise concept",
  "logo_url": "https://example.com/logo.png",
  "metadata": {
    "target_demographic": "urban_professionals",
    "price_point": "premium"
  },
  "marketing_data": {
    "brand_colors": ["#8B4513", "#F5DEB3"],
    "fonts": ["Roboto", "Open Sans"],
    "style_guide_url": "https://example.com/style-guide.pdf"
  }
}
```

### Products

#### List Products
```http
GET /product?brand_id=eq.{brand_id}&is_active=eq.true
```

#### Create Product
```http
POST /product
```

**Request Body:**
```json
{
  "brand_id": "uuid",
  "category_id": "uuid",
  "product_nm": "Espresso Blend",
  "details": "Premium espresso coffee blend",
  "sku": "ESP-001",
  "unit_price": 12.99,
  "is_active": true,
  "metadata": {
    "origin": "Colombia",
    "roast_level": "medium",
    "caffeine_content": "high"
  },
  "custom_attributes": {
    "allergens": [],
    "certifications": ["organic", "fair_trade"],
    "shelf_life_days": 365
  }
}
```

### Franchisees

#### List Franchisees
```http
GET /franchisee?brand_id=eq.{brand_id}
```

#### Create Franchisee
```http
POST /franchisee
```

**Request Body:**
```json
{
  "brand_id": "uuid",
  "op_nm": "Downtown Coffee Express",
  "legal_nm": "Downtown Coffee LLC",
  "contact_first_nm": "John",
  "contact_last_nm": "Smith",
  "contact_email": "john@downtowncoffee.com",
  "phone_no": "+1-555-0301",
  "onboarding_status": "pending",
  "metadata": {
    "territory": "downtown",
    "investment_level": "standard"
  },
  "preferences": {
    "marketing_budget": 5000,
    "staff_size": 15
  }
}
```

### Locations

#### List Locations
```http
GET /location?franchisee_id=eq.{franchisee_id}
```

#### Create Location
```http
POST /location
```

**Request Body:**
```json
{
  "franchisee_id": "uuid",
  "location_nm": "Downtown Coffee Express - Main St",
  "street_addr": "789 Main Street",
  "city": "New York",
  "state_prov": "NY",
  "postal_code": "10001",
  "country": "USA",
  "phone_no": "+1-555-0401",
  "email": "mainst@downtowncoffee.com",
  "opening_date": "2024-03-01",
  "status": "active",
  "metadata": {
    "square_footage": 1200,
    "seating_capacity": 40
  },
  "operating_hours": {
    "monday": {"open": "06:00", "close": "20:00"},
    "tuesday": {"open": "06:00", "close": "20:00"},
    "wednesday": {"open": "06:00", "close": "20:00"},
    "thursday": {"open": "06:00", "close": "20:00"},
    "friday": {"open": "06:00", "close": "21:00"},
    "saturday": {"open": "07:00", "close": "21:00"},
    "sunday": {"open": "08:00", "close": "19:00"}
  }
}
```

## User Management

### User Profiles

#### Get Current User Profile
```http
GET /user_dashboard_view
```

#### Update User Profile
```http
PATCH /user_profiles?user_id=eq.{user_id}
```

**Request Body:**
```json
{
  "first_nm": "John",
  "last_nm": "Doe",
  "phone_no": "+1-555-0123",
  "avatar_url": "https://example.com/avatar.jpg",
  "metadata": {
    "department": "operations",
    "hire_date": "2024-01-15"
  },
  "preferences": {
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "dashboard_layout": "compact"
  }
}
```

### Roles and Permissions

#### List Roles
```http
GET /role?franchisor_id=eq.{franchisor_id}
```

#### Create Role
```http
POST /role
```

**Request Body:**
```json
{
  "franchisor_id": "uuid",
  "role_nm": "Store Manager",
  "details": "Manages daily operations of a franchise location"
}
```

#### Assign Role to User
```http
POST /user_role
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "role_id": "uuid",
  "location_id": "uuid"
}
```

## Sales and Analytics

### Sales Transactions

#### List Sales Transactions
```http
GET /sales_transaction?location_id=eq.{location_id}&txn_date=gte.2024-01-01
```

#### Create Sales Transaction
```http
POST /sales_transaction
```

**Request Body:**
```json
{
  "location_id": "uuid",
  "customer_id": "uuid",
  "total_amt": 25.50,
  "payment_method": "credit_card",
  "status": "completed",
  "user_id": "uuid",
  "metadata": {
    "order_type": "dine_in",
    "table_number": 5
  },
  "custom_data": {
    "promotion_code": "WELCOME10",
    "discount_applied": 2.55
  }
}
```

### KPI Management

#### List KPIs
```http
GET /kpi?brand_id=eq.{brand_id}
```

#### Create KPI
```http
POST /kpi
```

**Request Body:**
```json
{
  "brand_id": "uuid",
  "kpi_nm": "Daily Sales Target",
  "details": "Target daily sales revenue per location",
  "target_value": 1500.00,
  "unit_of_measure": "USD"
}
```

#### Record KPI Data
```http
POST /kpi_data
```

**Request Body:**
```json
{
  "kpi_id": "uuid",
  "location_id": "uuid",
  "actual_value": 1650.00,
  "recorded_date": "2024-01-15"
}
```

## Inventory Management

### Inventory

#### Get Inventory by Location
```http
GET /inventory?location_id=eq.{location_id}
```

#### Update Inventory
```http
PATCH /inventory?inventory_id=eq.{inventory_id}
```

**Request Body:**
```json
{
  "current_stock": 50,
  "min_stock_level": 10
}
```

### Purchase Orders

#### List Purchase Orders
```http
GET /purchase_order?location_id=eq.{location_id}
```

#### Create Purchase Order
```http
POST /purchase_order
```

**Request Body:**
```json
{
  "location_id": "uuid",
  "supplier_id": "uuid",
  "user_id": "uuid",
  "order_date": "2024-01-15",
  "status": "pending",
  "total_amt": 500.00
}
```

## Training System

### Training Modules

#### List Training Modules
```http
GET /training_module?brand_id=eq.{brand_id}
```

#### Create Training Module
```http
POST /training_module
```

**Request Body:**
```json
{
  "brand_id": "uuid",
  "title": "Coffee Brewing Fundamentals",
  "details": "Learn the basics of coffee brewing techniques",
  "module_type": "video",
  "content_path": "https://example.com/training/brewing-101.mp4",
  "is_mandatory": true
}
```

### User Training Progress

#### Get User Training Progress
```http
GET /user_training?user_id=eq.{user_id}
```

#### Update Training Progress
```http
PATCH /user_training?user_id=eq.{user_id}&module_id=eq.{module_id}
```

**Request Body:**
```json
{
  "completion_status": "completed",
  "completion_date": "2024-01-15T10:30:00Z",
  "score": 95.5
}
```

## File Management

### File Maintenance

#### List Files
```http
GET /file_maintenance?franchisor_id=eq.{franchisor_id}
```

#### Upload File Metadata
```http
POST /file_maintenance
```

**Request Body:**
```json
{
  "franchisor_id": "uuid",
  "franchisee_id": "uuid",
  "file_name": "training_manual_v2.pdf",
  "file_path": "https://storage.example.com/files/training_manual_v2.pdf",
  "file_type": "application/pdf",
  "file_size": 2048576,
  "category": "training",
  "description": "Updated training manual for new employees",
  "uploaded_by": "uuid"
}
```

## Reporting

### Generated Reports

#### List Reports
```http
GET /generated_reports?franchisor_id=eq.{franchisor_id}
```

#### Create Report Request
```http
POST /generated_reports
```

**Request Body:**
```json
{
  "franchisor_id": "uuid",
  "franchisee_id": "uuid",
  "report_name": "Monthly Sales Summary",
  "report_type": "sales_summary",
  "parameters": {
    "date_range": "monthly",
    "include_charts": true,
    "format": "pdf"
  },
  "generated_by": "uuid",
  "date_from": "2024-01-01",
  "date_to": "2024-01-31"
}
```

## Real-time Subscriptions

### Subscribe to Changes
```javascript
// Subscribe to sales transactions for a location
const subscription = supabase
  .channel('sales_changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sales_transaction',
    filter: 'location_id=eq.{location_id}'
  }, (payload) => {
    console.log('New sale:', payload.new);
  })
  .subscribe();
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "PGRST116",
    "message": "The result contains 0 rows",
    "details": null,
    "hint": null
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Bulk operations**: 10 requests per minute

## Pagination

Use `limit` and `offset` parameters:
```http
GET /sales_transaction?limit=20&offset=40
```

Or use range headers:
```http
Range: 0-19
```

---

For more detailed examples and advanced usage, see the [Supabase Documentation](https://supabase.com/docs).
