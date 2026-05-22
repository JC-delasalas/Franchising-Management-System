# 🧪 Supplier Management System - Testing Guide

## Overview

This guide provides comprehensive testing instructions for the role-based supplier management system implemented in FranchiseHub. The system enforces strict access controls to ensure franchisors maintain control over their supplier networks while franchisees can still place orders efficiently.

## 🔐 Access Control Matrix

| Role | View Suppliers | Create/Edit Suppliers | Delete Suppliers | View Contracts | Manage Contracts | View Performance | Purchase Orders |
|------|----------------|----------------------|------------------|----------------|------------------|------------------|-----------------|
| **Franchisor** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full CRUD |
| **Franchisee** | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ✅ View Own Only |
| **Admin** | ✅ Read-Only | ❌ No Access | ❌ No Access | ✅ Read-Only | ❌ No Access | ✅ Read-Only | ✅ Read-Only |
| **User** | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access | ❌ No Access |

## 🚀 Quick Start Testing

### 1. Access the Testing Interface

Navigate to: `http://localhost:5173/test/supplier-access`

This comprehensive testing interface will:
- Show your current user role and permissions
- Test database access with your current role
- Verify role-based access control is working
- Provide detailed test results and error messages

### 2. Test Different User Roles

To properly test the system, you'll need to test with different user roles:

#### Testing as Franchisor
1. Login with a franchisor account
2. Navigate to `/suppliers` - Should see full supplier management interface
3. Try creating a new supplier - Should work
4. Access all supplier sub-pages - Should have full access

#### Testing as Franchisee
1. Login with a franchisee account
2. Navigate to `/suppliers` - Should see access denied message
3. Try direct URL access to `/suppliers/create` - Should be blocked
4. Check product catalog - Should see approved products without supplier details
5. Navigation menu - Should not show supplier management options

#### Testing as Admin
1. Login with an admin account
2. Navigate to `/suppliers` - Should see read-only interface
3. Try creating a supplier - Should be blocked with appropriate message
4. View existing suppliers - Should work (read-only)

#### Testing as User
1. Login with a user/staff account
2. Navigate to `/suppliers` - Should see access denied message
3. All supplier functionality should be blocked

## 🧪 Detailed Test Scenarios

### Scenario 1: Franchisor Full Access Test

**Expected Behavior**: Franchisors should have complete access to all supplier functionality.

**Test Steps**:
1. Login as franchisor
2. Navigate to `/suppliers`
3. Verify you can see the supplier list
4. Click "Add Supplier" button
5. Fill out the supplier creation form
6. Submit the form
7. Verify supplier is created successfully
8. Navigate to supplier details page
9. Verify all tabs are accessible (Overview, Products, Contracts, Orders)

**Expected Results**:
- ✅ Full access to supplier management interface
- ✅ Can create, edit, and delete suppliers
- ✅ Can view all supplier information
- ✅ Navigation shows supplier management menu item
- ✅ No access restrictions or error messages

### Scenario 2: Franchisee Access Restriction Test

**Expected Behavior**: Franchisees should be completely blocked from supplier management but can still order products.

**Test Steps**:
1. Login as franchisee
2. Navigate to `/suppliers` directly
3. Verify access denied message is shown
4. Check navigation menu for supplier options
5. Navigate to `/product-catalog`
6. Verify products are shown without supplier information
7. Try to place an order
8. Navigate to `/orders` to view own orders

**Expected Results**:
- ❌ Access denied to `/suppliers` with appropriate error message
- ❌ No supplier management in navigation menu
- ✅ Can view and order products from catalog
- ✅ Products shown without supplier details
- ✅ Can view own orders and purchase orders
- ✅ Informational notice about supplier management

### Scenario 3: Admin Read-Only Access Test

**Expected Behavior**: Admins should have read-only access to supplier information for support purposes.

**Test Steps**:
1. Login as admin
2. Navigate to `/suppliers`
3. Verify supplier list is visible
4. Try to click "Add Supplier" button (should not exist or be disabled)
5. Navigate to existing supplier details
6. Verify all information is visible but not editable
7. Try to access supplier creation URL directly

**Expected Results**:
- ✅ Can view supplier list and details
- ❌ Cannot create, edit, or delete suppliers
- ✅ Navigation shows supplier management with "Read Only" badge
- ❌ Write operations blocked with appropriate messages
- ✅ All supplier information visible for support purposes

### Scenario 4: Database Security Test

**Expected Behavior**: Database-level security should prevent unauthorized access regardless of frontend bypassing.

**Test Steps**:
1. Use the automated testing interface at `/test/supplier-access`
2. Run comprehensive tests for your current role
3. Verify database access results match expected permissions
4. Check that RLS policies are enforcing access control
5. Verify audit logging is working

**Expected Results**:
- ✅ Database access matches role permissions
- ✅ RLS policies block unauthorized queries
- ✅ Audit logs capture access attempts
- ✅ Error messages are role-appropriate
- ✅ No data leakage between organizations

## 🔍 Manual Testing Checklist

### Frontend Security Tests

- [ ] **Navigation Menu**: Supplier management only visible to appropriate roles
- [ ] **Route Guards**: Direct URL access blocked for unauthorized roles
- [ ] **UI Components**: Create/Edit buttons hidden for read-only users
- [ ] **Error Messages**: Appropriate messages for each role
- [ ] **Product Catalog**: Supplier information hidden from franchisees

### Backend Security Tests

- [ ] **API Endpoints**: Proper authorization middleware on all routes
- [ ] **Database Queries**: RLS policies enforcing access control
- [ ] **Role Verification**: User roles correctly identified and enforced
- [ ] **Organization Isolation**: Users can only access their organization's data
- [ ] **Audit Logging**: All access attempts logged with proper details

### Business Logic Tests

- [ ] **Franchisor Workflow**: Complete supplier management lifecycle
- [ ] **Franchisee Workflow**: Order placement without supplier visibility
- [ ] **Admin Support**: Read-only access for customer support
- [ ] **Data Integrity**: Supplier relationships maintained correctly
- [ ] **Performance**: System performs well with role-based filtering

## 🚨 Common Issues and Troubleshooting

### Issue: "Access Denied" for Franchisor Users

**Possible Causes**:
- User role not set correctly in database
- Organization membership not configured
- RLS policies too restrictive

**Solution**:
1. Check user_profiles table for correct role
2. Verify organization_members table has active membership
3. Test with the automated testing interface

### Issue: Franchisees Can See Supplier Information

**Possible Causes**:
- Frontend components not checking permissions
- API endpoints not enforcing restrictions
- Database queries bypassing RLS

**Solution**:
1. Verify useSupplierPermissions hook is used
2. Check API middleware is applied
3. Test database queries directly

### Issue: Database Connection Errors

**Possible Causes**:
- Supabase configuration issues
- RLS policies blocking legitimate access
- Missing database permissions

**Solution**:
1. Check Supabase connection settings
2. Verify RLS policies are correctly configured
3. Test with service role key for debugging

## 📊 Performance Testing

### Load Testing Scenarios

1. **Concurrent Franchisor Access**: Multiple franchisors accessing suppliers simultaneously
2. **Franchisee Order Volume**: High volume of franchisee orders without supplier access
3. **Admin Support Load**: Multiple admin users accessing read-only supplier data
4. **Database Query Performance**: RLS policy impact on query performance

### Performance Benchmarks

- Supplier list loading: < 2 seconds
- Supplier creation: < 3 seconds
- Role-based filtering: < 500ms additional overhead
- Database queries with RLS: < 1 second

## 🔧 Development Testing

### Unit Tests

Run the supplier management unit tests:
```bash
npm test -- --testPathPattern=supplier
```

### Integration Tests

Test the complete supplier workflow:
```bash
npm run test:integration -- supplier-management
```

### E2E Tests

Run end-to-end tests for all user roles:
```bash
npm run test:e2e -- supplier-access
```

## 📝 Test Reporting

### Automated Test Results

The testing interface at `/test/supplier-access` provides:
- Real-time test execution
- Detailed pass/fail results
- Error message analysis
- Performance metrics
- Database access verification

### Manual Test Documentation

Document your manual testing results:
- User role tested
- Test scenarios completed
- Issues discovered
- Performance observations
- Security verification results

## ✅ Sign-off Checklist

Before considering the supplier management system ready for production:

- [ ] All automated tests pass for all user roles
- [ ] Manual testing completed for each role
- [ ] Security verification confirms proper access control
- [ ] Performance meets established benchmarks
- [ ] Error handling provides appropriate user feedback
- [ ] Audit logging captures all required events
- [ ] Database security (RLS) properly configured
- [ ] Frontend components respect role-based permissions
- [ ] API endpoints enforce proper authorization
- [ ] Documentation updated with any changes

## 🎯 Success Criteria

The supplier management system is considered successfully implemented when:

1. **Franchisors** have complete control over their supplier network
2. **Franchisees** can efficiently place orders without supplier visibility
3. **Admins** can provide support with read-only access
4. **Users** are appropriately restricted from supplier functionality
5. **Security** is enforced at both frontend and database levels
6. **Performance** meets business requirements
7. **Audit trails** provide complete access logging
8. **Error handling** provides clear, role-appropriate feedback

---

*This testing guide ensures the supplier management system meets enterprise-grade security standards while maintaining optimal user experience for each role.*
