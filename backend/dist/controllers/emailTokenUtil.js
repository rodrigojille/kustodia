"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
const crypto_1 = __importDefault(require("crypto"));
function generateToken(length = 48) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
