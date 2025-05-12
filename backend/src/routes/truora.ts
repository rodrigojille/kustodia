import { Router } from "express";
import { verifyKYC, startKYC, truoraWebhook } from "../controllers/truoraController";
const router = Router();

router.get("/test", (req, res) => {
  res.json({ ok: true, message: "Truora router is active" });
});

router.post("/test-post", (req, res) => {
  res.json({ ok: true, message: "POST test works" });
});

router.post("/verify-kyc", verifyKYC);
router.post("/start-kyc", startKYC);
router.post("/webhook", truoraWebhook);

console.log("Truora routes loaded");
export default router;
