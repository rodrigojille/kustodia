# Kustodia Backend - SPEI Receipt System

🏦 **Production-ready backend system for secure cryptocurrency payments with compliant SPEI receipt generation**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your production values

# Build the application
npm run build

# Start the server
npm start
```

## 🎯 Key Features

### 💳 Payment Processing
- End-to-end payment processing with escrow system
- Automatic custody release after configurable period
- Multi-currency support (MXNB tokens)
- Blockchain-based security with smart contracts

### 📄 SPEI Receipt System
- **CEP-compliant SPEI receipts** (Banco de México standards)
- PDF and HTML receipt generation
- Digital signature and QR code verification
- Public authenticity verification API
- Automatic email delivery with attachments

### 🤖 Automation Services
- **Escrow release**: Every 10 minutes
- **Payout processing**: Every 2 minutes  
- **Deposit monitoring**: Every 1 minute
- **Receipt generation**: On payout completion

### 🔒 Security & Compliance
- JWT-based authentication
- Role-based access control
- Comprehensive audit logging
- Environment-based configuration
- Production security hardening

## 📁 Project Structure

```
backend/
├── src/                          # Source code
│   ├── controllers/              # API controllers
│   ├── services/                 # Business logic
│   │   └── speiReceiptService.ts # SPEI receipt generation
│   ├── routes/                   # API routes
│   │   └── speiReceipt.ts        # SPEI receipt endpoints
│   ├── entity/                   # Database entities
│   └── utils/                    # Utility functions
├── dist/                         # Compiled JavaScript (for Heroku)
├── scripts/                      # Utility scripts
│   ├── production/               # Production health checks
│   └── maintenance/              # Maintenance scripts
├── docs/                         # Documentation
│   ├── systems/                  # System documentation
│   ├── deployment/               # Deployment guides
│   ├── security/                 # Security documentation
│   ├── automation/               # Automation guides
│   ├── api/                      # API documentation
│   ├── troubleshooting/          # Troubleshooting guides
│   └── maintenance/              # Maintenance documentation
└── migrations/                   # Database migrations
```

## 🔧 Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kustodia
DB_USER=postgres
DB_PASSWORD=your_password

# Blockchain
ETH_RPC_URL=your_rpc_url
ESCROW_PRIVATE_KEY=your_private_key
ESCROW_CONTRACT_ADDRESS_2=your_contract_address

# Juno API (for SPEI transfers)
JUNO_API_KEY=your_juno_key
JUNO_API_SECRET=your_juno_secret
JUNO_WALLET=your_juno_wallet

# SPEI Receipts
SPEI_SIGNATURE_KEY=your_signature_key

# Security
JWT_SECRET=your_jwt_secret
```

## 🏥 Health Monitoring

Run comprehensive system health check:

```bash
# Full system validation
node scripts/production/comprehensive-final-health-check.js

# Basic health check
npx ts-node scripts/production/check-production-health.ts
```

## 📋 API Endpoints

### SPEI Receipt Endpoints
- `GET /api/payments/:id/spei-receipt` - Download PDF receipt
- `GET /api/payments/:id/spei-receipt/preview` - HTML preview
- `GET /api/payments/verify-receipt` - Public verification

### Core Payment Endpoints
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/:id/complete` - Complete payment

## 🚀 Deployment

### Heroku Deployment
1. **Repository is ready** - All files organized and committed
2. **Environment variables** - Set in Heroku dashboard
3. **Build process** - Automatic via `npm run build`
4. **Dependencies** - All production dependencies included

```bash
# Deploy to Heroku
git push heroku main

# Check deployment status
heroku logs --tail
```

## 📚 Documentation

- **[SPEI Receipt System](docs/systems/SPEI_RECEIPT_SYSTEM.md)** - Complete SPEI implementation guide
- **[Deployment Guide](docs/deployment/)** - Production deployment instructions
- **[Security Plan](docs/security/)** - Security implementation details
- **[API Documentation](docs/api/)** - Complete API reference
- **[Troubleshooting](docs/troubleshooting/)** - Common issues and solutions

## 🛠️ Development

```bash
# Development mode with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## 📊 System Capabilities

✅ **Production Ready Features:**
- End-to-end payment processing
- Automatic escrow release after custody period
- MXNB token redemption via Juno API
- SPEI transfer execution
- **Compliant SPEI receipt generation (PDF/HTML)**
- Email notifications with receipt attachments
- Public receipt authenticity verification
- Blockchain-based custody management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and health checks
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Check [troubleshooting documentation](docs/troubleshooting/)
- Review [system health checks](scripts/production/)
- Contact the development team

---

**Built with ❤️ for secure, compliant cryptocurrency payments**
