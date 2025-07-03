"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const isCompiled = __dirname.includes('dist');
const Escrow_1 = require("./entity/Escrow");
const JunoTransaction_1 = require("./entity/JunoTransaction");
const Payment_1 = require("./entity/Payment");
const PaymentEvent_1 = require("./entity/PaymentEvent");
const User_1 = require("./entity/User");
const Ticket_1 = require("./entity/Ticket");
const TicketReply_1 = require("./entity/TicketReply");
const Notification_1 = require("./entity/Notification");
const Lead_1 = __importDefault(require("./entity/Lead"));
const EarlyAccessCounter_1 = __importDefault(require("./entity/EarlyAccessCounter"));
const AppDataSource = new typeorm_1.DataSource({
    name: "default",
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false, // Should be false in production, use migrations
    logging: true,
    entities: [
        User_1.User,
        Escrow_1.Escrow,
        Payment_1.Payment,
        PaymentEvent_1.PaymentEvent,
        JunoTransaction_1.JunoTransaction,
        Ticket_1.Ticket,
        TicketReply_1.TicketReply,
        Notification_1.Notification,
        Lead_1.default,
        EarlyAccessCounter_1.default
    ],
    migrations: [isCompiled ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
    subscribers: [isCompiled ? "dist/subscriber/**/*.js" : "src/subscriber/**/*.ts"],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
exports.default = AppDataSource;
