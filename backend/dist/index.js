"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file before any other imports
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ormconfig_1 = __importDefault(require("./ormconfig"));
const PaymentAutomationService_1 = require("./services/PaymentAutomationService");
const passport_1 = __importStar(require("./services/passport"));
const junoService_1 = require("./services/junoService");
const routes_1 = __importDefault(require("./routes"));
const lead_1 = __importDefault(require("./routes/lead"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const support_1 = __importDefault(require("./routes/support"));
const ticket_1 = __importDefault(require("./routes/ticket"));
const disputeMessages_1 = __importDefault(require("./routes/disputeMessages"));
const earlyAccessCounter_1 = __importDefault(require("./routes/earlyAccessCounter"));
const yield_1 = require("./routes/yield");
const analytics_1 = __importDefault(require("./routes/analytics"));
const assetNFTRoutes_1 = __importDefault(require("./routes/assetNFTRoutes"));
const publicHistory_1 = __importDefault(require("./routes/publicHistory"));
const portalPayment_1 = __importDefault(require("./routes/portalPayment"));
const web3Payment_1 = __importDefault(require("./routes/web3Payment"));
const multisig_1 = __importDefault(require("./routes/multisig"));
const preApprovalRoutes_1 = __importDefault(require("./routes/preApprovalRoutes"));
const blacklistRoutes_1 = __importDefault(require("./routes/blacklistRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '5mb' }));
app.use((0, cookie_parser_1.default)()); // Enable cookie parsing for JWT authentication
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Enable CORS for frontend dev server
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://kustodia.mx',
    'https://www.kustodia.mx'
];
function isAllowedOrigin(origin) {
    if (!origin)
        return true;
    const normalizedOrigin = origin.toLowerCase();
    return allowedOrigins.some(o => normalizedOrigin === o.toLowerCase());
}
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));
// Explicit preflight handler for all routes
app.options('*', (0, cors_1.default)({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        else {
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
        await ormconfig_1.default.initialize();
        console.log("Data Source has been initialized!");
        // Configure passport strategies now that DB is connected
        (0, passport_1.configurePassport)();
        // Initialize Juno service to ensure API keys are loaded
        (0, junoService_1.initializeJunoService)();
        // Now that the DB is connected, we can configure and start the server.
        // Initialize Payment Automation Service
        const paymentAutomation = new PaymentAutomationService_1.PaymentAutomationService();
        await paymentAutomation.startAutomation();
        // Serve uploaded files
        app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        // Basic health check
        app.get("/", (req, res) => {
            res.json({ status: "Kustodia backend running" });
        });
        app.get("/health", (req, res) => {
            res.json({ status: "OK", timestamp: new Date().toISOString() });
        });
        app.get("/api/health/db", async (req, res) => {
            try {
                const isConnected = ormconfig_1.default.isInitialized;
                if (isConnected) {
                    await ormconfig_1.default.query('SELECT 1');
                    res.json({ status: "connected", database: ormconfig_1.default.options.database });
                }
                else {
                    res.status(500).json({ status: "not_initialized" });
                }
            }
            catch (error) {
                res.status(500).json({
                    status: "error",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        });
        // Mount all API routes
        console.log('Mounting mainRouter at /api');
        app.use("/api", routes_1.default);
        console.log('Mounting leadRoutes at /api/leads');
        app.use('/api/leads', lead_1.default);
        // Auth routes
        app.use(passport_1.default.initialize());
        app.use('/api/auth', authRoutes_1.default);
        app.use('/api/support', support_1.default);
        app.use('/api/tickets', ticket_1.default);
        app.use('/api/disputes', disputeMessages_1.default);
        app.use('/api/early-access-counter', earlyAccessCounter_1.default);
        app.use('/api/yield', (0, yield_1.createYieldRoutes)(ormconfig_1.default));
        app.use('/api/analytics', analytics_1.default);
        app.use('/api/assets', assetNFTRoutes_1.default);
        app.use('/api/public', publicHistory_1.default);
        app.use('/api/portal', portalPayment_1.default);
        app.use('/api/web3-payment', web3Payment_1.default);
        app.use('/api/multisig', multisig_1.default);
        app.use('/api/blacklist', blacklistRoutes_1.default);
        // Create pool for preApproval routes
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        app.use('/api/pre-approval', (0, preApprovalRoutes_1.default)(pool));
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("Error during application startup:", err);
        process.exit(1);
    }
}
main();
