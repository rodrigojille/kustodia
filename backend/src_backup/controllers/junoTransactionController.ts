import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { JunoTransaction } from "../entity/JunoTransaction";

/**
 * GET /api/juno-transactions?reference=...&type=...&status=...
 * Query JunoTransaction records by optional reference, type, or status.
 */
export const getJunoTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference, type, status } = req.query;
    const repo = ormconfig.getRepository(JunoTransaction);
    const where: any = {};
    if (reference) where.reference = reference;
    if (type) where.type = type;
    if (status) where.status = status;
    const transactions = await repo.find({ where, order: { created_at: "DESC" } });
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch JunoTransaction records", details: String(err) });
  }
};
