import { Request, Response } from 'express';
import ormconfig from '../ormconfig';
import Lead from '../entity/Lead';
import { sendEmail } from '../utils/emailService';

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Nombre y correo son obligatorios.' });
      return;
    }
    const repo = ormconfig.getRepository(Lead);
    const lead = repo.create({ name, email, message });
    await repo.save(lead);
    // Send invitation email immediately
    await sendEmail({
      to: lead.email,
      subject: '¡Estás invitado a Kustodia Early Access!',
      html: `<div style='font-family:Montserrat,Arial,sans-serif;background:#f6f8fc;padding:2rem;'>
        <img src='https://kustodia.app/logo.svg' alt='Kustodia Logo' style='width:56px;margin-bottom:1rem;'>
        <h2 style='color:#2e7ef7;'>¡Hola${lead.name ? ` ${lead.name}` : ''}!</h2>
        <p>¡Gracias por tu interés en Kustodia! Ya puedes acceder a la plataforma y descubrir la forma más segura de gestionar tus pagos y custodias en LATAM.</p>
        <p><a href='https://kustodia.app/early-access' style='display:inline-block;padding:10px 18px;background:#1A73E8;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;'>Accede a Kustodia</a></p>
        <p style='color:#888;'>¿Tienes dudas? Responde este correo y te ayudamos.</p>
        <br><p style='font-size:13px;color:#999;'>Equipo Kustodia</p>
      </div>`
    });
    lead.invited = true;
    await repo.save(lead);
    res.status(201).json({ success: true });
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
      subject: '¡Estás invitado a Kustodia Early Access!',
      html: `<div style='font-family:Montserrat,Arial,sans-serif;background:#f6f8fc;padding:2rem;'>
        <img src='https://kustodia.app/logo.svg' alt='Kustodia Logo' style='width:56px;margin-bottom:1rem;'>
        <h2 style='color:#2e7ef7;'>¡Hola${lead.name ? ` ${lead.name}` : ''}!</h2>
        <p>¡Gracias por tu interés en Kustodia! Ya puedes acceder a la plataforma y descubrir la forma más segura de gestionar tus pagos y custodias en LATAM.</p>
        <p><a href='https://kustodia.app/early-access' style='display:inline-block;padding:10px 18px;background:#1A73E8;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;'>Accede a Kustodia</a></p>
        <p style='color:#888;'>¿Tienes dudas? Responde este correo y te ayudamos.</p>
        <br><p style='font-size:13px;color:#999;'>Equipo Kustodia</p>
      </div>`
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
