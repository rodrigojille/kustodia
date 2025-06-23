"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const ormconfig_1 = __importDefault(require("../src/ormconfig"));
const User_1 = require("../src/entity/User");
(async () => {
    await ormconfig_1.default.initialize();
    const users = await ormconfig_1.default.getRepository(User_1.User).find();
    console.log('--- Seller payout CLABEs ---');
    users.forEach((u) => {
        console.log(`Email: ${u.email}, payout_clabe: ${u.payout_clabe || 'NONE'}`);
    });
    process.exit(0);
})();
