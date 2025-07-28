import { Router, Request, Response } from "express";
import { verifyKYC, startKYC, truoraWebhook, getValidationStatus, updateKYCStatus } from "../controllers/truoraController";
const router = Router();

router.get("/test", (req, res) => {
  res.json({ ok: true, message: "Truora router is active" });
});

router.post("/test-post", (req, res) => {
  res.json({ ok: true, message: "POST test works" });
});

// Test API key endpoint
const testApiKey = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    res.json({ 
      error: "API key test failed", 
      details: error.response?.data || error.message,
      keyPreview: `${TRUORA_API_KEY.substring(0, 10)}...`
    });
  }
};

router.get("/test-api-key", testApiKey);

// New Main Validator Suite API endpoints
router.post("/start-kyc", startKYC);
router.post("/update-kyc-status", updateKYCStatus);
router.get("/validation-status/:validation_id", getValidationStatus);

// Legacy endpoints (for backward compatibility)
router.post("/verify-kyc", verifyKYC);
router.post("/webhook", truoraWebhook);

console.log("Truora routes loaded");
export default router;
