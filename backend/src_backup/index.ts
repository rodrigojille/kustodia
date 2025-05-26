import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ormconfig from "./ormconfig";
import * as Sentry from "@sentry/node";
import "./utils/sentry"; // Inicializa Sentry (usa el DSN de env)

import mainRouter from "./routes";
import leadRoutes from './routes/lead';
import earlyAccessCounterRoutes from './routes/earlyAccessCounter';

dotenv.config();

const app = express();

// Middleware manual para capturar errores con Sentry (si los handlers no existen)
app.use((req, res, next) => {
  try {
    next();
  } catch (err) {
    Sentry.captureException(err);
    next(err);
  }
});

app.use(express.json());

// Enable CORS for frontend dev server
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Explicit preflight handler for all routes
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to Postgres
ormconfig.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    // Basic health check
    app.get("/", (req, res) => {
      res.json({ status: "Kustodia backend running" });
    });
    // Mount all API routes
    app.use("/api", mainRouter);
    app.use('/api/leads', leadRoutes);
    app.use('/api/early-access-counter', earlyAccessCounterRoutes);


    // Middleware manual para capturar errores con Sentry (si los handlers no existen)
    app.use((err: unknown, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
      Sentry.captureException(err);
      res.status(500).json({ error: 'Internal server error' });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    Sentry.captureException(err);
    console.error("Error during Data Source initialization:", err);
  });
