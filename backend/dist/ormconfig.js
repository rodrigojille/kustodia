"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
const Payment_1 = require("./entity/Payment");
const PaymentEvent_1 = require("./entity/PaymentEvent");
const Escrow_1 = require("./entity/Escrow");
const Dispute_1 = require("./entity/Dispute");
const DisputeMessage_1 = require("./entity/DisputeMessage");
const Notification_1 = require("./entity/Notification");
const EarlyAccessCounter_1 = require("./entity/EarlyAccessCounter");
const JunoTransaction_1 = require("./entity/JunoTransaction");
const Lead_1 = require("./entity/Lead");
const Ticket_1 = require("./entity/Ticket");
const TicketReply_1 = require("./entity/TicketReply");
const Token_1 = require("./entity/Token");
const WalletTransaction_1 = require("./entity/WalletTransaction");
const CommissionRecipient_1 = require("./entity/CommissionRecipient");
const Blacklist_1 = require("./entity/Blacklist");
const AppDataSource = new typeorm_1.DataSource({
    name: "default",
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false, // Should be false in production, use migrations
    logging: true,
    entities: [
        User_1.User,
        Payment_1.Payment,
        PaymentEvent_1.PaymentEvent,
        Escrow_1.Escrow,
        Dispute_1.Dispute,
        DisputeMessage_1.DisputeMessage,
        Notification_1.Notification,
        EarlyAccessCounter_1.EarlyAccessCounter,
        JunoTransaction_1.JunoTransaction,
        Lead_1.Lead,
        Ticket_1.Ticket,
        TicketReply_1.TicketReply,
        Token_1.Token,
        WalletTransaction_1.WalletTransaction,
        CommissionRecipient_1.CommissionRecipient,
        Blacklist_1.Blacklist
    ],
    migrations: process.env.NODE_ENV === "production" ? ["dist/migration/**/*.js"] : ["src/migration/**/*.ts"],
    subscribers: ["dist/subscriber/**/*.js"],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
exports.default = AppDataSource;
