import { Router } from 'express';
import { authenticateJWT } from '../authenticateJWT';
import { 
  getDisputeMessages, 
  addDisputeMessage, 
  getDisputeDetails,
  upload 
} from '../controllers/disputeMessageController';

const router = Router();

// All routes require JWT authentication
router.use(authenticateJWT);

// Get all messages for a dispute
router.get('/:disputeId/messages', getDisputeMessages);

// Add a new message to a dispute (with optional file attachment)
router.post('/:disputeId/messages', upload.single('attachment'), addDisputeMessage);

// Get detailed dispute information with messages
router.get('/:disputeId/details', getDisputeDetails);

export default router;
