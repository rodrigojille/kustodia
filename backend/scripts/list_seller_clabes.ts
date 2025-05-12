import 'reflect-metadata';
import ormconfig from '../src/ormconfig';
import { User } from '../src/entity/User';

(async () => {
  await ormconfig.initialize();
  const users = await ormconfig.getRepository(User).find();
  console.log('--- Seller payout CLABEs ---');
  users.forEach((u: User) => {
    console.log(`Email: ${u.email}, payout_clabe: ${u.payout_clabe || 'NONE'}`);
  });
  process.exit(0);
})();
