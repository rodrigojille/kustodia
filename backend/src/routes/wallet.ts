import { Router } from 'express';
import { generateDepositClabe, initiateWithdrawal } from '../controllers/walletController';
import { authenticateJWT } from '../authenticateJWT';
import { AuthenticatedRequest } from '../AuthenticatedRequest';

const router = Router();

// @route   POST /api/wallet/generate-deposit-clabe
// @desc    Generate a unique CLABE for a user to deposit funds
// @access  Private
router.post('/generate-deposit-clabe', authenticateJWT, async (req, res) => {
  await generateDepositClabe(req as AuthenticatedRequest, res);
});

router.post('/initiate-withdrawal', authenticateJWT, async (req, res) => {
  await initiateWithdrawal(req as AuthenticatedRequest, res);
});

export default router;
