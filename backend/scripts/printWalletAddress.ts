import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;

if (!PRIVATE_KEY) {
  console.error('ESCROW_PRIVATE_KEY not set in .env');
  process.exit(1);
}

const wallet = new ethers.Wallet(PRIVATE_KEY);
console.log('Wallet address:', wallet.address);
