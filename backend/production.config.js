/**
 * Production Configuration
 * Environment-specific settings for production deployment
 */

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 4000,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.FRONTEND_URL || 'https://kustodia.mx',
      credentials: true
    }
  },

  // Database Configuration
  database: {
    type: 'postgres',
    url: process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    synchronize: false, // Never auto-sync in production
    logging: process.env.NODE_ENV !== 'production',
    entities: ['dist/entities/*.js'],
    migrations: ['dist/migrations/*.js'],
    subscribers: ['dist/subscribers/*.js']
  },

  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    bcrypt: {
      saltRounds: 12
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Blockchain Configuration
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
    escrowContractAddress: process.env.KUSTODIA_ESCROW_V3_ADDRESS,
    escrowPrivateKey: process.env.ESCROW_PRIVATE_KEY,
    bridgeWallet: process.env.ESCROW_BRIDGE_WALLET,
    junoWallet: process.env.JUNO_WALLET
  },

  // Juno API Configuration
  juno: {
    environment: process.env.JUNO_ENV || 'stage',
    apiKey: process.env.JUNO_API_KEY,
    apiSecret: process.env.JUNO_API_SECRET,
    baseUrl: process.env.JUNO_ENV === 'production' 
      ? 'https://api.juno.com' 
      : 'https://api-stage.juno.com'
  },

  // SPEI Receipt Configuration
  speiReceipt: {
    signatureKey: process.env.SPEI_SIGNATURE_KEY,
    bankName: 'Nvio',
    institutionCode: '90969',
    certificateSerial: 'CERT-2024-NVIO-001'
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'no-reply@kustodia.mx',
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },

  // File Upload Configuration
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    destination: 'uploads/'
  },

  // Automation Configuration
  automation: {
    escrowRelease: {
      interval: '*/10 * * * *', // Every 10 minutes
      custodyPeriod: 2 * 24 * 60 * 60 * 1000 // 2 days in milliseconds
    },
    payoutProcessing: {
      interval: '*/2 * * * *', // Every 2 minutes
      batchSize: 10
    },
    depositMonitoring: {
      interval: '*/1 * * * *', // Every minute
      confirmations: 12
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    file: {
      enabled: true,
      filename: 'logs/app.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }
  },

  // Health Check Configuration
  healthCheck: {
    enabled: true,
    endpoint: '/health',
    interval: 60000, // 1 minute
    timeout: 5000 // 5 seconds
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    metrics: {
      enabled: true,
      endpoint: '/metrics'
    },
    alerts: {
      enabled: true,
      webhook: process.env.ALERT_WEBHOOK_URL
    }
  }
};
