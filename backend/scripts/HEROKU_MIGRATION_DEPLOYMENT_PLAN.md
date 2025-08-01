# 🚀 HEROKU PRODUCTION MIGRATION DEPLOYMENT PLAN

## 📋 **MIGRATION OVERVIEW**

Based on the schema comparison between local and production databases, we need to migrate **9 missing tables** and ensure all column additions are properly synced.

### **🔴 MISSING TABLES IN PRODUCTION:**
1. `etherfuse_customers` - Customer management for Etherfuse integration
2. `multisig_wallet_config` - Multi-signature wallet configurations
3. `multisig_wallet_owners` - Wallet ownership tracking
4. `multisig_approval_requests` - Transaction approval workflow
5. `multisig_signatures` - Digital signatures for approvals
6. `multisig_transaction_log` - Transaction execution history
7. `yield_activations` - Yield farming activations
8. `yield_earnings` - Daily yield calculations
9. `yield_payouts` - Yield distribution records

### **🟡 POTENTIAL COLUMN UPDATES:**
- User table: `portal_share`, `role`, `juno_bank_account_id`
- Payment table: `blockchain_tx_hash`, `juno_transaction_id`
- Escrow table: `smart_contract_escrow_id`, `blockchain_tx_hash`, `release_tx_hash`, `dispute_history`

---

## 🚨 **PRE-MIGRATION CHECKLIST**

### **1. BACKUP PRODUCTION DATABASE**
```bash
# Create backup before migration
heroku pg:backups:capture --app your-kustodia-app
heroku pg:backups --app your-kustodia-app
```

### **2. VERIFY HEROKU APP STATUS**
```bash
# Check app status
heroku ps --app your-kustodia-app
heroku logs --tail --app your-kustodia-app
```

### **3. ENABLE MAINTENANCE MODE (Optional)**
```bash
# Enable maintenance mode during migration
heroku maintenance:on --app your-kustodia-app
```

---

## 📝 **MIGRATION EXECUTION STEPS**

### **STEP 1: Connect to Heroku Postgres**
```bash
# Option A: Using Heroku CLI
heroku pg:psql --app your-kustodia-app

# Option B: Using connection string
heroku config:get DATABASE_URL --app your-kustodia-app
# Then connect with psql or pgAdmin
```

### **STEP 2: Execute Migration Script**
```sql
-- Copy and paste the contents of heroku-production-migration.sql
-- OR upload the file and execute:
\i /path/to/heroku-production-migration.sql
```

### **STEP 3: Verify Migration Success**
```sql
-- Check all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Verify new tables have correct structure
\d multisig_wallet_config
\d yield_activations
\d etherfuse_customers

-- Check indexes were created
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename;
```

### **STEP 4: Test Application Functionality**
```bash
# Disable maintenance mode
heroku maintenance:off --app your-kustodia-app

# Monitor application logs
heroku logs --tail --app your-kustodia-app

# Test key endpoints
curl https://your-app.herokuapp.com/api/health
curl https://your-app.herokuapp.com/api/payments
```

---

## 🔍 **POST-MIGRATION VALIDATION**

### **1. Database Schema Validation**
```sql
-- Count tables (should match local)
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

### **2. Application Health Checks**
- [ ] User authentication works
- [ ] Payment creation/processing works
- [ ] Escrow functionality works
- [ ] Email notifications work
- [ ] Blockchain transparency features work
- [ ] Timeline and tracker display correctly

### **3. Feature-Specific Tests**
- [ ] Multisig wallet creation (if implemented)
- [ ] Yield farming activation (if implemented)
- [ ] Etherfuse integration (if implemented)

---

## 🚨 **ROLLBACK PLAN**

### **If Migration Fails:**
```bash
# 1. Restore from backup
heroku pg:backups:restore BACKUP_ID --app your-kustodia-app

# 2. Or manually drop new tables (see rollback section in migration script)
heroku pg:psql --app your-kustodia-app
```

### **Emergency Rollback SQL:**
```sql
-- Drop new tables in dependency order
DROP TABLE IF EXISTS yield_payouts CASCADE;
DROP TABLE IF EXISTS yield_earnings CASCADE;
DROP TABLE IF EXISTS yield_activations CASCADE;
DROP TABLE IF EXISTS multisig_transaction_log CASCADE;
DROP TABLE IF EXISTS multisig_signatures CASCADE;
DROP TABLE IF EXISTS multisig_approval_requests CASCADE;
DROP TABLE IF EXISTS multisig_wallet_owners CASCADE;
DROP TABLE IF EXISTS multisig_wallet_config CASCADE;
DROP TABLE IF EXISTS etherfuse_customers CASCADE;
```

---

## ⚡ **DEPLOYMENT COMMANDS**

### **Complete Migration Workflow:**
```bash
# 1. Backup
heroku pg:backups:capture --app your-kustodia-app

# 2. Enable maintenance (optional)
heroku maintenance:on --app your-kustodia-app

# 3. Execute migration
heroku pg:psql --app your-kustodia-app < heroku-production-migration.sql

# 4. Verify and test
heroku pg:psql --app your-kustodia-app -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

# 5. Deploy latest code (if needed)
git push heroku main

# 6. Disable maintenance
heroku maintenance:off --app your-kustodia-app

# 7. Monitor
heroku logs --tail --app your-kustodia-app
```

---

## 📊 **EXPECTED RESULTS**

### **Before Migration:**
- **Production Tables:** 17 tables
- **Missing Features:** Multisig, Yield, Etherfuse

### **After Migration:**
- **Production Tables:** 26 tables (17 + 9 new)
- **New Features:** Full multisig support, yield farming, customer management
- **Enhanced Features:** Blockchain transparency, escrow improvements

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

**1. Foreign Key Constraint Errors**
```sql
-- Check if referenced tables exist first
SELECT tablename FROM pg_tables WHERE tablename IN ('users', 'payments', 'escrows');
```

**2. Column Already Exists Errors**
```sql
-- Check existing columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
```

**3. Permission Errors**
```bash
# Ensure you have proper Heroku permissions
heroku auth:whoami
heroku access --app your-kustodia-app
```

### **Performance Monitoring:**
```sql
-- Check table sizes after migration
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## ✅ **SUCCESS CRITERIA**

- [ ] All 9 missing tables created successfully
- [ ] All indexes created without errors
- [ ] Foreign key constraints established
- [ ] Application starts without database errors
- [ ] All existing functionality still works
- [ ] New features are available (if implemented)
- [ ] Performance remains acceptable
- [ ] Backup created and verified

---

## 📞 **SUPPORT CONTACTS**

- **Database Issues:** Check Heroku Postgres logs
- **Application Issues:** Monitor application logs
- **Migration Questions:** Review this guide and migration script comments

---

**🎉 Ready to execute the migration!**

The migration script is comprehensive and includes:
- ✅ Safe table creation with IF NOT EXISTS
- ✅ Proper foreign key relationships
- ✅ Performance indexes
- ✅ Rollback procedures
- ✅ Verification queries
- ✅ Error handling

Execute when ready! 🚀
