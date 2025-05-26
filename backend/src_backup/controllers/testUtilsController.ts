import ormconfig from '../ormconfig';
import { Escrow } from '../entity/Escrow';

// POST /api/test/force-expire-escrow/:escrowId
import { Request, Response } from 'express';

export const forceExpireEscrow = async (req: Request, res: Response) => {
  // TEMPORARY: Allow in production for testing
  // if (process.env.NODE_ENV === 'production') {
  //   return res.status(403).json({ error: 'Endpoint disabled in production' });
  // }

  const escrowId = Number(req.params.escrowId);
  if (!escrowId) {
    return res.status(400).json({ error: 'Missing escrowId param' });
  }
  try {
    const escrowRepo = ormconfig.getRepository(Escrow);
    const escrow = await escrowRepo.findOne({ where: { id: escrowId } });
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    escrow.custody_end = new Date(Date.now() - 60 * 1000); // 1 minuto en el pasado
    await escrowRepo.save(escrow);
    return res.json({ success: true, escrow });
  } catch (err: any) {
    return res.status(500).json({ error: 'DB error', details: err && err.message ? err.message : String(err) });
  }
};
