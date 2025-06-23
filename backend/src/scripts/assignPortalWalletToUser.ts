import fetch from 'node-fetch';
import { DataSource } from 'typeorm';
import ormconfig from '../ormconfig';
import { User } from '../entity/User';

const PORTAL_API_KEY = '00d44a69-e705-4fca-b97f-fca9dcb126f7';
const USER_ID = 4; // Cambia esto si necesitas otro usuario

async function createPortalWallet() {
  const res = await fetch('https://mpc-client.portalhq.io/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PORTAL_API_KEY}`
    },
    body: JSON.stringify({})
  });
  if (!res.ok) {
    throw new Error(`Portal API error: ${res.status} ${await res.text()}`);
  }
  const data: any = await res.json();
  if (!data.eip155Address) {
    throw new Error('No eip155Address in Portal API response');
  }
  return data.eip155Address;
}

async function assignWalletToUser(userId: number, walletAddress: string) {
  const dataSource = new DataSource(ormconfig as any);
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }
  user.wallet_address = walletAddress;
  await userRepo.save(user);
  await dataSource.destroy();
  console.log(`Assigned wallet ${walletAddress} to user id ${userId}`);
}

(async () => {
  try {
    const walletAddress = await createPortalWallet();
    await assignWalletToUser(USER_ID, walletAddress);
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
