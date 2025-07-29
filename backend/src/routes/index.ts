import { Router } from "express";
import userRoutes from "./user";
import paymentRoutes from "./payment";
import truoraRoutes from "./truora";
import disputeRoutes from "./dispute";
import adminRoutes from "./admin";
import evidenceRoutes from "./evidence";
import junoRoutes from "./juno";
import automationRoutes from "./automation";
import notificationRoutes from "./notification";
import ticketRoutes from "./ticket";
import speiReceiptRoutes from "./speiReceipt";
import portalPaymentRoutes from "./portalPayment";

const router = Router();

console.log('Mounting userRoutes at /users in mainRouter');
router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/truora", truoraRoutes);
router.use("/dispute", disputeRoutes);
router.use("/admin", adminRoutes);
router.use("/tickets", ticketRoutes);
router.use("/evidence", evidenceRoutes);
router.use("/juno", junoRoutes);
router.use("/automation", automationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", speiReceiptRoutes);
router.use("/portal", portalPaymentRoutes);

export default router;
