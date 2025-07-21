"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPaymentEvent = recordPaymentEvent;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const PaymentEvent_1 = require("../entity/PaymentEvent");
async function recordPaymentEvent(payment, type, description) {
    const repo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    const event = repo.create({ payment, type, description });
    await repo.save(event);
}
