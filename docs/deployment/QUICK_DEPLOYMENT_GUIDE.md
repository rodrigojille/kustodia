# ⚡ QUICK DEPLOYMENT GUIDE - KUSTODIA

## 🚀 **IMMEDIATE DEPLOYMENT STEPS**

### **1. Platform Deployment (Choose One)**

#### **Option A: Heroku**
```bash
# Add Heroku remote (if not already added)
heroku git:remote -a your-app-name

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd ../frontend
# Follow Heroku Node.js deployment guide
```

#### **Option B: Netlify/Vercel**
```bash
# Connect your GitHub repository
# Platform will auto-deploy from main branch
# Set build command: npm run build
# Set publish directory: dist/ (backend) or .next/ (frontend)
```

### **2. Environment Variables Setup**

Copy from `.env.example` and set these **REQUIRED** variables:

#### **Database**
```
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=kustodia
```

#### **Juno API**
```
JUNO_API_KEY=your-juno-api-key
JUNO_ENVIRONMENT=sandbox  # or production
JUNO_BASE_URL=https://api.juno.com.br
```

#### **Google OAuth**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
```

#### **JWT & Security**
```
JWT_SECRET=your-super-secure-jwt-secret-key
```

#### **Blockchain**
```
RPC_URL=https://your-blockchain-rpc-url
PRIVATE_KEY=9412cdee7af7810add2d3a516f5b0ff9aeaea05e56a0fa6fc91ddbef3fc0828e
ESCROW_PRIVATE_KEY=9412cdee7af7810add2d3a516f5b0ff9aeaea05e56a0fa6fc91ddbef3fc0828e
```

### **3. Database Setup**
```sql
-- Your database should already have the correct schema
-- If needed, run migrations:
npm run migration:run
```

### **4. Verify Deployment**
- [ ] Visit your deployed URL
- [ ] Test user login
- [ ] Check admin panel access
- [ ] Verify payment creation
- [ ] Test Juno integration

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **Authentication Errors**
- Check Google OAuth credentials
- Verify JWT_SECRET is set
- Confirm callback URL matches deployment URL

#### **Database Connection**
- Verify DATABASE_URL format
- Check database credentials
- Ensure database is accessible from deployment platform

#### **Juno API Issues**
- Confirm JUNO_API_KEY is correct
- Check JUNO_ENVIRONMENT setting
- Verify Juno webhook URLs

### **Quick Fixes**
```bash
# Check logs
heroku logs --tail  # for Heroku
# or check platform-specific logs

# Restart application
heroku restart  # for Heroku
# or redeploy on other platforms
```

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Code pushed to GitHub main branch
- [ ] Platform deployment configured
- [ ] Environment variables set
- [ ] Database connected
- [ ] Google OAuth configured
- [ ] Juno API credentials set
- [ ] JWT secret configured
- [ ] Blockchain keys set
- [ ] Application accessible
- [ ] Authentication working
- [ ] Payments functional
- [ ] Admin panel accessible

---

## 🎯 **SUCCESS CRITERIA**

Your deployment is successful when:
- ✅ Users can log in with Google OAuth
- ✅ Payment creation works
- ✅ Admin panel is accessible
- ✅ Juno integration responds
- ✅ No critical errors in logs

**Your Kustodia payment system is now LIVE! 🚀**
