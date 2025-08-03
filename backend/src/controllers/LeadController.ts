import { Request, Response } from 'express';
import ormconfig from '../ormconfig';
import Lead from '../entity/Lead';
import { sendEmail } from '../utils/emailService';
import { createEarlyAccessConfirmationTemplate } from '../utils/earlyAccessTemplate';
import { decrementSlot } from './EarlyAccessCounterController';

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message, empresa, telefono, vertical } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Nombre y correo son obligatorios.' });
      return;
    }
    // Fetch EarlyAccessCounter
    const counterRepo = ormconfig.getRepository(require('../entity/EarlyAccessCounter').default);
    let counter = await counterRepo.findOneBy({});
    let slots = counter ? counter.slots : 0;
    let zeroFee = false;
    if (counter && counter.slots > 0) {
      counter.slots -= 1;
      await counterRepo.save(counter);
      slots = counter.slots;
      zeroFee = slots >= 0 && slots < 100;
    }
    const repo = ormconfig.getRepository(Lead);
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
    await sendEmail({
      to: lead.email,
      subject: '¡Confirmación de Acceso Prioritario - Kustodia!',
      html: createEarlyAccessConfirmationTemplate(lead.name)
    });
    lead.invited = true;
    await repo.save(lead);
    res.status(201).json({ success: true, slots, zeroFee } );
    return;
  } catch (err) {
    console.error('Error al guardar el lead:', err);
    res.status(500).json({ error: 'Error al guardar el lead.' });
    return;
  }
};

export const inviteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = ormconfig.getRepository(Lead);
    const lead = await repo.findOne({ where: { id: Number(id) } });
    if (!lead) {
      res.status(404).json({ error: 'Lead no encontrado.' });
      return;
    }
    // Send invitation email
    await sendEmail({
      to: lead.email,
      subject: '¡Confirmación de Acceso Prioritario - Kustodia!',
      html: createEarlyAccessConfirmationTemplate(lead.name)
    });
    lead.invited = true;
    await repo.save(lead);
    res.json({ success: true });
    return;
  } catch (err) {
    console.error('Error al invitar:', err);
    res.status(500).json({ error: 'Error al invitar.' });
    return;
  }
};
