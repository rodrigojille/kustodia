import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../AuthenticatedRequest';
import AppDataSource from '../ormconfig';
import { WalletTransaction } from '../entity/WalletTransaction';
import { User } from '../entity/User';
import { getCurrentNetworkConfig } from '../utils/networkConfig';
// Asumiremos que existe un junoService con un método para crear CLABEs
import { createJunoClabe } from '../services/junoService';



export const generateDepositClabe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const walletTransactionRepo = AppDataSource.getRepository(WalletTransaction);
    const userId = req.user!.id;

    // 1. Crear una CLABE única a través de Juno
    const newClabe = await createJunoClabe();

    if (!newClabe) {
      return res.status(500).json({ message: 'Failed to generate CLABE from provider' });
    }

    const newTransaction = walletTransactionRepo.create({
      user_id: userId,
      type: 'DEPOSIT',
      status: 'pending_deposit',
      deposit_clabe: newClabe,
    });

    await walletTransactionRepo.save(newTransaction);

    // 3. Devolver la CLABE al frontend
    return res.status(201).json({ clabe: newTransaction.deposit_clabe });
  } catch (error) {
    console.error('Error generating deposit clabe:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export async function initiateWithdrawal(req: AuthenticatedRequest, res: Response) {
  const { amount } = req.body; // Amount in MXNB
  const userId = req.user!.id;

  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Invalid amount specified.' });
  }

  try {
    const walletTransactionRepo = AppDataSource.getRepository(WalletTransaction);
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user || !user.payout_clabe) {
      return res.status(400).json({ message: 'User must have a registered payout CLABE to initiate a withdrawal.' });
    }

    const newTransaction = walletTransactionRepo.create({
      user: user, // Use the user object for the relation
      type: 'WITHDRAWAL',
      status: 'pending_user_transfer',
      amount_mxnb: parseFloat(amount),
      amount_mxn: parseFloat(amount) // Assuming 1:1 for now, this could be an estimate
    });

    await walletTransactionRepo.save(newTransaction);

    // Return the bridge wallet address so the user knows where to send the funds
    res.status(201).json({
      message: 'Withdrawal initiated. Please send the specified MXNB amount to the bridge wallet.',
      bridgeWalletAddress: getCurrentNetworkConfig().bridgeWallet,
      transactionId: newTransaction.id
    });
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
