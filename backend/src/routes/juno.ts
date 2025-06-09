import { Router } from 'express';
import { getJunoTxDetails } from '../controllers/junoTransactionController';

const router = Router();

// Get Juno transaction details by transaction_id
router.post('/transaction/:transaction_id', getJunoTxDetails);

export default router;
