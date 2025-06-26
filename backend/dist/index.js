"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ormconfig_1 = __importDefault(require("./ormconfig"));
const PaymentAutomationService_1 = require("./services/PaymentAutomationService");
const routes_1 = __importDefault(require("./routes"));
const lead_1 = __importDefault(require("./routes/lead"));
const earlyAccessCounter_1 = __importDefault(require("./routes/earlyAccessCounter"));
const yield_1 = __importDefault(require("./routes/yield"));
dotenv_1.default.config();
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
// Connect to Postgres
ormconfig_1.default.initialize()
    .then(async () => {
    console.log("Data Source has been initialized!");
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
    app.use('/api/early-access-counter', earlyAccessCounter_1.default);
    app.use('/api/yield', yield_1.default);
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("Error during Data Source initialization:", err);
});
