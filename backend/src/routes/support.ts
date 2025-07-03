import { Router } from 'express';
import { handleChatMessage } from '../controllers/supportController';
import { authenticateJWT } from '../authenticateJWT';

const router = Router();

router.post('/chat', authenticateJWT, handleChatMessage);

export default router;
