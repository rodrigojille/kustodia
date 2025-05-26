import { Router } from 'express';
import { createLead, inviteLead } from '../controllers/LeadController';

const router = Router();

router.post('/', createLead);
router.post('/:id/invite', inviteLead);

export default router;
