"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteLead = exports.createLead = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Lead_1 = __importDefault(require("../entity/Lead"));
const emailService_1 = require("../utils/emailService");
const earlyAccessTemplate_1 = require("../utils/earlyAccessTemplate");
const createLead = async (req, res) => {
    try {
        const { name, email, message, empresa, telefono, vertical } = req.body;
        if (!name || !email) {
            res.status(400).json({ error: 'Nombre y correo son obligatorios.' });
            return;
        }
        // Fetch EarlyAccessCounter
        const counterRepo = ormconfig_1.default.getRepository(require('../entity/EarlyAccessCounter').default);
        let counter = await counterRepo.findOneBy({});
        let slots = counter ? counter.slots : 0;
        let zeroFee = false;
        if (counter && counter.slots > 0) {
            counter.slots -= 1;
            await counterRepo.save(counter);
            slots = counter.slots;
            zeroFee = slots >= 0 && slots < 100;
        }
        const repo = ormconfig_1.default.getRepository(Lead_1.default);
        const lead = repo.create({
            name,
            email,
            message,
            empresa: empresa?.trim() || undefined,
            telefono: telefono?.trim() || undefined,
            vertical: vertical?.trim() || undefined,
            earlyAccessCounter: counter ?? undefined
        });
        await repo.save(lead);
        // Send invitation email immediately
        await (0, emailService_1.sendEmail)({
            to: lead.email,
            subject: '¡Confirmación de Acceso Prioritario - Kustodia!',
            html: (0, earlyAccessTemplate_1.createEarlyAccessConfirmationTemplate)(lead.name)
        });
        lead.invited = true;
        await repo.save(lead);
        res.status(201).json({ success: true, slots, zeroFee });
        return;
    }
    catch (err) {
        console.error('Error al guardar el lead:', err);
        res.status(500).json({ error: 'Error al guardar el lead.' });
        return;
    }
};
exports.createLead = createLead;
const inviteLead = async (req, res) => {
    try {
        const { id } = req.params;
        const repo = ormconfig_1.default.getRepository(Lead_1.default);
        const lead = await repo.findOne({ where: { id: Number(id) } });
        if (!lead) {
            res.status(404).json({ error: 'Lead no encontrado.' });
            return;
        }
        // Send invitation email
        await (0, emailService_1.sendEmail)({
            to: lead.email,
            subject: '¡Confirmación de Acceso Prioritario - Kustodia!',
            html: (0, earlyAccessTemplate_1.createEarlyAccessConfirmationTemplate)(lead.name)
        });
        lead.invited = true;
        await repo.save(lead);
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error('Error al invitar:', err);
        res.status(500).json({ error: 'Error al invitar.' });
        return;
    }
};
exports.inviteLead = inviteLead;
