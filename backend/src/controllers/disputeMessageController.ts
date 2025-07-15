import { Request, Response } from 'express';
import AppDataSource from '../ormconfig';
import { Dispute } from '../entity/Dispute';
import { DisputeMessage, MessageType } from '../entity/DisputeMessage';
import { User } from '../entity/User';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/disputes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `dispute-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and videos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, documents, and videos are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all messages for a dispute
export const getDisputeMessages = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;
    const userId = (req as any).user.id;

    const disputeRepo = AppDataSource.getRepository(Dispute);
    const messageRepo = AppDataSource.getRepository(DisputeMessage);

    // Verify user has access to this dispute
    const dispute = await disputeRepo.findOne({
      where: { id: parseInt(disputeId) },
      relations: ['raisedBy', 'escrow']
    });

    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    // Check if user is the dispute creator or admin
    const user = (req as any).user;
    const isAuthorized = dispute.raisedBy.id === userId || user.role === 'admin';
    
    if (!isAuthorized) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await messageRepo.find({
      where: { dispute_id: parseInt(disputeId) },
      relations: ['user'],
      order: { created_at: 'ASC' }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching dispute messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Add a new message to a dispute
export const addDisputeMessage = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { message } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const disputeRepo = AppDataSource.getRepository(Dispute);
    const messageRepo = AppDataSource.getRepository(DisputeMessage);

    // Verify dispute exists and user has access
    const dispute = await disputeRepo.findOne({
      where: { id: parseInt(disputeId) },
      relations: ['raisedBy']
    });

    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    const isAuthorized = dispute.raisedBy.id === userId || userRole === 'admin';
    
    if (!isAuthorized) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Create new message
    const disputeMessage = new DisputeMessage();
    disputeMessage.message = message;
    disputeMessage.dispute_id = parseInt(disputeId);
    disputeMessage.user_id = userId;
    disputeMessage.is_admin = userRole === 'admin';
    disputeMessage.message_type = userRole === 'admin' ? MessageType.ADMIN_MESSAGE : MessageType.USER_MESSAGE;

    // Handle file attachment if present
    if (req.file) {
      disputeMessage.attachment_url = `/uploads/disputes/${req.file.filename}`;
      disputeMessage.attachment_name = req.file.originalname;
      disputeMessage.attachment_type = req.file.mimetype.split('/')[0]; // image, application, video, etc.
      disputeMessage.message_type = MessageType.EVIDENCE;
    }

    const savedMessage = await messageRepo.save(disputeMessage);

    // Return message with user details
    const messageWithUser = await messageRepo.findOne({
      where: { id: savedMessage.id },
      relations: ['user']
    });

    res.status(201).json({ message: messageWithUser });
  } catch (error) {
    console.error('Error adding dispute message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

// Get dispute details with initial message/evidence
export const getDisputeDetails = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const disputeRepo = AppDataSource.getRepository(Dispute);

    const dispute = await disputeRepo.findOne({
      where: { id: parseInt(disputeId) },
      relations: ['raisedBy', 'escrow', 'escrow.payment', 'messages', 'messages.user']
    });

    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    // Check if user is the dispute creator or admin
    const isAuthorized = dispute.raisedBy.id === userId || userRole === 'admin';
    
    if (!isAuthorized) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ dispute });
  } catch (error) {
    console.error('Error fetching dispute details:', error);
    res.status(500).json({ error: 'Failed to fetch dispute details' });
  }
};
