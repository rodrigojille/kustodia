"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketsForAdmin = exports.closeTicket = exports.createReply = exports.getTicketById = exports.getTicketsForUser = exports.createTicket = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Ticket_1 = require("../entity/Ticket");
const TicketReply_1 = require("../entity/TicketReply");
const User_1 = require("../entity/User");
// Basic email sending placeholder - replace with your actual email service
async function sendTicketEmail(ticket, user) {
    console.log('--- Sending Support Ticket Email ---');
    console.log(`New ticket #${ticket.id} from ${user.email}`);
    console.log(`Subject: ${ticket.subject}`);
    console.log(`Message: ${ticket.message}`);
    console.log('------------------------------------');
    // In a real application, you would use a service like SendGrid, Nodemailer, etc.
}
const createTicket = async (req, res) => {
    const { subject, message } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    if (!subject || !message) {
        res.status(400).json({ message: 'Subject and message are required' });
        return;
    }
    try {
        const ticketRepository = ormconfig_1.default.getRepository(Ticket_1.Ticket);
        const userRepository = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newTicket = new Ticket_1.Ticket();
        newTicket.subject = subject;
        newTicket.message = message;
        newTicket.userId = userId;
        newTicket.user = user;
        const savedTicket = await ticketRepository.save(newTicket);
        // Send email notification (async, no need to await)
        sendTicketEmail(savedTicket, user);
        res.status(201).json(savedTicket);
    }
    catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createTicket = createTicket;
const getTicketsForUser = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(400).json({ message: 'User ID is missing' });
        return;
    }
    try {
        const ticketRepository = ormconfig_1.default.getRepository(Ticket_1.Ticket);
        const tickets = await ticketRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
        res.json(tickets);
    }
    catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.getTicketsForUser = getTicketsForUser;
const getTicketById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    try {
        const ticketRepository = ormconfig_1.default.getRepository(Ticket_1.Ticket);
        const ticket = await ticketRepository.findOne({
            where: { id },
            relations: ['user', 'replies', 'replies.user'],
        });
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        // Security check: Ensure the user is the owner of the ticket or an admin
        if (ticket.userId !== userId && userRole !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        res.json(ticket);
    }
    catch (error) {
        console.error(`Error fetching ticket ${id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTicketById = getTicketById;
const createReply = async (req, res) => {
    const { id: ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    if (!message) {
        res.status(400).json({ message: 'Reply message cannot be empty' });
        return;
    }
    try {
        const ticketRepository = ormconfig_1.default.getRepository(Ticket_1.Ticket);
        const ticket = await ticketRepository.findOne({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        // Security check: Ensure the user is the ticket owner or an admin
        if (ticket.userId !== userId && req.user?.role !== 'admin') {
            res.status(403).json({ message: 'You are not authorized to reply to this ticket' });
            return;
        }
        const replyRepository = ormconfig_1.default.getRepository(TicketReply_1.TicketReply);
        const newReply = replyRepository.create({
            message,
            ticketId,
            userId,
        });
        await replyRepository.save(newReply);
        // Eager load the user relation for the response
        const fullReply = await replyRepository.findOne({
            where: { id: newReply.id },
            relations: ['user'],
        });
        res.status(201).json(fullReply);
    }
    catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ message: 'Failed to create reply' });
    }
};
exports.createReply = createReply;
const closeTicket = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    try {
        const ticketRepository = ormconfig_1.default.getRepository(Ticket_1.Ticket);
        const ticket = await ticketRepository.findOne({ where: { id } });
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        // Security check: only the owner or an admin can close the ticket
        if (ticket.userId !== userId && userRole !== 'admin') {
            res.status(403).json({ message: 'You are not authorized to close this ticket' });
            return;
        }
        if (ticket.status === Ticket_1.TicketStatus.CLOSED) {
            res.status(400).json({ message: 'Ticket is already closed' });
            return;
        }
        ticket.status = Ticket_1.TicketStatus.CLOSED;
        await ticketRepository.save(ticket);
        // Re-fetch the ticket to include all relations in the response
        const updatedTicket = await ticketRepository.findOne({
            where: { id: ticket.id },
            relations: ['user', 'replies', 'replies.user'],
        });
        res.status(200).json(updatedTicket);
    }
    catch (error) {
        console.error(`Error closing ticket ${id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.closeTicket = closeTicket;
const getTicketsForAdmin = async (req, res) => {
    try {
        const ticketRepository = ormconfig_1.default.getRepository(Ticket_1.Ticket);
        const tickets = await ticketRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });
        res.status(200).json(tickets);
    }
    catch (error) {
        console.error('Error fetching tickets for admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getTicketsForAdmin = getTicketsForAdmin;
