import { Router } from 'express';
import { forceExpireEscrow } from '../controllers/testUtilsController';

const router = Router();

// POST /api/test/force-expire-escrow/:escrowId
router.post('/force-expire-escrow/:escrowId', forceExpireEscrow);

export default router;
