import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { User } from "../entity/User";

export const verifyRecipient = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  try {
    const userRepo = ormconfig.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      res.json({ exists: false, verified: false });
      return;
    }
    res.json({ exists: true, verified: !!user.email_verified });
    return;
  } catch (err) {
    res.status(500).json({ error: "Verification failed", details: err instanceof Error ? err.message : err });
    return;
  }
};
