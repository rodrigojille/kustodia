import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
const privateKey = process.env.ESCROW_PRIVATE_KEY as string;
const signer = new ethers.Wallet(privateKey, provider);
const tokenAddress = process.env.MOCK_ERC20_ADDRESS as string;
const escrowAddress = process.env.ESCROW_CONTRACT_ADDRESS as string;

const abiPath = path.join(process.cwd(), 'artifacts', 'contracts', 'ERC20.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;

async function main() {
  const token = new ethers.Contract(tokenAddress, abi, signer);
  const amount = ethers.utils.parseUnits('2000', 6); // 2000 MXNB (6 decimales)
  console.log(`Aprobando ${amount.toString()} tokens para ${escrowAddress}`);

  try {
    const tx = await token.approve(escrowAddress, amount);
    console.log('approve tx hash:', tx.hash);
    await tx.wait();
    console.log('Approve confirmado en blockchain');
  } catch (e) {
    console.error('Error en approve:', e);
  }
}

main();
