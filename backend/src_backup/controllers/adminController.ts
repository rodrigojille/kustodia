import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { Dispute } from "../entity/Dispute";
import { User } from "../entity/User";
import { Escrow } from "../entity/Escrow";
import axios from "axios";

// Utility to get Juno API credentials from env
const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || 'https://api.juno.com';

// --- Dispute Management ---
export const getAllDisputes = async (req: Request, res: Response) => {
  const disputeRepo = ormconfig.getRepository(Dispute);
  const userRepo = ormconfig.getRepository(User);
  const escrowRepo = ormconfig.getRepository(Escrow);
  const disputes = await disputeRepo.find({ relations: ["escrow", "raisedBy"] });
  res.json({ disputes });
};

// --- User Management ---
export const getAllUsersWithDetails = async (req: Request, res: Response) => {
  const userRepo = ormconfig.getRepository(User);
  const users = await userRepo.find();
  // Optionally, fetch balances and clabes here
  res.json({ users });
};

export const getUserClabes = async (req: Request, res: Response) => {
  const { userId } = req.params;
  // Fetch CLABEs from DB and Juno API
  // DB fetch (assume User has clabe field or related entity)
  const userRepo = ormconfig.getRepository(User);
  const user = await userRepo.findOne({ where: { id: Number(userId) } });
  // Collect both deposit and payout CLABEs
  let dbClabes: string[] = [];
  if (user?.deposit_clabe) dbClabes.push(user.deposit_clabe);
  if (user?.payout_clabe) dbClabes.push(user.payout_clabe);
  // Juno API fetch
  let junoClabes = [];
  if (JUNO_API_KEY && JUNO_API_SECRET) {
    try {
      const resp = await axios.get(`${JUNO_BASE_URL}/v1/clabes`, {
        headers: { 'Authorization': `Bearer ${JUNO_API_KEY}` }
      });
      junoClabes = resp.data?.clabes?.filter((c: any) => c.user_id == userId) || [];
    } catch (err) {
      // Log or handle
    }
  }
  res.json({ dbClabes, junoClabes });
};

export const getUserDeposits = async (req: Request, res: Response) => {
  const { userId } = req.params;
  // Fetch deposits from DB and Juno API
  // DB fetch (assume Escrow has deposits or related entity)
  const escrowRepo = ormconfig.getRepository(Escrow);
  // Assuming Escrow -> Payment -> User
  // Fetch escrows where payment.user.id = userId
  const dbDeposits = await escrowRepo.find({
    relations: ['payment', 'payment.user'],
    where: { payment: { user: { id: Number(userId) } } }
  });
  // Juno API fetch
  let junoDeposits = [];
  if (JUNO_API_KEY && JUNO_API_SECRET) {
    try {
      const resp = await axios.get(`${JUNO_BASE_URL}/v1/deposits`, {
        headers: { 'Authorization': `Bearer ${JUNO_API_KEY}` }
      });
      junoDeposits = resp.data?.deposits?.filter((d: any) => d.user_id == userId) || [];
    } catch (err) {
      // Log or handle
    }
  }
  res.json({ dbDeposits, junoDeposits });
};

// --- Payment Management ---
export const getAllPayments = async (req: Request, res: Response) => {
  const paymentRepo = ormconfig.getRepository(require("../entity/Payment").Payment);
  const payments = await paymentRepo.find({ relations: ["user", "escrow"] });
  res.json({ payments });
};
