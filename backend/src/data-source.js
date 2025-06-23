"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const Escrow_1 = require("./entity/Escrow");
const Payment_1 = require("./entity/Payment");
const PaymentEvent_1 = require("./entity/PaymentEvent");
const Dispute_1 = require("./entity/Dispute");
const User_1 = require("./entity/User");
const JunoTransaction_1 = require("./entity/JunoTransaction");
const Lead_1 = require("./entity/Lead");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres", // Cambia a tu tipo de base de datos si usas otro
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Escrow_1.Escrow, Payment_1.Payment, PaymentEvent_1.PaymentEvent, Dispute_1.Dispute, User_1.User, JunoTransaction_1.JunoTransaction, Lead_1.Lead],
    synchronize: false,
    logging: false,
});
