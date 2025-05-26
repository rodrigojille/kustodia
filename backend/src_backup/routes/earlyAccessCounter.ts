import { Router } from 'express';
import { getSlots } from '../controllers/EarlyAccessCounterController';

const router = Router();

router.get('/slots', getSlots);

export default router;
