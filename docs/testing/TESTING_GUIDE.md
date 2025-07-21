# 🧪 Kustodia Nuevo-Flujo Testing Guide

## 🎯 Testing Objectives
Verify that all custody UI enhancements and mobile responsiveness improvements work correctly across different scenarios.

## 📋 Test Scenarios

### 🔒 1. Mandatory Custody Validation Tests

#### Test 1.1: Empty Custody Fields
1. Navigate to `/dashboard/nuevo-flujo`
2. Select any vertical (inmobiliaria, freelancer, etc.)
3. Fill payment amount, description, and beneficiary email
4. **Leave custody fields empty**
5. Try to click "Siguiente"
6. **Expected**: Button should be disabled and show alert message

#### Test 1.2: Invalid Custody Values
1. Fill all basic fields
2. Enter custody percentage < 1 or > 100
3. Enter custody period < 1 or > 365
4. **Expected**: Red borders around invalid fields, button disabled

#### Test 1.3: Valid Custody Configuration
1. Fill all required fields correctly
2. Enter custody percentage: 50-100
3. Enter custody period: 1-30 days
4. **Expected**: Fields show normal styling, "Siguiente" button enabled

### 🏢 2. Vertical-Specific Custody Tests

#### Test 2.1: Inmobiliaria Vertical
1. Select "Inmobiliarias y agentes"
2. **Expected**: Custody section visible ABOVE broker commission
3. **Expected**: Broker commission section visible (optional)
4. Complete form and verify custody data in payload

#### Test 2.2: All Other Verticals
1. Test each: freelancer, ecommerce, particulares, b2b, marketplace
2. **Expected**: Custody section visible for ALL verticals
3. **Expected**: No broker commission section (inmobiliaria only)
4. Verify custody configuration available in all cases

### 📱 3. Mobile Responsiveness Tests

#### Test 3.1: Mobile Layout (< 640px width)
1. Resize browser to mobile width or use device emulation
2. Navigate through form
3. **Expected**: 
   - Single column layout for vertical selection
   - Larger input padding (touch-friendly)
   - Full-width buttons
   - Column-stacked navigation buttons

#### Test 3.2: Desktop Layout (> 640px width)
1. Use full desktop browser width
2. Navigate through form
3. **Expected**:
   - Multi-column layout for vertical selection
   - Standard input padding
   - Row-based navigation buttons
   - Optimized spacing

#### Test 3.3: Responsive Transitions
1. Start on desktop, resize to mobile
2. Start on mobile, resize to desktop
3. **Expected**: Smooth layout adaptation without page refresh

### 🎨 4. Visual Validation Tests

#### Test 4.1: Required Field Indicators
1. Check all form fields
2. **Expected**: Asterisks (*) on mandatory fields
3. **Expected**: Clear visual hierarchy

#### Test 4.2: Error State Styling
1. Leave required fields empty
2. **Expected**: Red borders on invalid/empty fields
3. **Expected**: Error messages below fields

#### Test 4.3: Success State Styling
1. Fill all fields correctly
2. **Expected**: Normal border colors
3. **Expected**: No error messages
4. **Expected**: Enabled button states

### 🔄 5. Form Flow Tests

#### Test 5.1: Step Navigation
1. Complete form step by step
2. Test "Anterior" and "Siguiente" buttons
3. **Expected**: Proper step progression with validation

#### Test 5.2: Form Completion
1. Complete entire form with valid data
2. Click "Crear pago"
3. **Expected**: API call with proper custody configuration
4. Verify custody_percent and custody_period in request payload

#### Test 5.3: Form Reset/Back Navigation
1. Fill form partially
2. Go back to vertical selection
3. Return to form
4. **Expected**: Form state preserved or properly reset

## 🔧 Browser Testing Matrix

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest) 
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile
- [ ] Samsung Internet

### Screen Sizes
- [ ] Mobile: 375px width
- [ ] Tablet: 768px width
- [ ] Desktop: 1024px+ width

## 🐛 Common Issues to Check

### JavaScript Errors
- [ ] No console errors during form interaction
- [ ] Proper TypeScript compilation
- [ ] useWindowSize hook works correctly

### CSS Layout Issues
- [ ] No horizontal scroll on mobile
- [ ] Proper input field sizing
- [ ] Button alignment on all screen sizes

### Validation Logic
- [ ] Form submission properly blocked for invalid data
- [ ] All required fields checked before progression
- [ ] Error messages clear and helpful

## 📊 Success Criteria

### ✅ All Tests Pass When:
1. **Custody fields are mandatory** for all verticals
2. **Mobile layout adapts** properly at 640px breakpoint
3. **Validation prevents** invalid form submissions
4. **Visual feedback** is clear and immediate
5. **All verticals show** custody configuration section
6. **Performance** remains smooth during validation

### 🚨 Test Failures Indicate:
- Validation logic errors
- CSS responsiveness issues  
- TypeScript compilation problems
- State management bugs

## 🎯 Manual Testing Commands

```bash
# Start development server
npm run dev

# Run TypeScript checks
npm run type-check

# Run linting
npm run lint

# Build for production (test compilation)
npm run build
```

## 📋 Test Report Template

```
## Test Report - [Date]

### Environment:
- Browser: 
- Screen Size:
- Device:

### Test Results:
- [ ] Mandatory custody validation works
- [ ] All verticals show custody controls  
- [ ] Mobile responsiveness functions
- [ ] Form submission validation active
- [ ] Visual styling correct
- [ ] Performance acceptable

### Issues Found:
1. [Describe any issues]

### Overall Status: ✅ PASS / ❌ FAIL
```

---

**Remember**: These tests ensure the custody configuration enhancements meet all user requirements for mandatory validation, universal vertical access, and mobile responsiveness!
