import ormconfig from '../ormconfig';
import { User } from '../entity/User';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';

async function main() {
  await ormconfig.initialize();
  // Create or find a test user with a CLABE
  let user = await ormconfig.getRepository(User).findOne({ where: { email: 'test-seller@kustodia.mx' } });
  if (!user) {
    user = ormconfig.getRepository(User).create({
      email: 'test-seller@kustodia.mx',
      password_hash: 'testhash', // Not used for login
      deposit_clabe: '710969000047317763', // Use correct property name if User entity has it
      full_name: 'Test Seller',
      email_verified: true,
      kyc_status: 'approved',
    });
    await ormconfig.getRepository(User).save(user);
  }

  // Create a payment
  const payment = ormconfig.getRepository(Payment).create({
    user,
    recipient_email: 'test-seller@kustodia.mx',
    amount: 100,
    currency: 'MXN',
    description: 'Test payment',
    status: 'funded',
  });
  await ormconfig.getRepository(Payment).save(payment);

  // Create an escrow
  const escrow = ormconfig.getRepository(Escrow).create({
    payment,
    custody_percent: 20,
    custody_amount: 20,
    release_amount: 80,
    status: 'active',
    dispute_status: 'none',
    custody_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  });
  await ormconfig.getRepository(Escrow).save(escrow);

  console.log('Test escrow created:', escrow);
  process.exit(0);
}

main();
