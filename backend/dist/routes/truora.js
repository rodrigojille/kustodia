"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const truoraController_1 = require("../controllers/truoraController");
const router = (0, express_1.Router)();
router.get("/test", (req, res) => {
    res.json({ ok: true, message: "Truora router is active" });
});
router.post("/test-post", (req, res) => {
    res.json({ ok: true, message: "POST test works" });
});
router.post("/verify-kyc", truoraController_1.verifyKYC);
router.post("/start-kyc", truoraController_1.startKYC);
router.post("/webhook", truoraController_1.truoraWebhook);
console.log("Truora routes loaded");
exports.default = router;
