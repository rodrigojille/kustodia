import { Request, Response } from 'express';
import ormconfig from '../ormconfig';
import EarlyAccessCounter from '../entity/EarlyAccessCounter';
import { Connection } from 'typeorm';

export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection: Connection = ormconfig;
    const repo = connection.getRepository(EarlyAccessCounter);
    let counter;
    try {
      counter = await repo.findOne({ where: {} });
    } catch (err) {
      console.error("DB error in getSlots:", err);
      res.status(500).json({ error: 'Database error', details: err instanceof Error ? err.message : err });
      return;
    }
    if (!counter) {
      // Counter row not found, return 404 and default slots value
      res.status(404).json({ slots: 0, message: 'No early access counter found' });
      return;
    }
    res.json({ slots: counter.slots });
    return;
  } catch (err) {
    console.error("General error in getSlots:", err);
    res.status(500).json({ error: 'Error fetching slots.', details: err instanceof Error ? err.message : err });
    return;
  }
};

export const decrementSlot = async (connection?: Connection): Promise<number> => {
  const conn: Connection = connection || ormconfig;
  const repo = conn.getRepository(EarlyAccessCounter);
  let counter = await repo.findOne({});
  if (!counter) {
    counter = repo.create({ slots: 100 });
    await repo.save(counter);
  }
  if (counter.slots > 0) {
    counter.slots -= 1;
    await repo.save(counter);
  }
  return counter.slots;
};
