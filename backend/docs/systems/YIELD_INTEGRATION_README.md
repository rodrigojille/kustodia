# EtherFuse CETES Yield Integration

## Overview

This integration adds CETES-backed yield generation to Kustodia's escrow payment system using EtherFuse's API. Users can optionally activate yield generation on their escrowed payments to earn returns backed by Mexican government bonds.

## 🏗️ Architecture

### Database Schema
- **yield_activations**: Tracks yield activation per payment
- **yield_earnings**: Records daily yield calculations 
- **yield_payouts**: Manages final payouts on escrow completion
- **etherfuse_customers**: Links users to EtherFuse customer IDs

### Service Layer
- **EtherFuseService**: API integration with EtherFuse platform
- **YieldCalculationService**: Daily yield calculations and cron jobs
- **YieldController**: REST API endpoints for yield management

### Revenue Model
- **80%** yield earnings go to payer
- **20%** yield earnings go to platform (disputes)
- Minimum threshold: **$1 MXN**

## 📁 Files Created

### Database
```
backend/migrations/add_yield_generation_tables.sql
```
Complete database schema with tables, constraints, indexes, and triggers.

### Backend Services
```
backend/services/etherfuseService.js
backend/services/yieldCalculationService.js
backend/controllers/yieldController.js
backend/src/routes/yield.ts
```

### Configuration
```
backend/.env.yield.example
```

### Frontend Updates
```
kustodia-next/src/app/page.tsx (lines 799-1020)
kustodia-next/src/components/NuevoFlujoTracker.tsx (line 497)
```

## 🚀 API Endpoints

### Yield Management
- `POST /api/yield/payments/:id/activate-yield` - Activate yield for payment
- `GET /api/yield/payments/:id/yield-status` - Get current yield status
- `GET /api/yield/payments/:id/yield-history` - Get earnings history
- `POST /api/yield/etherfuse/webhook` - EtherFuse webhook handler

### Admin Endpoints
- `POST /api/yield/admin/calculate-yields` - Manual calculation trigger
- `GET /api/yield/admin/health` - Service health check
- `GET /api/yield/admin/stats` - Yield statistics

## ⚙️ Environment Variables

Required variables (see `.env.yield.example`):

```bash
# EtherFuse API
ETHERFUSE_API_KEY=your_api_key
ETHERFUSE_API_SECRET=your_api_secret  
ETHERFUSE_MERCHANT_ID=your_merchant_id
BASE_URL=https://kustodia.mx

# Database (existing)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=kustodia

# Optional Configuration
YIELD_MINIMUM_THRESHOLD=1.00
YIELD_PAYER_PERCENTAGE=0.80
YIELD_PLATFORM_PERCENTAGE=0.20
```

## 📋 Implementation Steps

### 1. Database Migration
```sql
-- Run the migration script
psql -d kustodia -f backend/migrations/add_yield_generation_tables.sql
```

### 2. Environment Setup
```bash
# Copy environment template
cp backend/.env.yield.example backend/.env

# Fill in actual EtherFuse credentials
nano backend/.env
```

### 3. Dependencies Installation
```bash
cd backend
npm install node-cron
# All other dependencies already exist in package.json
```

### 4. Server Integration
The yield routes are already integrated in `src/index.ts`:
```typescript
import yieldRoutes from './routes/yield';
app.use('/api/yield', yieldRoutes);
```

### 5. EtherFuse Account Setup
1. Create EtherFuse merchant account
2. Complete KYC/compliance verification
3. Obtain API credentials
4. Configure webhook endpoints

## 🧪 Testing

### Manual Testing Flow
1. **Activate Yield**: `POST /api/yield/payments/123/activate-yield`
2. **Check Status**: `GET /api/yield/payments/123/yield-status`
3. **Trigger Calculation**: `POST /api/yield/admin/calculate-yields`
4. **View History**: `GET /api/yield/payments/123/yield-history`

### Test Data Examples
```bash
# Activate yield (requires authentication header)
curl -X POST http://localhost:4000/api/yield/payments/123/activate-yield \
  -H "x-user-email: test@kustodia.mx" \
  -H "Content-Type: application/json"

# Check yield status
curl -X GET http://localhost:4000/api/yield/payments/123/yield-status \
  -H "x-user-email: test@kustodia.mx"

# Admin health check
curl -X GET http://localhost:4000/api/yield/admin/health
```

## 📊 Monitoring & Operations

### Daily Cron Jobs
- **Yield Calculation**: 2:00 AM Mexico City time
- **Health Check**: Every hour
- **EtherFuse Sync**: Via webhooks + daily batch

### Key Metrics to Monitor
- Active yield activations
- Total earnings generated
- Average annual rates
- Failed calculations
- EtherFuse API health

### Logging
All services include comprehensive logging:
- 🚀 Activation events
- 💰 Daily earnings calculations  
- ✅ Successful operations
- ❌ Errors and failures
- 📡 Webhook events

## 🔐 Security Considerations

### Authentication
- User authentication via existing JWT/session system
- Admin endpoints require elevated permissions
- EtherFuse webhooks use signature verification

### Data Protection
- API keys stored in environment variables
- Database constraints prevent data corruption
- Webhook signature validation prevents spoofing

### Compliance
- KYC integration via existing Truora system
- CNBV regulatory compliance via EtherFuse
- Audit trail for all yield transactions

## 🎯 Production Deployment

### Pre-Launch Checklist
- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] EtherFuse API credentials validated
- [ ] Webhook endpoints configured
- [ ] SSL certificates for webhooks
- [ ] Monitoring alerts configured
- [ ] Beta user testing completed

### Launch Configuration
1. Update `NODE_ENV=production`
2. Configure production database URLs
3. Set up EtherFuse production API endpoints
4. Enable monitoring and alerting
5. Configure backup strategies

## 🚨 Troubleshooting

### Common Issues

**Yield not activating:**
- Check EtherFuse API credentials
- Verify customer KYC status
- Check payment status (must be approved/funded)

**Daily calculations failing:**
- Check database connectivity
- Verify EtherFuse API health
- Review cron job logs

**Webhook not receiving:**
- Verify webhook URL is accessible
- Check signature verification
- Review EtherFuse webhook configuration

### Debug Commands
```bash
# Check service health
curl http://localhost:4000/api/yield/admin/health

# View database tables
psql -d kustodia -c "SELECT * FROM yield_activations LIMIT 5;"

# Manual calculation trigger
curl -X POST http://localhost:4000/api/yield/admin/calculate-yields
```

## 📈 Future Enhancements

### Phase 2 Features
- Real-time yield tracking
- Multiple investment products
- Enhanced analytics dashboard
- Mobile app integration
- Advanced risk management

### Technical Improvements
- Redis caching for performance
- GraphQL API for complex queries
- Microservices architecture
- Enhanced monitoring with Prometheus

## 📞 Support

### Documentation
- EtherFuse API: https://docs.etherfuse.com/initial-setup
- CETES Information: https://banxico.org.mx/

### Key Contacts
- EtherFuse Support: support@etherfuse.com
- CNBV Compliance: https://www.cnbv.gob.mx/

---

**🎯 MVP Target: August 2025**  
**🔥 Beta Testing: Early Access Users**  
**💰 Expected Returns: 7.2% annual (CETES rate)**
