import ormconfig from '../src/ormconfig';
import { User } from '../src/entity/User';

async function main() {
  await ormconfig.initialize();
  const user = await ormconfig.getRepository(User).findOne({ where: { deposit_clabe: '710969000000351106' } });
  if (user) {
    console.log('User with CLABE 710969000000351106:', user);
    console.log('Full name:', user.full_name);
  } else {
    console.log('No user found with CLABE 710969000000351106');
  }
  process.exit(0);
}

main();
