"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisputeDetails = exports.addDisputeMessage = exports.getDisputeMessages = exports.upload = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Dispute_1 = require("../entity/Dispute");
const DisputeMessage_1 = require("../entity/DisputeMessage");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads/disputes');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `dispute-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        // Allow images, documents, and videos
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only images, documents, and videos are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
// Get all messages for a dispute
const getDisputeMessages = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const userId = req.user.id;
        const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
        const messageRepo = ormconfig_1.default.getRepository(DisputeMessage_1.DisputeMessage);
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
        const user = req.user;
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
    }
    catch (error) {
        console.error('Error fetching dispute messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
exports.getDisputeMessages = getDisputeMessages;
// Add a new message to a dispute
const addDisputeMessage = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
        const messageRepo = ormconfig_1.default.getRepository(DisputeMessage_1.DisputeMessage);
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
        const disputeMessage = new DisputeMessage_1.DisputeMessage();
        disputeMessage.message = message;
        disputeMessage.dispute_id = parseInt(disputeId);
        disputeMessage.user_id = userId;
        disputeMessage.is_admin = userRole === 'admin';
        disputeMessage.message_type = userRole === 'admin' ? DisputeMessage_1.MessageType.ADMIN_MESSAGE : DisputeMessage_1.MessageType.USER_MESSAGE;
        // Handle file attachment if present
        if (req.file) {
            disputeMessage.attachment_url = `/uploads/disputes/${req.file.filename}`;
            disputeMessage.attachment_name = req.file.originalname;
            disputeMessage.attachment_type = req.file.mimetype.split('/')[0]; // image, application, video, etc.
            disputeMessage.message_type = DisputeMessage_1.MessageType.EVIDENCE;
        }
        const savedMessage = await messageRepo.save(disputeMessage);
        // Return message with user details
        const messageWithUser = await messageRepo.findOne({
            where: { id: savedMessage.id },
            relations: ['user']
        });
        res.status(201).json({ message: messageWithUser });
    }
    catch (error) {
        console.error('Error adding dispute message:', error);
        res.status(500).json({ error: 'Failed to add message' });
    }
};
exports.addDisputeMessage = addDisputeMessage;
// Get dispute details with initial message/evidence
const getDisputeDetails = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
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
    }
    catch (error) {
        console.error('Error fetching dispute details:', error);
        res.status(500).json({ error: 'Failed to fetch dispute details' });
    }
};
exports.getDisputeDetails = getDisputeDetails;
