import { Request, Response } from 'express';
import ormconfig from '../ormconfig';
import EarlyAccessCounter from '../entity/EarlyAccessCounter';
import { Connection } from 'typeorm';

export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection: Connection = ormconfig;
    const repo = connection.getRepository(EarlyAccessCounter);
    let counter = await repo.findOne({});
    if (!counter) {
      counter = repo.create({ slots: 100 });
      await repo.save(counter);
    }
    res.json({ slots: counter.slots });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching slots.' });
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
