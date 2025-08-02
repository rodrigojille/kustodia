import "reflect-metadata";

import dotenv from "dotenv";
import path from 'path';

// Load environment variables from .env file before any other imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ormconfig from "./ormconfig";
import { PaymentAutomationService } from "./services/PaymentAutomationService";
import passport, { configurePassport } from './services/passport';
import { initializeJunoService } from "./services/junoService";

import mainRouter from "./routes";
import leadRoutes from './routes/lead';
import paymentRoutes from './routes/payment';
import authRoutes from './routes/authRoutes';
import automationRoutes from './routes/automation';
import supportRoutes from './routes/support';
import ticketRoutes from './routes/ticket';
import disputeMessageRoutes from './routes/disputeMessages';
import earlyAccessCounterRoutes from './routes/earlyAccessCounter';
import { createYieldRoutes } from './routes/yield';
import analyticsRoutes from './routes/analytics';
import assetNFTRoutes from './routes/assetNFTRoutes';
import publicHistoryRoutes from './routes/publicHistory';
import portalPaymentRoutes from './routes/portalPayment';
import web3PaymentRoutes from './routes/web3Payment';
import multisigRoutes from './routes/multisig';
import createPreApprovalRoutes from './routes/preApprovalRoutes';
import blacklistRoutes from './routes/blacklistRoutes';
import operationsControlRoomRoutes from './routes/operationsControlRoomRoutes';

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser()); // Enable cookie parsing for JWT authentication
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Enable CORS for frontend dev server
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://kustodia.mx',
  'https://www.kustodia.mx'
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalizedOrigin = origin.toLowerCase();
  return allowedOrigins.some(o => normalizedOrigin === o.toLowerCase());
}

app.use(cors({
  origin: function(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));

// Explicit preflight handler for all routes
app.options('*', cors({
  origin: function(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));

async function main() {
  try {
    // Connect to Postgres and wait for it to be ready
    await ormconfig.initialize();
    console.log("Data Source has been initialized!");

    // Configure passport strategies now that DB is connected
    configurePassport();

    // Initialize Juno service to ensure API keys are loaded
    initializeJunoService();

    // Now that the DB is connected, we can configure and start the server.
    // Initialize Payment Automation Service
    const paymentAutomation = new PaymentAutomationService();
    await paymentAutomation.startAutomation();

    // Serve uploaded files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Basic health check
    app.get("/", (req, res) => {
      res.json({ status: "Kustodia backend running" });
    });

    app.get("/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    app.get("/api/health/db", async (req, res) => {
      try {
        const isConnected = ormconfig.isInitialized;
        if (isConnected) {
          await ormconfig.query('SELECT 1');
          res.json({ status: "connected", database: ormconfig.options.database });
        } else {
          res.status(500).json({ status: "not_initialized" });
        }
      } catch (error) {
        res.status(500).json({ 
          status: "error", 
          details: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Mount all API routes
    console.log('Mounting mainRouter at /api');
    app.use("/api", mainRouter);
    console.log('Mounting leadRoutes at /api/leads');
    app.use('/api/leads', leadRoutes);

    // Auth routes
    app.use(passport.initialize());
    app.use('/api/auth', authRoutes);
    app.use('/api/support', supportRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/disputes', disputeMessageRoutes);
    app.use('/api/early-access-counter', earlyAccessCounterRoutes);
    app.use('/api/yield', createYieldRoutes(ormconfig));
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/assets', assetNFTRoutes);
    app.use('/api/public', publicHistoryRoutes);
    app.use('/api/portal', portalPaymentRoutes);
    app.use('/api/web3-payment', web3PaymentRoutes);
    app.use('/api/multisig', multisigRoutes);
    app.use('/api/blacklist', blacklistRoutes);
    app.use('/api/operations', operationsControlRoomRoutes);
    
    // Create pool for preApproval routes
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    app.use('/api/pre-approval', createPreApprovalRoutes(pool));


    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });

  } catch (err) {
    console.error("Error during application startup:", err);
    process.exit(1);
  }
}

main();
