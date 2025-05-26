import { Router } from "express";
import { getJunoTransactions } from "../controllers/junoTransactionController";

const router = Router();

// GET /api/juno-transactions?reference=...&type=...&status=...
router.get("/", getJunoTransactions);

export default router;
