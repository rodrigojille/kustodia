import { Request, Response } from 'express';
import ormconfig from '../ormconfig';
import Lead from '../entity/Lead';
import { sendEmail } from '../utils/emailService';
import { decrementSlot } from './EarlyAccessCounterController';

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body;
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
    const lead = repo.create({ name, email, message, earlyAccessCounter: counter ?? undefined });
    await repo.save(lead);
    // Send invitation email immediately
    await sendEmail({
      to: lead.email,
      subject: '¡Estás invitado a Kustodia Early Access!',
      html: `<div style='font-family:Montserrat,Arial,sans-serif;background:#f6f8fc;padding:2rem;'>
        <div style='text-align:left;margin-bottom:1rem;'>
          <img src='https://kustodia.mx/kustodia-logo.svg' alt='Kustodia Logo' style='width:80px;height:80px;'>
        </div>
        <h2 style='color:#2e7ef7;text-align:center;'>¡Hola${lead.name ? ` ${lead.name}` : ''}!</h2>
        <p>¡Gracias por tu interés en Kustodia! Hemos recibido correctamente tu registro para Early Access.<br>Pronto recibirás novedades sobre el acceso y nuevas funcionalidades.</p>
        <p style='margin-top:1.5rem;'><b>Código de Early Access:</b> <span style='background:#e3e9f8;color:#2e7ef7;padding:3px 10px;border-radius:5px;font-family:monospace;'>kustodiapremier</span></p>
        <p style='margin-top:1.5rem;'><b>¡Felicidades!</b> ${zeroFee ? 'Tienes 0% fees de por vida por ser de los primeros 100 registros.' : 'Regístrate pronto para obtener beneficios exclusivos.'}</p>
        <p style='font-size:13px;color:#555;margin-top:0.5rem;'>Guarda este código, lo necesitarás para acceder a la plataforma cuando se cierre la página de Early Access.</p>
        <p style='margin-top:2rem;'>Síguenos en redes sociales para estar al tanto de las novedades:</p>
<p style='text-align:left;margin:12px 0 0 0;'>
  <a href='https://x.com/Kustodia_mx' style='margin:0 10px;text-decoration:underline;color:#1DA1F2;font-weight:bold;' target='_blank' rel='noopener noreferrer'>X (antes Twitter)</a>
  <a href='https://instagram.com/kustodia.mx' style='margin:0 10px;text-decoration:underline;color:#E1306C;font-weight:bold;' target='_blank' rel='noopener noreferrer'>Instagram</a>
  <a href='https://www.linkedin.com/company/kustodia' style='margin:0 10px;text-decoration:underline;color:#0077b5;font-weight:bold;' target='_blank' rel='noopener noreferrer'>LinkedIn</a>
</p>
        <p style='color:#888;'>¿Tienes dudas? Envía un correo a <a href='mailto:info@kustodia.mx' style='color:#2e7ef7;text-decoration:none;'>info@kustodia.mx</a> y te ayudamos.</p>
        <br><p style='font-size:13px;color:#999;'>Equipo Kustodia</p>
        <hr style='border:none;border-top:1px solid #e3e9f8;margin:32px 0 12px 0;'>
        <p style='font-size:12px;color:#aaa;text-align:center;'>Tecnologias Avanzadas Centrales SAPI de CV</p>
      </div>`
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
      subject: '¡Estás invitado a Kustodia Early Access!',
      html: `<div style='font-family:Montserrat,Arial,sans-serif;background:#f6f8fc;padding:2rem;'>
        <div style='text-align:left;margin-bottom:1rem;'>
          <img src='https://kustodia.mx/kustodia-logo.svg' alt='Kustodia Logo' style='width:80px;height:80px;'>
        </div>
        <h2 style='color:#2e7ef7;text-align:center;'>¡Hola${lead.name ? ` ${lead.name}` : ''}!</h2>
        <p>¡Gracias por tu interés en Kustodia! Hemos recibido correctamente tu registro para Early Access.<br>Pronto recibirás novedades sobre el acceso y nuevas funcionalidades.</p>
        <p style='margin-top:1.5rem;'><b>Código de Early Access:</b> <span style='background:#e3e9f8;color:#2e7ef7;padding:3px 10px;border-radius:5px;font-family:monospace;'>kustodiapremier</span></p>
        <p style='font-size:13px;color:#555;margin-top:0.5rem;'>Guarda este código, lo necesitarás para acceder a la plataforma cuando se cierre la página de Early Access.</p>
        <p style='margin-top:2rem;'>Síguenos en redes sociales para estar al tanto de las novedades:</p>
<p style='text-align:left;margin:12px 0 0 0;'>
  <a href='https://x.com/Kustodia_mx' style='margin:0 10px;text-decoration:underline;color:#1DA1F2;font-weight:bold;' target='_blank' rel='noopener noreferrer'>X (antes Twitter)</a>
  <a href='https://instagram.com/kustodia.mx' style='margin:0 10px;text-decoration:underline;color:#E1306C;font-weight:bold;' target='_blank' rel='noopener noreferrer'>Instagram</a>
  <a href='https://www.linkedin.com/company/kustodia' style='margin:0 10px;text-decoration:underline;color:#0077b5;font-weight:bold;' target='_blank' rel='noopener noreferrer'>LinkedIn</a>
</p>
        <p style='color:#888;'>¿Tienes dudas? Envía un correo a <a href='mailto:info@kustodia.mx' style='color:#2e7ef7;text-decoration:none;'>info@kustodia.mx</a> y te ayudamos.</p>
        <br><p style='font-size:13px;color:#999;'>Equipo Kustodia</p>
        <hr style='border:none;border-top:1px solid #e3e9f8;margin:32px 0 12px 0;'>
        <p style='font-size:12px;color:#aaa;text-align:center;'>Tecnologias Avanzadas Centrales SAPI de CV</p>
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
