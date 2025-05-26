import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { PaymentEvent } from "../entity/PaymentEvent";

export const getPaymentEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing payment id" });
    }
    const paymentEventRepo = ormconfig.getRepository(PaymentEvent); // Usar solo una vez por request
    const events = await paymentEventRepo.find({
      where: { paymentId: Number(id) },
      order: { created_at: "ASC" }
    });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment events", details: err instanceof Error ? err.message : err });
  }
};
