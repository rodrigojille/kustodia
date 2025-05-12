import { ethers } from 'ethers';
import MockERC20ABI from '../../../contracts/artifacts/contracts/MockERC20.sol/MockERC20.json';

const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
const privateKey = process.env.ESCROW_PRIVATE_KEY!;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA";

const mockERC20 = new ethers.Contract(contractAddress, MockERC20ABI.abi, wallet);

export async function mintToEscrow(to: string, amount: string) {
  // amount should be in wei (string)
  const tx = await mockERC20.mint(to, amount);
  await tx.wait();
  return tx.hash;
}

export async function transferToEscrow(to: string, amount: string) {
  // amount should be in wei (string)
  const tx = await mockERC20.transfer(to, amount);
  await tx.wait();
  return tx.hash;
}
