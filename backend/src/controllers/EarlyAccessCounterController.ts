import { Request, Response } from 'express';
import ormconfig from '../ormconfig';
import EarlyAccessCounter from '../entity/EarlyAccessCounter';
import { DataSource } from 'typeorm';

const getCounterRepo = () => {
  const dataSource: DataSource = ormconfig;
  return dataSource.getRepository(EarlyAccessCounter);
}

export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = getCounterRepo();
    const counters = await repo.find();
    let counter = counters[0];

    if (!counter) {
      console.log('Early access counter not found. Initializing with 100 slots.');
      counter = repo.create({ slots: 100 });
      await repo.save(counter);
    }

    res.status(200).json({ slots: counter.slots });
  } catch (err) {
    console.error("Error in getSlots:", err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Error fetching slots.', details: message });
  }
};

export const decrementSlot = async (connection?: DataSource): Promise<number> => {
  const conn = connection || ormconfig;
  
  return conn.manager.transaction(async transactionalEntityManager => {
    const counters = await transactionalEntityManager.find(EarlyAccessCounter, { 
      lock: { mode: 'pessimistic_write' } 
    });
    let counter = counters[0];

    if (!counter) {
      console.log('Early access counter not found during decrement. Initializing with 100 slots.');
      counter = transactionalEntityManager.create(EarlyAccessCounter, { slots: 100 });
      await transactionalEntityManager.save(counter);
    }

    if (counter.slots > 0) {
      counter.slots -= 1;
      await transactionalEntityManager.save(counter);
    }
    
    return counter.slots;
  });
};
