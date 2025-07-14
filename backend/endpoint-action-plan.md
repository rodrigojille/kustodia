# KUSTODIA ENDPOINT & AUTHENTICATION ACTION PLAN

## 🔍 CRITICAL FINDINGS

### 1. **ENDPOINT CONFUSION IDENTIFIED**
- **Dashboard components** use: `authFetch("payments")`
- **This proxies to**: `/api/payments` 
- **Backend route**: `/api/payments` - **LIKELY ADMIN-ONLY**
- **User-specific route**: `/api/payments/user-payments`

### 2. **USER DATA STATUS** ✅
- **4 users total**: All have good data completeness (80-100%)
- **User 2 (rodrigojille6@gmail.com)**: ADMIN role ✅
- **Authentication data**: All users have proper Juno bank IDs and CLABEs

### 3. **PAYMENT DATA STATUS** ✅
- **20 recent payments**: Good distribution across statuses
- **No orphaned payments**: All have proper user references
- **Recent nuevo_flujo payments**: Working correctly (escrowed status)

## 🎯 ROOT CAUSE ANALYSIS

### **The Real Issue**: ENDPOINT PERMISSION MISMATCH

```
Dashboard Components → authFetch("payments") → /api/payments
                                                     ↓
                                            ADMIN-ONLY ENDPOINT?
                                                     ↓
                                            Regular users get 403/500
```

### **Expected vs Actual**:
- **Expected**: Dashboard shows user's own payments
- **Actual**: Dashboard tries to fetch ALL payments (admin endpoint)
- **Result**: Cards break for non-admin users

## 🔧 IMMEDIATE ACTION PLAN

### **Phase 1: Verify Backend Endpoint Behavior**

1. **Check `/api/payments` controller**:
   ```bash
   # Test what /api/payments actually returns
   # Is it filtered by user or returns all payments?
   ```

2. **Check `/api/payments/user-payments` controller**:
   ```bash
   # Verify this returns user-specific payments
   ```

3. **Test with different user roles**:
   - Admin user (rodrigojille6@gmail.com)
   - Regular user (rodrigo.jimenez@crehana.com)

### **Phase 2: Fix Frontend Components**

**Option A**: If `/api/payments` should be user-filtered:
- Keep current `authFetch("payments")`
- Fix backend to filter by user

**Option B**: If `/api/payments` is admin-only:
- Change dashboard components to `authFetch("user-payments")`
- Keep admin dashboard using `authFetch("/api/admin/payments")`

### **Phase 3: Authentication Flow Verification**

1. **Test JWT token contents**:
   ```javascript
   // Check what's in the token
   const token = localStorage.getItem('auth_token');
   console.log(JSON.parse(atob(token.split('.')[1])));
   ```

2. **Verify proxy behavior**:
   ```javascript
   // Test direct vs proxied calls
   authFetch("payments") vs fetch("/api/payments")
   ```

## 🛠️ SPECIFIC FIXES NEEDED

### **1. Backend Route Analysis**
```typescript
// Check paymentController.ts
// What does getAllPayments() actually do?
// Does it filter by req.user.id or return all?
```

### **2. Frontend Component Strategy**
```typescript
// Current (potentially broken):
authFetch("payments") // → /api/payments (admin?)

// Option 1 (if backend filters):
authFetch("payments") // → /api/payments (user-filtered)

// Option 2 (if admin-only):
authFetch("user-payments") // → /api/payments/user-payments
```

### **3. Role-Based Routing**
```typescript
// Smart component that uses correct endpoint based on user role
const usePaymentsEndpoint = (user) => {
  return user?.role === 'admin' ? 'admin/payments' : 'user-payments';
};
```

## 🧪 TESTING STRATEGY

### **Step 1: Backend Endpoint Testing**
```bash
# Test as admin user
curl -H "Authorization: Bearer <admin_token>" http://localhost:4000/api/payments

# Test as regular user  
curl -H "Authorization: Bearer <user_token>" http://localhost:4000/api/payments

# Test user-specific endpoint
curl -H "Authorization: Bearer <user_token>" http://localhost:4000/api/payments/user-payments
```

### **Step 2: Frontend Component Testing**
1. Login as admin → Check if dashboard cards work
2. Login as regular user → Check if dashboard cards break
3. Test with browser dev tools → Check network requests

### **Step 3: Authentication Flow Testing**
1. Check localStorage token presence
2. Verify proxy route behavior
3. Test cookie vs localStorage authentication

## 📋 IMPLEMENTATION CHECKLIST

- [ ] **Analyze backend `/api/payments` controller behavior**
- [ ] **Test endpoint responses with different user roles**
- [ ] **Determine correct endpoint strategy**
- [ ] **Update frontend components if needed**
- [ ] **Add proper error handling for failed requests**
- [ ] **Test authentication flow end-to-end**
- [ ] **Verify admin vs user permission separation**
- [ ] **Add loading states for all data fetching**

## 🚨 CRITICAL DECISION POINT

**We need to determine**: 
- Should `/api/payments` filter by user ID automatically?
- Or should dashboard components use `/api/payments/user-payments`?

**This decision affects**:
- All dashboard components
- User experience
- Security model
- Admin functionality

## 🎯 NEXT IMMEDIATE STEPS

1. **Check the actual `/api/payments` controller code**
2. **Test the endpoint with both admin and regular users**
3. **Make the definitive decision on endpoint strategy**
4. **Implement the fix consistently across all components**

---

**Status**: 🔴 **ANALYSIS COMPLETE - AWAITING ENDPOINT VERIFICATION**
