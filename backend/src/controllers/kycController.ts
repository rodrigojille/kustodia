import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { User } from "../entity/User";

// GET /api/user/kyc-status?process_id=...
export async function getKYCStatus(req: Request, res: Response): Promise<void> {
  const { process_id } = req.query;
  if (!process_id) {
    res.status(400).json({ error: "process_id is required" });
    return;
  }
  const user = await ormconfig.getRepository(User).findOne({ where: { truora_process_id: String(process_id) } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ kyc_status: user.kyc_status, user });
}
