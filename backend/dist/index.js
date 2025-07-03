"use strict";
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
const ormconfig_1 = __importDefault(require("./ormconfig"));
const PaymentAutomationService_1 = require("./services/PaymentAutomationService");
const routes_1 = __importDefault(require("./routes"));
const lead_1 = __importDefault(require("./routes/lead"));
const juno_1 = __importDefault(require("./routes/juno"));
const automation_1 = __importDefault(require("./routes/automation"));
const support_1 = __importDefault(require("./routes/support"));
const ticket_1 = __importDefault(require("./routes/ticket"));
const earlyAccessCounter_1 = __importDefault(require("./routes/earlyAccessCounter"));
const yield_1 = require("./routes/yield");
const app = (0, express_1.default)();
app.use(express_1.default.json());
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
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
async function main() {
    try {
        // Connect to Postgres and wait for it to be ready
        await ormconfig_1.default.initialize();
        console.log("Data Source has been initialized!");
        // Now that the DB is connected, we can configure and start the server.
        // Initialize Payment Automation Service
        const paymentAutomation = new PaymentAutomationService_1.PaymentAutomationService();
        await paymentAutomation.startAutomation();
        // Basic health check
        app.get("/", (req, res) => {
            res.json({ status: "Kustodia backend running" });
        });
        // Mount all API routes
        app.use("/api", routes_1.default);
        app.use('/api/leads', lead_1.default);
        app.use('/api/automation', automation_1.default);
        app.use('/api/juno', juno_1.default);
        app.use('/api/support', support_1.default);
        app.use('/api/tickets', ticket_1.default);
        app.use('/api/early-access-counter', earlyAccessCounter_1.default);
        app.use('/api/yield', (0, yield_1.createYieldRoutes)(ormconfig_1.default));
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
