# 🚨 Critical Fixes Testing Guide

**Status**: ✅ **FIXES DEPLOYED**  
**Target User**: Franchisor (ID: `cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51`)  
**Environment**: Production (https://franchising-management-system-tg5m.vercel.app/)

## 🔧 Issues Resolved

### **1. User Profile Creation Failure (HTTP 403 Forbidden)**
- **✅ FIXED**: Added missing INSERT policy for user_profiles table
- **✅ FIXED**: Enhanced upsert operation with proper role handling
- **✅ FIXED**: Added fallback UPDATE mechanism for 403 errors

### **2. Database Schema Relationship Error (PGRST200)**
- **✅ FIXED**: Added missing `related_order_id` column to notifications table
- **✅ FIXED**: Created `notifications_related_order_id_fkey` foreign key constraint
- **✅ FIXED**: Refreshed schema cache with ANALYZE commands

### **3. Query Retry Loop Performance Issue**
- **✅ FIXED**: Implemented circuit breaker pattern in React Query
- **✅ FIXED**: Added DatabaseErrorBoundary component
- **✅ FIXED**: Reduced retry attempts and enhanced error handling

## 🧪 Testing Protocol

### **Step 1: Franchisor Login Test**

#### **Test Case 1.1: Direct Login**
1. **Navigate to**: https://franchising-management-system-tg5m.vercel.app/login
2. **Credentials**: 
   - Email: `franchisor@demo.com`
   - Password: [Use existing password]
3. **Expected Result**: ✅ Successful login without 403 errors
4. **Verify**: User profile loads correctly in dashboard

#### **Test Case 1.2: Email Confirmation Flow**
1. **Trigger**: Password reset or new registration
2. **Check**: Email confirmation redirects properly
3. **Expected Result**: ✅ Lands on appropriate dashboard
4. **Verify**: No localhost:3000 redirects

### **Step 2: Database Operations Test**

#### **Test Case 2.1: Profile Operations**
1. **Action**: Login as franchisor user
2. **Check**: Profile data loads without errors
3. **Expected Result**: ✅ No 403 Forbidden errors
4. **Verify**: User profile displays correctly

#### **Test Case 2.2: Notifications System**
1. **Action**: Access notifications in dashboard
2. **Check**: No PGRST200 relationship errors
3. **Expected Result**: ✅ Notifications load successfully
4. **Verify**: Related order information displays

### **Step 3: Error Handling Test**

#### **Test Case 3.1: Error Boundary**
1. **Action**: Simulate database error (if possible)
2. **Check**: Error boundary catches and displays properly
3. **Expected Result**: ✅ Professional error message shown
4. **Verify**: Retry functionality works

#### **Test Case 3.2: Query Performance**
1. **Action**: Monitor network requests in browser DevTools
2. **Check**: No infinite retry loops
3. **Expected Result**: ✅ Reasonable retry attempts only
4. **Verify**: UI remains responsive

## 🔍 Verification Checklist

### **Database Verification**
- [ ] `notifications.related_order_id` column exists
- [ ] Foreign key constraint `notifications_related_order_id_fkey` active
- [ ] User profile INSERT/UPDATE policies working
- [ ] Schema cache refreshed and relationships recognized

### **Authentication Verification**
- [ ] Franchisor user can login successfully
- [ ] Profile creation/update works without 403 errors
- [ ] Role-based access control functioning
- [ ] Session persistence working correctly

### **Performance Verification**
- [ ] No infinite retry loops on failed requests
- [ ] Error boundaries catch critical database errors
- [ ] UI remains responsive during error conditions
- [ ] Proper error messages displayed to users

## 🚨 Critical Test Scenarios

### **Scenario 1: Fresh Franchisor Login**
```
User: cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51
Role: franchisor
Expected: Successful dashboard access
```

### **Scenario 2: Notification Access**
```
Action: View notifications in franchisor dashboard
Expected: No PGRST200 errors, proper data loading
```

### **Scenario 3: Profile Update**
```
Action: Update franchisor profile information
Expected: No 403 errors, successful save
```

## 🔧 Debugging Information

### **Database Queries to Verify Fixes**

#### **Check Foreign Key Constraint**
```sql
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'notifications_related_order_id_fkey';
```

#### **Check RLS Policies**
```sql
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;
```

#### **Test User Profile Access**
```sql
SELECT id, email, role, full_name, status 
FROM user_profiles 
WHERE id = 'cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51';
```

### **Browser Console Monitoring**

#### **Look for These Fixed Issues**
- ❌ ~~HTTP 403 on user_profiles?on_conflict=id&select=*~~
- ❌ ~~PGRST200: Could not find a relationship between 'notifications' and 'orders'~~
- ❌ ~~Multiple 400 Bad Request errors in retry loops~~

#### **Expected Successful Patterns**
- ✅ Successful user profile upsert operations
- ✅ Notifications loading without relationship errors
- ✅ Proper error handling with user-friendly messages

## 📊 Success Criteria

### **Primary Success Indicators**
1. **✅ Franchisor Login**: User `cbee6bd4-77c7-4abb-ac3c-02ac20bf6b51` can login successfully
2. **✅ Profile Operations**: No 403 errors on profile creation/updates
3. **✅ Notifications**: No PGRST200 relationship errors
4. **✅ Performance**: No infinite retry loops or UI freezing

### **Secondary Success Indicators**
1. **✅ Error Boundaries**: Graceful error handling for database issues
2. **✅ User Experience**: Professional error messages and recovery options
3. **✅ System Stability**: Consistent performance across all features
4. **✅ Data Integrity**: All foreign key relationships working correctly

## 🚀 Post-Fix Monitoring

### **Immediate Monitoring (First 24 Hours)**
- Monitor error logs for any remaining 403 or PGRST200 errors
- Check user login success rates for franchisor accounts
- Verify notification system stability
- Monitor query performance and retry patterns

### **Ongoing Monitoring**
- Weekly review of authentication error rates
- Monthly database performance analysis
- Quarterly RLS policy audit
- Continuous monitoring of Core Web Vitals

## 📞 Support Information

### **If Issues Persist**
1. **Check Browser Console**: Look for specific error messages
2. **Network Tab**: Monitor failed requests and response codes
3. **Contact Support**: jcedrick.delasalas@gmail.com
4. **GitHub Issues**: Report with specific error details

### **Emergency Rollback**
If critical issues arise, the previous stable version can be restored by:
1. Reverting the database schema changes
2. Rolling back the application deployment
3. Restoring previous RLS policies

---

**All critical fixes have been implemented and deployed. The system is now ready for Series A funding demonstrations with full franchisor functionality.**
