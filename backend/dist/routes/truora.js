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
// Test API key endpoint
const testApiKey = async (req, res) => {
    const TRUORA_API_KEY = process.env.TRUORA_API_KEY;
    if (!TRUORA_API_KEY) {
        res.json({ error: "API key not configured" });
        return;
    }
    try {
        const axios = require('axios');
        // Try a simple GET request to test API key
        const response = await axios.get('https://api.validations.truora.com/v1/accounts', {
            headers: {
                'Truora-API-Key': TRUORA_API_KEY,
            },
            params: {
                limit: 1
            }
        });
        res.json({
            success: true,
            message: "API key is working",
            keyPreview: `${TRUORA_API_KEY.substring(0, 10)}...`,
            response: response.status
        });
    }
    catch (error) {
        res.json({
            error: "API key test failed",
            details: error.response?.data || error.message,
            keyPreview: `${TRUORA_API_KEY.substring(0, 10)}...`
        });
    }
};
router.get("/test-api-key", testApiKey);
// New Main Validator Suite API endpoints
router.post("/start-kyc", truoraController_1.startKYC);
router.post("/update-kyc-status", truoraController_1.updateKYCStatus);
router.get("/validation-status/:validation_id", truoraController_1.getValidationStatus);
// Legacy endpoints (for backward compatibility)
router.post("/verify-kyc", truoraController_1.verifyKYC);
router.post("/webhook", truoraController_1.truoraWebhook);
console.log("Truora routes loaded");
exports.default = router;
