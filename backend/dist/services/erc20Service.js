"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// import MockERC20ABI from '../../../contracts/artifacts/contracts/MockERC20.sol/MockERC20.json';
const provider = new ethers_1.ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
const privateKey = process.env.ESCROW_PRIVATE_KEY;
const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
const contractAddress = process.env.MOCK_ERC20_ADDRESS;
// const mockERC20 = new ethers.Contract(contractAddress, MockERC20ABI.abi, wallet);
// export async function mintToEscrow(to: string, amount: string) {
//   // amount should be in wei (string)
//   const tx = await mockERC20.mint(to, amount);
//   await tx.wait();
//   return tx.hash;
// }
// export async function transferToEscrow(to: string, amount: string) {
//   // amount should be in wei (string)
//   const tx = await mockERC20.transfer(to, amount);
//   await tx.wait();
//   return tx.hash;
// }
