import { Router } from "express";
import userRoutes from "./user";
import paymentRoutes from "./payment";
import truoraRoutes from "./truora";
import disputeRoutes from "./dispute";
import adminRoutes from "./admin";

const router = Router();

router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/truora", truoraRoutes);
router.use("/escrow", disputeRoutes);
router.use("/admin", adminRoutes);

export default router;
