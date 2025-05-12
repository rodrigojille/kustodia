import { Request, Response } from "express";



import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";
import { Escrow } from "../entity/Escrow";

import { AuthenticatedRequest } from '../AuthenticatedRequest';

export const getUserPayments = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  try {
    // Restrict to authenticated user only
    // Assume req.user is populated by authentication middleware
    const authUser = authReq.user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const paymentRepo = ormconfig.getRepository(Payment);
    const payments = await paymentRepo.find({
      where: [
        { user: { id: Number(authUser.id) } },
        { recipient_email: authUser.email }
      ],
      order: { created_at: "DESC" },
      relations: ["user", "escrow"]
    });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments", details: err instanceof Error ? err.message : err });
  }
};
