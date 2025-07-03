import "reflect-metadata";
import dotenv from "dotenv";
import path from 'path';

// Load environment variables from .env file before any other imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from "express";
import cors from "cors";
import ormconfig from "./ormconfig";
import { PaymentAutomationService } from "./services/PaymentAutomationService";

import mainRouter from "./routes";
import leadRoutes from './routes/lead';
import junoRoutes from './routes/juno';
import automationRoutes from './routes/automation';
import supportRoutes from './routes/support';
import ticketRoutes from './routes/ticket';
import earlyAccessCounterRoutes from './routes/earlyAccessCounter';
import { createYieldRoutes } from './routes/yield';

const app = express();
app.use(express.json());

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
  allowedHeaders: ['Content-Type', 'Authorization'],
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
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to Postgres
ormconfig.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");
    
    // Initialize Payment Automation Service
    const paymentAutomation = new PaymentAutomationService();
    await paymentAutomation.startAutomation();
    
    // Basic health check
    app.get("/", (req, res) => {
      res.json({ status: "Kustodia backend running" });
    });
    // Mount all API routes
    app.use("/api", mainRouter);
    app.use('/api/leads', leadRoutes);
    app.use('/api/automation', automationRoutes);
    app.use('/api/juno', junoRoutes);
    app.use('/api/support', supportRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/early-access-counter', earlyAccessCounterRoutes);
    app.use('/api/yield', createYieldRoutes(ormconfig));
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
