# Heroku Database Migration Instructions

## Prerequisites
- Heroku CLI installed and logged in
- Access to your Heroku app with PostgreSQL addon

## Step 1: Connect to Heroku Postgres
```bash
# Get your DATABASE_URL
heroku config:get DATABASE_URL -a your-app-name

# Connect to Heroku Postgres
heroku pg:psql -a your-app-name
```

## Step 2: Execute Migration
Copy and paste the SQL commands from `heroku_migration_plan.sql`:

```sql
-- Add portal_share column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS portal_share VARCHAR(128);

-- Add role column with default
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Add juno_bank_account_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS juno_bank_account_id VARCHAR(64);
```

## Step 3: Verify Migration
```sql
-- Check columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('portal_share', 'role', 'juno_bank_account_id')
ORDER BY column_name;

-- Check existing users have default role
SELECT id, email, role FROM users LIMIT 5;
```

## Alternative: One-liner Migration
```bash
# Execute all at once via Heroku CLI
heroku pg:psql -a your-app-name -c "
ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_share VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS juno_bank_account_id VARCHAR(64);"
```

## Safety Notes
✅ **All columns are SAFE to add:**
- All new columns are nullable or have defaults
- No data loss risk
- No breaking changes
- Can be rolled back if needed

⚠️ **Best Practices:**
- Run during low-traffic period
- Test on staging environment first
- Backup database before migration (Heroku auto-backups)
- Monitor application logs after deployment

## Post-Migration
After successful migration, deploy your updated backend code to Heroku:
```bash
git push heroku main
```
