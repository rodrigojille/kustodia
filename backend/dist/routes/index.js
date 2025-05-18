"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("./user"));
const payment_1 = __importDefault(require("./payment"));
const truora_1 = __importDefault(require("./truora"));
const dispute_1 = __importDefault(require("./dispute"));
const admin_1 = __importDefault(require("./admin"));
const router = (0, express_1.Router)();
router.use("/users", user_1.default);
router.use("/payments", payment_1.default);
router.use("/truora", truora_1.default);
router.use("/escrow", dispute_1.default);
router.use("/admin", admin_1.default);
exports.default = router;
