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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("[DEBUG] DATABASE_URL:", process.env.DATABASE_URL);
const isCompiled = __dirname.includes('dist');
const JunoTransaction_1 = require("./entity/JunoTransaction");
const Payment_1 = require("./entity/Payment");
const User_1 = require("./entity/User");
const Escrow_1 = require("./entity/Escrow");
exports.default = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL, // Use this for Heroku!
    synchronize: true, // set to false in production and use migrations
    logging: false,
    entities: [
        JunoTransaction_1.JunoTransaction,
        Payment_1.Payment,
        User_1.User,
        Escrow_1.Escrow,
        isCompiled ? "dist/entity/**/*.js" : "src/entity/**/*.ts"
    ],
    migrations: [isCompiled ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
    subscribers: [isCompiled ? "dist/subscriber/**/*.js" : "src/subscriber/**/*.ts"],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
